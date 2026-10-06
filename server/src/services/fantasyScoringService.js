import prisma from '../config/prisma.js'

const GOAL_POINTS = {
  GK: 7,
  DEF: 6,
  MID: 5,
  ST: 4,
}

const ASSIST_POINTS = 3

const CLEAN_SHEET_POINTS = {
  GK: 4,
  DEF: 4,
  MID: 2,
  ST: 1,
}

const calculatePlayerPoints = ({
  position,
  goals = 0,
  assists = 0,
  cleanSheets = 0,
}) => {
  const goalPoints =
    goals * (GOAL_POINTS[position] || 0)

  const assistPoints =
    assists * ASSIST_POINTS

  const cleanSheetPoints =
    cleanSheets * (CLEAN_SHEET_POINTS[position] || 0)

  let goalBonus = 0

  if (goals >= 2) {
    goalBonus = 3
  } else if (goals === 1) {
    goalBonus = 1
  }

  return (
    goalPoints +
    assistPoints +
    cleanSheetPoints +
    goalBonus
  )
}

export const recalculateGameweekScores = async (
  gameweekId,
) => {
  const gameweek = await prisma.gameweek.findUnique({
    where: {
      id: gameweekId,
    },
  })

  if (!gameweek) {
    throw new Error('Gameweek not found')
  }

  /*
   * Get every fantasy team in this league.
   */
  const teams = await prisma.fantasyTeam.findMany({
    where: {
      leagueId: gameweek.leagueId,
    },
    include: {
      players: {
        include: {
          player: true,
        },
      },
    },
  })

  /*
   * Get all matches and events belonging
   * to this gameweek.
   */
  const matches = await prisma.match.findMany({
    where: {
      gameweekId,
    },
    include: {
      events: {
        include: {
          player: true,
        },
      },
    },
  })

  /*
   * Flatten all events into one array.
   */
  const events = matches.flatMap(
    (match) => match.events,
  )

  /*
   * Build real-world player statistics.
   */
  const playerStats = new Map()

  for (const event of events) {
    if (!playerStats.has(event.playerId)) {
      playerStats.set(event.playerId, {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
      })
    }

    const stats = playerStats.get(event.playerId)

    switch (event.type) {
      case 'GOAL':
        stats.goals += 1
        break

      case 'ASSIST':
        stats.assists += 1
        break

      case 'CLEAN_SHEET':
        stats.cleanSheets += 1
        break

      default:
        break
    }
  }

  /*
   * Recalculate every fantasy team.
   */
  for (const team of teams) {
    let teamTotal = 0

    /*
     * Remove the existing player scores for
     * this team/gameweek.
     *
     * This makes recalculation safe if an admin
     * edits or deletes a match event.
     */
    await prisma.fantasyPlayerGameweekScore.deleteMany({
      where: {
        teamId: team.id,
        gameweekId,
      },
    })

    for (const teamPlayer of team.players) {
      const player = teamPlayer.player

      const stats =
        playerStats.get(player.id) || {
          goals: 0,
          assists: 0,
          cleanSheets: 0,
        }

      let points = calculatePlayerPoints({
        position: player.position,
        goals: stats.goals,
        assists: stats.assists,
        cleanSheets: stats.cleanSheets,
      })

      /*
       * Captain gets double points.
       */
      if (team.captainId === player.id) {
        points *= 2
      }

      teamTotal += points

      await prisma.fantasyPlayerGameweekScore.create({
        data: {
          teamId: team.id,
          playerId: player.id,
          gameweekId,
          points,
        },
      })
    }

    /*
     * Update the team's total for this gameweek.
     */
    await prisma.fantasyTeamGameweekScore.upsert({
      where: {
        teamId_gameweekId: {
          teamId: team.id,
          gameweekId,
        },
      },
      update: {
        points: teamTotal,
      },
      create: {
        teamId: team.id,
        gameweekId,
        points: teamTotal,
      },
    })
  }

  return {
    gameweekId,
    teamsProcessed: teams.length,
  }
}