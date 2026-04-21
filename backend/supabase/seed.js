require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const hash = (pw) => bcrypt.hash(pw, 12);

async function seed() {
  console.log('🌱 Seeding Supabase database...\n');

  // ── 1. Employers ──────────────────────────────────────────────────────────
  const employers = [
    { email: 'tbcbank@azkard.ge',     password: 'password123', companyName: 'TBC Bank',          description: 'საქართველოს წამყვანი კომერციული ბანკი.',             website: 'https://www.tbcbank.ge',   phone: '595100200' },
    { email: 'bog@azkard.ge',         password: 'password123', companyName: 'Bank of Georgia',   description: 'ერთ-ერთი უმსხვილესი ბანკი კავკასიაში.',             website: 'https://bankofgeorgia.ge', phone: '595200300' },
    { email: 'wissol@azkard.ge',      password: 'password123', companyName: 'Wissol Group',      description: 'ენერგეტიკა, საწვავი და მომსახურება.',                website: 'https://wissol.ge',        phone: '595300400' },
    { email: 'sweeft@azkard.ge',      password: 'password123', companyName: 'Sweeft Digital',    description: 'IT კომპანია, ფინტექ პროდუქტები და მობაილ ბანქი.', website: 'https://sweeft.com',       phone: '595400500' },
    { email: 'optio@azkard.ge',       password: 'password123', companyName: 'Optio.ai',          description: 'AI-driven customer experience პლათფორმა.',          website: 'https://optio.ai',         phone: '595500600' },
    { email: 'epiqe@azkard.ge',       password: 'password123', companyName: 'Epiqe',             description: 'პროდუქტული IT სტარტაპი თბილისიდან.',                website: 'https://epiqe.ge',         phone: '595600700' },
  ];

  const createdEmployers = [];
  for (const e of employers) {
    const passwordHash = await hash(e.password);
    const { data: user } = await supabase.from('users')
      .insert({ email: e.email, password_hash: passwordHash, role: 'EMPLOYER', phone: e.phone })
      .select().single();
    const { data: profile } = await supabase.from('employer_profiles')
      .insert({ user_id: user.id, company_name: e.companyName, description: e.description, website: e.website })
      .select().single();
    createdEmployers.push({ user, profile });
    console.log(`  ✓ Employer: ${e.companyName}`);
  }

  // ── 2. Candidates ─────────────────────────────────────────────────────────
  const candidates = [
    { email: 'giorgi.beridze@gmail.com',  password: 'password123', firstName: 'გიორგი',   lastName: 'ბერიძე',     headline: 'Full-Stack Developer | React & Node.js',   phone: '598111222' },
    { email: 'nino.kvaratskhelia@gmail.com', password: 'password123', firstName: 'ნინო',  lastName: 'კვარაცხელია', headline: 'UI/UX Designer | Figma & Prototyping',     phone: '598222333' },
    { email: 'luka.mchedlishvili@gmail.com', password: 'password123', firstName: 'ლუკა',  lastName: 'მჭედლიშვილი', headline: 'Junior Backend Developer | Python',        phone: '598333444' },
    { email: 'ana.shengelia@gmail.com',   password: 'password123', firstName: 'ანა',     lastName: 'შენგელია',    headline: 'Marketing Specialist | Digital & SEO',      phone: '598444555' },
    { email: 'davit.lomidze@gmail.com',   password: 'password123', firstName: 'დავით',   lastName: 'ლომიძე',      headline: 'Financial Analyst | Excel & Power BI',      phone: '598555666' },
    { email: 'mariam.janjgava@gmail.com', password: 'password123', firstName: 'მარიამი', lastName: 'ჯანჯღავა',    headline: 'HR Manager | Recruitment & Talent',         phone: '598666777' },
    { email: 'irakli.tabatadze@gmail.com',password: 'password123', firstName: 'ირაკლი', lastName: 'ტაბატაძე',     headline: 'DevOps Engineer | Docker & Kubernetes',     phone: '598777888' },
    { email: 'salome.gelashvili@gmail.com',password: 'password123', firstName: 'სალომე', lastName: 'გელაშვილი',   headline: 'Graphic Designer | Brand & Visual Identity', phone: '598888999' },
  ];

  const createdCandidates = [];
  for (const c of candidates) {
    const passwordHash = await hash(c.password);
    const { data: user } = await supabase.from('users')
      .insert({ email: c.email, password_hash: passwordHash, role: 'CANDIDATE', phone: c.phone })
      .select().single();
    const { data: profile } = await supabase.from('candidate_profiles')
      .insert({ user_id: user.id, first_name: c.firstName, last_name: c.lastName, headline: c.headline })
      .select().single();
    createdCandidates.push({ user, profile });
    console.log(`  ✓ Candidate: ${c.firstName} ${c.lastName}`);
  }

  // ── 3. Jobs ───────────────────────────────────────────────────────────────
  const now = new Date();
  const daysFromNow = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d.toISOString(); };
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString(); };

  const [tbc, bog, wissol, sweeft, optio, epiqe] = createdEmployers.map(e => e.profile);

  const jobs = [
    // TBC Bank
    { employer_profile_id: tbc.id, title: 'Senior React Developer', description: 'ვეძებთ გამოცდილ React დეველოპერს TBC-ს ციფრული პროდუქტების გუნდისთვის. პასუხისმგებლობები: ვებ აპლიკაციების შემუშავება, კოდ-რევიუ, ახალი სტანდარტების დანერგვა.', location: 'თბილისი', salary_min: 4000, salary_max: 6000, job_regime: 'HYBRID', experience: 'THREE_TO_FIVE', category: 'IT', is_premium: true, premium_badge_label: 'TOP', highlight_color: '#0066CC', expires_at: daysFromNow(25) },
    { employer_profile_id: tbc.id, title: 'Mobile Developer (iOS)', description: 'iOS დეველოპერი TBC-ს მობაილ ბანქის გუნდში. Swift და SwiftUI ცოდნა სავალდებულოა. ვმუშაობთ კვირაში 4 დღე ოფისში.', location: 'თბილისი', salary_min: 3500, salary_max: 5500, job_regime: 'HYBRID', experience: 'THREE_TO_FIVE', category: 'IT', expires_at: daysFromNow(20) },
    { employer_profile_id: tbc.id, title: 'Financial Risk Analyst', description: 'სარისკო ანალიტიკოსი ბანკის რისკ-მენეჯმენტის დეპარტამენტისთვის. საჭიროა Excel, SQL და სტატისტიკის ცოდნა.', location: 'თბილისი', salary_min: 2500, salary_max: 3500, job_regime: 'FULL_TIME', experience: 'ONE_TO_THREE', category: 'FINANCE', expires_at: daysFromNow(15) },

    // Bank of Georgia
    { employer_profile_id: bog.id, title: 'Backend Engineer (Java)', description: 'Java Backend ინჟინერი ბანკის ძირითადი სისტემების გუნდში. Spring Boot, Kafka, PostgreSQL გამოცდილება სასურველია.', location: 'თბილისი', salary_min: 4500, salary_max: 7000, job_regime: 'HYBRID', experience: 'THREE_TO_FIVE', category: 'IT', is_premium: true, premium_badge_label: 'HOT', highlight_color: '#E30613', expires_at: daysFromNow(30) },
    { employer_profile_id: bog.id, title: 'Product Manager', description: 'Product Manager ციფრული ბანქინგის პროდუქტისთვის. Agile/Scrum გამოცდილება, ბაზარის ანალიზი და პროდუქტ სტრატეგია.', location: 'თბილისი', salary_min: 3000, salary_max: 4500, job_regime: 'FULL_TIME', experience: 'THREE_TO_FIVE', category: 'MANAGEMENT', expires_at: daysFromNow(18) },
    { employer_profile_id: bog.id, title: 'Intern — Data Analytics', description: 'სტაჟიორი მონაცემთა ანალიტიკის გუნდში. Python ან R-ის საბაზისო ცოდნა. სტაჟირება 3 თვიანია ანაზღაურებით.', location: 'თბილისი', salary_min: 800, salary_max: 1000, job_regime: 'FULL_TIME', experience: 'NONE', category: 'IT', is_for_students: true, is_internship: true, expires_at: daysFromNow(10) },

    // Wissol
    { employer_profile_id: wissol.id, title: 'Sales Manager (B2B)', description: 'B2B გაყიდვების მენეჯერი კორპორატიული კლიენტების მოზიდვისა და შენარჩუნების პასუხისმგებლობით. ავტომობილი პლიუსი.', location: 'თბილისი', salary_min: 2000, salary_max: 3500, job_regime: 'FULL_TIME', experience: 'ONE_TO_THREE', category: 'SALES', expires_at: daysFromNow(22) },
    { employer_profile_id: wissol.id, title: 'Logistics Coordinator', description: 'ლოჯისტიკის კოორდინატორი საწვავის მიწოდების ოპერაციების მართვისთვის. ოპერაციული გამოცდილება სასურველია.', location: 'თბილისი', salary_min: 1500, salary_max: 2200, job_regime: 'FULL_TIME', experience: 'ONE_TO_THREE', category: 'LOGISTICS', expires_at: daysFromNow(12) },

    // Sweeft Digital
    { employer_profile_id: sweeft.id, title: 'React Native Developer', description: 'React Native დეველოპერი ფინტექ მობაილ აპლიკაციისთვის. TypeScript, Redux, REST API ინტეგრაცია.', location: 'Remote', salary_min: 3000, salary_max: 5000, job_regime: 'REMOTE', experience: 'ONE_TO_THREE', category: 'IT', expires_at: daysFromNow(28) },
    { employer_profile_id: sweeft.id, title: 'QA Engineer', description: 'QA ინჟინერი მობაილ და ვებ პროდუქტების ხარისხის კონტროლისთვის. Automation testing (Selenium/Appium) გამოცდილება.', location: 'თბილისი / Remote', salary_min: 2000, salary_max: 3000, job_regime: 'HYBRID', experience: 'ONE_TO_THREE', category: 'IT', expires_at: daysFromNow(20) },
    { employer_profile_id: sweeft.id, title: 'Junior Frontend Developer', description: 'Junior Frontend Developer სტარტაპ გარემოში. HTML, CSS, JavaScript, React ბაზისური ცოდნა. მენტორინგი გარანტირებულია.', location: 'თბილისი', salary_min: 1200, salary_max: 1800, job_regime: 'FULL_TIME', experience: 'NONE', category: 'IT', is_for_students: true, expires_at: daysFromNow(25) },

    // Optio.ai
    { employer_profile_id: optio.id, title: 'Machine Learning Engineer', description: 'ML ინჟინერი AI-driven პლათფორმის გუნდში. Python, TensorFlow/PyTorch, NLP გამოცდილება. Remote ვარიანტი შესაძლებელია.', location: 'Remote', salary_min: 5000, salary_max: 8000, job_regime: 'REMOTE', experience: 'THREE_TO_FIVE', category: 'IT', is_premium: true, premium_badge_label: 'REMOTE', highlight_color: '#7C3AED', expires_at: daysFromNow(35) },
    { employer_profile_id: optio.id, title: 'UX/UI Designer', description: 'UX/UI დიზაინერი პროდუქტის გუნდში. Figma, Adobe XD, user research გამოცდილება. ინგლისური ენის ცოდნა სავალდებულოა.', location: 'Remote', salary_min: 2500, salary_max: 4000, job_regime: 'REMOTE', experience: 'ONE_TO_THREE', category: 'DESIGN', expires_at: daysFromNow(20) },

    // Epiqe
    { employer_profile_id: epiqe.id, title: 'Full Stack Developer (Node + React)', description: 'Full-Stack Developer პატარა, მეგობრულ გუნდში. Node.js, React, PostgreSQL. სწრაფი ზრდის შესაძლებლობა.', location: 'თბილისი', salary_min: 2500, salary_max: 4000, job_regime: 'HYBRID', experience: 'ONE_TO_THREE', category: 'IT', expires_at: daysFromNow(15) },
    { employer_profile_id: epiqe.id, title: 'Digital Marketing Specialist', description: 'Digital Marketing სპეციალისტი B2C სტარტაპისთვის. SEO, Google Ads, Social Media, Content Marketing გამოცდილება.', location: 'თბილისი', salary_min: 1500, salary_max: 2500, job_regime: 'FULL_TIME', experience: 'ONE_TO_THREE', category: 'MARKETING', expires_at: daysFromNow(18) },
    { employer_profile_id: epiqe.id, title: 'Intern — Software Development', description: 'სოფტვეარ დეველოპმენტის სტაჟიორი. ნებისმიერი პროგრამირების ენის ბაზისური ცოდნა. ხელფასი + მენტორინგი.', location: 'თბილისი', salary_min: 600, salary_max: 900, job_regime: 'FULL_TIME', experience: 'NONE', category: 'IT', is_for_students: true, is_internship: true, expires_at: daysFromNow(14), created_at: new Date().toISOString() },
  ];

  const createdJobs = [];
  for (const j of jobs) {
    const { data: job } = await supabase.from('jobs').insert(j).select().single();
    createdJobs.push(job);
    console.log(`  ✓ Job: ${j.title}`);
  }

  // ── 4. Applications ───────────────────────────────────────────────────────
  const applications = [
    { job_id: createdJobs[0].id, candidate_profile_id: createdCandidates[0].profile.id, status: 'REVIEWING',   cover_letter: 'გამარჯობა, დიდი სურვილი მაქვს TBC-ს გუნდში გავაგრძელო კარიერა React-ის მიმართულებით.' },
    { job_id: createdJobs[0].id, candidate_profile_id: createdCandidates[2].profile.id, status: 'PENDING',     cover_letter: 'React-ში 2 წლიანი გამოცდილება მაქვს და ვფიქრობ კარგი ფიტი ვიქნები.' },
    { job_id: createdJobs[3].id, candidate_profile_id: createdCandidates[0].profile.id, status: 'SHORTLISTED', cover_letter: 'Java-ში 4 წლის გამოცდილება მაქვს, Spring Boot-ს კარგად ვიცნობ.' },
    { job_id: createdJobs[8].id, candidate_profile_id: createdCandidates[0].profile.id, status: 'PENDING',     cover_letter: 'React Native-ში გავაკეთე 3 პროექტი, TypeScript-ს ვიყენებ ყოველდღიურად.' },
    { job_id: createdJobs[1].id, candidate_profile_id: createdCandidates[1].profile.id, status: 'PENDING',     cover_letter: 'iOS-ის გამოცდილება 2 წელი, SwiftUI-ს კარგად ვიცნობ.' },
    { job_id: createdJobs[11].id, candidate_profile_id: createdCandidates[1].profile.id, status: 'REVIEWING',  cover_letter: 'Figma-ში 3 წელზე მეტია ვმუშაობ, user research-ის გამოცდილებაც მაქვს.' },
    { job_id: createdJobs[2].id, candidate_profile_id: createdCandidates[4].profile.id, status: 'HIRED',       cover_letter: 'ფინანსური ანალიზი ჩემი სპეციალობაა, Excel და SQL ვიცი.' },
    { job_id: createdJobs[5].id, candidate_profile_id: createdCandidates[2].profile.id, status: 'PENDING',     cover_letter: 'სტაჟირება ჩემთვის კარგი შესაძლებლობა იქნება მონაცემთა ანალიზის სფეროში.' },
    { job_id: createdJobs[6].id, candidate_profile_id: createdCandidates[3].profile.id, status: 'PENDING',     cover_letter: 'B2B გაყიდვების გამოცდილება მაქვს, კორპორატიულ კლიენტებთან მუშაობა მიყვარს.' },
    { job_id: createdJobs[12].id, candidate_profile_id: createdCandidates[0].profile.id, status: 'PENDING',    cover_letter: 'Full-Stack-ის გამოცდილება 2 წელი, Node.js და React ვიცი.' },
  ];

  for (const a of applications) {
    await supabase.from('applications').insert(a);
  }
  console.log(`  ✓ ${applications.length} applications created`);

  // ── 5. Company CV Boxes ───────────────────────────────────────────────────
  const boxes = [
    { company_id: tbc.id,    title: 'IT სპეციალისტები',   description: 'გამოგვიგზავნეთ CV თუ IT სფეროში გამოცდილება გაქვთ და გინდათ TBC-ს გუნდში გაწევრიანება.' },
    { company_id: tbc.id,    title: 'ფინანსების გუნდი',   description: 'ვეძებთ ფინანსების, ბუღალტერიისა და ეკონომიკის სპეციალისტებს.' },
    { company_id: bog.id,    title: 'ტექნოლოგიები & IT',  description: 'Bank of Georgia-ს IT გუნდი ყოველთვის ეძებს ნიჭიერ ადამიანებს.' },
    { company_id: sweeft.id, title: 'Developers Wanted',   description: 'Sweeft Digital is always hiring great engineers. Drop your CV here.' },
    { company_id: epiqe.id,  title: 'ნებისმიერი პოზიცია', description: 'Epiqe-ში ადგილი ყველასთვის არის — გამოგვიგზავნეთ CV.' },
  ];

  for (const b of boxes) {
    await supabase.from('company_boxes').insert(b);
  }
  console.log(`  ✓ ${boxes.length} company CV boxes created`);

  // ── 6. Notifications ──────────────────────────────────────────────────────
  const notifs = [
    { user_id: createdEmployers[0].user.id, message: 'გიორგი ბერიძემ გამოაგზავნა განაცხადი — Senior React Developer' },
    { user_id: createdEmployers[0].user.id, message: 'ლუკა მჭედლიშვილმა გამოაგზავნა განაცხადი — Senior React Developer' },
    { user_id: createdCandidates[4].user.id, message: 'თქვენი სტატუსი შეიცვალა — აყვანილია (Financial Risk Analyst)' },
    { user_id: createdCandidates[0].user.id, message: 'თქვენი სტატუსი შეიცვალა — განიხილება (Senior React Developer)' },
  ];

  for (const n of notifs) {
    await supabase.from('notifications').insert(n);
  }
  console.log(`  ✓ ${notifs.length} notifications created`);

  console.log('\n✅ Seed complete!\n');
  console.log('Employer logins (password: password123):');
  employers.forEach(e => console.log(`  ${e.email}`));
  console.log('\nCandidate logins (password: password123):');
  candidates.forEach(c => console.log(`  ${c.email}`));
}

seed().catch(console.error);
