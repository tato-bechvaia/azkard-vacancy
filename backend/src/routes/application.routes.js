const router  = require('express').Router();
const { applyToJob, myApplications, jobApplicants, updateStatus } = require('../controllers/application.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');

router.post('/job/:jobId',    protect, requireRole('CANDIDATE'), upload.single('cv'), applyToJob);
router.get('/mine',           protect, requireRole('CANDIDATE'), myApplications);
router.get('/job/:jobId',     protect, requireRole('EMPLOYER'),  jobApplicants);
router.put('/:id/status',     protect, requireRole('EMPLOYER'),  updateStatus);

module.exports = router;