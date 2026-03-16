const router = require('express').Router();
const { applyToJob, myApplications, jobApplicants, updateStatus } = require('../controllers/application.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.post('/job/:jobId',        protect, requireRole('CANDIDATE'), applyToJob);
router.get('/mine',               protect, requireRole('CANDIDATE'), myApplications);
router.get('/job/:jobId',         protect, requireRole('EMPLOYER'),  jobApplicants);
router.put('/:id/status',         protect, requireRole('EMPLOYER'),  updateStatus);

module.exports = router;