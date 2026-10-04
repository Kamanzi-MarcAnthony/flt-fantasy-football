/*
  Warnings:

  - You are about to drop the column `budget` on the `FantasyTeam` table. All the data in the column will be lost.
  - Added the required column `bank` to the `FantasyTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FantasyTeam" DROP COLUMN "budget",
ADD COLUMN     "bank" DECIMAL(10,2) NOT NULL;
