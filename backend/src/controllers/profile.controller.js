const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMyProfile = async (req, res, next) => {
  try {
    const profile = req.user.role === 'CANDIDATE'
      ? await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } })
      : await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profile = req.user.role === 'CANDIDATE'
      ? await prisma.candidateProfile.update({
          where: { userId: req.user.id },
          data: req.body,
        })
      : await prisma.employerProfile.update({
          where: { userId: req.user.id },
          data: req.body,
        });

    res.json(profile);
  } catch (err) { next(err); }
};

module.exports = { getMyProfile, updateMyProfile };