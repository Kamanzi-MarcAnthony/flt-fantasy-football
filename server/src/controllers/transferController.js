import prisma from '../config/prisma.js'

import { getMatchdayStatus } from '../utils/matchday.js'


const getCurrentGameweekNumber = async (leagueId) => {
  const latestGameweek = await prisma.gameweek.findFirst({
    where: {
      leagueId,
    },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  })

  return latestGameweek?.number ?? 1
}

const getTransferGameweekNumber = async (leagueId, matchDate) => {
  const match = await prisma.match.findFirst({
    where: {
      leagueId,
      matchDate: matchDate.toJSDate(),
    },
    select: {
      gameweek: {
        select: {
          number: true,
        },
      },
    },
  })

  if (match?.gameweek?.number) {
    return match.gameweek.number
  }

  const openGameweek = await prisma.gameweek.findFirst({
    where: {
      leagueId,
      endDate: null,
    },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  })

  if (openGameweek) {
    return openGameweek.number
  }

  const latestGameweek = await prisma.gameweek.findFirst({
    where: { leagueId },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  })

  return latestGameweek ? latestGameweek.number + 1 : 1
}




export const makeTransfer = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      leagueId,
      outgoingPlayerId,
      incomingPlayerId,
    } = req.body || {}



    const parsedLeagueId = Number(leagueId)

    const parsedOutgoingPlayerId = Number(outgoingPlayerId)

    const parsedIncomingPlayerId = Number(incomingPlayerId)



    // ---------------------------------------------------------

    // Validate request

    // ---------------------------------------------------------



    if (

      !Number.isInteger(parsedLeagueId) ||

      !Number.isInteger(parsedOutgoingPlayerId) ||

      !Number.isInteger(parsedIncomingPlayerId)

    ) {

      return res.status(400).json({

        success: false,

        message: 'League, outgoing player and incoming player are required',

      })

    }



    if (parsedOutgoingPlayerId === parsedIncomingPlayerId) {

      return res.status(400).json({

        success: false,

        message: 'Outgoing and incoming players must be different',

      })

    }



    // ---------------------------------------------------------

    // Get league

    // ---------------------------------------------------------



    const league = await prisma.league.findUnique({

      where: {

        id: parsedLeagueId,

      },

      select: {

        id: true,

        matchDay: true,

        matchTime: true,

        maxTransfers: true,

      },

    })



    if (!league) {

      return res.status(404).json({

        success: false,

        message: 'League not found',

      })

    }



    // ---------------------------------------------------------

    // Validate matchday configuration

    // ---------------------------------------------------------



    if (!league.matchDay || !league.matchTime) {

      return res.status(400).json({

        success: false,

        message: 'League match day and match time are not configured',

      })

    }



    // ---------------------------------------------------------

    // Check transfer window

    // ---------------------------------------------------------



const {
  status,
  transferStatus,
  now,
  matchDate,
  closeDate,
  transferCloseDate,
} = getMatchdayStatus(
  league.matchDay,
  league.matchTime
)

    const gameweekNumber = await getTransferGameweekNumber(
      parsedLeagueId,
      matchDate,
    )
    const unlimitedTransfers = gameweekNumber === 1



    // Transfers are closed while the matchday is active.

if (transferStatus === 'CLOSED') {
  return res.status(400).json({
    success: false,
    message: 'Transfers are closed for this matchday',
    data: {
      transferStatus: 'CLOSED',
      transferCloseDate: transferCloseDate.toISO(),
      matchDate: matchDate.toISO(),
      gameweekNumber,
      unlimitedTransfers,
    },
  })
}



    // ---------------------------------------------------------

    // Get fantasy team

    // ---------------------------------------------------------



    const team = await prisma.fantasyTeam.findUnique({

      where: {

        userId_leagueId: {

          userId,

          leagueId: parsedLeagueId,

        },

      },

      include: {

        players: {

          include: {

            player: true,

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



    // ---------------------------------------------------------

    // Calculate current transfer window

    // ---------------------------------------------------------



    /*

     * The current matchDate represents the next matchday.

     *

     * Therefore the current transfer window starts after

     * the previous matchday and ends when the next matchday starts.

     *

     * Your league runs weekly, so the previous matchday is

     * seven days before the upcoming matchday.

     */



    const transferWindowStart = matchDate.minus({

      weeks: 1,

    })




    // ---------------------------------------------------------

    // Count transfers used in this window

    // ---------------------------------------------------------



    const transferCount = await prisma.fantasyTransfer.count({

      where: {

        teamId: team.id,

        createdAt: {

          gte: transferWindowStart.toJSDate(),

          lt: matchDate.toJSDate(),

        },

      },

    })



    const remainingTransfers = unlimitedTransfers
      ? null
      : Math.max(league.maxTransfers - transferCount, 0)

    // ---------------------------------------------------------
    // Enforce transfer limit
    // ---------------------------------------------------------

    if (!unlimitedTransfers && transferCount >= league.maxTransfers) {

      return res.status(400).json({

        success: false,

        message: `You have reached your maximum of ${league.maxTransfers} transfers for this transfer window`,

        data: {

          transferLimit: league.maxTransfers,

          transfersUsed: transferCount,

          remainingTransfers: 0,
          gameweekNumber,
          unlimitedTransfers: false,
        },

      })

    }



    // ---------------------------------------------------------

    // Check outgoing player

    // ---------------------------------------------------------



    const outgoingPlayer = team.players.find(

      (item) => item.playerId === parsedOutgoingPlayerId,

    )



    if (!outgoingPlayer) {

      return res.status(400).json({

        success: false,

        message: 'The outgoing player is not in your squad',

      })

    }



    // ---------------------------------------------------------

    // Get incoming player

    // ---------------------------------------------------------



    const incomingPlayer = await prisma.player.findFirst({

      where: {

        id: parsedIncomingPlayerId,

        leagueId: parsedLeagueId,

        deletedAt: null,

      },

      select: {

        id: true,

        name: true,

        position: true,

        photoUrl: true,

        ovr: true,

        price: true,

      },

    })



    if (!incomingPlayer) {

      return res.status(404).json({

        success: false,

        message: 'Incoming player not found',

      })

    }



    // ---------------------------------------------------------

    // Make sure incoming player isn't already owned

    // ---------------------------------------------------------



    const alreadyOwned = team.players.some(

      (item) => item.playerId === incomingPlayer.id,

    )



    if (alreadyOwned) {

      return res.status(400).json({

        success: false,

        message: 'You already own this player',

      })

    }



    // ---------------------------------------------------------

    // Calculate bank impact

    // ---------------------------------------------------------



    const outgoingSalePrice = Number(

      outgoingPlayer.purchasePrice,

    )



    const incomingPurchasePrice = Number(

      incomingPlayer.price,

    )



    const currentBank = Number(team.bank)



    const newBank =

      currentBank +

      outgoingSalePrice -

      incomingPurchasePrice



    // ---------------------------------------------------------

    // Check available funds

    // ---------------------------------------------------------



    if (newBank < 0) {

      return res.status(400).json({

        success: false,

        message: 'Insufficient funds for this transfer',

      })

    }



    // ---------------------------------------------------------

    // Perform transfer atomically

    // ---------------------------------------------------------



    const result = await prisma.$transaction(async (tx) => {

      // Remove outgoing player

      await tx.fantasyTeamPlayer.delete({

        where: {

          id: outgoingPlayer.id,

        },

      })



      // If outgoing player is captain or vice-captain,

      // remove that assignment.

      const captainId =

        team.captainId === outgoingPlayer.playerId

          ? null

          : team.captainId



      const viceCaptainId =

        team.viceCaptainId === outgoingPlayer.playerId

          ? null

          : team.viceCaptainId



      // Add incoming player and update bank

      const updatedTeam = await tx.fantasyTeam.update({

        where: {

          id: team.id,

        },

        data: {

          bank: newBank,

          captainId,

          viceCaptainId,

          players: {

            create: {

              playerId: incomingPlayer.id,

              purchasePrice: incomingPurchasePrice,

            },

          },

        },

        include: {

          players: {

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

        },

      })



      // Record transfer history

await tx.fantasyTransfer.create({
  data: {
    teamId: team.id,
    outgoingPlayerId: outgoingPlayer.playerId,
    incomingPlayerId: incomingPlayer.id,
    outgoingPrice: outgoingSalePrice,
    incomingPrice: incomingPurchasePrice,
  },
})



      return updatedTeam

    })



    // ---------------------------------------------------------

    // Calculate updated transfer information

    // ---------------------------------------------------------



    const transfersUsed = transferCount + 1



    const updatedRemainingTransfers = unlimitedTransfers
      ? null
      : Math.max(league.maxTransfers - transfersUsed, 0)



    // ---------------------------------------------------------

    // Response

    // ---------------------------------------------------------



    return res.json({

      success: true,

      message: 'Transfer completed successfully',

      data: {

        team: result,

        transfer: {

          outgoingPlayer: {

            id: outgoingPlayer.playerId,

            name: outgoingPlayer.player.name,

            price: outgoingSalePrice,

          },

          incomingPlayer: {

            id: incomingPlayer.id,

            name: incomingPlayer.name,

            price: incomingPurchasePrice,

          },

        },

        transferLimit: unlimitedTransfers ? null : league.maxTransfers,
        transfersUsed,
        remainingTransfers: updatedRemainingTransfers,
        transferCloseDate: transferCloseDate.toISO(),
        transferStatus,
        gameweekNumber,
        unlimitedTransfers,

      },

    })

  } catch (error) {

    console.error('Make transfer error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to complete transfer',
    })
  }
}

 export const getTransferInfo = async (teamId, league, matchDate) => {
  const windowStart = matchDate.minus({ weeks: 1 })

  const gameweekNumber = await getTransferGameweekNumber(
    league.id,
    matchDate,
  )

  const unlimitedTransfers = gameweekNumber === 1

  const usedTransfers = await prisma.fantasyTransfer.count({
    where: {
      teamId,
      createdAt: {
        gte: windowStart.toJSDate(),
        lt: matchDate.toJSDate(),
      },
    },
  })

  const transferLimit = unlimitedTransfers
    ? null
    : league.maxTransfers

  const remainingTransfers = unlimitedTransfers
    ? null
    : Math.max(0, transferLimit - usedTransfers)

  return {
    usedTransfers,
    transferLimit,
    remainingTransfers,
    gameweekNumber,
    unlimitedTransfers,
  }
}

export const getTransferHistory = async (req, res) => {

  try {

    const userId = req.user.id

    const leagueId = Number(req.query.leagueId)



    if (!Number.isInteger(leagueId) || leagueId <= 0) {

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

    })



    if (!team) {

      return res.status(404).json({

        success: false,

        message: 'Fantasy team not found',

      })

    }



    // Get the league so we know the current matchday

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



    if (!league.matchDay || !league.matchTime) {

      return res.status(400).json({

        success: false,

        message: 'League match day and match time are not configured',

      })

    }



    // Get the current matchday/transfer window

    const {

      matchDate,

    } = getMatchdayStatus(

      league.matchDay,

      league.matchTime,

    )



    // Current transfer window:

    // 7 days before matchday kickoff → matchday kickoff

    const windowStart = matchDate.minus({ weeks: 1 })



    const transfers = await prisma.fantasyTransfer.findMany({

      where: {

        teamId: team.id,

        createdAt: {

          gte: windowStart.toJSDate(),

          lt: matchDate.toJSDate(),

        },

      },

      orderBy: {

        createdAt: 'desc',

      },

      include: {

        outgoingPlayer: {

          select: {

            id: true,

            name: true,

            photoUrl: true,

          },

        },

        incomingPlayer: {

          select: {

            id: true,

            name: true,

            photoUrl: true,

          },

        },

      },

    })



    return res.json({

      success: true,

      data: {

        transfers,

      },

    })

  } catch (error) {

    console.error('Get transfer history error:', error)



    return res.status(500).json({

      success: false,

      message: 'Unable to load transfer history',

    })

  }

}