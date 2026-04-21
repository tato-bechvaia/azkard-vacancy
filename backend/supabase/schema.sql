-- ============================================================
-- Azkard Vacancy — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enums
CREATE TYPE role AS ENUM ('EMPLOYER', 'CANDIDATE');
CREATE TYPE job_regime AS ENUM ('REMOTE', 'HYBRID', 'FULL_TIME');
CREATE TYPE job_status AS ENUM ('HIRING', 'CLOSED');
CREATE TYPE experience AS ENUM ('NONE', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS');
CREATE TYPE application_method AS ENUM ('CV_ONLY', 'FORM_ONLY', 'BOTH');
CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED');
CREATE TYPE job_category AS ENUM (
  'IT', 'SALES', 'MARKETING', 'FINANCE', 'DESIGN',
  'MANAGEMENT', 'LOGISTICS', 'HEALTHCARE', 'EDUCATION',
  'HOSPITALITY', 'OTHER'
);

-- Users
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           role NOT NULL,
  phone          TEXT,
  is_verified    BOOLEAN      DEFAULT false,
  is_admin       BOOLEAN      DEFAULT false,
  verify_code    TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Employer profiles
CREATE TABLE employer_profiles (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description  TEXT,
  website      TEXT,
  logo_url     TEXT,
  avatar_url   TEXT
);

-- Candidate profiles
CREATE TABLE candidate_profiles (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  headline   TEXT,
  location   TEXT,
  cv_url     TEXT,
  avatar_url TEXT
);

-- Jobs
CREATE TABLE jobs (
  id                  SERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  location            TEXT,
  salary_min          INTEGER NOT NULL,
  salary_max          INTEGER,
  currency            TEXT             DEFAULT 'GEL',
  job_regime          job_regime NOT NULL,
  job_period          TEXT,
  experience          experience       DEFAULT 'NONE',
  application_method  application_method DEFAULT 'CV_ONLY',
  status              job_status       DEFAULT 'HIRING',
  views               INTEGER          DEFAULT 0,
  created_at          TIMESTAMPTZ      DEFAULT NOW(),
  expires_at          TIMESTAMPTZ,
  is_for_students     BOOLEAN          DEFAULT false,
  is_internship       BOOLEAN          DEFAULT false,
  employer_profile_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  category            job_category     DEFAULT 'OTHER',
  is_premium          BOOLEAN          DEFAULT false,
  premium_badge_label TEXT,
  highlight_color     TEXT,
  featured_until      TIMESTAMPTZ
);

-- Applications
CREATE TABLE applications (
  id                   SERIAL PRIMARY KEY,
  job_id               INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_profile_id INTEGER NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  status               application_status DEFAULT 'PENDING',
  cover_letter         TEXT,
  cv_url               TEXT,
  form_data            JSONB,
  applied_at           TIMESTAMPTZ        DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  is_read    BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company CV boxes
CREATE TABLE company_boxes (
  id          SERIAL PRIMARY KEY,
  company_id  INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CV submissions to company boxes
CREATE TABLE cv_submissions (
  id               SERIAL PRIMARY KEY,
  company_box_id   INTEGER NOT NULL REFERENCES company_boxes(id) ON DELETE CASCADE,
  candidate_name   TEXT NOT NULL,
  candidate_email  TEXT NOT NULL,
  cv_url           TEXT NOT NULL,
  message          TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_jobs_status         ON jobs(status);
CREATE INDEX idx_jobs_employer       ON jobs(employer_profile_id);
CREATE INDEX idx_jobs_created_at     ON jobs(created_at DESC);
CREATE INDEX idx_applications_job    ON applications(job_id);
CREATE INDEX idx_applications_cand   ON applications(candidate_profile_id);
CREATE INDEX idx_notifications_user  ON notifications(user_id);
CREATE INDEX idx_cv_submissions_box  ON cv_submissions(company_box_id);
