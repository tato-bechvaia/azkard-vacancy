/*
  Warnings:

  - You are about to drop the column `fullName` on the `CandidateProfile` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `CandidateProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `CandidateProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
