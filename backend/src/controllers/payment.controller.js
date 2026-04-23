const Stripe   = require('stripe');
const supabase = require('../supabase');

// Lazy init — prevents server crash if STRIPE_SECRET_KEY is not yet set
let _stripe = null;
const stripe = new Proxy({}, {
  get: (_, prop) => {
    if (!_stripe) {
      if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
      _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return _stripe[prop];
  },
});

const PRICES = { USUAL: 35, PREMIUM: 65 };

// ---------------------------------------------------------------------------
// POST /api/payments/create-session
// Body: job form fields + pricingTier
// Creates job (PENDING) + Stripe Checkout session, returns { url }
// ---------------------------------------------------------------------------
const createStripeSession = async (req, res, next) => {
  try {
    const {
      title, description, location, salary, salaryMin, salaryMax,
      jobRegime, jobPeriod, experience, applicationMethod, category,
      isForStudents, isInternship, startDate, pricingTier,
    } = req.body;

    const tier        = pricingTier === 'PREMIUM' ? 'PREMIUM' : 'USUAL';
    const priceAmount = PRICES[tier];

    // 1 — Look up employer
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    // 2 — Create job with PENDING payment status (hidden from listings)
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);

    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        location:           location  || null,
        salary_min:         +(salary  || salaryMin),
        salary_max:         salaryMax ? +salaryMax : null,
        job_regime:         jobRegime,
        job_period:         jobPeriod || null,
        experience:         experience         || 'NONE',
        application_method: applicationMethod  || 'CV_ONLY',
        category:           category           || 'OTHER',
        employer_profile_id: employer.id,
        is_premium:          tier === 'PREMIUM',
        premium_badge_label: tier === 'PREMIUM' ? 'Premium' : null,
        is_for_students:    isForStudents === true || isForStudents === 'true',
        is_internship:      isInternship  === true || isInternship  === 'true',
        expires_at:         startDate
          ? new Date(startDate).toISOString()
          : defaultExpiry.toISOString(),
        pricing_tier:   tier,
        price_amount:   priceAmount,
        payment_status: 'PENDING',
      })
      .select()
      .single();

    if (jobErr) throw jobErr;

    // 3 — Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode:        'payment',
      currency:    'gel',
      line_items: [{
        quantity: 1,
        price_data: {
          currency:     'gel',
          unit_amount:  priceAmount * 100,   // tetri (100 tetri = 1 GEL)
          product_data: {
            name:        tier === 'PREMIUM' ? 'Azkard — Premium ვაკანსია' : 'Azkard — სტანდარტული ვაკანსია',
            description: `${title} · ${tier === 'PREMIUM' ? 'პრემიუმ განთავსება + კარუსელი' : 'სტანდარტული განთავსება'} · 30 დღე`,
          },
        },
      }],
      metadata: {
        jobId:    String(job.id),
        tier,
        employerId: String(employer.id),
      },
      success_url: `${process.env.CLIENT_URL}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/profile?payment=cancelled&jobId=${job.id}`,
    });

    // 4 — Record in payments table
    await supabase.from('payments').insert({
      job_id:              job.id,
      employer_profile_id: employer.id,
      amount:              priceAmount,
      currency:            'GEL',
      provider:            'STRIPE',
      provider_order_id:   session.id,
      status:              'PENDING',
    });

    res.json({ url: session.url, jobId: job.id });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// POST /api/payments/webhook/stripe
// Stripe calls this after payment — MUST use raw body (configured in app.js)
// ---------------------------------------------------------------------------
const stripeWebhook = async (req, res) => {
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[Stripe webhook] Signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const jobId   = +session.metadata.jobId;

    // Activate the job
    await supabase.from('jobs').update({ payment_status: 'PAID' }).eq('id', jobId);

    // Mark payment as paid
    await supabase
      .from('payments')
      .update({ status: 'PAID', paid_at: new Date().toISOString() })
      .eq('provider_order_id', session.id);

    console.log(`[Stripe] Job ${jobId} activated`);
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const jobId   = +session.metadata?.jobId;
    if (jobId) {
      await supabase.from('payments')
        .update({ status: 'FAILED' })
        .eq('provider_order_id', session.id);
      // Optional: delete the pending job so employer can retry cleanly
      // await supabase.from('jobs').delete().eq('id', jobId);
    }
  }

  res.json({ received: true });
};

// ---------------------------------------------------------------------------
// DELETE /api/payments/cancel-job/:jobId
// Called when employer lands on the cancel URL — cleans up the PENDING job
// ---------------------------------------------------------------------------
const cancelPendingJob = async (req, res, next) => {
  try {
    const jobId = +req.params.jobId;

    // Verify ownership before deleting
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('employer_profile_id', employer.id)
      .eq('payment_status', 'PENDING');

    res.json({ message: 'Cancelled' });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// GET /api/payments/session/:sessionId
// Frontend polls this on the success page to confirm payment
// ---------------------------------------------------------------------------
const getSessionStatus = async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      status: session.payment_status,   // 'paid' | 'unpaid' | 'no_payment_required'
      jobId:  session.metadata?.jobId,
    });
  } catch (err) { next(err); }
};

module.exports = { createStripeSession, stripeWebhook, cancelPendingJob, getSessionStatus };
