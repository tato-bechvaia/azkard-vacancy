-- ============================================================================
-- Migration: Three-Tier Pricing System (Standard / Premium / Premium+)
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- 1. Ensure the pricing_tier column accepts the new value
-- (pricing_tier is a text column, so no enum alteration needed)

-- 2. Add a tier_priority column for easy sorting
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tier_priority INT DEFAULT 0;

-- Set tier_priority based on existing pricing_tier values
UPDATE jobs SET tier_priority = CASE
  WHEN pricing_tier = 'PREMIUM_PLUS' THEN 2
  WHEN pricing_tier = 'PREMIUM' THEN 1
  ELSE 0
END;

-- 3. Create index for tier-based sorting
CREATE INDEX IF NOT EXISTS idx_jobs_tier_priority ON jobs (tier_priority DESC, created_at DESC);

-- 4. Create saved_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ============================================================================
-- SEED DATA: 15 Premium+ jobs, 30 Premium jobs, 30 Standard jobs
-- ============================================================================

-- First, let's make sure we have some employer profiles to attach jobs to.
-- We'll create 8 test companies if they don't already exist.

-- Helper: insert employer users + profiles
DO $$
DECLARE
  uid INT;
  epid INT;
  companies TEXT[] := ARRAY[
    'TBC Bank', 'Wissol Group', 'Magti', 'Silknet', 'Bank of Georgia',
    'Crystal', 'Geocell', 'Glovo Georgia'
  ];
  comp TEXT;
BEGIN
  FOREACH comp IN ARRAY companies LOOP
    -- Check if employer with this company name already exists
    SELECT ep.id INTO epid FROM employer_profiles ep WHERE ep.company_name = comp;
    IF epid IS NULL THEN
      INSERT INTO users (email, password_hash, role)
      VALUES (lower(replace(comp, ' ', '')) || '@test.ge', '$2b$10$dummyhashforseeding000000000000000000000000000', 'EMPLOYER')
      RETURNING id INTO uid;

      INSERT INTO employer_profiles (user_id, company_name, description)
      VALUES (uid, comp, comp || ' - leading Georgian company')
      RETURNING id INTO epid;
    END IF;
  END LOOP;
END $$;

-- Now seed jobs using the employer profiles
DO $$
DECLARE
  ep_ids INT[];
  ep_id INT;
  i INT;
  job_titles TEXT[] := ARRAY[
    'Senior Frontend Developer', 'Backend Engineer (Node.js)', 'UI/UX Designer',
    'Product Manager', 'DevOps Engineer', 'Data Analyst',
    'Marketing Manager', 'Sales Representative', 'HR Specialist',
    'Full Stack Developer', 'Mobile Developer (React Native)', 'QA Engineer',
    'Project Manager', 'Financial Analyst', 'Customer Success Manager',
    'Cloud Architect', 'Machine Learning Engineer', 'Content Strategist',
    'Business Development Manager', 'Graphic Designer', 'SEO Specialist',
    'Cybersecurity Analyst', 'Database Administrator', 'Technical Writer',
    'Operations Manager', 'Accountant', 'Legal Counsel',
    'System Administrator', 'React Developer', 'Python Developer',
    'Java Developer', 'PHP Developer', 'Go Developer',
    'Kotlin Developer', 'Swift Developer', 'Rust Developer',
    'Data Engineer', 'AI Research Scientist', 'Blockchain Developer',
    'Supply Chain Analyst', 'Event Coordinator', 'Brand Manager',
    'Video Editor', 'Copywriter', 'UX Researcher',
    'IT Support Specialist', 'Network Engineer', 'Scrum Master',
    'Chief Technology Officer', 'VP of Engineering', 'Solutions Architect',
    'Embedded Systems Engineer', 'Site Reliability Engineer', 'Platform Engineer',
    'Growth Hacker', 'Performance Marketing Lead', 'PR Manager',
    'Talent Acquisition Lead', 'Compliance Officer', 'Risk Analyst',
    'Interior Designer', 'Civil Engineer', 'Mechanical Engineer',
    'Electrical Engineer', 'Biomedical Researcher', 'Pharmacist',
    'Nurse Practitioner', 'Teacher (English)', 'Teacher (Mathematics)',
    'Hotel Manager', 'Restaurant Manager', 'Tour Guide',
    'Logistics Coordinator', 'Warehouse Manager', 'Fleet Manager',
    'Real Estate Agent', 'Insurance Broker', 'Investment Analyst'
  ];
  locations TEXT[] := ARRAY['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Tbilisi', 'Tbilisi', 'Batumi', 'Tbilisi'];
  categories TEXT[] := ARRAY['IT', 'IT', 'DESIGN', 'MANAGEMENT', 'IT', 'IT', 'MARKETING', 'SALES', 'MANAGEMENT', 'IT', 'IT', 'IT', 'MANAGEMENT', 'FINANCE', 'SALES', 'IT', 'IT', 'MARKETING', 'SALES', 'DESIGN', 'MARKETING', 'IT', 'IT', 'IT', 'MANAGEMENT', 'FINANCE', 'OTHER', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'IT', 'LOGISTICS', 'OTHER', 'MARKETING', 'DESIGN', 'MARKETING', 'DESIGN', 'IT', 'IT', 'MANAGEMENT', 'MANAGEMENT', 'MANAGEMENT', 'IT', 'IT', 'IT', 'IT', 'MARKETING', 'MARKETING', 'MARKETING', 'MANAGEMENT', 'FINANCE', 'FINANCE', 'DESIGN', 'OTHER', 'OTHER', 'OTHER', 'HEALTHCARE', 'HEALTHCARE', 'HEALTHCARE', 'EDUCATION', 'EDUCATION', 'HOSPITALITY', 'HOSPITALITY', 'HOSPITALITY', 'LOGISTICS', 'LOGISTICS', 'LOGISTICS'];
  regimes TEXT[] := ARRAY['REMOTE', 'HYBRID', 'FULL_TIME'];
  experiences TEXT[] := ARRAY['NONE', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS'];
  base_salary INT;
  tier TEXT;
  tier_p INT;
  price INT;
  is_prem BOOLEAN;
  badge TEXT;
  expiry TIMESTAMPTZ;
BEGIN
  -- Collect employer profile IDs
  SELECT array_agg(id ORDER BY id) INTO ep_ids FROM employer_profiles LIMIT 8;

  -- If no employers found, skip
  IF ep_ids IS NULL OR array_length(ep_ids, 1) = 0 THEN
    RAISE NOTICE 'No employer profiles found, skipping seed';
    RETURN;
  END IF;

  FOR i IN 1..75 LOOP
    ep_id := ep_ids[1 + ((i - 1) % array_length(ep_ids, 1))];

    -- Determine tier
    IF i <= 15 THEN
      tier := 'PREMIUM_PLUS';
      tier_p := 2;
      price := 95;
      is_prem := true;
      badge := 'Premium+';
      base_salary := 3000 + (i * 200);
    ELSIF i <= 45 THEN
      tier := 'PREMIUM';
      tier_p := 1;
      price := 65;
      is_prem := true;
      badge := 'Premium';
      base_salary := 2000 + ((i - 15) * 100);
    ELSE
      tier := 'USUAL';
      tier_p := 0;
      price := 35;
      is_prem := false;
      badge := NULL;
      base_salary := 1000 + ((i - 45) * 80);
    END IF;

    expiry := NOW() + INTERVAL '30 days';

    INSERT INTO jobs (
      title, description, location, salary, currency,
      job_regime, experience, application_method, category,
      employer_profile_id, status, payment_status,
      pricing_tier, price_amount, tier_priority,
      is_premium, premium_badge_label,
      expires_at, created_at
    ) VALUES (
      job_titles[i],
      'We are looking for a talented ' || job_titles[i] || ' to join our team. ' ||
      'This is an exciting opportunity to work with a leading Georgian company. ' ||
      'Responsibilities include working on key projects, collaborating with cross-functional teams, ' ||
      'and contributing to the growth of our organization. ' ||
      'We offer competitive salary, professional development opportunities, and a great work environment.',
      locations[1 + ((i - 1) % array_length(locations, 1))],
      base_salary,
      'GEL',
      regimes[1 + ((i - 1) % 3)]::job_regime,
      experiences[1 + ((i - 1) % 4)]::experience,
      'CV_ONLY'::application_method,
      categories[i]::job_category,
      ep_id,
      'HIRING'::job_status,
      'PAID',
      tier,
      price,
      tier_p,
      is_prem,
      badge,
      expiry,
      NOW() - (i * INTERVAL '2 hours')
    );
  END LOOP;
END $$;
