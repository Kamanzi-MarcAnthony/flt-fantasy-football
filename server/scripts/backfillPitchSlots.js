import prisma from '../src/config/prisma.js'

const backfillPitchSlots = async () => {
  try {
    console.log('Starting pitch slot backfill...')

    const teams = await prisma.fantasyTeam.findMany({
      select: {
        id: true,
        name: true,
        players: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            playerId: true,
            pitchSlot: true,
            player: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    console.log(`Found ${teams.length} fantasy teams.`)

    for (const team of teams) {
      console.log(`\nProcessing team: ${team.name} (ID: ${team.id})`)

      for (let index = 0; index < team.players.length; index++) {
        const teamPlayer = team.players[index]
        const pitchSlot = index + 1

        await prisma.fantasyTeamPlayer.update({
          where: {
            id: teamPlayer.id,
          },
          data: {
            pitchSlot,
          },
        })

        console.log(
          `  Slot ${pitchSlot} → ${teamPlayer.player.name}`,
        )
      }
    }

    console.log('\n✅ Pitch slot backfill completed successfully.')
  } catch (error) {
    console.error('\n❌ Pitch slot backfill failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

backfillPitchSlots()