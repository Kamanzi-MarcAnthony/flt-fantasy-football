import prisma from '../config/prisma.js'
import { getMatchdayStatus } from '../utils/matchday.js'

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
      status: matchdayStatus,
      matchDate,
      closeDate,
    } = getMatchdayStatus(
      league.matchDay,
      league.matchTime,
    )

    // Transfers are closed while the matchday is active.
    if (matchdayStatus === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Transfers are closed while the matchday is in progress',
        data: {
          transferStatus: 'CLOSED',
          matchDate: matchDate.toISO(),
          closeDate: closeDate.toISO(),
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

    const remainingTransfers = Math.max(
      league.maxTransfers - transferCount,
      0,
    )

    // ---------------------------------------------------------
    // Enforce transfer limit
    // ---------------------------------------------------------

    if (transferCount >= league.maxTransfers) {
      return res.status(400).json({
        success: false,
        message: `You have reached your maximum of ${league.maxTransfers} transfers for this transfer window`,
        data: {
          transferLimit: league.maxTransfers,
          transfersUsed: transferCount,
          remainingTransfers: 0,
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

    const updatedRemainingTransfers = Math.max(
      league.maxTransfers - transfersUsed,
      0,
    )

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
        transferLimit: league.maxTransfers,
        transfersUsed,
        remainingTransfers: updatedRemainingTransfers,
        transferStatus: 'OPEN',
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