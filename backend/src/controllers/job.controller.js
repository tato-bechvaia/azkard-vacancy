const prisma = require('../prisma');

// Compute effective expiry: stored expiresAt OR createdAt + 30 days
const effectiveExpiry = (job) => {
  if (job.expiresAt) return job.expiresAt;
  const d = new Date(job.createdAt);
  d.setDate(d.getDate() + 30);
  return d;
};

const withExpiry = (jobs) => jobs.map(j => ({ ...j, expiresAt: effectiveExpiry(j) }));

const includeEmployer = {
  employer: { select: { companyName: true, logoUrl: true, avatarUrl: true } },
  _count: { select: { applications: true } },
};

// Active job base filter — status HIRING and not expired
const activeBase = (now) => ({
  status: 'HIRING',
  OR: [
    { expiresAt: null },
    { expiresAt: { gte: now } },
  ],
});

const CAROUSEL_TAKE = 16;

const listJobs = async (req, res, next) => {
  try {
    const { search, location, regime, experience, category, salaryMin, salaryMax, page = 1, limit = 10 } = req.query;
    const now = new Date();

    const sharedWhere = {
      ...activeBase(now),
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
      ...(salaryMin && { salaryMin: { gte: +salaryMin } }),
      ...(salaryMax && { salaryMin: { lte: +salaryMax } }),
    };

    const premiumWhere = {
      ...sharedWhere,
      isPremium: true,
      OR: [
        { featuredUntil: null },
        { featuredUntil: { gte: now } },
      ],
    };

    const standardWhere = { ...sharedWhere, isPremium: false };

    // Today start (for today's vacancies carousel)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [
      premiumJobs,
      standardJobs,
      total,
      carouselStudents,
      carouselInternships,
      carouselTopSalaries,
      carouselToday,
      carouselTop,
    ] = await Promise.all([
      // Premium jobs
      prisma.job.findMany({
        where: premiumWhere,
        include: includeEmployer,
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Standard paginated jobs
      prisma.job.findMany({
        where: standardWhere,
        skip: (+page - 1) * +limit,
        take: +limit,
        include: includeEmployer,
        orderBy: { createdAt: 'desc' },
      }),
      // Total count
      prisma.job.count({ where: standardWhere }),
      // Carousel: For Students
      prisma.job.findMany({
        where: {
          ...activeBase(now),
          OR: [{ isForStudents: true }, { experience: 'NONE' }],
        },
        include: includeEmployer,
        orderBy: { createdAt: 'desc' },
        take: CAROUSEL_TAKE,
      }),
      // Carousel: Internships
      prisma.job.findMany({
        where: { ...activeBase(now), isInternship: true },
        include: includeEmployer,
        orderBy: { createdAt: 'desc' },
        take: CAROUSEL_TAKE,
      }),
      // Carousel: Top Salaries
      prisma.job.findMany({
        where: activeBase(now),
        include: includeEmployer,
        orderBy: { salaryMin: 'desc' },
        take: CAROUSEL_TAKE,
      }),
      // Carousel: Today's Vacancies
      prisma.job.findMany({
        where: { ...activeBase(now), createdAt: { gte: todayStart } },
        include: includeEmployer,
        orderBy: { createdAt: 'desc' },
        take: CAROUSEL_TAKE,
      }),
      // Carousel: Top Vacancies (by views + applications)
      prisma.job.findMany({
        where: activeBase(now),
        include: includeEmployer,
        orderBy: { views: 'desc' },
        take: CAROUSEL_TAKE,
      }),
    ]);

    // Sort top vacancies by engagement score
    const sortedTop = [...carouselTop]
      .map(j => ({ ...j, score: j.views + (j._count?.applications || 0) * 10 }))
      .sort((a, b) => b.score - a.score);

    res.json({
      premiumJobs: withExpiry(premiumJobs),
      standardJobs: withExpiry(standardJobs),
      total,
      page: +page,
      pages: Math.ceil(total / +limit),
      carousels: {
        students:    withExpiry(carouselStudents),
        internships: withExpiry(carouselInternships),
        topSalaries: withExpiry(carouselTopSalaries),
        today:       withExpiry(carouselToday),
        top:         withExpiry(sortedTop),
      },
    });
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

    res.json({
      ...job,
      expiresAt: effectiveExpiry(job),
      employer: { ...job.employer, jobCount: job.employer._count.jobs }
    });
  } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    const {
      title, description, location, salaryMin, salaryMax, jobRegime, jobPeriod,
      experience, applicationMethod, category,
      isPremium, premiumBadgeLabel, highlightColor, featuredUntil,
      isForStudents, isInternship, expiresAt,
    } = req.body;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);

    const job = await prisma.job.create({
      data: {
        title, description, location,
        salaryMin: +salaryMin,
        ...(salaryMax && { salaryMax: +salaryMax }),
        ...(jobPeriod && { jobPeriod }),
        jobRegime,
        experience: experience || 'NONE',
        applicationMethod: applicationMethod || 'CV_ONLY',
        category: category || 'OTHER',
        employerProfileId: employer.id,
        isPremium: isPremium === true || isPremium === 'true',
        ...(premiumBadgeLabel && { premiumBadgeLabel }),
        ...(highlightColor && { highlightColor }),
        ...(featuredUntil && { featuredUntil: new Date(featuredUntil) }),
        isForStudents: isForStudents === true || isForStudents === 'true',
        isInternship: isInternship === true || isInternship === 'true',
        expiresAt: expiresAt ? new Date(expiresAt) : defaultExpiry,
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
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err) { next(err); }
};

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob, myJobs };
