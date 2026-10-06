import prisma from '../config/prisma.js'

export const getOrCreateGameweek = async (leagueId, matchDate) => {
  const existing = await prisma.gameweek.findFirst({
    where: {
      leagueId,
      startDate: matchDate,
    },
  })

  if (existing) {
    return existing
  }

  const latest = await prisma.gameweek.findFirst({
    where: {
      leagueId,
    },
    orderBy: {
      number: 'desc',
    },
  })

  const number = (latest?.number ?? 0) + 1

  return prisma.gameweek.create({
    data: {
      leagueId,
      number,
      startDate: matchDate,
    },
  })
}