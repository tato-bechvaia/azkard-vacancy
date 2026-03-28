const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const prisma = require('../prisma');

router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

router.put('/read-all', protect, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await prisma.notification.delete({
      where: { id: +req.params.id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/', protect, async (req, res, next) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;