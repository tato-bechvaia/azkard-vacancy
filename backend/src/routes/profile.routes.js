const router = require('express').Router();
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me',  protect, getMyProfile);
router.put('/me',  protect, updateMyProfile);

module.exports = router;