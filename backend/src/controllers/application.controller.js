const prisma = require('../prisma');
const { sendNotification } = require('../utils/notify');

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
    if (req.file) cvUrl = '/uploads/' + req.file.filename;

    const application = await prisma.application.create({
      data: {
        jobId: +req.params.jobId,
        candidateProfileId: candidate.id,
        coverLetter,
        cvUrl,
      },
      include: {
        job: {
          include: {
            employer: { include: { user: true } }
          }
        }
      }
    });

    const candidateName = candidate.firstName + ' ' + candidate.lastName;
    const employerUserId = application.job.employer.user.id;

    await sendNotification(
      req.app,
      employerUserId,
      candidateName + '-მ გამოაგზავნა განაცხადი — ' + application.job.title
    );

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
      include: {
        job: true,
        candidate: { include: { user: true } }
      }
    });

    const STATUS_GEO = {
      PENDING:     'განხილვის მოლოდინში',
      REVIEWING:   'განიხილება',
      SHORTLISTED: 'შორტლისტში',
      REJECTED:    'უარყოფილია',
      HIRED:       'აყვანილია',
    };

    await sendNotification(
      req.app,
      application.candidate.user.id,
      'თქვენი სტატუსი შეიცვალა — ' + STATUS_GEO[req.body.status] + ' (' + application.job.title + ')'
    );

    res.json(application);
  } catch (err) { next(err); }
};

const viewCv = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: +req.params.id },
      include: {
        job: true,
        candidate: { include: { user: true } },
      }
    });

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    await sendNotification(
      req.app,
      application.candidate.user.id,
      employer.companyName + '-მ გახსნა თქვენი CV — ' + application.job.title
    );

    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { applyToJob, myApplications, jobApplicants, updateStatus, viewCv };