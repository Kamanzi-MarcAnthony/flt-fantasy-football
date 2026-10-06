import prisma from '../config/prisma.js'
import {
  STARTING_BANK,
  FANTASY_TEAM_SIZE,
} from '../constants/fantasy.js'
import { getMatchdayStatus } from '../utils/matchday.js'

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

export const getFantasyTransferStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.query.leagueId)

    if (!Number.isInteger(leagueId) || leagueId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const membership = await prisma.fantasyLeagueMember.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId,
        },
      },
      include: {
        league: true,
      },
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this league',
      })
    }

    const league = membership.league

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

    return res.json({
      success: true,
      data: {
        transferStatus: status === 'ACTIVE' ? 'CLOSED' : 'OPEN',
        matchdayStatus: status,
        now: now.toISO(),
        matchDate: matchDate.toISO(),
        closeDate: closeDate.toISO(),
      },
    })
  } catch (error) {
    console.error('Get fantasy transfer status error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load transfer status',
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
        message: 'Valid leagueId is required',
      })
    }

    // Make sure the fantasy user belongs to this league
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
        message: 'You are not a member of this league',
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

        events: {
          select: {
            type: true,
            matchId: true,
          },
        },
      },
    })

    const formattedPlayers = players.map((player) => {
      // Group events by match so the goal bonus is calculated
      // per match rather than across the player's entire career.
      const matches = {}

      player.events.forEach((event) => {
        if (!matches[event.matchId]) {
          matches[event.matchId] = {
            goals: 0,
            assists: 0,
            cleanSheets: 0,
          }
        }

        if (event.type === 'GOAL') {
          matches[event.matchId].goals += 1
        }

        if (event.type === 'ASSIST') {
          matches[event.matchId].assists += 1
        }

        if (event.type === 'CLEAN_SHEET') {
          matches[event.matchId].cleanSheets += 1
        }
      })

      let totalPoints = 0

      Object.values(matches).forEach((match) => {
        // Goal points
        const goalPoints = {
          GK: 7,
          DEF: 6,
          MID: 5,
          ST: 4,
        }

        totalPoints += match.goals * goalPoints[player.position]

        // Assist points
        totalPoints += match.assists * 3

        // Goal bonus
        if (match.goals >= 2) {
          totalPoints += 3
        } else if (match.goals === 1) {
          totalPoints += 1
        }

        // Clean sheet points
        const cleanSheetPoints = {
          GK: 4,
          DEF: 4,
          MID: 2,
          ST: 1,
        }

        totalPoints +=
          match.cleanSheets * cleanSheetPoints[player.position]
      })

      return {
        id: player.id,
        name: player.name,
        photoUrl: player.photoUrl,
        position: player.position,
        ovr: player.ovr,
        price: player.price,
        totalPoints,
      }
    })

    return res.json({
      success: true,
      data: {
        players: formattedPlayers,
      },
    })
  } catch (error) {
    console.error('Get fantasy players error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch fantasy players',
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

                events: {
                  select: {
                    type: true,
                    matchId: true,
                  },
                },
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

    const goalPoints = {
      GK: 7,
      DEF: 6,
      MID: 5,
      ST: 4,
    }

    const cleanSheetPoints = {
      GK: 4,
      DEF: 4,
      MID: 2,
      ST: 1,
    }

    const players = team.players.map((item) => {
      const matches = {}

      item.player.events.forEach((event) => {
        if (!matches[event.matchId]) {
          matches[event.matchId] = {
            goals: 0,
            assists: 0,
            cleanSheets: 0,
          }
        }

        if (event.type === 'GOAL') {
          matches[event.matchId].goals += 1
        }

        if (event.type === 'ASSIST') {
          matches[event.matchId].assists += 1
        }

        if (event.type === 'CLEAN_SHEET') {
          matches[event.matchId].cleanSheets += 1
        }
      })

      let totalPoints = 0

      Object.values(matches).forEach((match) => {
        // Goals
        totalPoints +=
          match.goals * goalPoints[item.player.position]

        // Assists
        totalPoints += match.assists * 3

        // Goal bonus
        if (match.goals >= 2) {
          totalPoints += 3
        } else if (match.goals === 1) {
          totalPoints += 1
        }

        // Clean sheets
        totalPoints +=
          match.cleanSheets *
          cleanSheetPoints[item.player.position]
      })

      return {
        ...item,
        player: {
          ...item.player,
          totalPoints,
          // Events are only needed internally for calculation
          events: undefined,
        },
      }
    })

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
          players,
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

export const getFantasyPoints = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.query.leagueId)

    const requestedGameweekId = req.query.gameweekId
      ? Number(req.query.gameweekId)
      : null

    // -----------------------------------
    // Validate league ID
    // -----------------------------------

    if (!Number.isInteger(leagueId) || leagueId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    // -----------------------------------
    // Validate gameweek ID if provided
    // -----------------------------------

    if (
      requestedGameweekId !== null &&
      (!Number.isInteger(requestedGameweekId) ||
        requestedGameweekId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gameweek ID',
      })
    }

    // -----------------------------------
    // Check league membership
    // -----------------------------------

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
        message: 'You are not a member of this league',
      })
    }

    // -----------------------------------
    // Get user's fantasy team
    // -----------------------------------

    const team = await prisma.fantasyTeam.findUnique({
      where: {
        userId_leagueId: {
          userId,
          leagueId,
        },
      },
      select: {
        id: true,
        name: true,
        leagueId: true,
        captainId: true,
        viceCaptainId: true,
      },
    })

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Fantasy team not found',
      })
    }

    // -----------------------------------
    // Get all gameweeks for this league
    // -----------------------------------

    const gameweeks = await prisma.gameweek.findMany({
      where: {
        leagueId,
      },
      orderBy: {
        number: 'asc',
      },
      select: {
        id: true,
        number: true,
        startDate: true,
        endDate: true,
      },
    })

    // -----------------------------------
    // No gameweeks yet
    // -----------------------------------

    if (gameweeks.length === 0) {
      return res.json({
        success: true,
        data: {
          team,
          gameweeks: [],
          gameweek: null,
          players: [],
          totalPoints: 0,
          highestGameweekPoints: 0,
          highestGameweek: null,
        },
      })
    }

    // -----------------------------------
    // Determine selected gameweek
    // -----------------------------------

    let selectedGameweek

    if (requestedGameweekId !== null) {
      selectedGameweek = gameweeks.find(
        (item) => item.id === requestedGameweekId,
      )

      if (!selectedGameweek) {
        return res.status(404).json({
          success: false,
          message: 'Gameweek not found',
        })
      }
    } else {
      selectedGameweek = gameweeks[gameweeks.length - 1]
    }

    // -----------------------------------
    // Get player's fantasy points
    // -----------------------------------

    const playerScores = await prisma.fantasyPlayerGameweekScore.findMany({
      where: {
        teamId: team.id,
        gameweekId: selectedGameweek.id,
      },
      select: {
        playerId: true,
        points: true,

        player: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            position: true,
            ovr: true,
            price: true,

            events: {
              where: {
                match: {
                  gameweekId: selectedGameweek.id,
                },
              },
              select: {
                id: true,
                type: true,
                matchId: true,
              },
            },
          },
        },
      },
      orderBy: {
        player: {
          name: 'asc',
        },
      },
    })

    // -----------------------------------
    // Get total team points
    // -----------------------------------

    const teamScore = await prisma.fantasyTeamGameweekScore.findUnique({
      where: {
        teamId_gameweekId: {
          teamId: team.id,
          gameweekId: selectedGameweek.id,
        },
      },
      select: {
        points: true,
      },
    })

    // -----------------------------------
    // Get highest gameweek score
    // -----------------------------------

    const highestGameweekScore =
      await prisma.fantasyTeamGameweekScore.findFirst({
        where: {
          teamId: team.id,
        },
        orderBy: {
          points: 'desc',
        },
        select: {
          points: true,
          gameweek: {
            select: {
              id: true,
              number: true,
            },
          },
        },
      })

    // -----------------------------------
    // Scoring rules
    // -----------------------------------

    const GOAL_POINTS = {
      GK: 7,
      DEF: 6,
      MID: 5,
      ST: 4,
    }

    const CLEAN_SHEET_POINTS = {
      GK: 4,
      DEF: 4,
      MID: 2,
      ST: 1,
    }

    const ASSIST_POINTS = 3

    // -----------------------------------
    // Format player points + breakdown
    // -----------------------------------

    const players = playerScores.map((item) => {
      const events = item.player.events || []

      const goals = events.filter(
        (event) => event.type === 'GOAL',
      ).length

      const assists = events.filter(
        (event) => event.type === 'ASSIST',
      ).length

      const cleanSheets = events.filter(
        (event) => event.type === 'CLEAN_SHEET',
      ).length

      const breakdown = []

      // Goals
      if (goals > 0) {
        const points = goals * GOAL_POINTS[item.player.position]

        breakdown.push({
          type: 'GOAL',
          label: 'Goals',
          detail: `${goals} ${goals === 1 ? 'goal' : 'goals'}`,
          points,
        })
      }

      // Assists
      if (assists > 0) {
        breakdown.push({
          type: 'ASSIST',
          label: 'Assists',
          detail: `${assists} ${
            assists === 1 ? 'assist' : 'assists'
          }`,
          points: assists * ASSIST_POINTS,
        })
      }

      // Goal bonus
      if (goals >= 2) {
        breakdown.push({
          type: 'BONUS',
          label: 'Bonus',
          detail: '2+ goals',
          points: 3,
        })
      } else if (goals === 1) {
        breakdown.push({
          type: 'BONUS',
          label: 'Bonus',
          detail: '1 goal',
          points: 1,
        })
      }

      // Clean sheet
      if (cleanSheets > 0) {
        breakdown.push({
          type: 'CLEAN_SHEET',
          label: 'Clean Sheet',
          detail: `${cleanSheets} ${
            cleanSheets === 1 ? 'clean sheet' : 'clean sheets'
          }`,
          points:
            cleanSheets *
            CLEAN_SHEET_POINTS[item.player.position],
        })
      }

      return {
        id: item.player.id,
        name: item.player.name,
        photoUrl: item.player.photoUrl,
        position: item.player.position,
        ovr: item.player.ovr,
        price: Number(item.player.price),

        // Already includes captain multiplier.
        points: item.points,

        isCaptain: item.player.id === team.captainId,
        isViceCaptain: item.player.id === team.viceCaptainId,

        breakdown,
      }
    })

    // -----------------------------------
    // Response
    // -----------------------------------

    return res.json({
      success: true,
      data: {
        team,

        gameweeks,

        gameweek: selectedGameweek,

        players,

        totalPoints: teamScore?.points ?? 0,

        highestGameweekPoints:
          highestGameweekScore?.points ?? 0,

        highestGameweek:
          highestGameweekScore?.gameweek ?? null,
      },
    })
  } catch (error) {
    console.error('Get fantasy points error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load fantasy points',
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

export const getFantasyLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id
    const leagueId = Number(req.query.leagueId)
    const type = req.query.type === 'overall' ? 'overall' : 'gameweek'

    if (!Number.isInteger(leagueId) || leagueId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    // Make sure the fantasy user belongs to this league.
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
        message: 'You are not a member of this league',
      })
    }

    /*
     * Get the latest gameweek.
     *
     * For now, the latest gameweek is the current gameweek.
     * When we implement matchday/gameweek management, this
     * will be created automatically when a new gameweek starts.
     */
    let currentGameweek = await prisma.gameweek.findFirst({
      where: {
        leagueId,
      },
      orderBy: {
        number: 'desc',
      },
    })

    /*
     * If the league has never had a gameweek, create Gameweek 1.
     */
    if (!currentGameweek) {
      currentGameweek = await prisma.gameweek.create({
        data: {
          leagueId,
          number: 1,
          startDate: new Date(),
        },
      })
    }

    const previousGameweek = await prisma.gameweek.findFirst({
      where: {
        leagueId,
        number: currentGameweek.number - 1,
      },
    })

    /*
     * Get every fantasy team in the league.
     *
     * This is important:
     * teams with no score record still appear with 0 points.
     */
    const teams = await prisma.fantasyTeam.findMany({
      where: {
        leagueId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        gameweekScores: {
          where: {
            gameweekId: {
              in: [
                currentGameweek.id,
                ...(previousGameweek
                  ? [previousGameweek.id]
                  : []),
              ],
            },
          },
          select: {
            gameweekId: true,
            points: true,
          },
        },
      },
    })

    /*
     * Build the leaderboard.
     */
    const rows = teams.map((team) => {
      const currentScore =
        team.gameweekScores.find(
          (score) => score.gameweekId === currentGameweek.id,
        )?.points || 0

      const previousScore = previousGameweek
        ? team.gameweekScores.find(
            (score) =>
              score.gameweekId === previousGameweek.id,
          )?.points || 0
        : 0

      return {
        teamId: team.id,
        userId: team.userId,
        name: team.user.name,
        gameweekPoints: currentScore,
        previousGameweekPoints: previousScore,
        isCurrentUser: team.userId === userId,
      }
    })

    /*
     * GAMEWEEK
     *
     * Rank teams using only this gameweek's points.
     */
    if (type === 'gameweek') {
      rows.sort((a, b) => {
        if (b.gameweekPoints !== a.gameweekPoints) {
          return b.gameweekPoints - a.gameweekPoints
        }

        return a.name.localeCompare(b.name)
      })
    }

    /*
     * OVERALL
     *
     * Add every gameweek's points.
     */
    if (type === 'overall') {
      const allScores = await prisma.fantasyTeamGameweekScore.findMany({
        where: {
          team: {
            leagueId,
          },
        },
        select: {
          teamId: true,
          points: true,
        },
      })

      const totals = new Map()

      allScores.forEach((score) => {
        totals.set(
          score.teamId,
          (totals.get(score.teamId) || 0) + score.points,
        )
      })

      rows.forEach((row) => {
        row.overallPoints = totals.get(row.teamId) || 0
      })

      rows.sort((a, b) => {
        if (b.overallPoints !== a.overallPoints) {
          return b.overallPoints - a.overallPoints
        }

        return a.name.localeCompare(b.name)
      })
    }

    /*
     * Get previous ranking for movement.
     *
     * For Gameweek:
     * compare with the previous gameweek.
     *
     * For Overall:
     * compare current overall ranking against the
     * overall ranking before the current gameweek.
     */
    let previousRanks = new Map()

    if (previousGameweek) {
      const previousScores = await prisma.fantasyTeamGameweekScore.findMany({
        where: {
          gameweekId: previousGameweek.id,
          team: {
            leagueId,
          },
        },
        select: {
          teamId: true,
          points: true,
        },
      })

      const previousRankRows = teams.map((team) => {
        const score =
          previousScores.find(
            (item) => item.teamId === team.id,
          )?.points || 0

        return {
          teamId: team.id,
          points: score,
        }
      })

      previousRankRows.sort((a, b) => {
        return b.points - a.points
      })

      previousRankRows.forEach((row, index) => {
        previousRanks.set(row.teamId, index + 1)
      })
    }

    const leaderboard = rows.map((row, index) => {
      const rank = index + 1
      const previousRank = previousRanks.get(row.teamId)

      let movement = 'same'

      if (previousRank) {
        if (rank < previousRank) {
          movement = 'up'
        } else if (rank > previousRank) {
          movement = 'down'
        }
      }

      return {
        rank,
        teamId: row.teamId,
        userId: row.userId,
        name: row.name,
        points:
          type === 'overall'
            ? row.overallPoints
            : row.gameweekPoints,
        movement,
        isCurrentUser: row.isCurrentUser,
      }
    })

    return res.json({
      success: true,
      data: {
        type,
        gameweek: {
          id: currentGameweek.id,
          number: currentGameweek.number,
        },
        leaderboard,
      },
    })
  } catch (error) {
    console.error('Get fantasy leaderboard error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load leaderboard',
    })
  }
}