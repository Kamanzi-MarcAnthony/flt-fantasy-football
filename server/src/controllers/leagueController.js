import prisma from '../config/prisma.js'

export const createLeague = async (req, res) => {
  try {
    console.log('CREATE LEAGUE BODY:', req.body)
    const { name, startDate, endDate, recurring, recurrenceType, location, scoringConfig } =
      req.body || {}

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, start date and end date are required',
      })
    }

    const league = await prisma.league.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        recurring: recurring ?? false,
        recurrenceType: recurrenceType || null,
        location: location || null,
        scoringConfig: scoringConfig || {},
        createdById: req.user.id,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: {
        league,
      },
    })
  } catch (error) {
    console.error('Create league error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create league',
    })
  }
}

// ADD THIS BELOW createLeague

export const getLeagues = async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json({
      success: true,
      data: {
        leagues,
      },
    })
  } catch (error) {
    console.error('Get leagues error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch leagues',
    })
  }
}
