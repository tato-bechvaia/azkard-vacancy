const supabase = require('../supabase');
const cache = require('../utils/cache');

// Compute effective expiry: stored expires_at OR created_at + 30 days
const effectiveExpiry = (job) => {
  if (job.expiresAt) return job.expiresAt;
  const d = new Date(job.createdAt);
  d.setDate(d.getDate() + 30);
  return d;
};

// Normalize a raw Supabase job row into the shape the frontend expects
const formatJob = (j) => {
  if (!j) return null;
  const ep = j.employer_profiles;
  const appCount = Array.isArray(j.applications)
    ? (j.applications[0]?.count ?? 0)
    : 0;

  return {
    id: j.id,
    title: j.title,
    description: j.description,
    location: j.location,
    salaryMin: j.salary_min,
    salaryMax: j.salary_max,
    currency: j.currency,
    jobRegime: j.job_regime,
    jobPeriod: j.job_period,
    experience: j.experience,
    applicationMethod: j.application_method,
    status: j.status,
    views: j.views,
    createdAt: j.created_at,
    expiresAt: j.expires_at,
    isForStudents: j.is_for_students,
    isInternship: j.is_internship,
    employerProfileId: j.employer_profile_id,
    category: j.category,
    isPremium: j.is_premium,
    premiumBadgeLabel: j.premium_badge_label,
    highlightColor: j.highlight_color,
    featuredUntil: j.featured_until,
    pricingTier: j.pricing_tier || 'USUAL',
    priceAmount: j.price_amount || 35,
    paymentStatus: j.payment_status || 'PAID',
    employer: ep ? {
      companyName: ep.company_name,
      logoUrl: ep.logo_url,
      avatarUrl: ep.avatar_url,
      website: ep.website,
      jobCount: ep.jobs?.[0]?.count,
    } : undefined,
    _count: { applications: appCount },
  };
};

const withExpiry = (jobs) => jobs.map(j => ({ ...j, expiresAt: effectiveExpiry(j) }));

const EMPLOYER_SELECT = `*, employer_profiles!employer_profile_id(company_name, logo_url, avatar_url), applications(count)`;
const CAROUSEL_TAKE = 16;

// Build the active-job filter on a Supabase query
const applyActiveFilter = (query, now) =>
  query
    .eq('status', 'HIRING')
    .eq('payment_status', 'PAID')
    .or(`expires_at.is.null,expires_at.gte.${now.toISOString()}`);

const listJobs = async (req, res, next) => {
  try {
    const cacheKey = 'jobs:' + JSON.stringify(req.query);
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const {
      search, location, regime, experience, category,
      salaryMin, salaryMax, page = 1, limit = 10,
    } = req.query;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Pre-fetch employer IDs matching company name search (once, reused across all queries)
    let searchEmpIds = [];
    if (search) {
      const { data: empMatches } = await supabase
        .from('employer_profiles')
        .select('id')
        .ilike('company_name', `%${search}%`);
      searchEmpIds = (empMatches || []).map(e => e.id);
    }

    // Build shared filter builder for reuse
    const applySharedFilters = (query) => {
      query = applyActiveFilter(query, now);
      if (location) query = query.ilike('location', `%${location}%`);
      if (regime)   query = query.eq('job_regime', regime);
      if (experience) query = query.eq('experience', experience);
      if (salaryMin)  query = query.gte('salary_min', +salaryMin);
      if (salaryMax)  query = query.lte('salary_min', +salaryMax);
      if (search) {
        if (searchEmpIds.length > 0) {
          query = query.or(`title.ilike.%${search}%,employer_profile_id.in.(${searchEmpIds.join(',')})`);
        } else {
          query = query.ilike('title', `%${search}%`);
        }
      }
      if (category) {
        const cats = category.split(',').map(c => c.trim()).filter(Boolean);
        if (cats.length === 1) query = query.eq('category', cats[0]);
        else if (cats.length > 1) query = query.in('category', cats);
      }
      return query;
    };

    const skip = (+page - 1) * +limit;

    const [
      { data: premiumJobs },
      { data: standardJobs },
      { count: total },
      { data: carouselStudents },
      { data: carouselInternships },
      { data: carouselTopSalaries },
      { data: carouselToday },
      { data: carouselTop },
    ] = await Promise.all([
      // Premium jobs
      applySharedFilters(
        supabase.from('jobs').select(EMPLOYER_SELECT).eq('is_premium', true)
          .or(`featured_until.is.null,featured_until.gte.${now.toISOString()}`)
      ).order('created_at', { ascending: false }).limit(20),

      // Standard paginated jobs
      applySharedFilters(
        supabase.from('jobs').select(EMPLOYER_SELECT).eq('is_premium', false)
      ).order('created_at', { ascending: false }).range(skip, skip + +limit - 1),

      // Total standard count
      applySharedFilters(
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_premium', false)
      ),

      // Carousel: For Students
      applyActiveFilter(supabase.from('jobs').select(EMPLOYER_SELECT), now)
        .or('is_for_students.eq.true,experience.eq.NONE')
        .order('created_at', { ascending: false }).limit(CAROUSEL_TAKE),

      // Carousel: Internships
      applyActiveFilter(supabase.from('jobs').select(EMPLOYER_SELECT), now)
        .eq('is_internship', true)
        .order('created_at', { ascending: false }).limit(CAROUSEL_TAKE),

      // Carousel: Top Salaries
      applyActiveFilter(supabase.from('jobs').select(EMPLOYER_SELECT), now)
        .order('salary_min', { ascending: false }).limit(CAROUSEL_TAKE),

      // Carousel: Today's Vacancies
      applyActiveFilter(supabase.from('jobs').select(EMPLOYER_SELECT), now)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false }).limit(CAROUSEL_TAKE),

      // Carousel: Top Vacancies (by views)
      applyActiveFilter(supabase.from('jobs').select(EMPLOYER_SELECT), now)
        .order('views', { ascending: false }).limit(CAROUSEL_TAKE),
    ]);

    const fmt = (jobs) => withExpiry((jobs || []).map(formatJob));

    const sortedTop = [...(carouselTop || []).map(formatJob)]
      .map(j => ({ ...j, score: j.views + (j._count?.applications || 0) * 10 }))
      .sort((a, b) => b.score - a.score);

    const result = {
      premiumJobs:   withExpiry((premiumJobs  || []).map(formatJob)),
      standardJobs:  withExpiry((standardJobs || []).map(formatJob)),
      total:  total || 0,
      page:   +page,
      pages:  Math.ceil((total || 0) / +limit),
      carousels: {
        students:    fmt(carouselStudents),
        internships: fmt(carouselInternships),
        topSalaries: fmt(carouselTopSalaries),
        today:       fmt(carouselToday),
        top:         withExpiry(sortedTop),
      },
    };
    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (err) { next(err); }
};

const getJob = async (req, res, next) => {
  try {
    const cacheKey = 'job:' + req.params.id;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const jobId = +req.params.id;
    const now = new Date();

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!employer_profile_id(
          company_name, logo_url, avatar_url, website,
          jobs(count)
        ),
        applications(count)
      `)
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;
    if (!job) return res.status(404).json({ message: 'ვაკანსია ვერ მოიძებნა' });

    // Increment view count (fire and forget)
    supabase.from('jobs').update({ views: (job.views || 0) + 1 }).eq('id', jobId).then(() => {});

    const employerProfileId = job.employer_profile_id;
    const category = job.category;

    // Fetch company's other active jobs + similar-category jobs in parallel
    const [{ data: companyRaw }, { data: similarRaw }] = await Promise.all([
      applyActiveFilter(
        supabase.from('jobs').select(EMPLOYER_SELECT), now
      )
        .eq('employer_profile_id', employerProfileId)
        .neq('id', jobId)
        .order('created_at', { ascending: false })
        .limit(12),

      category
        ? applyActiveFilter(
            supabase.from('jobs').select(EMPLOYER_SELECT), now
          )
            .eq('category', category)
            .neq('id', jobId)
            .order('views', { ascending: false })
            .limit(12)
        : Promise.resolve({ data: [] }),
    ]);

    const formatted = {
      ...formatJob(job),
      expiresAt: effectiveExpiry(formatJob(job)),
      companyJobs:  withExpiry((companyRaw  || []).map(formatJob)),
      similarJobs:  withExpiry((similarRaw  || []).map(formatJob)),
    };
    cache.set(cacheKey, formatted, 30);
    res.json(formatted);
  } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    const {
      title, description, location, salaryMin, salaryMax, jobRegime, jobPeriod,
      experience, applicationMethod, category,
      isPremium, premiumBadgeLabel, highlightColor, featuredUntil,
      isForStudents, isInternship, expiresAt,
      pricingTier,
    } = req.body;

    const tier = pricingTier === 'PREMIUM' ? 'PREMIUM' : 'USUAL';
    const priceAmount = tier === 'PREMIUM' ? 65 : 35;

    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        location: location || null,
        salary_min: +salaryMin,
        salary_max: salaryMax ? +salaryMax : null,
        job_period: jobPeriod || null,
        job_regime: jobRegime,
        experience: experience || 'NONE',
        application_method: applicationMethod || 'CV_ONLY',
        category: category || 'OTHER',
        employer_profile_id: employer.id,
        is_premium: isPremium === true || isPremium === 'true' || tier === 'PREMIUM',
        premium_badge_label: premiumBadgeLabel || (tier === 'PREMIUM' ? 'Premium' : null),
        highlight_color: highlightColor || null,
        featured_until: featuredUntil ? new Date(featuredUntil).toISOString() : null,
        pricing_tier: tier,
        price_amount: priceAmount,
        payment_status: 'PAID', // Set to 'PENDING' once real payment gateway is wired
        is_for_students: isForStudents === true || isForStudents === 'true',
        is_internship: isInternship === true || isInternship === 'true',
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : defaultExpiry.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    cache.delByPrefix('jobs:');
    res.status(201).json(formatJob(job));
  } catch (err) { next(err); }
};

const updateJob = async (req, res, next) => {
  try {
    // Convert camelCase body keys to snake_case for Supabase
    const map = {
      salaryMin: 'salary_min', salaryMax: 'salary_max',
      jobRegime: 'job_regime', jobPeriod: 'job_period',
      applicationMethod: 'application_method', expiresAt: 'expires_at',
      isForStudents: 'is_for_students', isInternship: 'is_internship',
      isPremium: 'is_premium', premiumBadgeLabel: 'premium_badge_label',
      highlightColor: 'highlight_color', featuredUntil: 'featured_until',
      pricingTier: 'pricing_tier', priceAmount: 'price_amount',
      paymentStatus: 'payment_status',
    };
    const data = {};
    for (const [k, v] of Object.entries(req.body)) {
      data[map[k] || k] = v;
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', +req.params.id)
      .select()
      .single();
    if (error) throw error;

    cache.delByPrefix('jobs:');
    cache.del('job:' + req.params.id);
    res.json(formatJob(job));
  } catch (err) { next(err); }
};

const deleteJob = async (req, res, next) => {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', +req.params.id);
    if (error) throw error;
    cache.delByPrefix('jobs:');
    cache.del('job:' + req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) { next(err); }
};

const myJobs = async (req, res, next) => {
  try {
    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('employer_profile_id', employer.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json((jobs || []).map(formatJob));
  } catch (err) { next(err); }
};

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, myJobs };
