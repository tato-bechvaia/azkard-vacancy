const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.cVSubmission.deleteMany();
  await prisma.companyBox.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding...');
  const hash = (pw) => bcrypt.hash(pw, 12);

  // ── EMPLOYERS ──────────────────────────────────────────────────────────────
  const employerData = [
    {
      email: 'hr@sweeft.com',
      password: 'password123',
      phone: '+995599100001',
      companyName: 'Sweeft Digital',
      description: 'ვართ ერთ-ერთი ყველაზე სწრაფად მზარდი ტექნოლოგიური კომპანია საქართველოში. ვქმნით ინოვაციურ პროდუქტებს გლობალური ბაზრებისთვის.',
      website: 'https://sweeft.com',
    },
    {
      email: 'careers@tbcbank.ge',
      password: 'password123',
      phone: '+995599100002',
      companyName: 'TBC Bank',
      description: 'TBC ბანკი — საქართველოს ერთ-ერთი წამყვანი ფინანსური ინსტიტუტი, რომელიც გვთავაზობს ინოვაციურ ბანკინგ გადაწყვეტებს.',
      website: 'https://tbcbank.ge',
    },
    {
      email: 'jobs@space.ge',
      password: 'password123',
      phone: '+995599100003',
      companyName: 'Space International',
      description: 'Space International — საქართველოში ყველაზე სწრაფად მზარდი მრავალსფეროიანი ჰოლდინგი.',
      website: 'https://space.ge',
    },
    {
      email: 'hr@medicinehouse.ge',
      password: 'password123',
      phone: '+995599100004',
      companyName: 'Medicina House',
      description: 'საქართველოს ერთ-ერთი წამყვანი კლინიკა — გვთავაზობთ სრულ სამედიცინო მომსახურებას თანამედროვე ტექნოლოგიებით.',
      website: 'https://medicinehouse.ge',
    },
    {
      email: 'careers@bpg.ge',
      password: 'password123',
      phone: '+995599100005',
      companyName: 'BPG',
      description: 'BPG — ბიზნეს პროცესების მართვის კომპანია, B2B და B2C სეგმენტებში.',
      website: 'https://bpg.ge',
    },
    {
      email: 'hr@gpi.ge',
      password: 'password123',
      phone: '+995599100006',
      companyName: 'GPI Holding',
      description: 'GPI Holding — საქართველოს მსხვილი სადაზღვევო კომპანია სიცოცხლის, ჯანმრთელობისა და ქონების დაზღვევაში.',
      website: 'https://gpi.ge',
    },
    {
      email: 'jobs@glovo.ge',
      password: 'password123',
      phone: '+995599100007',
      companyName: 'Glovo Georgia',
      description: 'Glovo — ევროპის წამყვანი სწრაფი მიწოდების პლატფორმა, 2019 წლიდან ვმუშაობთ საქართველოში.',
      website: 'https://glovoapp.com',
    },
    {
      email: 'hr@nikora.ge',
      password: 'password123',
      phone: '+995599100008',
      companyName: 'Nikora Trade',
      description: 'ნიკორა — საქართველოს ერთ-ერთი ყველაზე პოპულარული სასურსათო ქსელი 400+ მაღაზიით.',
      website: 'https://nikora.ge',
    },
  ];

  const employers = [];
  for (const e of employerData) {
    const user = await prisma.user.create({
      data: {
        email: e.email,
        passwordHash: await hash(e.password),
        role: 'EMPLOYER',
        phone: e.phone,
        isVerified: true,
        employerProfile: {
          create: {
            companyName: e.companyName,
            description: e.description,
            website: e.website,
          },
        },
      },
      include: { employerProfile: true },
    });
    employers.push(user.employerProfile);
    console.log(`  employer: ${e.companyName}`);
  }

  // ── CANDIDATES ─────────────────────────────────────────────────────────────
  const candidateData = [
    { email: 'giorgi.beridze@gmail.com',       password: 'password123', firstName: 'გიორგი',   lastName: 'ბერიძე',       headline: 'Full Stack Developer | React & Node.js',     location: 'თბილისი' },
    { email: 'nino.kvaratskhelia@gmail.com',   password: 'password123', firstName: 'ნინო',     lastName: 'კვარაცხელია',  headline: 'UI/UX Designer | Figma Expert',               location: 'თბილისი' },
    { email: 'luka.jgarkava@gmail.com',        password: 'password123', firstName: 'ლუკა',     lastName: 'ჯგარკავა',     headline: 'Data Analyst | Python & SQL',                 location: 'ბათუმი'  },
    { email: 'mariam.tabatadze@gmail.com',     password: 'password123', firstName: 'მარიამ',   lastName: 'ტაბატაძე',     headline: 'Marketing Manager | Digital & Content',       location: 'თბილისი' },
    { email: 'davit.mchedlishvili@gmail.com',  password: 'password123', firstName: 'დავით',    lastName: 'მჭედლიშვილი',  headline: 'Backend Engineer | Java & Spring Boot',        location: 'თბილისი' },
    { email: 'ana.kereselidze@gmail.com',      password: 'password123', firstName: 'ანა',      lastName: 'კერესელიძე',   headline: 'HR Manager | Talent Acquisition',             location: 'თბილისი' },
    { email: 'tornike.chikovani@gmail.com',    password: 'password123', firstName: 'თორნიკე',  lastName: 'ჩიქოვანი',     headline: 'Financial Analyst | CFA Candidate',           location: 'თბილისი' },
    { email: 'salome.arveladze@gmail.com',     password: 'password123', firstName: 'სალომე',   lastName: 'არველაძე',     headline: 'Sales Manager | B2B & B2C',                  location: 'ქუთაისი' },
    { email: 'nika.tvalchrelidze@gmail.com',   password: 'password123', firstName: 'ნიკა',     lastName: 'თვალჭრელიძე',  headline: 'Mobile Developer | Flutter & Dart',            location: 'თბილისი' },
    { email: 'tamar.gvenetadze@gmail.com',     password: 'password123', firstName: 'თამარ',    lastName: 'გვენეტაძე',    headline: 'Project Manager | PMP Certified',             location: 'თბილისი' },
    { email: 'beka.nakashidze@gmail.com',      password: 'password123', firstName: 'ბეკა',     lastName: 'ნაკაშიძე',     headline: 'DevOps Engineer | Kubernetes & AWS',           location: 'თბილისი' },
    { email: 'khatia.lomidze@gmail.com',       password: 'password123', firstName: 'ხათია',    lastName: 'ლომიძე',       headline: 'Graphic Designer | Brand Identity',           location: 'თბილისი' },
  ];

  const candidates = [];
  for (const c of candidateData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: await hash(c.password),
        role: 'CANDIDATE',
        isVerified: true,
        candidateProfile: {
          create: {
            firstName: c.firstName,
            lastName: c.lastName,
            headline: c.headline,
            location: c.location,
          },
        },
      },
      include: { candidateProfile: true },
    });
    candidates.push(user.candidateProfile);
    console.log(`  candidate: ${c.firstName} ${c.lastName}`);
  }

  // ── JOBS ───────────────────────────────────────────────────────────────────
  const soon = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const jobDefs = [
    // ── Sweeft Digital (0) ──────────────────────────────────────────────────
    {
      ei: 0,
      title: 'Senior React Developer',
      description: 'ვეძებთ გამოცდილ React-ის დეველოპერს, რომელიც შეუერთდება ჩვენს frontend გუნდს.\n\nმოვლენები:\n• კომპლექსური SPA-ების შემუშავება TypeScript-ით\n• Redux Toolkit / Zustand state management\n• REST API & GraphQL ინტეგრაცია\n• Code review და mentoring\n\nმოთხოვნები:\n• React 18+, TypeScript — 3+ წელი\n• Jest / Vitest ტესტირება\n• Git flow, CI/CD გამოცდილება\n• ინგლისური — B2+',
      location: 'თბილისი', salaryMin: 5000, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 342,
      isPremium: true, premiumBadgeLabel: 'TOP VACANCY', highlightColor: '#6366f1',
      featuredUntil: soon(30),
    },
    {
      ei: 0,
      title: 'Node.js Backend Engineer',
      description: 'გვჭირდება Backend Engineer Node.js-ში.\n\nპასუხისმგებლობები:\n• REST API-ების შექმნა და შენარჩუნება\n• მიკრო-სერვისების არქიტექტურა\n• PostgreSQL / Redis-თან მუშაობა\n• Docker containerization\n\nტექნოლოგიები: Node.js, Express/Fastify, PostgreSQL, Redis, Docker.',
      location: 'თბილისი', salaryMin: 4500, currency: 'GEL',
      jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'IT', views: 218, isPremium: false,
    },
    {
      ei: 0,
      title: 'DevOps Engineer',
      description: 'Sweeft Digital ეძებს DevOps Engineer-ს ინფრასტრუქტურის გუნდში.\n\nმოვლენები:\n• Kubernetes კლასტერების მართვა (AWS EKS)\n• Terraform-ით ინფრასტრუქტურის კოდი\n• GitHub Actions CI/CD pipeline-ები\n• მონიტორინგი: Grafana, Prometheus\n\nმოთხოვნები: Docker, K8s, AWS/GCP, 3+ წლის გამოცდილება.',
      location: 'Remote', salaryMin: 6000, currency: 'GEL',
      jobRegime: 'REMOTE', experience: 'THREE_TO_FIVE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 419, isPremium: false,
    },
    {
      ei: 0,
      title: 'Junior QA Engineer',
      description: 'ვეძებთ Junior QA Engineer-ს. გექნება შესაძლებლობა ისწავლო manual და automation ტესტირება გამოცდილი გუნდის გვერდით.\n\nმოთხოვნები:\n• ტესტ-ქეისების წერის გამოცდილება\n• Selenium ან Playwright ბაზისური ცოდნა\n• ქართული და ინგლისური ენები\n• ყურადღებიანობა დეტალებზე',
      location: 'თბილისი', salaryMin: 1800, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'NONE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 157, isPremium: false,
    },

    // ── TBC Bank (1) ────────────────────────────────────────────────────────
    {
      ei: 1,
      title: 'Product Manager — Digital Banking',
      description: 'TBC ბანკი ეძებს Product Manager-ს ციფრული ბანკინგის მიმართულებით. შენ იმუშავებ TBC-ს მობაილ და ვებ პროდუქტებზე.\n\nმოთხოვნები:\n• 3+ წლის PM გამოცდილება\n• fintech ან banking სექტორის ცოდნა\n• Agile/Scrum მეთოდოლოგია\n• ინგლისური — C1\n• მონაცემებზე ორიენტირებული აზროვნება',
      location: 'თბილისი', salaryMin: 6000, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'MANAGEMENT', views: 503,
      isPremium: true, premiumBadgeLabel: 'URGENT', highlightColor: '#0ea5e9',
      featuredUntil: soon(14),
    },
    {
      ei: 1,
      title: 'Financial Risk Analyst',
      description: 'TBC Bank-ის Risk Management დეპარტამენტი ეძებს Financial Risk Analyst-ს.\n\nმოვლენები:\n• კრედიტული რისკის შეფასება\n• VaR მოდელირება\n• ბაზელ III/IV მოთხოვნების შესრულება\n• ანგარიშების მომზადება სამეთვალყურეო საბჭოსთვის\n\nმოთხოვნები: ეკონომიკის ან ფინანსების ბაკალავრი, Excel/Python, ინგლისური.',
      location: 'თბილისი', salaryMin: 3500, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'FINANCE', views: 289, isPremium: false,
    },
    {
      ei: 1,
      title: 'Mobile Developer (iOS)',
      description: 'TBC Bank ეძებს iOS Developer-ს TBC მობაილ ბანკინგ აპლიკაციისთვის.\n\nSwift, UIKit/SwiftUI, Core Data, REST integration, Unit testing.\n\nმოვლენები: ახალი ფიჩერების შემუშავება, performance ოპტიმიზაცია, App Store release მენეჯმენტი.\n\nGამოცდილება: 3+ წელი iOS განვითარებაში.',
      location: 'თბილისი', salaryMin: 5500, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 374, isPremium: false,
    },
    {
      ei: 1,
      title: 'IT Security Analyst',
      description: 'TBC Bank-ის IT Security გუნდი ეძებს Security Analyst-ს.\n\nმოვლენები:\n• SOC ოპერაციები და incident response\n• Vulnerability assessment და penetration testing\n• Security policy-ების შემუშავება\n• PCI-DSS კომპლაიენსი\n\nCEH, OSCP ან CompTIA Security+ — სასურველია.',
      location: 'თბილისი', salaryMin: 5000, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 198,
      isPremium: true, premiumBadgeLabel: 'HOT', highlightColor: '#ef4444',
      featuredUntil: soon(10),
    },

    // ── Space International (2) ─────────────────────────────────────────────
    {
      ei: 2,
      title: 'Marketing Director',
      description: 'Space International ეძებს Marketing Director-ს.\n\nმოვლენები:\n• ბრენდ სტრატეგიის შემუშავება\n• გუნდის მართვა (10+ ადამიანი)\n• ATL/BTL კამპანიების ორგანიზება\n• ბიუჯეტის მართვა\n• KPI-ების ანალიზი და ანგარიშგება\n\nმოთხოვნები: 5+ წლის გამოცდილება, multi-brand გარემო, MBA სასურველია.',
      location: 'თბილისი', salaryMin: 8000, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'FIVE_PLUS', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'MARKETING', views: 621,
      isPremium: true, premiumBadgeLabel: 'PREMIUM', highlightColor: '#f59e0b',
      featuredUntil: soon(21),
    },
    {
      ei: 2,
      title: 'Logistics Coordinator',
      description: 'Space International-ის ლოჯისტიკის დეპარტამენტი ეძებს Logistics Coordinator-ს.\n\nმოვლენები:\n• მომწოდებლებთან მოლაპარაკება\n• იმ/ექსპორტის ოპერაციები\n• საბაჟო პროცედურები\n• მარაგების მართვა\n\nმოთხოვნები: ლოჯისტიკის ან ვაჭრობის განათლება, რუსული/ინგლისური ენები.',
      location: 'თბილისი', salaryMin: 2200, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'LOGISTICS', views: 134, isPremium: false,
    },
    {
      ei: 2,
      title: 'Content Creator & Copywriter',
      description: 'Space International ეძებს Content Creator-ს სოციალური მედიისა და ბლოგისთვის.\n\nSEO კოპირაიტინგი, სოც. მედიის კონტენტი (IG, FB, TikTok), video სკრიპტები.\n\nმოთხოვნები: კრეატიული წერა, ქართული/ინგლისური ენები, Canva/Photoshop ბაზისური ცოდნა.',
      location: 'თბილისი', salaryMin: 1800, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'MARKETING', views: 267, isPremium: false,
    },

    // ── Medicina House (3) ──────────────────────────────────────────────────
    {
      ei: 3,
      title: 'კარდიოლოგი',
      description: 'Medicina House ეძებს კვალიფიციურ კარდიოლოგს სრულ განაკვეთზე.\n\nმოვლენები:\n• ამბულატორიული და სტაციონარული პაციენტების მომსახურება\n• ECHO, EKG ინტერპრეტაცია\n• კონსილიუმებში მონაწილეობა\n• სამეცნიერო კვლევა\n\nმოთხოვნები: სამედიცინო განათლება, კარდიოლოგიის სპეციალიზაცია, ორდინატურა.',
      location: 'თბილისი', salaryMin: 5500, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'THREE_TO_FIVE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'HEALTHCARE', views: 198,
      isPremium: true, premiumBadgeLabel: 'HOT', highlightColor: '#ef4444',
      featuredUntil: soon(20),
    },
    {
      ei: 3,
      title: 'Medical Receptionist',
      description: 'გვჭირდება სამედიცინო ადმინისტრატორი / რეგისტრატორი.\n\nმოვლენები:\n• პაციენტების მიღება და ჩაწერა\n• სამედიცინო ჩანაწერების მართვა\n• ტელეფონით კომუნიკაცია\n• ბილინგი და სადაზღვევო მოთხოვნები\n\nმოთხოვნები: კომპიუტერული გამოცდილება, კომუნიკაბელობა, ქართული/რუსული.',
      location: 'თბილისი', salaryMin: 1400, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'NONE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'HEALTHCARE', views: 87, isPremium: false,
    },

    // ── BPG (4) ─────────────────────────────────────────────────────────────
    {
      ei: 4,
      title: 'Senior Accountant',
      description: 'BPG ეძებს Senior Accountant-ს.\n\nმოვლენები:\n• ფინანსური ანგარიშგების მომზადება (IFRS)\n• გადასახადების ადმინისტრირება\n• აუდიტთან თანამშრომლობა\n• ბიუჯეტის პლანირება\n\nმოთხოვნები: ACCA ან CPA, 1C/SAP ცოდნა, 4+ წლის გამოცდილება.',
      location: 'თბილისი', salaryMin: 4000, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'THREE_TO_FIVE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'FINANCE', views: 276, isPremium: false,
    },
    {
      ei: 4,
      title: 'Business Development Manager',
      description: 'BPG ეძებს Business Development Manager-ს B2B მიმართულებით.\n\nმოვლენები:\n• ახალი კლიენტების მოძიება\n• კომერციული შეთავაზებების მომზადება\n• ხელშეკრულებების მოლაპარაკება\n• პარტნიორული კავშირების განვითარება\n\nმოთხოვნები: B2B გაყიდვების გამოცდილება, ინგლისური C1.',
      location: 'თბილისი', salaryMin: 3000, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'SALES', views: 312,
      isPremium: true, premiumBadgeLabel: 'FEATURED', highlightColor: '#8b5cf6',
      featuredUntil: soon(25),
    },

    // ── GPI Holding (5) ─────────────────────────────────────────────────────
    {
      ei: 5,
      title: 'Insurance Sales Agent',
      description: 'GPI Holding ეძებს Insurance Sales Agent-ებს სიცოცხლის დაზღვევის მიმართულებით.\n\nმოვლენები:\n• ახალი კლიენტების მოძიება და კონსულტირება\n• პოლისების გაყიდვა\n• გრძელვადიანი ურთიერთობების შენარჩუნება\n• პორტფოლიოს მართვა\n\nმოთხოვნები: გაყიდვების სურვილი, კომუნიკაბელობა. გამოცდილება + სასარგებლო.',
      location: 'თბილისი', salaryMin: 1200, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'NONE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'SALES', views: 445, isPremium: false,
    },
    {
      ei: 5,
      title: 'IT Systems Administrator',
      description: 'GPI Holding ეძებს IT Systems Administrator-ს.\n\nმოვლენები:\n• სერვერების მართვა (Windows Server / Linux)\n• ქსელის ადმინისტრირება\n• Helpdesk მხარდაჭერა\n• Backup და disaster recovery\n\nმოთხოვნები: MCSA ან Linux+ სერტიფიკაცია, 2+ წლის გამოცდილება.',
      location: 'თბილისი', salaryMin: 2800, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 163, isPremium: false,
    },

    // ── Glovo Georgia (6) ───────────────────────────────────────────────────
    {
      ei: 6,
      title: 'Operations Manager — Tbilisi',
      description: 'Glovo Georgia ეძებს Operations Manager-ს თბილისისთვის.\n\nმოვლენები:\n• ქალაქის ოპერაციების სრული მართვა\n• კურიერების გუნდის ხელმძღვანელობა\n• რესტორნებთან პარტნიორობა\n• ხარისხისა და delivery SLA-ების კონტროლი\n\nმოთხოვნები: 2+ წლის ოპერ./ლოჯისტ. გამოცდილება, Excel, ინგლისური.',
      location: 'თბილისი', salaryMin: 3800, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'MANAGEMENT', views: 388,
      isPremium: true, premiumBadgeLabel: 'TOP VACANCY', highlightColor: '#f97316',
      featuredUntil: soon(18),
    },
    {
      ei: 6,
      title: 'Junior Data Analyst',
      description: 'Glovo Georgia ეძებს Junior Data Analyst-ს growth გუნდში.\n\nმოვლენები:\n• ოპერაციული მონაცემების ანალიზი\n• Dashboard-ების შექმნა (Looker/Tableau)\n• A/B ტესტების ანალიზი\n• ყოველკვირეული ანგარიშები\n\nმოთხოვნები: SQL, Python (pandas), Tableau/Looker, სტატისტიკის ბაზა.',
      location: 'თბილისი', salaryMin: 2500, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'NONE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'IT', views: 241, isPremium: false,
    },

    // ── Nikora Trade (7) ────────────────────────────────────────────────────
    {
      ei: 7,
      title: 'UI/UX Designer',
      description: 'ნიკორა ეძებს UI/UX Designer-ს ციფრული გარდაქმნის პროექტისთვის.\n\nმოვლენები:\n• მობაილ და ვებ პლატფორმების დიზაინი\n• Figma prototyping და user testing\n• Design system-ის შენარჩუნება\n• Cross-functional გუნდებთან თანამშრომლობა\n\nმოთხოვნები: Figma, Adobe XD, user research მეთოდები, portfolio.',
      location: 'თბილისი', salaryMin: 3200, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'DESIGN', views: 307,
      isPremium: true, premiumBadgeLabel: 'NEW', highlightColor: '#10b981',
      featuredUntil: soon(28),
    },
    {
      ei: 7,
      title: 'Store Manager',
      description: 'ნიკორა ეძებს Store Manager-ებს სხვადასხვა ლოკაციისთვის.\n\nმოვლენები:\n• მაღაზიის სრული მართვა\n• გუნდის ხელმძღვანელობა (10-20 ადამ.)\n• შემოსავლის გეგმის შესრულება\n• მარაგებისა და ინვენტარის კონტროლი\n\nმოთხოვნები: retail მართვის გამოცდილება, ორგანიზაციული უნარები.',
      location: 'თბილისი', salaryMin: 2500, currency: 'GEL',
      jobRegime: 'FULL_TIME', experience: 'ONE_TO_THREE', applicationMethod: 'CV_ONLY',
      status: 'HIRING', category: 'MANAGEMENT', views: 198, isPremium: false,
    },
    {
      ei: 7,
      title: 'E-Commerce Manager',
      description: 'ნიკორა ეძებს E-Commerce Manager-ს online გაყიდვების სტრატეგიისთვის.\n\nმოვლენები:\n• ონლაინ მაღაზიის მართვა\n• პროდუქტ-კატალოგის ოპტიმიზაცია\n• ციფრული მარკეტინგი (SEO, PPC)\n• Analytics და conversion optimization\n\nმოთხოვნები: e-commerce პლატფორმების ცოდნა, 2+ წლის გამოცდილება.',
      location: 'თბილისი', salaryMin: 2800, currency: 'GEL',
      jobRegime: 'HYBRID', experience: 'ONE_TO_THREE', applicationMethod: 'BOTH',
      status: 'HIRING', category: 'SALES', views: 189, isPremium: false,
    },
  ];

  const jobs = [];
  for (const j of jobDefs) {
    const { ei, ...data } = j;
    const job = await prisma.job.create({
      data: {
        ...data,
        employerProfileId: employers[ei].id,
      },
    });
    jobs.push(job);
  }
  console.log(`  ${jobs.length} jobs created`);

  // ── APPLICATIONS ───────────────────────────────────────────────────────────
  const appDefs = [
    { ji: 0, ci: 0, status: 'REVIEWING',   coverLetter: 'React-ის 4 წლიანი გამოცდილებით ძალიან გამაინტერესა ეს პოზიცია.' },
    { ji: 0, ci: 4, status: 'SHORTLISTED', coverLetter: 'Full Stack გამოცდილებით მზად ვარ ახალი გამოწვევებისთვის.' },
    { ji: 1, ci: 0, status: 'PENDING',     coverLetter: 'Node.js-ში 3 წლიანი გამოცდილება მაქვს, ოხ.' },
    { ji: 2, ci: 10, status: 'REVIEWING',  coverLetter: 'Kubernetes და Terraform — ჩემი ძირითადი ინსტრუმენტებია.' },
    { ji: 4, ci: 9,  status: 'REVIEWING',  coverLetter: 'PM პოზიციაზე 4 წლიანი გამოცდილება მაქვს fintech-ში.' },
    { ji: 5, ci: 6,  status: 'PENDING',    coverLetter: 'Financial Risk Analyst-ად მუშაობა ჩემი პრიორიტეტია.' },
    { ji: 8, ci: 3,  status: 'PENDING',    coverLetter: 'Marketing Director-ის პოზიციაზე მაღალი მოტივაციით ვგზავნი CV-ს.' },
    { ji: 11, ci: 7, status: 'HIRED',      coverLetter: 'კარდიოლოგიური სპეციალიზაციით 5 წლიანი კლინიკური გამოცდილება.' },
    { ji: 13, ci: 6, status: 'SHORTLISTED',coverLetter: 'Senior Accountant-ის პოზიციაზე ACCA სერტიფიკატით ვგზავნი განაცხადს.' },
    { ji: 17, ci: 2, status: 'PENDING',    coverLetter: 'Data Analyst პოზიციაზე Python & SQL-ის ცოდნით.' },
    { ji: 20, ci: 1, status: 'REVIEWING',  coverLetter: 'UI/UX Designer — 3 წლიანი Figma გამოცდილება, portfolio ერთვის.' },
    { ji: 3,  ci: 8, status: 'PENDING',    coverLetter: 'Junior QA Engineer-ად დაწყება ჩემი სამომავლო გეგმის ნაწილია.' },
  ];

  for (const a of appDefs) {
    if (a.ji < jobs.length && a.ci < candidates.length) {
      await prisma.application.create({
        data: {
          jobId: jobs[a.ji].id,
          candidateProfileId: candidates[a.ci].id,
          status: a.status,
          coverLetter: a.coverLetter,
        },
      });
    }
  }
  console.log(`  ${appDefs.length} applications created`);

  // ── COMPANY BOXES ──────────────────────────────────────────────────────────
  await prisma.companyBox.createMany({
    data: [
      { companyId: employers[0].id, title: 'გამოგვიგზავნე CV', description: 'ელოდება ახალი ტალანტები Sweeft-ში? CV ნებისმიერ დროს შეგიძლია გამოაგზავნო.', isActive: true },
      { companyId: employers[1].id, title: 'TBC Talent Pool', description: 'შემოიტანე შენი CV TBC-ს ნიჭიერი კადრების ბანკში.', isActive: true },
      { companyId: employers[2].id, title: 'Space Careers', description: 'Space International-ის Talent Pool-ში შეუერთდი.', isActive: true },
      { companyId: employers[6].id, title: 'Glovo Open Applications', description: 'გამოგვიგზავნე CV — ყველა ღია პოზიციისთვის Glovo Georgia-ში.', isActive: true },
    ],
  });
  console.log('  company boxes created');

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  const allCandidateUsers = await prisma.user.findMany({ where: { role: 'CANDIDATE' }, orderBy: { id: 'asc' } });
  const notifs = [
    { ui: 0, msg: 'შენი განაცხადი "Senior React Developer"-ზე მიღებულია!' },
    { ui: 0, msg: 'შენი განაცხადი განხილვის ეტაპზეა — Sweeft Digital-ი დაგიკავშირდება.' },
    { ui: 3, msg: 'შენი განაცხადი "Marketing Director"-ზე მიღებულია — Space International.' },
    { ui: 6, msg: '"Financial Risk Analyst"-ზე განაცხადი განხილვაშია. TBC Bank.' },
    { ui: 9, msg: 'TBC Bank: PM განაცხადი shortlist-ში გადავიდა!' },
  ];
  for (const n of notifs) {
    if (n.ui < allCandidateUsers.length) {
      await prisma.notification.create({ data: { userId: allCandidateUsers[n.ui].id, message: n.msg } });
    }
  }
  console.log('  notifications created');

  console.log('\n✓ Seed complete!');
  console.log('\nTest accounts (password: password123):');
  console.log('  EMPLOYERS : hr@sweeft.com | careers@tbcbank.ge | jobs@space.ge | hr@nikora.ge');
  console.log('  CANDIDATES: giorgi.beridze@gmail.com | nino.kvaratskhelia@gmail.com | luka.jgarkava@gmail.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
