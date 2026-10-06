<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClearMatchdayDataModal from '../../components/matches/ClearMatchdayDataModal.vue'
import { useAuthStore } from '../../stores/auth'

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  Users,
} from 'lucide-vue-next'

import api from '../../services/api'

import PlayerFormModal from '../../components/players/PlayerFormModal.vue'
import RecordGoalModal from '../../components/matches/RecordGoalModal.vue'
import AwardCleanSheetModal from '../../components/matches/AwardCleanSheetModal.vue'
import LeagueFormModal from '../../components/leagues/LeagueFormModal.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const showClearMatchdayModal = ref(false)
const clearingMatchday = ref(false)

// --------------------------------------------------
// League
// --------------------------------------------------

const league = ref(null)
const loading = ref(true)
const error = ref(null)

// --------------------------------------------------
// Leaderboard
// --------------------------------------------------
const leaderboard = ref([])
const leaderboardLoading = ref(false)
const leaderboardError = ref('')

// --------------------------------------------------
// Tabs
// --------------------------------------------------

const activeTab = ref('players')

const tabs = computed(() => [
  {
    key: 'players',
    label: `Players (${league.value?.players?.length || 0})`,
  },
  {
    key: 'stats',
    label: 'Stats',
  },
  {
    key: 'leaderboards',
    label: 'Leaderboards',
  },
])

// --------------------------------------------------
// Player
// --------------------------------------------------

const showPlayerModal = ref(false)
const playerSaving = ref(false)

const handlePlayerSubmit = async (playerData) => {
  playerSaving.value = true

  try {
    const response = await api.post(
      `/leagues/${route.params.id}/players`,
      playerData,
    )

    const player = response.data.data.player

    league.value.players = [
      ...(league.value.players || []),
      player,
    ]

    showPlayerModal.value = false
  } catch (err) {
    console.error('Failed to add player:', err)

    alert(
      err.response?.data?.message ||
        'Unable to add player. Please try again.',
    )
  } finally {
    playerSaving.value = false
  }
}

// --------------------------------------------------
// Matchday
// --------------------------------------------------

const matchday = ref(null)
const matchdayLoading = ref(false)
const matchdayError = ref(null)

const showGoalModal = ref(false)
const showCleanSheetModal = ref(false)

const goalSaving = ref(false)
const cleanSheetSaving = ref(false)

const fetchMatchday = async () => {
  matchdayLoading.value = true
  matchdayError.value = null

  try {
    const response = await api.get(
      `/leagues/${route.params.id}/matchday`,
    )

    matchday.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch matchday:', err)

    matchdayError.value =
      err.response?.data?.message ||
      'Unable to load matchday.'
  } finally {
    matchdayLoading.value = false
  }
}

// --------------------------------------------------
// League Stats
// --------------------------------------------------

const leagueStats = ref({
  topGoalscorers: [],
  topAssists: [],
})

const statsLoading = ref(false)
const statsError = ref(null)

const fetchLeagueStats = async () => {
  statsLoading.value = true
  statsError.value = null

  try {
    const response = await api.get(
      `/leagues/${route.params.id}/stats`,
    )

    leagueStats.value = response.data.data
  } catch (err) {
    console.error(
      'Failed to fetch league stats:',
      err,
    )

    statsError.value =
      err.response?.data?.message ||
      'Unable to load league statistics.'
  } finally {
    statsLoading.value = false
  }
}

// --------------------------------------------------
// Transfer Status
// --------------------------------------------------

const isTransfersOpen = computed(() => {
  return matchday.value?.status === 'UPCOMING'
})

// --------------------------------------------------
// League Formatting
// --------------------------------------------------

const formatMatchDay = (day) => {
  if (!day) return 'Match day not set'

  return day
}

const formatMatchTime = (time) => {
  if (!time) return 'Match time not set'

  const [hours, minutes] = time.split(':')

  const date = new Date()

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  )

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// --------------------------------------------------
// Player Points
// --------------------------------------------------

const totalPoints = (player) => {
  return player.totalPoints || 0
}

// --------------------------------------------------
// Match Events
// --------------------------------------------------

const recordGoal = async (payload) => {
  if (!matchday.value?.match?.id) return

  goalSaving.value = true

  try {
    const response = await api.post(
      `/matches/${matchday.value.match.id}/goals`,
      payload,
    )

    matchday.value.match = response.data.data.match

    showGoalModal.value = false
  } catch (err) {
    console.error('Failed to record goal:', err)

    alert(
      err.response?.data?.message ||
        'Unable to record goal.',
    )
  } finally {
    goalSaving.value = false
  }
}

const awardCleanSheets = async (payload) => {
  if (!matchday.value?.match?.id) return

  cleanSheetSaving.value = true

  try {
    const response = await api.post(
      `/matches/${matchday.value.match.id}/clean-sheets`,
      payload,
    )

    matchday.value.match = response.data.data.match

    showCleanSheetModal.value = false
  } catch (err) {
    console.error(
      'Failed to award clean sheets:',
      err,
    )

    alert(
      err.response?.data?.message ||
        'Unable to award clean sheets.',
    )
  } finally {
    cleanSheetSaving.value = false
  }
}

// --------------------------------------------------
// League Actions
// --------------------------------------------------

const showActionMenu = ref(false)

const showEditLeagueModal = ref(false)
const leagueSaving = ref(false)

const showDeleteLeagueModal = ref(false)
const deletingLeague = ref(false)

const openEditLeague = () => {
  showActionMenu.value = false
  showEditLeagueModal.value = true
}

const openDeleteLeague = () => {
  showActionMenu.value = false
  showDeleteLeagueModal.value = true
}

// --------------------------------------------------
// Edit League
// --------------------------------------------------

const handleLeagueUpdate = async (leagueData) => {
  leagueSaving.value = true

  try {
    const response = await api.patch(
      `/leagues/${league.value.id}`,
      {
        name: leagueData.name,
        location: leagueData.location,
        matchDay: leagueData.matchDay,
        matchTime: leagueData.matchTime,
        maxTransfers: leagueData.maxTransfers,
      },
    )

    league.value = {
      ...league.value,
      ...response.data.data.league,
    }

    showEditLeagueModal.value = false

    // Refresh matchday because match day/time may have changed.
    await fetchMatchday()
  } catch (err) {
    console.error(
      'Failed to update league:',
      err,
    )

    alert(
      err.response?.data?.message ||
        'Unable to update league.',
    )
  } finally {
    leagueSaving.value = false
  }
}

// --------------------------------------------------
// Clear Matchday data
// --------------------------------------------------
// const clearMatchdayData = async () => {
//   if (!matchday.value?.match?.id) return

//   clearingMatchday.value = true

//   try {
//     const response = await api.delete(
//       `/matches/${matchday.value.match.id}/events`,
//     )

//     matchday.value.match = response.data.data.match

//     showClearMatchdayModal.value = false
//   } catch (error) {
//     console.error('Failed to clear matchday data:', error)

//     alert(
//       error.response?.data?.message ||
//         'Unable to clear matchday data.',
//     )
//   } finally {
//     clearingMatchday.value = false
//   }
// }
const clearMatchdayData = async () => {
  if (!matchday.value?.match?.id) return

  clearingMatchday.value = true

  try {
    await api.delete(
      `/matches/${matchday.value.match.id}/events`,
    )

    // Refresh all data affected by the cleared matchday
    await Promise.all([
      fetchMatchday(),
      fetchLeagueStats(),
      fetchLeagueLeaderboard(),
    ])

    showClearMatchdayModal.value = false
  } catch (error) {
    console.error('Failed to clear matchday data:', error)

    alert(
      error.response?.data?.message ||
        'Unable to clear matchday data.',
    )
  } finally {
    clearingMatchday.value = false
  }
}

// --------------------------------------------------
// Delete League
// --------------------------------------------------

const handleDeleteLeague = async () => {
  if (!league.value) return

  deletingLeague.value = true

  try {
    await api.delete(
      `/leagues/${league.value.id}`,
    )

    router.push('/admin/leagues')
  } catch (err) {
    console.error(
      'Failed to delete league:',
      err,
    )

    alert(
      err.response?.data?.message ||
        'Unable to delete league.',
    )
  } finally {
    deletingLeague.value = false
  }
}

// --------------------------------------------------
// Fetch League
// --------------------------------------------------

const fetchLeague = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(
      `/leagues/${route.params.id}`,
    )

    league.value = response.data.data.league
  } catch (err) {
    console.error(
      'Failed to fetch league:',
      err,
    )

    error.value =
      err.response?.data?.message ||
      'Unable to load league.'
  } finally {
    loading.value = false
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------


const fetchLeagueLeaderboard = async () => {
  leaderboardLoading.value = true
  leaderboardError.value = ''

  try {
    const response = await api.get(
      `/leagues/${route.params.id}/leaderboard`,
    )

    leaderboard.value = response.data.data.leaderboard || []
  } catch (error) {
    console.error('Failed to fetch league leaderboard:', error)

    leaderboardError.value =
      error.response?.data?.message ||
      'Unable to load league leaderboard'
  } finally {
    leaderboardLoading.value = false
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------

onMounted(() => {
  fetchLeague()
  fetchMatchday()
  fetchLeagueStats()
  fetchLeagueLeaderboard()
})
</script>

<template>
  <div class="min-h-screen bg-[#061112] text-white">
    <!-- Header -->
    <header class="border-b border-white/10 px-5 py-5 sm:px-8">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          @click="router.push('/admin/leagues')"
        >
          <ArrowLeft class="h-4 w-4" />
          Leagues
        </button>

        <div
          v-if="league"
          class="hidden text-sm font-medium text-white/60 sm:block"
        >
          {{ league.name }}
        </div>

        <!-- Actions -->
        <div class="relative">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            @click="showActionMenu = !showActionMenu"
          >
            <MoreVertical class="h-5 w-5" />
          </button>

          <div
            v-if="showActionMenu"
            class="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-1 shadow-2xl"
          >
            <!-- Edit -->
<button
  type="button"
  class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
  @click="openEditLeague"
>
  <Pencil class="h-4 w-4" />
  <span>Edit League</span>
</button>

            <!-- Delete -->
            <template v-if="authStore.user?.role === 'SUPER_ADMIN'">
              <div class="my-1 border-t border-white/10"></div>

<button
  type="button"
  class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-400/[0.08]"
  @click="openDeleteLeague"
>
  <Trash2 class="h-4 w-4" />
  <span>Delete League</span>
</button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-[70vh] items-center justify-center"
    >
      <div class="text-center">
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
        ></div>

        <p class="mt-4 text-sm text-white/40">
          Loading league...
        </p>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="mx-auto max-w-xl px-5 py-20 text-center"
    >
      <h2 class="text-xl font-semibold">
        Unable to load league
      </h2>

      <p class="mt-2 text-sm text-white/40">
        {{ error }}
      </p>

      <button
        type="button"
        class="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        @click="fetchLeague"
      >
        Try Again
      </button>
    </div>

    <!-- League -->
    <main
      v-else-if="league"
      class="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
    >
      <!-- League Summary -->
      <section
        class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      >
        <div
          class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <!-- League Identity -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"
            >
              <Trophy class="h-7 w-7 text-white/70" />
            </div>

            <div>
              <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
                {{ league.name }}
              </h1>

              <div
                class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40"
              >
                <span class="flex items-center gap-2">
                  <MapPin class="h-4 w-4" />
                  {{ league.location || 'Location not set' }}
                </span>

                <span class="flex items-center gap-2">
                  <CalendarDays class="h-4 w-4" />
                  {{ formatMatchDay(league.matchDay) }}
                </span>

                <span class="flex items-center gap-2">
                  <Clock class="h-4 w-4" />
                  {{ formatMatchTime(league.matchTime) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Transfer Status -->
          <div
            class="flex items-center gap-3 rounded-2xl border px-4 py-3"
            :class="
              isTransfersOpen
                ? 'border-emerald-400/20 bg-emerald-400/[0.06]'
                : 'border-red-400/20 bg-red-400/[0.06]'
            "
          >
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="
                isTransfersOpen
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              "
            ></span>

            <div>
              <p class="text-xs text-white/40">
                Transfers
              </p>

              <p
                class="mt-0.5 text-sm font-semibold"
                :class="
                  isTransfersOpen
                    ? 'text-emerald-400'
                    : 'text-red-400'
                "
              >
                {{ isTransfersOpen ? 'Open' : 'Closed' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Matchday Live -->
      <section
        class="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div
          class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p
              class="text-xs font-bold uppercase tracking-[0.2em] text-white/30"
            >
              Matchday
            </p>

            <div
              v-if="matchdayLoading"
              class="mt-2 text-sm text-white/40"
            >
              Loading matchday...
            </div>

            <div v-else-if="matchday">
              <h2 class="mt-2 text-xl font-semibold">
                {{ league.matchDay }} · {{ league.matchTime }}
              </h2>

              <p class="mt-1 text-sm text-white/40">
                {{
                  matchday.status === 'ACTIVE'
                    ? 'Matchday is currently active'
                    : 'Next matchday is upcoming'
                }}
              </p>
            </div>

            <p
              v-if="matchdayError"
              class="mt-2 text-sm text-red-300"
            >
              {{ matchdayError }}
            </p>
          </div>

          <!-- Actions -->
          <div
            v-if="matchday?.status === 'ACTIVE'"
            class="flex flex-wrap gap-3"
          >
            <button
              type="button"
              class="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#111c1d] transition hover:bg-white/90"
              @click="showGoalModal = true"
            >
              <Plus class="mr-2 h-4 w-4" />
              Record Goal
            </button>

            <button
              type="button"
              class="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              @click="showCleanSheetModal = true"
            >
              Award Clean Sheets
            </button>

            <button
  type="button"
  class="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-400/20"
  @click="showClearMatchdayModal = true"
>
  <Trash2 class="h-4 w-4" />
  Clear Matchday Data
</button>
          </div>

          <div
            v-else-if="matchday?.status === 'UPCOMING'"
            class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50"
          >
            Matchday hasn't started yet.
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="mt-8 border-b border-white/10">
        <nav class="flex gap-6 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="relative whitespace-nowrap pb-4 text-sm font-medium transition"
            :class="
              activeTab === tab.key
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}

            <span
              v-if="activeTab === tab.key"
              class="absolute inset-x-0 -bottom-px h-0.5 bg-white"
            ></span>
          </button>
        </nav>
      </div>

      <!-- Players -->
      <section
        v-if="activeTab === 'players'"
        class="mt-6"
      >
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">
              Players
            </h2>

            <p class="mt-1 text-sm text-white/40">
              Players available in this league.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            @click="showPlayerModal = true"
          >
            <Plus class="h-4 w-4" />

            <span class="hidden sm:inline">
              Add Player
            </span>
          </button>
        </div>

        <!-- Player Table -->
        <div
          v-if="league.players?.length"
          class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <!-- Table Header -->
          <div
            class="grid grid-cols-[minmax(0,3fr)_45px_55px_55px] items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30 sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:gap-3 sm:px-6"
          >
            <span>Player</span>

            <span class="text-right">
              OVR
            </span>

            <span class="text-right">
              Price
            </span>

            <span class="text-right">
              Points
            </span>
          </div>

          <!-- Rows -->
          <div class="divide-y divide-white/10">
            <div
              v-for="player in league.players"
              :key="player.id"
              class="grid grid-cols-[minmax(0,3fr)_45px_55px_55px] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:gap-3 sm:px-6"
            >
              <!-- Player -->
              <div class="flex min-w-0 items-center gap-3">
                <!-- Player Portrait -->
                <div
                  class="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
                >
                  <img
                    v-if="player.photoUrl"
                    :src="player.photoUrl"
                    :alt="player.name"
                    class="h-full w-full object-cover"
                  />

                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-xs font-semibold text-white/30"
                  >
                    {{ player.name?.charAt(0)?.toUpperCase() }}
                  </div>
                </div>

                <!-- Player Name + Position -->
                <div class="min-w-0">
                  <button
                    type="button"
                    class="truncate text-left text-sm font-medium transition hover:text-white/60"
                    @click="router.push(`/admin/players/${player.id}`)"
                  >
                    {{ player.name }}
                  </button>

                  <p class="mt-0.5 text-xs text-white/40">
                    {{ player.position }}
                  </p>
                </div>
              </div>

              <!-- OVR -->
              <div class="text-right">
                <span class="text-sm font-semibold">
                  {{ player.ovr }}
                </span>
              </div>

              <!-- Price -->
              <div class="text-right">
                <span class="text-sm font-medium text-white/70">
                  {{ player.price }}
                </span>
              </div>

              <!-- Points -->
              <div class="text-right">
                <span class="text-sm font-semibold">
                  {{ totalPoints(player) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-5 text-center"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10"
          >
            <Users class="h-6 w-6 text-white/50" />
          </div>

          <h3 class="mt-5 font-semibold">
            No players yet
          </h3>

          <p class="mt-2 max-w-xs text-sm leading-6 text-white/40">
            Add players to make them available for fantasy teams.
          </p>

          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            @click="showPlayerModal = true"
          >
            <Plus class="h-4 w-4" />
            Add Player
          </button>
        </div>
      </section>

      <!-- Stats -->
<!-- Stats -->
<section
  v-else-if="activeTab === 'stats'"
  class="mt-6"
>
  <!-- Loading -->
  <div
    v-if="statsLoading"
    class="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]"
  >
    <div class="text-center">
      <div
        class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
      ></div>

      <p class="mt-4 text-sm text-white/40">
        Loading statistics...
      </p>
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="statsError"
    class="rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center"
  >
    <p class="text-sm text-red-300">
      {{ statsError }}
    </p>

    <button
      type="button"
      class="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
      @click="fetchLeagueStats"
    >
      Try Again
    </button>
  </div>

  <!-- Stats -->
  <div
    v-else
    class="grid gap-6 lg:grid-cols-2"
  >
    <!-- Top Goalscorers -->
    <div
      class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
    >
      <div class="border-b border-white/10 p-6">
        <h2 class="text-lg font-semibold">
          Top Goalscorers
        </h2>

        <p class="mt-1 text-sm text-white/40">
          Leading players by goals.
        </p>
      </div>

      <div
        v-if="leagueStats.topGoalscorers.length"
        class="divide-y divide-white/10"
      >
        <div
          v-for="(player, index) in leagueStats.topGoalscorers"
          :key="player.id"
          class="flex items-center gap-4 px-6 py-4"
        >
          <!-- Rank -->
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-white/40"
          >
            {{ index + 1 }}
          </div>

          <!-- Player -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="h-11 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
            >
              <img
                v-if="player.photoUrl"
                :src="player.photoUrl"
                :alt="player.name"
                class="h-full w-full object-cover"
              />

              <div
                v-else
                class="flex h-full w-full items-center justify-center text-xs font-semibold text-white/30"
              >
                {{ player.name?.charAt(0)?.toUpperCase() }}
              </div>
            </div>

            <div class="min-w-0">
              <button
                type="button"
                class="truncate text-left text-sm font-medium transition hover:text-white/60"
                @click="router.push(`/admin/players/${player.id}`)"
              >
                {{ player.name }}
              </button>

              <p class="mt-0.5 text-xs text-white/40">
                {{ player.position }}
              </p>
            </div>
          </div>

          <!-- Goals -->
          <div class="text-right">
            <p class="text-lg font-bold">
              {{ player.goals }}
            </p>

            <p class="text-[11px] uppercase tracking-wider text-white/30">
              Goals
            </p>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else
        class="flex min-h-[250px] items-center justify-center px-6 text-center"
      >
        <p class="text-sm text-white/30">
          No goals recorded yet.
        </p>
      </div>
    </div>

    <!-- Top Assists -->
    <div
      class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
    >
      <div class="border-b border-white/10 p-6">
        <h2 class="text-lg font-semibold">
          Top Assists
        </h2>

        <p class="mt-1 text-sm text-white/40">
          Leading players by assists.
        </p>
      </div>

      <div
        v-if="leagueStats.topAssists.length"
        class="divide-y divide-white/10"
      >
        <div
          v-for="(player, index) in leagueStats.topAssists"
          :key="player.id"
          class="flex items-center gap-4 px-6 py-4"
        >
          <!-- Rank -->
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-white/40"
          >
            {{ index + 1 }}
          </div>

          <!-- Player -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="h-11 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
            >
              <img
                v-if="player.photoUrl"
                :src="player.photoUrl"
                :alt="player.name"
                class="h-full w-full object-cover"
              />

              <div
                v-else
                class="flex h-full w-full items-center justify-center text-xs font-semibold text-white/30"
              >
                {{ player.name?.charAt(0)?.toUpperCase() }}
              </div>
            </div>

            <div class="min-w-0">
              <button
                type="button"
                class="truncate text-left text-sm font-medium transition hover:text-white/60"
                @click="router.push(`/admin/players/${player.id}`)"
              >
                {{ player.name }}
              </button>

              <p class="mt-0.5 text-xs text-white/40">
                {{ player.position }}
              </p>
            </div>
          </div>

          <!-- Assists -->
          <div class="text-right">
            <p class="text-lg font-bold">
              {{ player.assists }}
            </p>

            <p class="text-[11px] uppercase tracking-wider text-white/30">
              Assists
            </p>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else
        class="flex min-h-[250px] items-center justify-center px-6 text-center"
      >
        <p class="text-sm text-white/30">
          No assists recorded yet.
        </p>
      </div>
    </div>
  </div>
</section>

      <!-- Leaderboards -->
      <div v-else-if="activeTab === 'leaderboards'" class="space-y-6">
  <!-- Loading -->
  <div
    v-if="leaderboardLoading"
    class="flex items-center justify-center py-16"
  >
    <div class="text-sm text-gray-500">
      Loading leaderboard...
    </div>
  </div>

  <!-- Error -->
  <div
    v-else-if="leaderboardError"
    class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
  >
    {{ leaderboardError }}
  </div>

  <!-- Empty -->
  <div
    v-else-if="leaderboard.length === 0"
    class="rounded-xl border border-gray-200 bg-white py-16 text-center"
  >
    <Trophy class="mx-auto mb-3 h-8 w-8 text-gray-400" />

    <h3 class="text-sm font-semibold text-gray-900">
      No fantasy points yet
    </h3>

    <p class="mt-1 text-sm text-gray-500">
      The leaderboard will appear once fantasy players start earning points.
    </p>
  </div>

  <!-- Leaderboard -->
  <div
    v-else
    class="overflow-hidden rounded-xl border border-gray-200 bg-white"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rank
            </th>

            <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fantasy Player
            </th>

            <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Team
            </th>

            <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
              Points
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="player in leaderboard"
            :key="player.teamId"
            class="hover:bg-gray-50"
          >
            <!-- Rank -->
            <td class="px-6 py-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                {{ player.rank }}
              </div>
            </td>

            <!-- Fantasy Player -->
            <td class="px-6 py-4">
              <div class="font-medium text-gray-900">
                {{ player.userName }}
              </div>
            </td>

            <!-- Team -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-600">
                {{ player.teamName }}
              </div>
            </td>

            <!-- Points -->
            <td class="px-6 py-4 text-right">
              <span class="font-semibold text-gray-900">
                {{ player.points }}
              </span>
              <span class="ml-1 text-sm text-gray-500">
                pts
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
    </main>

    <!-- Delete League Modal -->
    <div
      v-if="showDeleteLeagueModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      @click.self="showDeleteLeagueModal = false"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-400"
          >
            <Trash2 class="h-5 w-5" />
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white">
              Delete League?
            </h2>

            <p class="mt-1 text-sm leading-6 text-white/50">
              This will permanently delete
              <span class="font-medium text-white/80">
                {{ league?.name }}
              </span>
              and all associated players, matches, events and fantasy teams.
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            :disabled="deletingLeague"
            @click="showDeleteLeagueModal = false"
          >
            Cancel
          </button>

          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="deletingLeague"
            @click="handleDeleteLeague"
          >
            <Loader2
              v-if="deletingLeague"
              class="h-4 w-4 animate-spin"
            />

            <Trash2
              v-else
              class="h-4 w-4"
            />

            {{ deletingLeague ? 'Deleting...' : 'Delete League' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Player Modal -->
    <PlayerFormModal
      :open="showPlayerModal"
      :loading="playerSaving"
      @close="showPlayerModal = false"
      @submit="handlePlayerSubmit"
    />

    <!-- Record Goal Modal -->
    <RecordGoalModal
      :open="showGoalModal"
      :players="league?.players || []"
      :loading="goalSaving"
      @close="showGoalModal = false"
      @submit="recordGoal"
    />

    <!-- Clean Sheet Modal -->
    <AwardCleanSheetModal
      :open="showCleanSheetModal"
      :players="league?.players || []"
      :loading="cleanSheetSaving"
      @close="showCleanSheetModal = false"
      @submit="awardCleanSheets"
    />

    <!-- Edit League Modal -->
    <LeagueFormModal
      :open="showEditLeagueModal"
      :league="league"
      :loading="leagueSaving"
      @close="showEditLeagueModal = false"
      @submit="handleLeagueUpdate"
    />

    <ClearMatchdayDataModal
  v-model:visible="showClearMatchdayModal"
  :loading="clearingMatchday"
  :matchday="matchday"
  @confirm="clearMatchdayData"
/>
  </div>
</template>