-- -- Backfill + schema transition for Job.salary/startDate/endDate
-- -- Safe to run once on existing DB with salaryMin/salaryMax/jobPeriod.

-- ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "salary" INTEGER;
-- ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
-- ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

-- -- Backfill salary/start/end from existing data
-- UPDATE "Job"
-- SET
--   "salary" = COALESCE("salary", "salaryMin"),
--   "startDate" = COALESCE("startDate", "createdAt"),
--   "endDate" = COALESCE("endDate", ("createdAt" + INTERVAL '30 days'))
-- WHERE "salary" IS NULL OR "startDate" IS NULL OR "endDate" IS NULL;

-- -- Enforce required columns
-- ALTER TABLE "Job" ALTER COLUMN "salary" SET NOT NULL;
-- ALTER TABLE "Job" ALTER COLUMN "startDate" SET NOT NULL;
-- ALTER TABLE "Job" ALTER COLUMN "endDate" SET NOT NULL;

-- -- Drop old columns
-- ALTER TABLE "Job" DROP COLUMN IF EXISTS "salaryMin";
-- ALTER TABLE "Job" DROP COLUMN IF EXISTS "salaryMax";
-- ALTER TABLE "Job" DROP COLUMN IF EXISTS "jobPeriod";

