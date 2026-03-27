const router   = require('express').Router();
const { getMyProfile, updateMyProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const upload   = require('../middleware/upload.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma   = new PrismaClient();

router.get('/me',  protect, getMyProfile);
router.put('/me',  protect, updateMyProfile);

router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    const avatarUrl = '/uploads/' + req.file.filename;
    const profile = req.user.role === 'CANDIDATE'
      ? await prisma.candidateProfile.update({
          where: { userId: req.user.id },
          data: { avatarUrl },
        })
      : await prisma.employerProfile.update({
          where: { userId: req.user.id },
          data: { avatarUrl },
        });
    res.json({ avatarUrl: profile.avatarUrl });
  } catch (err) { next(err); }
});

router.post('/cv', protect, upload.single('cv'), async (req, res, next) => {
  try {
    const cvUrl = '/uploads/' + req.file.filename;
    const profile = await prisma.candidateProfile.update({
      where: { userId: req.user.id },
      data: { cvUrl },
    });
    res.json({ cvUrl: profile.cvUrl });
  } catch (err) { next(err); }
});

router.get('/company/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug.replace(/-/g, ' ');
    const now = new Date();
    const employer = await prisma.employerProfile.findFirst({
      where: { companyName: { equals: slug, mode: 'insensitive' } },
      include: {
        jobs: {
          where: { status: 'HIRING', startDate: { lte: now }, endDate: { gte: now } },
          include: { _count: { select: { applications: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!employer) return res.status(404).json({ message: 'კომპანია ვერ მოიძებნა' });
    res.json(employer);
  } catch (err) { next(err); }
});

module.exports = router;