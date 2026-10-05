-- AlterTable
ALTER TABLE "FantasyTeam" ADD COLUMN     "captainId" INTEGER,
ADD COLUMN     "viceCaptainId" INTEGER;

-- AddForeignKey
ALTER TABLE "FantasyTeam" ADD CONSTRAINT "FantasyTeam_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeam" ADD CONSTRAINT "FantasyTeam_viceCaptainId_fkey" FOREIGN KEY ("viceCaptainId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
