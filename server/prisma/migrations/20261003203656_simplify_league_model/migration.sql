/*
  Warnings:

  - You are about to drop the column `endDate` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `recurrenceType` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `scoringConfig` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `MatchEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "League" DROP COLUMN "endDate",
DROP COLUMN "recurrenceType",
DROP COLUMN "recurring",
DROP COLUMN "scoringConfig",
DROP COLUMN "startDate",
DROP COLUMN "status",
ADD COLUMN     "matchDay" TEXT,
ADD COLUMN     "matchTime" TEXT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "MatchEvent" DROP COLUMN "value";
