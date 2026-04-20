/**
 * Additive job expansion — run with: node prisma/expand-jobs.js
 * Does NOT delete any existing data.
 * Creates new employers if they don't already exist, then adds jobs.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hash(pw, 12);

const days = (n) => new Date(Date.now() + n * 86400000);
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

async function upsertEmployer({ email, password, phone, companyName, description, website }) {
  let user = await prisma.user.findUnique({ where: { email }, include: { employerProfile: true } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hash(password),
        role: 'EMPLOYER',
        phone,
        isVerified: true,
        employerProfile: { create: { companyName, description, website } },
      },
      include: { employerProfile: true },
    });
    console.log(`  + employer: ${companyName}`);
  } else {
    console.log(`  = employer exists: ${companyName}`);
  }
  return user.employerProfile;
}

async function main() {
  console.log('Expanding jobs (additive)...\n');

  // ── New Employers ──────────────────────────────────────────────────────────
  const bog = await upsertEmployer({
    email: 'careers@bog.ge', password: 'password123', phone: '+995599200001',
    companyName: 'Bank of Georgia',
    description: 'Bank of Georgia — საქართველოს უმსხვილესი კომერციული ბანკი.',
    website: 'https://bankofgeorgia.ge',
  });

  const wolt = await upsertEmployer({
    email: 'jobs@wolt.ge', password: 'password123', phone: '+995599200002',
    companyName: 'Wolt Georgia',
    description: 'Wolt — სწრაფი მიწოდების სერვისი, ათასობით კურიერით საქართველოში.',
    website: 'https://wolt.com',
  });

  const gorgia = await upsertEmployer({
    email: 'hr@gorgia.ge', password: 'password123', phone: '+995599200003',
    companyName: 'Gorgia',
    description: 'Gorgia — ქართული ტექნოლოგიური კომპანია, ERP გადაწყვეტები ბიზნესებისთვის.',
    website: 'https://gorgia.ge',
  });

  const psp = await upsertEmployer({
    email: 'hr@psp.ge', password: 'password123', phone: '+995599200004',
    companyName: 'PSP Pharma',
    description: 'PSP Pharma — საქართველოს ყველაზე დიდი სააფთიაქო ქსელი.',
    website: 'https://psp.ge',
  });

  const silknet = await upsertEmployer({
    email: 'careers@silknet.com', password: 'password123', phone: '+995599200005',
    companyName: 'Silknet',
    description: 'Silknet — საქართველოს წამყვანი ტელეკომუნიკაციური კომპანია.',
    website: 'https://silknet.com',
  });

  const leavingstone = await upsertEmployer({
    email: 'hr@leavingstone.com', password: 'password123', phone: '+995599200006',
    companyName: 'Leavingstone',
    description: 'Leavingstone — კრეატიული სააგენტო, ბრენდინგი და ციფრული მარკეტინგი.',
    website: 'https://leavingstone.com',
  });

  // ── Look up existing employers ─────────────────────────────────────────────
  const findExisting = async (email) => {
    const u = await prisma.user.findUnique({ where: { email }, include: { employerProfile: true } });
    return u?.employerProfile || null;
  };

  const sweeft   = await findExisting('hr@sweeft.com');
  const tbc      = await findExisting('careers@tbcbank.ge');
  const space    = await findExisting('jobs@space.ge');
  const medicina = await findExisting('hr@medicinehouse.ge');
  const bpg      = await findExisting('careers@bpg.ge');
  const gpi      = await findExisting('hr@gpi.ge');
  const glovo    = await findExisting('jobs@glovo.ge');
  const nikora   = await findExisting('hr@nikora.ge');

  // ── Job definitions ────────────────────────────────────────────────────────
  // Helper to build a job record
  const j = (employerProfile, data) => ({ employerProfileId: employerProfile.id, ...data });

  const expiresIn = (offset, base = 0) => {
    const d = new Date(Date.now() - base * 86400000);
    d.setDate(d.getDate() + offset);
    return d;
  };

  const jobsToCreate = [

    // ── Bank of Georgia ───────────────────────────────────────────────────────
    j(bog, { title: 'Java Backend Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5500, currency: 'GEL', status: 'HIRING', views: 312, description: 'BOG ეძებს Java Backend Developer-ს. Spring Boot, Kafka, Kubernetes. 5+ წლის გამოცდილება.', location: 'თბილისი', expiresAt: expiresIn(25), isPremium: true, premiumBadgeLabel: 'HOT', highlightColor: '#ef4444', featuredUntil: days(25) }),
    j(bog, { title: 'Python Data Engineer', category: 'IT', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 4800, currency: 'GEL', status: 'HIRING', views: 278, description: 'Python, Apache Spark, Airflow, AWS S3. Data Pipeline-ების შექმნა.', location: 'თბილისი', expiresAt: expiresIn(20) }),
    j(bog, { title: 'Scrum Master', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 4000, currency: 'GEL', status: 'HIRING', views: 189, description: 'Scrum Master — Agile ceremonies, impediment removal, 2+ წელი.', location: 'თბილისი', expiresAt: expiresIn(18) }),
    j(bog, { title: 'Credit Risk Manager', category: 'FINANCE', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 5000, currency: 'GEL', status: 'HIRING', views: 245, description: 'კრედიტული რისკის შეფასება, IFRS 9, Basel III. CFA ან FRM სასურველი.', location: 'თბილისი', expiresAt: expiresIn(22) }),
    j(bog, { title: 'UX Researcher', category: 'DESIGN', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3200, currency: 'GEL', status: 'HIRING', views: 167, description: 'User interviews, usability testing, journey mapping. 2+ წელი UX Research-ში.', location: 'თბილისი', expiresAt: expiresIn(28) }),
    j(bog, { title: 'AML Compliance Officer', category: 'FINANCE', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 3800, currency: 'GEL', status: 'HIRING', views: 203, description: 'ფულის გათეთრების პრევენცია, SAR ანგარიშები, FATF სტანდარტები.', location: 'თბილისი', expiresAt: expiresIn(15) }),
    j(bog, { title: 'iOS Developer (Swift)', category: 'IT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5200, currency: 'GEL', status: 'HIRING', views: 334, description: 'SwiftUI, Combine, Core Data. BOG Mobile Banking App-ის შემუშავება.', location: 'თბილისი', expiresAt: expiresIn(26) }),
    j(bog, { title: 'Junior Frontend Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 2000, currency: 'GEL', status: 'HIRING', views: 521, description: 'React.js, HTML/CSS, TypeScript ბაზისური ცოდნა. სტუდენტებისთვის მისაღები.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
    j(bog, { title: 'IT Internship Program', category: 'IT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 800, currency: 'GEL', status: 'HIRING', views: 889, description: 'BOG IT სტაჟირების 3-თვიანი პროგრამა. სტუდენტებისა და კურსდამთავრებულებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(bog, { title: 'HR Business Partner', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 198, description: 'Talent management, succession planning, OKR. HRBP 3+ წლის გამოცდილება.', location: 'თბილისი', expiresAt: expiresIn(19) }),
    j(bog, { title: 'Digital Marketing Specialist', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 276, description: 'Google Ads, Meta Ads, SEO/SEM, Analytics. 2+ წელი ციფრულ მარკეტინგში.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    j(bog, { title: 'Branch Manager — Batumi', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'FIVE_PLUS', salaryMin: 6500, currency: 'GEL', status: 'HIRING', views: 145, description: 'ბათუმის ფილიალის სრული ხელმძღვანელობა. 5+ წელი საბანკო სფეროში.', location: 'ბათუმი', expiresAt: expiresIn(21) }),
    j(bog, { title: 'Network Security Engineer', category: 'IT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 5800, currency: 'GEL', status: 'HIRING', views: 187, description: 'Firewall, IDS/IPS, SIEM. Cisco CCNP Security ან CEH სასურველი.', location: 'თბილისი', expiresAt: expiresIn(17) }),
    j(bog, { title: 'Finance Internship', category: 'FINANCE', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 700, currency: 'GEL', status: 'HIRING', views: 654, description: 'ფინანსური ანალიზის სტაჟირება. დღის ბოლო კურსის სტუდენტებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),

    // ── Wolt Georgia ──────────────────────────────────────────────────────────
    j(wolt, { title: 'City Operations Lead', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 412, description: 'ქალაქის ოპერაციების ხელმძღვანელობა, KPI-ების მართვა, courier engagement.', location: 'თბილისი', expiresAt: expiresIn(22), isPremium: true, premiumBadgeLabel: 'FEATURED', highlightColor: '#00b4d8', featuredUntil: days(22) }),
    j(wolt, { title: 'Restaurant Partner Manager', category: 'SALES', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3000, currency: 'GEL', status: 'HIRING', views: 289, description: 'რესტორნებთან პარტნიორობის ადმინისტრირება, onboarding, growth მხარდაჭერა.', location: 'თბილისი', expiresAt: expiresIn(18) }),
    j(wolt, { title: 'Backend Engineer (Go)', category: 'IT', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 6000, currency: 'GEL', status: 'HIRING', views: 445, description: 'Go, microservices, gRPC, Kafka, PostgreSQL. Wolt-ის backend პლატფორმაზე.', location: 'Remote', expiresAt: expiresIn(28) }),
    j(wolt, { title: 'Data Analyst — Growth', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3500, currency: 'GEL', status: 'HIRING', views: 367, description: 'SQL, Python, Looker. Growth metrics, cohort analysis, A/B testing.', location: 'თბილისი', expiresAt: expiresIn(25) }),
    j(wolt, { title: 'Marketing Specialist', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2500, currency: 'GEL', status: 'HIRING', views: 234, description: 'კამპანიების მენეჯმენტი, influencer marketing, social media. Wolt Georgia.', location: 'თბილისი', expiresAt: expiresIn(20) }),
    j(wolt, { title: 'Courier Support Specialist', category: 'LOGISTICS', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 1400, currency: 'GEL', status: 'HIRING', views: 678, description: 'კურიერების მხარდაჭერა, Issue resolution, shift coordination.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
    j(wolt, { title: 'Android Developer', category: 'IT', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 5500, currency: 'GEL', status: 'HIRING', views: 398, description: 'Kotlin, Jetpack Compose, Coroutines. Wolt customer app.', location: 'Remote', expiresAt: expiresIn(23) }),
    j(wolt, { title: 'Logistics Intern', category: 'LOGISTICS', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 600, currency: 'GEL', status: 'HIRING', views: 543, description: 'ოპერაციების სტაჟირება Wolt Georgia-ში. 3 თვე, სამუშაო შეთავაზების შესაძლებლობა.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(wolt, { title: 'Finance Controller', category: 'FINANCE', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 4200, currency: 'GEL', status: 'HIRING', views: 167, description: 'P&L მართვა, budget planning, IFRS ანგარიშგება. ACCA სასურველი.', location: 'თბილისი', expiresAt: expiresIn(19) }),

    // ── Gorgia ────────────────────────────────────────────────────────────────
    j(gorgia, { title: 'Senior PHP Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 312, description: 'Laravel, Vue.js, MySQL. Gorgia ERP პლატფორმის შემუშავება.', location: 'თბილისი', expiresAt: expiresIn(22), isPremium: true, premiumBadgeLabel: 'NEW', highlightColor: '#10b981', featuredUntil: days(22) }),
    j(gorgia, { title: 'DevOps / Cloud Engineer', category: 'IT', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 5000, currency: 'GEL', status: 'HIRING', views: 276, description: 'AWS, Terraform, Docker, CI/CD. Cloud infrastructure management.', location: 'Remote', expiresAt: expiresIn(26) }),
    j(gorgia, { title: 'Product Designer', category: 'DESIGN', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3000, currency: 'GEL', status: 'HIRING', views: 334, description: 'Figma, Design System, Prototyping. B2B SaaS პროდუქტის დიზაინი.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    j(gorgia, { title: 'Technical Support Specialist', category: 'IT', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 1600, currency: 'GEL', status: 'HIRING', views: 445, description: 'კლიენტების ტექნიკური მხარდაჭერა, ticket system, ERP troubleshooting.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
    j(gorgia, { title: 'B2B Sales Manager', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 267, description: 'B2B გაყიდვები, SaaS pipeline management, CRM. ინგლისური B2+.', location: 'თბილისი', expiresAt: expiresIn(20) }),
    j(gorgia, { title: 'QA Engineer', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2500, currency: 'GEL', status: 'HIRING', views: 198, description: 'Selenium, Playwright, API testing, Postman. Manual + Automation.', location: 'თბილისი', expiresAt: expiresIn(18) }),
    j(gorgia, { title: 'React Frontend Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3500, currency: 'GEL', status: 'HIRING', views: 389, description: 'React, TypeScript, Redux. ERP front-end interfaces.', location: 'თბილისი', expiresAt: expiresIn(25) }),
    j(gorgia, { title: 'IT Internship — Development', category: 'IT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 750, currency: 'GEL', status: 'HIRING', views: 712, description: 'Development სტაჟირება Gorgia-ში. PHP/JS სტუდენტებისთვის. 4 თვე.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(gorgia, { title: 'Customer Success Manager', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3200, currency: 'GEL', status: 'HIRING', views: 223, description: 'კლიენტების onboarding, retention, upsell. SaaS customer success.', location: 'თბილისი', expiresAt: expiresIn(21) }),

    // ── PSP Pharma ────────────────────────────────────────────────────────────
    j(psp, { title: 'Pharmacist', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2200, currency: 'GEL', status: 'HIRING', views: 345, description: 'ფარმაცევტი სააფთიაქო ქსელში. ფარმაციის ლიცენზია სავალდებულოა.', location: 'თბილისი', expiresAt: expiresIn(22) }),
    j(psp, { title: 'Regional Sales Manager', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 234, description: 'რეგიონალური გაყიდვების მართვა, 15+ სააფთიაქო, ბიუჯეტი, გუნდი.', location: 'თბილისი', expiresAt: expiresIn(19), isPremium: true, premiumBadgeLabel: 'URGENT', highlightColor: '#f97316', featuredUntil: days(19) }),
    j(psp, { title: 'Medical Representative', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2500, currency: 'GEL', status: 'HIRING', views: 289, description: 'ექიმებთან და კლინიკებთან კომუნიკაცია. სამედიცინო ან ბიოლოგიის განათლება.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    j(psp, { title: 'Supply Chain Analyst', category: 'LOGISTICS', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 167, description: 'მარაგების ოპტიმიზაცია, ERP სისტემა, მომწოდებლებთან მუშაობა.', location: 'თბილისი', expiresAt: expiresIn(20) }),
    j(psp, { title: 'Pharmacy Intern', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 650, currency: 'GEL', status: 'HIRING', views: 456, description: 'ფარმაციის სტუდენტებისთვის სტაჟირება PSP ქსელში. სახელმწიფო სერტიფიკატი.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(psp, { title: 'Digital Health Specialist', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3000, currency: 'GEL', status: 'HIRING', views: 198, description: 'Digital health პლატფორმების მხარდაჭერა, telemedicine, EHR სისტემები.', location: 'თბილისი', expiresAt: expiresIn(17) }),
    j(psp, { title: 'HR Recruiter', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 1600, currency: 'GEL', status: 'HIRING', views: 312, description: 'Talent Acquisition, ATS სისტემა, interview coordination. HR სფეროში Entry Level.', location: 'თბილისი', expiresAt: expiresIn(26), isForStudents: true }),
    j(psp, { title: 'Store Operations Manager', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 3800, currency: 'GEL', status: 'HIRING', views: 178, description: 'სააფთიაქო ქსელის ოპერაციების ოპტიმიზაცია, P&L კონტროლი.', location: 'ბათუმი', expiresAt: expiresIn(23) }),

    // ── Silknet ───────────────────────────────────────────────────────────────
    j(silknet, { title: 'Telecom Network Engineer', category: 'IT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 256, description: 'MPLS, BGP, OSPF. Fiber network planning და maintenance.', location: 'თბილისი', expiresAt: expiresIn(22) }),
    j(silknet, { title: 'B2B Account Manager', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 3200, currency: 'GEL', status: 'HIRING', views: 312, description: 'B2B კლიენტების მართვა, contract negotiations, upsell. ინგლ. B2+.', location: 'თბილისი', expiresAt: expiresIn(18), isPremium: true, premiumBadgeLabel: 'TOP VACANCY', highlightColor: '#6366f1', featuredUntil: days(18) }),
    j(silknet, { title: 'Cybersecurity Analyst', category: 'IT', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 4000, currency: 'GEL', status: 'HIRING', views: 334, description: 'SOC operations, SIEM, threat hunting, incident response.', location: 'თბილისი', expiresAt: expiresIn(25) }),
    j(silknet, { title: 'Fiber Optic Technician', category: 'IT', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 1800, currency: 'GEL', status: 'HIRING', views: 178, description: 'ოპტიკური ბოჭკოს გაყვანა, სპლაისინგი, OTDR გაზომვები.', location: 'თბილისი', expiresAt: expiresIn(20) }),
    j(silknet, { title: 'Cloud Solutions Architect', category: 'IT', jobRegime: 'REMOTE', experience: 'FIVE_PLUS', salaryMin: 8000, currency: 'GEL', status: 'HIRING', views: 445, description: 'AWS/Azure architecture, enterprise cloud migration, pre-sales.', location: 'Remote', expiresAt: expiresIn(28) }),
    j(silknet, { title: 'Customer Experience Specialist', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 1400, currency: 'GEL', status: 'HIRING', views: 567, description: 'Call center, CRM, customer satisfaction. გამოცდილება სავალდებულო არ არის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
    j(silknet, { title: 'IT Intern — Networks', category: 'IT', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 700, currency: 'GEL', status: 'HIRING', views: 623, description: 'Network engineering სტაჟირება. IT ან ტელეკომ სტუდენტებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(silknet, { title: 'Product Manager — B2C', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5500, currency: 'GEL', status: 'HIRING', views: 289, description: 'B2C product roadmap, user research, cross-functional coordination.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    j(silknet, { title: 'Marketing Analytics Manager', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3500, currency: 'GEL', status: 'HIRING', views: 234, description: 'Google Analytics, Data Studio, SQL. Marketing performance analysis.', location: 'თბილისი', expiresAt: expiresIn(21) }),

    // ── Leavingstone ──────────────────────────────────────────────────────────
    j(leavingstone, { title: 'Brand Strategist', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5000, currency: 'GEL', status: 'HIRING', views: 345, description: 'ბრენდ სტრატეგიის შემუშავება, positioning, visual identity direction.', location: 'თბილისი', expiresAt: expiresIn(22), isPremium: true, premiumBadgeLabel: 'PREMIUM', highlightColor: '#f59e0b', featuredUntil: days(22) }),
    j(leavingstone, { title: 'Motion Designer', category: 'DESIGN', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3500, currency: 'GEL', status: 'HIRING', views: 456, description: 'After Effects, Cinema 4D, Lottie. Motion graphics for digital campaigns.', location: 'თბილისი', expiresAt: expiresIn(25) }),
    j(leavingstone, { title: 'Senior Copywriter', category: 'MARKETING', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 4000, currency: 'GEL', status: 'HIRING', views: 312, description: 'ქართული და ინგლისური კოპირაიტინგი. ATL/BTL, digital, OOH. Portfolio სავალდებულოა.', location: 'Remote', expiresAt: expiresIn(20) }),
    j(leavingstone, { title: 'Social Media Manager', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 389, description: 'Instagram, TikTok, Facebook. Content calendar, community management, ads.', location: 'თბილისი', expiresAt: expiresIn(18) }),
    j(leavingstone, { title: 'Web Developer (React)', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3200, currency: 'GEL', status: 'HIRING', views: 267, description: 'React, Next.js, Tailwind. Marketing site development for clients.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    j(leavingstone, { title: 'Creative Intern', category: 'DESIGN', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 700, currency: 'GEL', status: 'HIRING', views: 534, description: 'Creative სტაჟირება სააგენტოში. Graphic design, copywriting, social media.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    j(leavingstone, { title: 'Account Manager', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3000, currency: 'GEL', status: 'HIRING', views: 223, description: 'კლიენტებთან ურთიერთობა, campaign briefings, deliverables tracking.', location: 'თბილისი', expiresAt: expiresIn(19) }),
    j(leavingstone, { title: 'PR Specialist', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2600, currency: 'GEL', status: 'HIRING', views: 198, description: 'მედია-ურთიერთობები, press releases, event PR, spokesperson coaching.', location: 'თბილისი', expiresAt: expiresIn(23) }),

    // ── Extra jobs for existing employers ─────────────────────────────────────
    ...(sweeft ? [
      j(sweeft, { title: 'Angular Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 3500, currency: 'GEL', status: 'HIRING', views: 289, description: 'Angular 16+, RxJS, NgRx. Enterprise web application development.', location: 'თბილისი', expiresAt: expiresIn(20) }),
      j(sweeft, { title: 'Machine Learning Engineer', category: 'IT', jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', salaryMin: 7000, currency: 'GEL', status: 'HIRING', views: 512, description: 'Python, TensorFlow, PyTorch, MLflow. NLP, CV models for product features.', location: 'Remote', expiresAt: expiresIn(28), isPremium: true, premiumBadgeLabel: 'HOT', highlightColor: '#ef4444', featuredUntil: days(28) }),
      j(sweeft, { title: 'Internship — React Developer', category: 'IT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 800, currency: 'GEL', status: 'HIRING', views: 867, description: 'Sweeft Digital-ის 3-თვიანი Frontend სტაჟირება. React, TypeScript-ის სამეცადინო კურსი შედის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
      j(sweeft, { title: 'Scrum Master / Agile Coach', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5000, currency: 'GEL', status: 'HIRING', views: 178, description: 'PSM II, Agile coaching, retrospectives, velocity improvement. 3+ წელი.', location: 'თბილისი', expiresAt: expiresIn(22) }),
    ] : []),

    ...(tbc ? [
      j(tbc, { title: 'Blockchain Engineer', category: 'IT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 7500, currency: 'GEL', status: 'HIRING', views: 389, description: 'Solidity, Ethereum, Web3.js. TBC-ს DeFi ინიციატივებზე.', location: 'თბილისი', expiresAt: expiresIn(26), isPremium: true, premiumBadgeLabel: 'PREMIUM', highlightColor: '#8b5cf6', featuredUntil: days(26) }),
      j(tbc, { title: 'Treasury Analyst', category: 'FINANCE', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 3800, currency: 'GEL', status: 'HIRING', views: 212, description: 'ლიკვიდობის მართვა, FX hedging, money market operations.', location: 'თბილისი', expiresAt: expiresIn(18) }),
      j(tbc, { title: 'Data Science Intern', category: 'IT', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 900, currency: 'GEL', status: 'HIRING', views: 745, description: 'ML/AI სტაჟირება TBC-ს Data Science გუნდში. Python, SQL სტუდენტებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
      j(tbc, { title: 'SME Relationship Manager', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 5000, currency: 'GEL', status: 'HIRING', views: 267, description: 'SME კლიენტების პორტფოლიო, lending, cross-sell. 3+ წელი ბანკინგში.', location: 'თბილისი', expiresAt: expiresIn(21) }),
      j(tbc, { title: 'Graphic Designer', category: 'DESIGN', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 334, description: 'Figma, Illustrator, Photoshop. TBC-ს ბრენდ მასალები, ციფრული და ბეჭდვითი.', location: 'თბილისი', expiresAt: expiresIn(24) }),
    ] : []),

    ...(space ? [
      j(space, { title: 'Interior Designer', category: 'DESIGN', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 3000, currency: 'GEL', status: 'HIRING', views: 423, description: 'ინტერიერის დიზაინი კომერციული სივრცეებისთვის. AutoCAD, 3ds Max, SketchUp.', location: 'თბილისი', expiresAt: expiresIn(20) }),
      j(space, { title: 'Real Estate Sales Agent', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 1200, currency: 'GEL', status: 'HIRING', views: 567, description: 'უძრავი ქონების გაყიდვები. კომისია + ბაზი. ახალი კადრებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
      j(space, { title: 'Hospitality Manager', category: 'HOSPITALITY', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 234, description: 'სასტუმრო ქსელის ოპერაციების ხელმძღვანელობა. Hospitality 3+ წლის გამოცდილება.', location: 'ბათუმი', expiresAt: expiresIn(19), isPremium: true, premiumBadgeLabel: 'FEATURED', highlightColor: '#f59e0b', featuredUntil: days(19) }),
      j(space, { title: 'Event Coordinator', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2500, currency: 'GEL', status: 'HIRING', views: 312, description: 'კორპორატიული ღონისძიებების ორგანიზება, vendor management, budget control.', location: 'თბილისი', expiresAt: expiresIn(22) }),
      j(space, { title: 'Internship — Marketing', category: 'MARKETING', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 650, currency: 'GEL', status: 'HIRING', views: 498, description: 'Space International-ის Marketing სტაჟირება. SMM, content, campaign support.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    ] : []),

    ...(medicina ? [
      j(medicina, { title: 'Neurologist', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 6000, currency: 'GEL', status: 'HIRING', views: 234, description: 'ნევროლოგი — ამბულატორიული, EEG, EMG. სპეციალიზაციის სერტიფიკატი.', location: 'თბილისი', expiresAt: expiresIn(24), isPremium: true, premiumBadgeLabel: 'URGENT', highlightColor: '#ef4444', featuredUntil: days(24) }),
      j(medicina, { title: 'Radiologist', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 6500, currency: 'GEL', status: 'HIRING', views: 198, description: 'CT, MRI ინტერპრეტაცია. Radiology-ს სპეციალიზაცია სავალდებულოა.', location: 'თბილისი', expiresAt: expiresIn(22) }),
      j(medicina, { title: 'Nurse — ICU', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2200, currency: 'GEL', status: 'HIRING', views: 312, description: 'ინტენსიური თერაპიის მედდა. ლიცენზია სავალდებულოა.', location: 'თბილისი', expiresAt: expiresIn(18) }),
      j(medicina, { title: 'Medical Intern', category: 'HEALTHCARE', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 600, currency: 'GEL', status: 'HIRING', views: 389, description: 'სამედიცინო სტაჟირება ორდინატორებისთვის. Medicina House-ის ყველა სპეციალობაში.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    ] : []),

    ...(bpg ? [
      j(bpg, { title: 'Tax Consultant', category: 'FINANCE', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 4200, currency: 'GEL', status: 'HIRING', views: 256, description: 'საქართველოს საგადასახადო კოდექსი, VAT, CIT, transfer pricing. ACCA/CPA.', location: 'თბილისი', expiresAt: expiresIn(21) }),
      j(bpg, { title: 'Management Consultant', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', salaryMin: 5500, currency: 'GEL', status: 'HIRING', views: 334, description: 'ბიზნეს პროცესების ოპტიმიზაცია, change management, process mapping.', location: 'თბილისი', expiresAt: expiresIn(25), isPremium: true, premiumBadgeLabel: 'PREMIUM', highlightColor: '#8b5cf6', featuredUntil: days(25) }),
      j(bpg, { title: 'Finance Intern', category: 'FINANCE', jobRegime: 'HYBRID', experience: 'NONE', salaryMin: 700, currency: 'GEL', status: 'HIRING', views: 523, description: 'ფინანსური კონსალტინგის სტაჟირება. Excel, ანგარიშგების ბაზა. ეკონომიკის სტუდენტებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    ] : []),

    ...(gpi ? [
      j(gpi, { title: 'Actuarial Analyst', category: 'FINANCE', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 167, description: 'სადაზღვევო პოლისების price-ing, reserve calculations. IFoA/SOA.', location: 'თბილისი', expiresAt: expiresIn(20) }),
      j(gpi, { title: 'Claims Adjuster', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', salaryMin: 2800, currency: 'GEL', status: 'HIRING', views: 234, description: 'სადაზღვევო შემთხვევების შეფასება, ანაზღაურება, SLA-ების კონტროლი.', location: 'თბილისი', expiresAt: expiresIn(22) }),
      j(gpi, { title: 'Insurance Sales Intern', category: 'SALES', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 600, currency: 'GEL', status: 'HIRING', views: 423, description: 'სადაზღვევო გაყიდვების სტაჟირება. 3 თვე, კომისია + base. სტუდენტებისთვის.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    ] : []),

    ...(glovo ? [
      j(glovo, { title: 'Growth Manager', category: 'MANAGEMENT', jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', salaryMin: 4000, currency: 'GEL', status: 'HIRING', views: 312, description: 'User acquisition, retention, referral programs. SQL, Tableau.', location: 'თბილისი', expiresAt: expiresIn(24), isPremium: true, premiumBadgeLabel: 'NEW', highlightColor: '#10b981', featuredUntil: days(24) }),
      j(glovo, { title: 'Courier Experience Intern', category: 'LOGISTICS', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 650, currency: 'GEL', status: 'HIRING', views: 489, description: 'Glovo-ს courier ops სტაჟირება. ოპერაციები, Support, community building.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
      j(glovo, { title: 'Senior Data Scientist', category: 'IT', jobRegime: 'REMOTE', experience: 'FIVE_PLUS', salaryMin: 9000, currency: 'GEL', status: 'HIRING', views: 456, description: 'Python, SQL, ML models for delivery ETA prediction, demand forecasting.', location: 'Remote', expiresAt: expiresIn(26) }),
    ] : []),

    ...(nikora ? [
      j(nikora, { title: 'Category Manager', category: 'MANAGEMENT', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4000, currency: 'GEL', status: 'HIRING', views: 234, description: 'FMCG კატეგორიების მართვა, assortment, pricing, promo. Retail 3+ წელი.', location: 'თბილისი', expiresAt: expiresIn(20) }),
      j(nikora, { title: 'Supply Chain Manager', category: 'LOGISTICS', jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', salaryMin: 4500, currency: 'GEL', status: 'HIRING', views: 198, description: 'მომწოდებლებთან მოლაპარაკება, inventory, logistics optimization.', location: 'თბილისი', expiresAt: expiresIn(22), isPremium: true, premiumBadgeLabel: 'FEATURED', highlightColor: '#0ea5e9', featuredUntil: days(22) }),
      j(nikora, { title: 'Cashier / Retail Intern', category: 'OTHER', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 900, currency: 'GEL', status: 'HIRING', views: 678, description: 'ნიკორას ქსელში სამუშაო. ხელფასი + გამოცდილება. სტუდენტებისთვის შესაფერი.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true }),
      j(nikora, { title: 'Digital Transformation Manager', category: 'IT', jobRegime: 'HYBRID', experience: 'FIVE_PLUS', salaryMin: 7000, currency: 'GEL', status: 'HIRING', views: 289, description: 'ERP, POS, e-commerce integration. Retail digital transformation lead.', location: 'თბილისი', expiresAt: expiresIn(25) }),
      j(nikora, { title: 'Retail Marketing Intern', category: 'MARKETING', jobRegime: 'FULL_TIME', experience: 'NONE', salaryMin: 650, currency: 'GEL', status: 'HIRING', views: 412, description: 'ნიკორას მარკეტინგის სტაჟირება. In-store promo, social media, content.', location: 'თბილისი', expiresAt: expiresIn(30), isForStudents: true, isInternship: true }),
    ] : []),

  ];

  let created = 0;
  for (const jobData of jobsToCreate) {
    await prisma.job.create({ data: jobData });
    created++;
  }

  // Add company boxes for new employers if they don't have one
  const boxEmployers = [
    { profile: bog, title: 'BOG Talent Pool', description: 'Bank of Georgia-ს ნიჭიერი კადრების ბანკი. CV ნებისმიერ დროს.' },
    { profile: wolt, title: 'Wolt Open Applications', description: 'Wolt Georgia — ყველა ღია პოზიციისთვის.' },
    { profile: gorgia, title: 'Gorgia Careers', description: 'Gorgia-ს გუნდში შეუერთდი — IT, Sales, Design.' },
    { profile: psp, title: 'PSP Pharma Talent', description: 'PSP-ის talent pool. ჯანდაცვა, გაყიდვები, ლოჯისტიკა.' },
    { profile: silknet, title: 'Silknet Careers', description: 'Silknet-ი — telecom ინდუსტრიის ლიდერი. გამოგვიგზავნე CV.' },
    { profile: leavingstone, title: 'Leavingstone Creative Pool', description: 'კრეატიული სააგენტოს talent pool. Design, Copy, Strategy.' },
  ];

  for (const { profile, title, description } of boxEmployers) {
    const existing = await prisma.companyBox.findFirst({ where: { companyId: profile.id } });
    if (!existing) {
      await prisma.companyBox.create({ data: { companyId: profile.id, title, description, isActive: true } });
      console.log(`  + company box: ${title}`);
    }
  }

  const totalJobs = await prisma.job.count();
  console.log(`\n✓ Done! Created ${created} new jobs. Total jobs in DB: ${totalJobs}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
