const router = require('express').Router();
const {
  createStripeSession,
  stripeWebhook,
  cancelPendingJob,
  getSessionStatus,
} = require('../controllers/payment.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

// Stripe Checkout — employer initiates payment + job creation
router.post('/create-session', protect, requireRole('EMPLOYER'), createStripeSession);

// Stripe webhook — raw body required (configured in app.js before express.json)
router.post('/webhook/stripe', stripeWebhook);

// Employer cancels a pending job (landed on cancel_url)
router.delete('/cancel-job/:jobId', protect, requireRole('EMPLOYER'), cancelPendingJob);

// Frontend polls this on success page to confirm payment went through
router.get('/session/:sessionId', protect, getSessionStatus);

module.exports = router;
