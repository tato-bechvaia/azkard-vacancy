/*
  Warnings:

  - The values [OPEN] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `jobRegime` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `salaryMin` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "JobRegime" AS ENUM ('REMOTE', 'HYBRID', 'FULL_TIME');

-- CreateEnum
CREATE TYPE "Experience" AS ENUM ('NONE', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS');

-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('CV_ONLY', 'FORM_ONLY', 'BOTH');

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('HIRING', 'CLOSED');
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "JobStatus_old";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'HIRING';
COMMIT;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "formData" JSONB;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "applicationMethod" "ApplicationMethod" NOT NULL DEFAULT 'CV_ONLY',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GEL',
ADD COLUMN     "experience" "Experience" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "jobPeriod" TEXT,
ADD COLUMN     "jobRegime" "JobRegime" NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "salaryMin" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'HIRING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifyCode" TEXT;
