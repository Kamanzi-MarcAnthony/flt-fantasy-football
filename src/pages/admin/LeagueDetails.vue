<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trophy,
  Users,
} from 'lucide-vue-next'
import api from '../../services/api'
import PlayerFormModal from '../../components/players/PlayerFormModal.vue'

const route = useRoute()
const router = useRouter()

const league = ref(null)
const loading = ref(true)
const error = ref(null)
const activeTab = ref('players')
const showPlayerModal = ref(false)
const playerSaving = ref(false)
const addingPlayer = ref(false)

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

const openAddPlayer = () => {
  showPlayerModal.value = true
}

const handlePlayerSubmit = async (playerData) => {
  playerSaving.value = true

  try {
    await api.post(
      `/leagues/${route.params.id}/players`,
      playerData,
    )

    showPlayerModal.value = false

    await fetchLeague()
  } catch (err) {
    console.error('Failed to add player:', err)
  } finally {
    playerSaving.value = false
  }
}

const fetchLeague = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/leagues/${route.params.id}`)
    league.value = response.data.data.league
  } catch (err) {
    console.error('Failed to fetch league:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load league.'
  } finally {
    loading.value = false
  }
}

const formatMatchDay = (day) => {
  if (!day) return 'Match day not set'
  return day
}

const formatMatchTime = (time) => {
  if (!time) return 'Match time not set'

  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const isTransfersOpen = computed(() => {
  // Temporary UI state.
  // Transfer-window calculation will be connected later.
  return true
})

const totalPoints = (player) => {
  return player.totalPoints || 0
}

const addPlayer = async (playerData) => {
  addingPlayer.value = true

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

    // We'll improve modal-level API errors shortly.
    alert(
      err.response?.data?.message ||
      'Unable to add player. Please try again.',
    )
  } finally {
    addingPlayer.value = false
  }
}

onMounted(() => {
  fetchLeague()
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

      <!-- League summary -->

      <section
        class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      >

        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <!-- League identity -->

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

              <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">

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


          <!-- Transfer status -->

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
            @click="showPlayerModal = true"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <Plus class="h-4 w-4" />
            <span class="hidden sm:inline">
              Add Player
            </span>
          </button>

        </div>


        <!-- Player table -->

        <div
          v-if="league.players?.length"
          class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >

          <!-- Table header -->

        <!-- Table header -->

<div
  class="grid grid-cols-[minmax(0,3fr)_45px_55px_55px] items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30 sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:gap-3 sm:px-6"
>
  <span>
    Player
  </span>

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
                class="grid grid-cols-[minmax(0,3fr)_45px_55px_55px] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_80px_110px_110px] sm:gap-3 sm:px-6">

    <!-- Player -->

    <div class="flex min-w-0 items-center gap-3">

      <!-- Player portrait -->

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

      <!-- Player name + position -->

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
            @click="showPlayerModal = true"
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <Plus class="h-4 w-4" />
            Add Player
          </button>

        </div>

      </section>


      <!-- Stats -->

      <section
        v-else-if="activeTab === 'stats'"
        class="mt-6"
      >

        <div class="grid gap-6 lg:grid-cols-2">

          <!-- Goals -->

          <div
            class="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >

            <h2 class="text-lg font-semibold">
              Top Goalscorers
            </h2>

            <p class="mt-1 text-sm text-white/40">
              Leading players by goals.
            </p>

            <div class="mt-6 flex min-h-[250px] items-center justify-center text-center">
              <p class="text-sm text-white/30">
                Match statistics will appear here.
              </p>
            </div>

          </div>


          <!-- Assists -->

          <div
            class="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >

            <h2 class="text-lg font-semibold">
              Top Assists
            </h2>

            <p class="mt-1 text-sm text-white/40">
              Leading players by assists.
            </p>

            <div class="mt-6 flex min-h-[250px] items-center justify-center text-center">
              <p class="text-sm text-white/30">
                Match statistics will appear here.
              </p>
            </div>

          </div>

        </div>

      </section>


      <!-- Leaderboards -->

      <section
        v-else-if="activeTab === 'leaderboards'"
        class="mt-6"
      >

        <div
          class="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-5 text-center"
        >

          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10"
          >
            <Trophy class="h-7 w-7 text-white/50" />
          </div>

          <h2 class="mt-5 text-xl font-semibold">
            Fantasy will start soon
          </h2>

          <p class="mt-2 max-w-md text-sm leading-6 text-white/40">
            Fantasy leaderboards will appear here once the fantasy competition begins.
          </p>

        </div>

      </section>

    </main>

    <PlayerFormModal
  :open="showPlayerModal"
  :loading="addingPlayer"
  @close="showPlayerModal = false"
  @submit="addPlayer"
/>

<PlayerFormModal
  :open="showPlayerModal"
  :loading="playerSaving"
  @close="showPlayerModal = false"
  @submit="handlePlayerSubmit"
/>

  </div>
</template>