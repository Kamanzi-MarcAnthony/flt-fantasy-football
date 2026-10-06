-- CreateTable
CREATE TABLE "FantasyPlayerGameweekScore" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameweekId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyPlayerGameweekScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayerGameweekScore_teamId_playerId_gameweekId_key" ON "FantasyPlayerGameweekScore"("teamId", "playerId", "gameweekId");

-- AddForeignKey
ALTER TABLE "FantasyPlayerGameweekScore" ADD CONSTRAINT "FantasyPlayerGameweekScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "FantasyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayerGameweekScore" ADD CONSTRAINT "FantasyPlayerGameweekScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayerGameweekScore" ADD CONSTRAINT "FantasyPlayerGameweekScore_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
