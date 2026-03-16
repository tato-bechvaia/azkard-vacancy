const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listJobs = async (req, res, next) => {
  try {
    const { search, location, page = 1, limit = 10 } = req.query;
    const where = {
      status: 'OPEN',
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
    };
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: +limit,
        include: { employer: { select: { companyName: true, logoUrl: true } } },
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
      include: { employer: { select: { companyName: true, logoUrl: true, website: true } } },
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    const { title, description, location, salaryMin, salaryMax } = req.body;
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await prisma.job.create({
      data: {
        title, description, location,
        salaryMin: salaryMin ? +salaryMin : null,
        salaryMax: salaryMax ? +salaryMax : null,
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

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };