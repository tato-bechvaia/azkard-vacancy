const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning database...');
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.employerProfile.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();
    console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const companies = [
    { email: 'tbc@test.com',      companyName: 'TBC Technology',     description: 'Leading Georgian fintech company', website: 'https://tbc.ge' },
    { email: 'bog@test.com',      companyName: 'Bank of Georgia',     description: 'Largest bank in Georgia', website: 'https://bog.ge' },
    { email: 'silknet@test.com',  companyName: 'Silknet',             description: 'Telecom and internet provider', website: 'https://silknet.com' },
    { email: 'geocell@test.com',  companyName: 'Geocell',             description: 'Mobile network operator', website: 'https://geocell.ge' },
    { email: 'cartu@test.com',    companyName: 'Cartu Group',         description: 'Diversified holding company', website: 'https://cartu.ge' },
  ];

  const jobs = [
    { title: 'Senior React Developer',        category: 'IT',         jobRegime: 'REMOTE',    salaryMin: 3500, salaryMax: 5000, experience: 'THREE_TO_FIVE', location: 'თბილისი',   description: 'We are looking for an experienced React developer to join our growing team. You will work on cutting-edge fintech products used by millions of Georgians.' },
    { title: 'Product Manager',               category: 'MANAGEMENT', jobRegime: 'HYBRID',    salaryMin: 4000, salaryMax: 6000, experience: 'FIVE_PLUS',     location: 'თბილისი',   description: 'Lead product strategy and roadmap for our core banking platform. Work closely with engineering, design, and business teams.' },
    { title: 'UI/UX Designer',                category: 'DESIGN',     jobRegime: 'REMOTE',    salaryMin: 2000, salaryMax: 3000, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Create beautiful and intuitive interfaces for our mobile and web applications. Figma expertise required.' },
    { title: 'Sales Manager',                 category: 'SALES',      jobRegime: 'FULL_TIME', salaryMin: 1500, salaryMax: 2500, experience: 'NONE',          location: 'თბილისი',   description: 'Drive revenue growth by acquiring new corporate clients. Strong communication skills and results-driven mindset needed.' },
    { title: 'Backend Node.js Developer',     category: 'IT',         jobRegime: 'HYBRID',    salaryMin: 2500, salaryMax: 4000, experience: 'THREE_TO_FIVE', location: 'ბათუმი',    description: 'Build and maintain scalable REST APIs for our banking platform. PostgreSQL and Node.js experience required.' },
    { title: 'Digital Marketing Specialist',  category: 'MARKETING',  jobRegime: 'REMOTE',    salaryMin: 1800, salaryMax: 2500, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Manage social media, SEO, and paid advertising campaigns. Experience with Google Ads and Meta Ads required.' },
    { title: 'Chief Accountant',              category: 'FINANCE',    jobRegime: 'FULL_TIME', salaryMin: 3000, salaryMax: 4500, experience: 'FIVE_PLUS',     location: 'თბილისი',   description: 'Oversee all financial operations and reporting. CPA certification and 5+ years experience required.' },
    { title: 'HR Specialist',                 category: 'MANAGEMENT', jobRegime: 'HYBRID',    salaryMin: 1200, salaryMax: 1800, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Manage recruitment, onboarding, and employee relations. Experience with ATS systems preferred.' },
    { title: 'iOS Developer',                 category: 'IT',         jobRegime: 'REMOTE',    salaryMin: 3000, salaryMax: 4500, experience: 'THREE_TO_FIVE', location: 'თბილისი',   description: 'Build and maintain our iOS mobile banking application. Swift and SwiftUI expertise required.' },
    { title: 'Data Analyst',                  category: 'IT',         jobRegime: 'HYBRID',    salaryMin: 2000, salaryMax: 3000, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Analyze business data and create actionable insights. SQL and Python skills required.' },
    { title: 'Customer Support Agent',        category: 'SALES',      jobRegime: 'FULL_TIME', salaryMin: 1000, salaryMax: 1400, experience: 'NONE',          location: 'თბილისი',   description: 'Handle customer inquiries via phone, email, and chat. Georgian and English fluency required.' },
    { title: 'DevOps Engineer',               category: 'IT',         jobRegime: 'REMOTE',    salaryMin: 4000, salaryMax: 6000, experience: 'THREE_TO_FIVE', location: 'თბილისი',   description: 'Manage cloud infrastructure on AWS. Experience with Docker, Kubernetes, and CI/CD pipelines required.' },
    { title: 'Brand Manager',                 category: 'MARKETING',  jobRegime: 'FULL_TIME', salaryMin: 2500, salaryMax: 3500, experience: 'THREE_TO_FIVE', location: 'თბილისი',   description: 'Develop and execute brand strategy across all channels. Creative thinking and analytical skills needed.' },
    { title: 'Legal Counsel',                 category: 'MANAGEMENT', jobRegime: 'FULL_TIME', salaryMin: 3500, salaryMax: 5000, experience: 'FIVE_PLUS',     location: 'თბილისი',   description: 'Provide legal advice on corporate, commercial, and regulatory matters. Law degree and bar admission required.' },
    { title: 'Junior Frontend Developer',     category: 'IT',         jobRegime: 'HYBRID',    salaryMin: 1200, salaryMax: 2000, experience: 'NONE',          location: 'ქუთაისი',   description: 'Join our frontend team and build modern web applications. Knowledge of HTML, CSS, and JavaScript required.' },
    { title: 'Financial Analyst',             category: 'FINANCE',    jobRegime: 'FULL_TIME', salaryMin: 2500, salaryMax: 3500, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Analyze financial data and prepare reports for senior management. Excel and financial modeling skills required.' },
    { title: 'Network Engineer',              category: 'IT',         jobRegime: 'FULL_TIME', salaryMin: 2000, salaryMax: 3000, experience: 'ONE_TO_THREE',  location: 'თბილისი',   description: 'Maintain and optimize our network infrastructure. CCNA certification preferred.' },
    { title: 'Content Writer',                category: 'MARKETING',  jobRegime: 'REMOTE',    salaryMin: 800,  salaryMax: 1500, experience: 'NONE',          location: 'თბილისი',   description: 'Create engaging content for our website, blog, and social media. Excellent Georgian and English writing skills required.' },
    { title: 'Project Manager',               category: 'MANAGEMENT', jobRegime: 'HYBRID',    salaryMin: 3000, salaryMax: 4000, experience: 'THREE_TO_FIVE', location: 'ბათუმი',    description: 'Lead cross-functional teams to deliver projects on time and within budget. PMP certification preferred.' },
    { title: 'Cybersecurity Specialist',      category: 'IT',         jobRegime: 'FULL_TIME', salaryMin: 4500, salaryMax: 7000, experience: 'FIVE_PLUS',     location: 'თბილისი',   description: 'Protect our systems and data from cyber threats. CISSP or CEH certification required.' },
  ];

  for (let i = 0; i < companies.length; i++) {
    const comp = companies[i];

    const user = await prisma.user.create({
      data: {
        email:        comp.email,
        passwordHash: passwordHash,
        role:         'EMPLOYER',
        employerProfile: {
          create: {
            companyName: comp.companyName,
            description: comp.description,
            website:     comp.website,
          }
        }
      },
      include: { employerProfile: true }
    });

    const employerProfileId = user.employerProfile.id;
    const companyJobs = jobs.slice(i * 4, i * 4 + 4);

    for (const job of companyJobs) {
      await prisma.job.create({
        data: {
          ...job,
          status:            'HIRING',
          applicationMethod: 'CV_ONLY',
          jobPeriod:         '1 თვე',
          employerProfileId,
          views:             Math.floor(Math.random() * 200) + 10,
        }
      });
    }

    console.log('Created: ' + comp.companyName);
  }

  console.log('Done! 20 jobs created across 5 companies.');
  console.log('Login: any company email + password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

  