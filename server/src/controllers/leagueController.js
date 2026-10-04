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