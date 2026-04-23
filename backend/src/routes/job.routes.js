const router = require('express').Router();
const { listJobs, getJob, createJob, updateJob, deleteJob, myJobs } = require('../controllers/job.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.get('/',      listJobs);
router.get('/mine',  protect, requireRole('EMPLOYER'), myJobs);
router.get('/:id',   getJob);
// Direct job creation disabled — use POST /api/payments/create-session instead
// router.post('/',  protect, requireRole('EMPLOYER'), createJob);
router.put('/:id',   protect, requireRole('EMPLOYER'), updateJob);
router.delete('/:id',protect, requireRole('EMPLOYER'), deleteJob);

module.exports = router;
