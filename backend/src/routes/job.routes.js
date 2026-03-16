const router = require('express').Router();
const { listJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/job.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.get('/',     listJobs);
router.get('/:id',  getJob);
router.post('/',    protect, requireRole('EMPLOYER'), createJob);
router.put('/:id',  protect, requireRole('EMPLOYER'), updateJob);
router.delete('/:id', protect, requireRole('EMPLOYER'), deleteJob);

module.exports = router;