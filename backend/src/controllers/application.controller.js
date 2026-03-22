const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const applyToJob = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!candidate) return res.status(404).json({ message: 'კანდიდატის პროფილი ვერ მოიძებნა' });

    const existing = await prisma.application.findFirst({
      where: { jobId: +req.params.jobId, candidateProfileId: candidate.id },
    });
    if (existing) return res.status(409).json({ message: 'უკვე გაგზავნილი გაქვთ განაცხადი' });

    let cvUrl = candidate.cvUrl || null;
    if (req.file) {
      cvUrl = '/uploads/' + req.file.filename;
    }

    const application = await prisma.application.create({
      data: {
        jobId: +req.params.jobId,
        candidateProfileId: candidate.id,
        coverLetter,
        cvUrl,
      },
    });
    res.status(201).json(application);
  } catch (err) { next(err); }
};

const myApplications = async (req, res, next) => {
  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    const applications = await prisma.application.findMany({
      where: { candidateProfileId: candidate.id },
      include: {
        job: {
            select: {
              title: true,
              location: true,
              employer: { select: { companyName: true, avatarUrl: true } }
            }
        }
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(applications);
  } catch (err) { next(err); }
};

const jobApplicants = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { jobId: +req.params.jobId },
      include: {
        candidate: {
          select: { firstName: true, lastName: true, headline: true, cvUrl: true }
        }
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(applications);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const application = await prisma.application.update({
      where: { id: +req.params.id },
      data: { status: req.body.status },
    });
    res.json(application);
  } catch (err) { next(err); }
};

module.exports = { applyToJob, myApplications, jobApplicants, updateStatus };