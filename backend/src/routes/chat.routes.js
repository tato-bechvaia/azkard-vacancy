const router = require('express').Router();
const { protect, requireAdmin } = require('../middleware/auth.middleware');
const { chat } = require('../controllers/chat.controller');

router.post('/', protect, requireAdmin, chat);

module.exports = router;
