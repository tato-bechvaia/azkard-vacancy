-- AlterTable: add premium fields to Job
ALTER TABLE "Job" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN "premiumBadgeLabel" TEXT;
ALTER TABLE "Job" ADD COLUMN "highlightColor" TEXT;
ALTER TABLE "Job" ADD COLUMN "featuredUntil" TIMESTAMP(3);

-- CreateTable: CompanyBox
CREATE TABLE "CompanyBox" (
    "id"          SERIAL NOT NULL,
    "companyId"   INTEGER NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CVSubmission
CREATE TABLE "CVSubmission" (
    "id"             SERIAL NOT NULL,
    "companyBoxId"   INTEGER NOT NULL,
    "candidateName"  TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "cvUrl"          TEXT NOT NULL,
    "message"        TEXT,
    "submittedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: CompanyBox -> EmployerProfile
ALTER TABLE "CompanyBox" ADD CONSTRAINT "CompanyBox_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CVSubmission -> CompanyBox
ALTER TABLE "CVSubmission" ADD CONSTRAINT "CVSubmission_companyBoxId_fkey"
    FOREIGN KEY ("companyBoxId") REFERENCES "CompanyBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
