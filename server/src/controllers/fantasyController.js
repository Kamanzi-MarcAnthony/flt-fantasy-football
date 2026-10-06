import prisma from '../config/prisma.js'
import {
  STARTING_BANK,
  FANTASY_TEAM_SIZE,
} from '../constants/fantasy.js'

export const getAvailableLeagues = async (req, res) => {
  try {
    const userId = req.user.id

    const leagues = await prisma.league.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        location: true,
        matchDay: true,
        matchTime: true,
        _count: {
          select: {
            players: true,
            fantasyMembers: true,
          },
        },
        fantasyMembers: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    })

    const formattedLeagues = leagues.map((league) => ({
      id: league.id,
      name: league.name,
      location: league.location,
      matchDay: league.matchDay,
      matchTime: league.matchTime,
      playerCount: league._count.players,
      memberCount: league._count.fantasyMembers,
      isJoined: league.fantasyMembers.length > 0,
    }))

    return res.json({
      success: true,
      data: {
        leagues: formattedLeagues,
      },
    })
  } catch (error) {
    console.error('Get available leagues error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load leagues',
    })
  }
}

export const joinLeague = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.params.leagueId)

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
    })

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found',
      })
    }

    const existingMembership =
      await prisma.fantasyLeagueMember.findUnique({
        where: {
          userId_leagueId: {
            userId,
            leagueId,
          },
        },
      })

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message: 'You have already joined this league',
      })
    }

    const membership =
      await prisma.fantasyLeagueMember.create({
        data: {
          userId,
          leagueId,
        },
        include: {
          league: {
            select: {
              id: true,
              name: true,
              location: true,
              matchDay: true,
              matchTime: true,
            },
          },
        },
      })

    return res.status(201).json({
      success: true,
      message: 'League joined successfully',
      data: {
        membership,
      },
    })
  } catch (error) {
    console.error('Join league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to join league',
    })
  }
}

export const getFantasyStatus = async (req, res) => {
  try {
    const userId = req.user.id

    const memberships = await prisma.fantasyLeagueMember.findMany({
      where: { userId },
      select: {
        id: true,
        leagueId: true,
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const teams = await prisma.fantasyTeam.findMany({
      where: { userId },
      select: {
        id: true,
        leagueId: true,
        name: true,
      },
    })

    return res.json({
      success: true,
      data: {
        hasJoinedLeague: memberships.length > 0,
        hasTeam: teams.length > 0,
        memberships,
        teams,
      },
    })
  } catch (error) {
    console.error('Get fantasy status error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load fantasy status',
    })
  }
}

export const getFantasyPlayers = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.query.leagueId)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    // Make sure the fantasy user has joined this league
    const membership = await prisma.fantasyLeagueMember.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You have not joined this league',
      })
    }

    const players = await prisma.player.findMany({
      where: {
        leagueId,
        deletedAt: null,
      },
      orderBy: [
        { position: 'asc' },
        { price: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
        ovr: true,
        price: true,
      },
    })

    return res.json({
      success: true,
      data: {
        players,
      },
    })
  } catch (error) {
    console.error('Get fantasy players error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load players',
    })
  }
}

export const createFantasyTeam = async (req, res) => {
  try {
    const userId = req.user.id

    const { leagueId, name, playerIds } = req.body

    const parsedLeagueId = Number(leagueId)

    if (!Number.isInteger(parsedLeagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required',
      })
    }

    if (!Array.isArray(playerIds)) {
      return res.status(400).json({
        success: false,
        message: 'Player IDs must be an array',
      })
    }

    if (playerIds.length !== FANTASY_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Your fantasy team must contain exactly ${FANTASY_TEAM_SIZE} players`,
      })
    }

    const normalizedPlayerIds = playerIds.map(Number)

    if (normalizedPlayerIds.some((id) => !Number.isInteger(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID',
      })
    }

    // Prevent duplicate players
    const uniquePlayerIds = [...new Set(normalizedPlayerIds)]

    if (uniquePlayerIds.length !== FANTASY_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'You cannot select the same player more than once',
      })
    }

    // Check league membership
    const membership = await prisma.fantasyLeagueMember.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId: parsedLeagueId,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You have not joined this league',
      })
    }

    // One team per user per league
    const existingTeam = await prisma.fantasyTeam.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId: parsedLeagueId,
        },
      },
    })

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'You already have a fantasy team in this league',
      })
    }

    // Fetch selected players
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: uniquePlayerIds,
        },
        leagueId: parsedLeagueId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    })

    if (players.length !== FANTASY_TEAM_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected players are invalid',
      })
    }

    // Calculate squad cost
    const squadCost = players.reduce(
      (total, player) => total + Number(player.price),
      0,
    )

    if (squadCost > STARTING_BANK) {
      return res.status(400).json({
        success: false,
        message: `Your squad costs ${squadCost}M, but you only have ${STARTING_BANK}M`,
      })
    }

    const bank = STARTING_BANK - squadCost

    // Create everything atomically
    const team = await prisma.$transaction(async (tx) => {
      const createdTeam = await tx.fantasyTeam.create({
        data: {
          userId,
          leagueId: parsedLeagueId,
          name: name.trim(),
          bank,
        },
      })

      await tx.fantasyTeamPlayer.createMany({
        data: players.map((player) => ({
          teamId: createdTeam.id,
          playerId: player.id,
          purchasePrice: player.price,
        })),
      })

      return createdTeam
    })

    return res.status(201).json({
      success: true,
      message: 'Fantasy team created successfully',
      data: {
        team: {
          id: team.id,
          name: team.name,
          leagueId: team.leagueId,
          bank: team.bank,
          squadCost,
          playerCount: players.length,
        },
      },
    })
  } catch (error) {
    console.error('Create fantasy team error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create fantasy team',
    })
  }
}

export const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.query.leagueId)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const team = await prisma.fantasyTeam.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId,
        },
      },
      include: {
        players: {
          orderBy: {
          createdAt: 'asc',
          },
          include: {
            player: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                position: true,
                ovr: true,
                price: true,
              },
            },
          },
        },
        captain: {
          select: {
            id: true,
          },
        },
        viceCaptain: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Fantasy team not found',
      })
    }

    const squadCost = team.players.reduce(
      (total, item) => total + Number(item.purchasePrice),
      0,
    )

    const squadValue = team.players.reduce(
      (total, item) => total + Number(item.player.price),
      0,
    )

    return res.json({
      success: true,
      data: {
        team: {
          id: team.id,
          name: team.name,
          leagueId: team.leagueId,
          bank: Number(team.bank),
          squadCost,
          squadValue,
          captainId: team.captainId,
          viceCaptainId: team.viceCaptainId,
          players: team.players,
        },
      },
    })
  } catch (error) {
    console.error('Get my team error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load fantasy team',
    })
  }
}

export const updateTeamCaptains = async (req, res) => {
  try {
    const userId = req.user.id
    const teamId = Number(req.params.teamId)

    const { captainId, viceCaptainId } = req.body

    if (!Number.isInteger(teamId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID',
      })
    }

    const parsedCaptainId = Number(captainId)
    const parsedViceCaptainId = Number(viceCaptainId)

    if (
      !Number.isInteger(parsedCaptainId) ||
      !Number.isInteger(parsedViceCaptainId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Captain and vice captain are required',
      })
    }

    if (parsedCaptainId === parsedViceCaptainId) {
      return res.status(400).json({
        success: false,
        message: 'Captain and vice captain must be different players',
      })
    }

    const team = await prisma.fantasyTeam.findFirst({
      where: {
        id: teamId,
        userId,
      },
      include: {
        players: {
          select: {
            playerId: true,
          },
        },
      },
    })

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Fantasy team not found',
      })
    }

    const playerIds = team.players.map((item) => item.playerId)

    if (
      !playerIds.includes(parsedCaptainId) ||
      !playerIds.includes(parsedViceCaptainId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Captain and vice captain must be players in your team',
      })
    }

    const updatedTeam = await prisma.fantasyTeam.update({
      where: {
        id: teamId,
      },
      data: {
        captainId: parsedCaptainId,
        viceCaptainId: parsedViceCaptainId,
      },
      select: {
        id: true,
        name: true,
        leagueId: true,
        bank: true,
        captainId: true,
        viceCaptainId: true,
      },
    })

    return res.json({
      success: true,
      message: 'Captain and vice captain updated successfully',
      data: {
        team: {
          ...updatedTeam,
          bank: Number(updatedTeam.bank),
        },
      },
    })
  } catch (error) {
    console.error('Update team captains error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update captain and vice captain',
    })
  }
}

export const updateFantasyTeam = async (req, res) => {
  try {
    const userId = req.user.id
    const teamId = Number(req.params.teamId)
    const { name } = req.body

    if (!Number.isInteger(teamId) || teamId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID',
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required',
      })
    }

    const trimmedName = name.trim()

    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Team name cannot exceed 50 characters',
      })
    }

    const team = await prisma.fantasyTeam.findFirst({
      where: {
        id: teamId,
        userId,
      },
    })

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Fantasy team not found',
      })
    }

    const updatedTeam = await prisma.fantasyTeam.update({
      where: {
        id: teamId,
      },
      data: {
        name: trimmedName,
      },
      select: {
        id: true,
        name: true,
        leagueId: true,
      },
    })

    return res.json({
      success: true,
      message: 'Team details updated successfully',
      data: {
        team: updatedTeam,
      },
    })
  } catch (error) {
    console.error('Update fantasy team error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update team details',
    })
  }
}

export const deleteFantasyAccount = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
        refreshTokenHash: null,
      },
    })

    return res.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete fantasy account error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete account',
    })
  }
}