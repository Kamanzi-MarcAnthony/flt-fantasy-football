-- AlterTable
ALTER TABLE "League" ADD COLUMN     "maxTransfers" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "transferDeadlineMinutes" INTEGER NOT NULL DEFAULT 180;
