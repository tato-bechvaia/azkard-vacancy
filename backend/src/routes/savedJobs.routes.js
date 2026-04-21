const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth.middleware');
const { saveJob, unsaveJob, listSavedJobs, savedJobIds } = require('../controllers/savedJobs.controller');

// All routes require auth and CANDIDATE role
router.use(protect, requireRole('CANDIDATE'));

router.get('/',            listSavedJobs);
router.get('/ids',         savedJobIds);
router.post('/:jobId',     saveJob);
router.delete('/:jobId',   unsaveJob);

module.exports = router;
