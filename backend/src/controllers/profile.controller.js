const prisma = require('../prisma');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = req.user.role === 'CANDIDATE'
      ? await prisma.candidateProfile.findUnique({
          where: { userId: req.user.id },
          include: { user: { select: { email: true, phone: true } } }
        })
      : await prisma.employerProfile.findUnique({
          where: { userId: req.user.id },
          include: { user: { select: { email: true, phone: true } } }
        });

    if (!profile) return res.status(404).json({ message: 'პროფილი ვერ მოიძებნა' });
    res.json(profile);
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, ...profileData } = req.body;

    if (phone) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { phone },
      });
    }

    const profile = req.user.role === 'CANDIDATE'
      ? await prisma.candidateProfile.update({
          where: { userId: req.user.id },
          data: profileData,
        })
      : await prisma.employerProfile.update({
          where: { userId: req.user.id },
          data: profileData,
        });

    res.json(profile);
  } catch (err) { next(err); }
};

module.exports = { getMyProfile, updateMyProfile };