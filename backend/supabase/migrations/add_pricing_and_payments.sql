-- =============================================
-- Migration: Add pricing tiers + payments table
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add pricing columns to jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS pricing_tier   VARCHAR(20)  DEFAULT 'USUAL',
  ADD COLUMN IF NOT EXISTS price_amount   INT          DEFAULT 35,
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)  DEFAULT 'PAID',
  ADD COLUMN IF NOT EXISTS payment_id     VARCHAR(255);

-- Mark all existing jobs as already paid (they predate the payment system)
UPDATE jobs SET payment_status = 'PAID' WHERE payment_status IS NULL;

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id                   SERIAL PRIMARY KEY,
  job_id               INT          REFERENCES jobs(id) ON DELETE SET NULL,
  employer_profile_id  INT          REFERENCES employer_profiles(id) ON DELETE SET NULL,
  amount               INT          NOT NULL,
  currency             VARCHAR(10)  DEFAULT 'GEL',
  provider             VARCHAR(20),            -- 'BOG' | 'FLITT'
  provider_order_id    VARCHAR(255),           -- ID returned by the payment gateway
  status               VARCHAR(20)  DEFAULT 'PENDING',  -- PENDING | PAID | FAILED | REFUNDED
  created_at           TIMESTAMPTZ  DEFAULT NOW(),
  paid_at              TIMESTAMPTZ
);

-- Index for fast lookups by job and by provider order id
CREATE INDEX IF NOT EXISTS idx_payments_job_id            ON payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON payments(provider_order_id);
