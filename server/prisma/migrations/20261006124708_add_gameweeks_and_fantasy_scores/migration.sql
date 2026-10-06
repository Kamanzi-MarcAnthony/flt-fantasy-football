-- CreateTable
CREATE TABLE "Gameweek" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gameweek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyTeamGameweekScore" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweekId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyTeamGameweekScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gameweek_leagueId_number_key" ON "Gameweek"("leagueId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyTeamGameweekScore_teamId_gameweekId_key" ON "FantasyTeamGameweekScore"("teamId", "gameweekId");

-- AddForeignKey
ALTER TABLE "Gameweek" ADD CONSTRAINT "Gameweek_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeamGameweekScore" ADD CONSTRAINT "FantasyTeamGameweekScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "FantasyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyTeamGameweekScore" ADD CONSTRAINT "FantasyTeamGameweekScore_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
