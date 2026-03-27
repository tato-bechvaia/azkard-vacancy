const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listJobs = async (req, res, next) => {
    try {
      const { search, location, regime, experience, category, salaryMin, salaryMax, page = 1, limit = 10 } = req.query;
      const now = new Date();
      const where = {
        status: 'HIRING',
        startDate: { lte: now },
        endDate: { gte: now },
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { employer: { companyName: { contains: search, mode: 'insensitive' } } },
          ],
        }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(regime && { jobRegime: regime }),
        ...(experience && { experience }),
        ...(category && { category }),
        ...(salaryMin && { salary: { gte: +salaryMin } }),
        ...(salaryMax && { salary: { lte: +salaryMax } }),
      };
      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where,
            skip: (page - 1) * limit,
            take: +limit,
            include: {
            employer: { select: { companyName: true, logoUrl: true, avatarUrl: true } },
              _count: { select: { applications: true } }
            },
            orderBy: { createdAt: 'desc' },
          }),
        prisma.job.count({ where }),
      ]);
      res.json({ jobs, total, page: +page, pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
};

const getJob = async (req, res, next) => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: +req.params.id },
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
              avatarUrl: true,
              website: true,
              _count: { select: { jobs: true } }
            }
          },
          _count: { select: { applications: true } }
        },
      });
      if (!job) return res.status(404).json({ message: 'ვაკანსია ვერ მოიძებნა' });
  
      await prisma.job.update({
        where: { id: +req.params.id },
        data: { views: { increment: 1 } },
      });
  
      const jobWithCount = {
        ...job,
        employer: {
          ...job.employer,
          jobCount: job.employer._count.jobs
        }
      };
  
      res.json(jobWithCount);
    } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    const { title, description, location, salary, jobRegime, startDate, experience, applicationMethod, category } = req.body;
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const start = startDate ? new Date(startDate) : new Date();
    if (Number.isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid startDate' });
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const job = await prisma.job.create({
      data: {
        title, description, location,
        salary: +salary,
        jobRegime,
        startDate: start,
        endDate: end,
        experience: experience || 'NONE',
        applicationMethod: applicationMethod || 'CV_ONLY',
        category: category || 'OTHER',
        employerProfileId: employer.id,
      },
    });
    res.status(201).json(job);
  } catch (err) { next(err); }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await prisma.job.update({
      where: { id: +req.params.id },
      data: req.body,
    });
    res.json(job);
  } catch (err) { next(err); }
};

const deleteJob = async (req, res, next) => {
  try {
    await prisma.job.delete({ where: { id: +req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (err) { next(err); }
};

const myJobs = async (req, res, next) => {
    try {
      const employer = await prisma.employerProfile.findUnique({
        where: { userId: req.user.id },
      });
      const jobs = await prisma.job.findMany({
        where: { employerProfileId: employer.id },
        include: {
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(jobs);
    } catch (err) { next(err); }
};

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, myJobs };