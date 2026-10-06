<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, ref, watch } from 'vue'
import PlayerPointsModal from '../../components/fantasy/PlayerPointsModal.vue'
import FantasyPitch from '../../components/fantasy/FantasyPitch.vue'
import api from '../../services/api'

const props = defineProps({
  team: {
    type: Object,
    required: true,
  },
})

const loading = ref(false)
const error = ref('')

const gameweeks = ref([])
const currentGameweekIndex = ref(-1)
const pointsData = ref(null)

const selectedPlayer = ref(null)
const showPlayerModal = ref(false)

const selectedGameweek = computed(() => {
  if (currentGameweekIndex.value < 0) return null

  return gameweeks.value[currentGameweekIndex.value] || null
})

// const isCurrentGameweek = computed(() => {
//   if (!selectedGameweek.value || !gameweeks.value.length) {
//     return false
//   }

//   return (
//     currentGameweekIndex.value ===
//     gameweeks.value.length - 1
//   )
// })

const canGoPrevious = computed(() => {
  return currentGameweekIndex.value > 0
})

const canGoNext = computed(() => {
  return (
    currentGameweekIndex.value >= 0 &&
    currentGameweekIndex.value < gameweeks.value.length - 1
  )
})

const playerPoints = computed(() => {
  const points = {}

  // Start every player in the current squad at 0.
  props.team.players.forEach((item) => {
    points[item.player.id] = 0
  })

  if (pointsData.value?.players) {
    pointsData.value.players.forEach((player) => {
      points[player.id] = player.points
    })
  }

  return points
})

const totalPoints = computed(() => {
  return pointsData.value?.totalPoints ?? 0
})

const highestPoints = computed(() => {
  return pointsData.value?.highestGameweekPoints || 0
})

const loadPoints = async (gameweekId = null) => {
  if (!props.team?.leagueId) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const params = {
      leagueId: props.team.leagueId,
    }

    if (gameweekId) {
      params.gameweekId = gameweekId
    }

    const response = await api.get('/fantasy/points', {
      params,
    })

    const data = response.data.data

    pointsData.value = data

    // Store all available gameweeks.
    gameweeks.value = data.gameweeks || []

    // Find the gameweek returned by the backend.
    if (data.gameweek) {
      const index = gameweeks.value.findIndex(
        (gameweek) => gameweek.id === data.gameweek.id,
      )

      currentGameweekIndex.value = index
    } else {
      currentGameweekIndex.value = -1
    }
  } catch (err) {
    console.error('Failed to load fantasy points:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load fantasy points'
  } finally {
    loading.value = false
  }
}

const openPlayerModal = (player) => {
  const playerWithPoints = pointsData.value?.players?.find(
    (item) => item.id === player.id,
  )

  selectedPlayer.value = playerWithPoints || player
  showPlayerModal.value = true
}


const previousGameweek = () => {
  if (!canGoPrevious.value || loading.value) {
    return
  }

  const previousIndex = currentGameweekIndex.value - 1
  const gameweek = gameweeks.value[previousIndex]

  if (gameweek) {
    loadPoints(gameweek.id)
  }
}

const nextGameweek = () => {
  if (!canGoNext.value || loading.value) {
    return
  }

  const nextIndex = currentGameweekIndex.value + 1
  const gameweek = gameweeks.value[nextIndex]

  if (gameweek) {
    loadPoints(gameweek.id)
  }
}

watch(
  () => props.team?.leagueId,
  (leagueId) => {
    if (leagueId) {
      loadPoints()
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="md:w-2/3 w-full flex flex-col gap-4">
    <!-- Points Summary -->
    <section
      class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#24002d] px-3 py-3"
    >
      <!-- Gameweek Navigation -->
      <div class="mb-3 flex items-center justify-between">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-xl transition"
          :class="
            canGoPrevious && !loading
              ? 'hover:bg-white/10'
              : 'cursor-not-allowed opacity-30'
          "
          :disabled="!canGoPrevious || loading"
          @click="previousGameweek"
        >
          ‹
        </button>

        <p class="text-sm font-semibold text-white">
          <template v-if="selectedGameweek">
            Gameweek {{ selectedGameweek.number }}
          </template>

          <template v-else>
            No Gameweek
          </template>
        </p>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-xl transition"
          :class="
            canGoNext && !loading
              ? 'hover:bg-white/10'
              : 'cursor-not-allowed opacity-30'
          "
          :disabled="!canGoNext || loading"
          @click="nextGameweek"
        >
          ›
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 items-center">
        <!-- Highest -->
        <div class="text-center">
          <p class="text-xs text-white/50">
            Highest
          </p>

          <p class="mt-1 text-xl font-bold text-white">
            {{ loading ? '—' : highestPoints }}
          </p>

          <p class="text-xs text-white/50">
            Points
          </p>
        </div>

        <!-- Total -->
        <div
          class="relative flex flex-col items-center justify-center"
        >
          <p class="text-xs text-white/50">
            Total Points
          </p>

          <p class="mt-1 text-3xl font-bold text-white">
            {{ loading ? '—' : totalPoints }}
          </p>
        </div>

        <!-- Transfers -->
        <div class="text-center">
          <p class="text-xs text-white/50">
            Transfers
          </p>

          <p class="mt-1 text-xl font-bold text-white">
            0
          </p>

          <p class="text-xs text-white/50">
            This Gameweek
          </p>
        </div>
      </div>

      <!-- Error -->
      <p
        v-if="error"
        class="mt-3 text-center text-xs text-red-400"
      >
        {{ error }}
      </p>
    </section>

    <!-- Pitch -->
    <div class="relative">
      <FantasyPitch
        :players="team.players.map((item) => item.player)"
        :captain-id="team.captainId"
        :vice-captain-id="team.viceCaptainId"
        stat-type="points"
        :player-points="playerPoints"
        @player-click="openPlayerModal"
      />

      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20"
      >
        <div
          class="rounded-lg bg-[#24002d] px-4 py-2 text-sm text-white shadow-lg"
        >
          Loading points...
        </div>
      </div>
    </div>

    <PlayerPointsModal
  v-model:visible="showPlayerModal"
  :player="selectedPlayer"
/>
  </div>
</template>