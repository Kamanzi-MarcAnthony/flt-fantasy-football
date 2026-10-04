import prisma from '../config/prisma.js'
import {
  getMatchdayStatus,
} from '../utils/matchday.js'

const getLeague = async (leagueId) => {
  return prisma.league.findUnique({
    where: {
      id: leagueId,
    },
  })
}

const getMatchWithEvents = async (matchId) => {
  return prisma.match.findUnique({
    where: {
      id: matchId,
    },
    include: {
      events: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              position: true,
              photoUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
}

/**
 * Get the current matchday state for a league.
 */
export const getMatchday = async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const league = await getLeague(leagueId)

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    if (!league.matchDay || !league.matchTime) {
      return res.status(400).json({
        success: false,
        message: 'League match day and match time are not configured',
      })
    }

    const {
      status,
      now,
      matchDate,
      closeDate,
    } = getMatchdayStatus(
      league.matchDay,
      league.matchTime,
    )

    let match = null

    /*
     * Only create a Match record once the matchday becomes active.
     *
     * This means we don't create empty future Match records.
     */
    if (status === 'ACTIVE') {
      match = await prisma.match.findFirst({
        where: {
          leagueId,
          matchDate: matchDate.toJSDate(),
        },
        include: {
          events: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  photoUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      if (!match) {
        match = await prisma.match.create({
          data: {
            leagueId,
            matchDate: matchDate.toJSDate(),
          },
          include: {
            events: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    position: true,
                    photoUrl: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        })
      }
    }

    return res.json({
      success: true,
      data: {
        status,
        now: now.toISO(),
        matchDate: matchDate.toISO(),
        closeDate: closeDate.toISO(),
        match,
      },
    })
  } catch (error) {
    console.error('Get matchday error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load matchday',
    })
  }
}
export const recordGoal = async (req, res) => {
  try {
    const matchId = Number(req.params.matchId)

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID',
      })
    }

    const {
      scorerId,
      assistId,
    } = req.body || {}

    if (!Number.isInteger(Number(scorerId))) {
      return res.status(400).json({
        success: false,
        message: 'Goal scorer is required',
      })
    }

    const parsedScorerId = Number(scorerId)
    const parsedAssistId =
      assistId !== null &&
      assistId !== undefined &&
      assistId !== ''
        ? Number(assistId)
        : null

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        league: true,
      },
    })

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Matchday not found',
      })
    }

    const {
      status,
      matchDate,
    } = getMatchdayStatus(
      match.league.matchDay,
      match.league.matchTime,
    )

    /*
     * Make sure this Match belongs to the currently active
     * calendar matchday.
     */
    if (
      status !== 'ACTIVE' ||
      matchDate.toMillis() !== match.matchDate.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: 'This matchday is not active',
      })
    }

    const scorer = await prisma.player.findFirst({
      where: {
        id: parsedScorerId,
        leagueId: match.leagueId,
        deletedAt: null,
      },
    })

    if (!scorer) {
      return res.status(404).json({
        success: false,
        message: 'Goal scorer not found in this league',
      })
    }

    let assist = null

    if (parsedAssistId !== null) {
      if (!Number.isInteger(parsedAssistId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assist player',
        })
      }

      if (parsedAssistId === parsedScorerId) {
        return res.status(400).json({
          success: false,
          message: 'A player cannot assist their own goal',
        })
      }

      assist = await prisma.player.findFirst({
        where: {
          id: parsedAssistId,
          leagueId: match.leagueId,
          deletedAt: null,
        },
      })

      if (!assist) {
        return res.status(404).json({
          success: false,
          message: 'Assist player not found in this league',
        })
      }
    }

    const events = [
      {
        matchId,
        playerId: parsedScorerId,
        type: 'GOAL',
      },
    ]

    if (assist) {
      events.push({
        matchId,
        playerId: assist.id,
        type: 'ASSIST',
      })
    }

    await prisma.matchEvent.createMany({
      data: events,
    })

    const updatedMatch = await getMatchWithEvents(matchId)

    return res.status(201).json({
      success: true,
      message: 'Goal recorded successfully',
      data: {
        match: updatedMatch,
      },
    })
  } catch (error) {
    console.error('Record goal error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to record goal',
    })
  }
}

export const awardCleanSheets = async (req, res) => {
  try {
    const matchId = Number(req.params.matchId)

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID',
      })
    }

    const {
      playerIds,
    } = req.body || {}

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one player is required',
      })
    }

    const parsedPlayerIds = [
      ...new Set(
        playerIds
          .map(Number)
          .filter((id) => Number.isInteger(id)),
      ),
    ]

    if (parsedPlayerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player IDs',
      })
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        league: true,
      },
    })

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Matchday not found',
      })
    }

    const {
      status,
      matchDate,
    } = getMatchdayStatus(
      match.league.matchDay,
      match.league.matchTime,
    )

    if (
      status !== 'ACTIVE' ||
      matchDate.toMillis() !== match.matchDate.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: 'This matchday is not active',
      })
    }

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: parsedPlayerIds,
        },
        leagueId: match.leagueId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    })

    if (players.length !== parsedPlayerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more players do not belong to this league',
      })
    }

    /*
     * Prevent awarding the same clean sheet twice.
     */
    const existingEvents = await prisma.matchEvent.findMany({
      where: {
        matchId,
        playerId: {
          in: parsedPlayerIds,
        },
        type: 'CLEAN_SHEET',
      },
      select: {
        playerId: true,
      },
    })

    const existingPlayerIds = new Set(
      existingEvents.map((event) => event.playerId),
    )

    const newPlayerIds = parsedPlayerIds.filter(
      (playerId) => !existingPlayerIds.has(playerId),
    )

    if (newPlayerIds.length > 0) {
      await prisma.matchEvent.createMany({
        data: newPlayerIds.map((playerId) => ({
          matchId,
          playerId,
          type: 'CLEAN_SHEET',
        })),
      })
    }

    const updatedMatch = await getMatchWithEvents(matchId)

    return res.status(201).json({
      success: true,
      message:
        newPlayerIds.length === 0
          ? 'Clean sheets were already awarded'
          : 'Clean sheets awarded successfully',
      data: {
        match: updatedMatch,
      },
    })
  } catch (error) {
    console.error('Award clean sheets error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to award clean sheets',
    })
  }
}

export const getMatchEvents = async (req, res) => {
  try {
    const matchId = Number(req.params.matchId)

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID',
      })
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        events: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                position: true,
                photoUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Matchday not found',
      })
    }

    return res.json({
      success: true,
      data: {
        match,
        events: match.events,
      },
    })
  } catch (error) {
    console.error('Get match events error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch match events',
    })
  }
}

