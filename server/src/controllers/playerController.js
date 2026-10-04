import prisma from '../config/prisma.js'

export const createPlayer = async (req, res) => {
  try {
    const leagueId = Number(req.params.leagueId)

    if (!Number.isInteger(leagueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid league ID',
      })
    }

    const { name, photoUrl, position, ovr, price } = req.body || {}

    if (!name || !position || ovr === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, position, OVR and price are required',
      })
    }

    const validPositions = ['GK', 'DEF', 'MID', 'ST']

    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player position',
      })
    }

    const parsedOvr = Number(ovr)
    const parsedPrice = Number(price)

    if (
      !Number.isInteger(parsedOvr) ||
      parsedOvr < 1 ||
      parsedOvr > 99
    ) {
      return res.status(400).json({
        success: false,
        message: 'OVR must be a whole number between 1 and 99',
      })
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
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

    const player = await prisma.player.create({
      data: {
        leagueId,
        name: name.trim(),
        photoUrl: photoUrl?.trim() || null,
        position,
        ovr: parsedOvr,
        price: parsedPrice,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Player added successfully',
      data: {
        player,
      },
    })
  } catch (error) {
    console.error('Create player error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create player',
    })
  }
}


export const getPlayers = async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json({
      success: true,
      data: {
        players,
      },
    })
  } catch (error) {
    console.error('Get players error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch players',
    })
  }
}

export const getPlayerById = async (req, res) => {
  try {
    const playerId = Number(req.params.id)

    if (!Number.isInteger(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID',
      })
    }

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        deletedAt: null,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
          },
        },
        events: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found',
      })
    }

    const hasStats = player.events.length > 0

    const goals = player.events.filter(
      (event) => event.type === 'GOAL',
    ).length

    const assists = player.events.filter(
      (event) => event.type === 'ASSIST',
    ).length

    const cleanSheets = player.events.filter(
      (event) => event.type === 'CLEAN_SHEET',
    ).length

    const { events, ...playerData } = player

    return res.json({
      success: true,
      data: {
        player: {
          ...playerData,
          stats: {
            goals: hasStats ? goals : null,
            assists: hasStats ? assists : null,
            cleanSheets: hasStats ? cleanSheets : null,
          },
        },
      },
    })
  } catch (error) {
    console.error('Get player error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch player',
    })
  }
}


export const updatePlayer = async (req, res) => {
  try {
    const playerId = Number(req.params.id)

    if (!Number.isInteger(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID',
      })
    }

    const {
      name,
      photoUrl,
      position,
      ovr,
      price,
    } = req.body || {}

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof position !== 'string' ||
      !position.trim() ||
      ovr === undefined ||
      ovr === null ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, position, OVR and price are required',
      })
    }

    const validPositions = ['GK', 'DEF', 'MID', 'ST']

    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player position',
      })
    }

    const parsedOvr = Number(ovr)
    const parsedPrice = Number(price)

    if (
      !Number.isInteger(parsedOvr) ||
      parsedOvr < 1 ||
      parsedOvr > 99
    ) {
      return res.status(400).json({
        success: false,
        message: 'OVR must be a whole number between 1 and 99',
      })
    }

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      })
    }

    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        deletedAt: null,
      },
    })

    if (!existingPlayer) {
      return res.status(404).json({
        success: false,
        message: 'Player not found',
      })
    }

    const player = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        name: name.trim(),
        photoUrl: photoUrl?.trim() || null,
        position,
        ovr: parsedOvr,
        price: parsedPrice,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return res.json({
      success: true,
      message: 'Player updated successfully',
      data: {
        player,
      },
    })
  } catch (error) {
    console.error('Update player error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update player',
    })
  }
}


export const deletePlayer = async (req, res) => {
  try {
    const playerId = Number(req.params.id)

    if (!Number.isInteger(playerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID',
      })
    }

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        deletedAt: null,
      },
    })

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found',
      })
    }

    await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return res.json({
      success: true,
      message: 'Player deleted successfully',
    })
  } catch (error) {
    console.error('Delete player error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete player',
    })
  }
}