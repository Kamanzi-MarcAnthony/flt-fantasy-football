-- CreateTable
CREATE TABLE "FantasyLeagueMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FantasyLeagueMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FantasyLeagueMember_userId_leagueId_key" ON "FantasyLeagueMember"("userId", "leagueId");

-- AddForeignKey
ALTER TABLE "FantasyLeagueMember" ADD CONSTRAINT "FantasyLeagueMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyLeagueMember" ADD CONSTRAINT "FantasyLeagueMember_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
