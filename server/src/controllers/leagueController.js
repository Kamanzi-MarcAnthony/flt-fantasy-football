import prisma from '../config/prisma.js'

export const createLeague = async (req, res) => {
  try {
    const { name, location, matchDay, matchTime, maxTransfers } = req.body || {}

    if (!name || !matchDay) {
      return res.status(400).json({
        success: false,
        message: 'Name and match day are required',
      })
    }

     // Transfer limit validation
    if (
      !Number.isInteger(maxTransfers) ||
      maxTransfers < 1 ||
      maxTransfers > 7
    ) {
      return res.status(400).json({
        success: false,
        message: 'Maximum transfers must be between 1 and 7',
      })
    }

    const league = await prisma.league.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        matchDay: matchDay.trim(),
        matchTime: matchTime?.trim() || null,
        createdById: req.user.id,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: { league },
    })
  } catch (error) {
    console.error('Create league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create league',
    })
  }
  }
  
export const updateLeague = async (req, res) => {
  try {
    const leagueId = Number(req.params.id)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const {
      name,
      location,
      matchDay,
      matchTime,
      maxTransfers,
    } = req.body || {}

    if (!name || !matchDay || !matchTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, match day and match time are required',
      })
    }

    if (
      !Number.isInteger(Number(maxTransfers)) ||
      Number(maxTransfers) < 1 ||
      Number(maxTransfers) > 7
    ) {
      return res.status(400).json({
        success: false,
        message: 'Maximum transfers must be between 1 and 7',
      })
    }

    const existingLeague = await prisma.league.findUnique({
      where: {
        id: leagueId,
      },
    })

    if (!existingLeague) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    const league = await prisma.league.update({
      where: {
        id: leagueId,
      },
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        matchDay: matchDay.trim(),
        matchTime: matchTime.trim(),
        maxTransfers: Number(maxTransfers),
      },
    })

    return res.json({
      success: true,
      message: 'League updated successfully',
      data: {
        league,
      },
    })
  } catch (error) {
    console.error('Update league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update league',
    })
  }
}


export const getLeagues = async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            players: true,
            matches: true,
          },
        },
      },
    })

    return res.json({
      success: true,
      data: { leagues },
    })
  } catch (error) {
    console.error('Get leagues error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch leagues',
    })
  }

}

export const getLeagueById = async (req, res) => {
  try {
    const leagueId = Number(req.params.id)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        players: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            players: true,
            matches: true,
            fantasyTeams: true,
          },
        },
      },
    })

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    return res.json({
      success: true,
      data: { league },
    })
  } catch (error) {
    console.error('Get league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch league',
    })
  }
}

export const deleteLeague = async (req, res) => {
  try {
    const leagueId = Number(req.params.id)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    await prisma.league.delete({
      where: { id: leagueId },
    })

    return res.json({
      success: true,
      message: 'League deleted successfully',
    })
  } catch (error) {
    console.error('Delete league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete league',
    })
  }
}

export const getLeagueStats = async (req, res) => {
  try {
    const leagueId = Number(req.params.id)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { id: true },
    })

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    const [goalStats, assistStats] = await Promise.all([
      prisma.matchEvent.groupBy({
        by: ['playerId'],
        where: {
          type: 'GOAL',
          player: {
            leagueId,
            deletedAt: null,
          },
        },
        _count: {
          playerId: true,
        },
        orderBy: {
          _count: {
            playerId: 'desc',
          },
        },
        take: 5,
      }),

      prisma.matchEvent.groupBy({
        by: ['playerId'],
        where: {
          type: 'ASSIST',
          player: {
            leagueId,
            deletedAt: null,
          },
        },
        _count: {
          playerId: true,
        },
        orderBy: {
          _count: {
            playerId: 'desc',
          },
        },
        take: 5,
      }),
    ])

    const playerIds = [
      ...new Set([
        ...goalStats.map((item) => item.playerId),
        ...assistStats.map((item) => item.playerId),
      ]),
    ]

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds,
        },
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
      },
    })

    const playerMap = new Map(
      players.map((player) => [player.id, player]),
    )

    const topGoalscorers = goalStats.map((item) => ({
      ...playerMap.get(item.playerId),
      goals: item._count.playerId,
    }))

    const topAssists = assistStats.map((item) => ({
      ...playerMap.get(item.playerId),
      assists: item._count.playerId,
    }))

    return res.json({
      success: true,
      data: {
        topGoalscorers,
        topAssists,
      },
    })
  } catch (error) {
    console.error('Get league stats error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load league statistics',
    })
  }
}

export const getLeagueLeaderboard = async (req, res) => {
  try {
    const leagueId = Number(req.params.id)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const league = await prisma.league.findUnique({
      where: {
        id: leagueId,
      },
      select: {
        id: true,
      },
    })

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    const leaderboard = await prisma.fantasyTeamGameweekScore.groupBy({
      by: ['teamId'],
      where: {
        team: {
          leagueId,
        },
      },
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
    })

    if (leaderboard.length === 0) {
      return res.json({
        success: true,
        data: {
          leaderboard: [],
        },
      })
    }

    const teamIds = leaderboard.map((item) => item.teamId)

    const teams = await prisma.fantasyTeam.findMany({
      where: {
        id: {
          in: teamIds,
        },
      },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const teamMap = new Map(
      teams.map((team) => [team.id, team]),
    )

    const formattedLeaderboard = leaderboard.map((item, index) => {
      const team = teamMap.get(item.teamId)

      return {
        rank: index + 1,
        teamId: item.teamId,
        teamName: team?.name || 'Unknown Team',
        userId: team?.user.id,
        userName: team?.user.name || 'Unknown Player',
        points: item._sum.points || 0,
      }
    })

    return res.json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
      },
    })
  } catch (error) {
    console.error('Get league leaderboard error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load league leaderboard',
    })
  }
}