<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter  } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()

const activeTab = ref('gameweek')

const loading = ref(true)
const error = ref('')

const leaderboard = ref([])
const currentGameweek = ref(null)

const leagueId = computed(() => {
  return Number(route.query.leagueId)
})



const loadLeaderboard = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!Number.isInteger(leagueId.value) || leagueId.value <= 0) {
      error.value = 'Invalid league.'
      return
    }

    const response = await api.get('/fantasy/leaderboard', {
      params: {
        leagueId: leagueId.value,
        type: activeTab.value,
      },
    })

    const data = response.data.data

    leaderboard.value = data.leaderboard || []
    currentGameweek.value = data.gameweek || null
  } catch (err) {
    console.error('Load leaderboard error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load leaderboard'
  } finally {
    loading.value = false
  }
}

const movementSymbol = (movement) => {
  if (movement === 'up') return '↑'
  if (movement === 'down') return '↓'

  return '—'
}

const openFantasyTeam = (teamId) => {
  if (!teamId) return

  router.push({
    path: `/fantasy/team/${teamId}`,
    query: {
      leagueId: leagueId.value,
    },
  })
}

watch(activeTab, () => {
  loadLeaderboard()
})

onMounted(loadLeaderboard)
</script>

<template>
  <div class="w-full md:w-2/3">

    <!-- Header -->
    <section
      class="relative mb-4 overflow-hidden flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-linear-to-br  from-[#05056b] via-[#09094b] to-[#18003d] py-5 px-4"
    >
      <!-- Decorative glow -->
      <div
        class="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div
        class="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
      />

      <div class="relative">
        <p
          class="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70"
        >
          Fantasy Competition
        </p>

        <h1 class="mt-1 text-2xl font-black tracking-tight text-white">
          Leaderboards
        </h1>

      </div>

      <!-- Gameweek / Overall -->
      <div
        class="relative mt-6  grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#11114d]/80"
      >
        <!-- Active indicator -->
        <div
          class="absolute bottom-0 h-0.5 w-1/2 bg-[#00d9ff] shadow-[0_0_12px_rgba(0,217,255,0.8)] transition-transform duration-300"
          :class="
            activeTab === 'overall'
              ? 'translate-x-full'
              : 'translate-x-0'
          "
        />

        <button
          type="button"
          class="relative flex h-12 items-center justify-center text-xs font-bold uppercase tracking-wide transition"
          :class="
            activeTab === 'gameweek'
              ? 'text-cyan-300'
              : 'text-white/40 hover:text-white/70'
          "
          @click="activeTab = 'gameweek'"
        >
          Gameweek
        </button>

        <button
          type="button"
          class="relative flex h-12 items-center justify-center text-xs font-bold uppercase tracking-wide transition"
          :class="
            activeTab === 'overall'
              ? 'text-cyan-300'
              : 'text-white/40 hover:text-white/70'
          "
          @click="activeTab = 'overall'"
        >
          Overall
        </button>
      </div>
    </section>

    <!-- Context -->
    <div class="mb-3  px-5  h-14 flex items-center justify-between px-1">
      <div>
        <p class="text-md font-regular text-white">
          {{
            activeTab === 'gameweek'
              ? `Gameweek ${currentGameweek?.number || 1}`
              : 'Overall'
          }}
        </p>

        <!-- <p class="mt-0.5 text-[11px] text-white/50">
          {{
            activeTab === 'gameweek'
              ? 'Current gameweeks rankings'
              : 'Cumulative points'
          }}
        </p> -->
      </div>

      <div
        class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-wide text-white/40"
      >
        {{ leaderboard.length }} Players
      </div>
    </div>

    <!-- Loading -->
    <section
      v-if="loading"
      class="rounded-2xl border border-white/10 bg-[#080827] px-6 py-12 text-center"
    >
      <p class="text-sm text-white/40">
        Loading leaderboard...
      </p>
    </section>

    <!-- Error -->
    <section
      v-else-if="error"
      class="rounded-2xl border border-red-400/10 bg-red-500/5 px-6 py-12 text-center"
    >
      <p class="text-sm font-semibold text-white">
        Unable to load leaderboard
      </p>

      <p class="mt-1 text-xs text-white/40">
        {{ error }}
      </p>

      <button
        type="button"
        class="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
        @click="loadLeaderboard"
      >
        Try Again
      </button>
    </section>

    <!-- Leaderboard -->
    <section
      v-else
      class="overflow-hidden rounded-2xl border border-white/10 bg-[#080827]"
    >
      <!-- Table Header -->
      <div
        class="grid grid-cols-[48px_minmax(0,1fr)_40px_58px] items-center border-b border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <p
          class="text-[9px] font-semibold uppercase tracking-wide text-white/30"
        >
          #
        </p>

        <p
          class="text-[9px] font-semibold uppercase tracking-wide text-white/30"
        >
          Player
        </p>

        <div />

        <p
          class="text-right text-[9px] font-semibold uppercase tracking-wide text-white/30"
        >
          PTS
        </p>
      </div>

      <!-- Rows -->
      <div
        v-if="leaderboard.length"
      >
        <div
          v-for="(player, index) in leaderboard"
          :key="player.teamId"
          class="relative grid grid-cols-[48px_minmax(0,1fr)_40px_58px] items-center px-4 py-4 transition"
          :class="[
            index !== leaderboard.length - 1
              ? 'border-b border-white/6'
              : '',
            player.isCurrentUser
              ? 'bg-cyan-4000/6'
              : 'hover:bg-white/2.5',
          ]"
        >
          <!-- Current user accent -->
          <div
            v-if="player.isCurrentUser"
            class="absolute left-0 top-0 h-full w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
          />

          <!-- Rank -->
          <div>
            <span
              class="text-sm font-black"
              :class="
                player.rank <= 3
                  ? 'text-white'
                  : 'text-white/40'
              "
            >
              {{ String(player.rank).padStart(2, '0') }}
            </span>
          </div>

          <!-- Player -->
<div class="min-w-0">
  <button
    type="button"
    class="block max-w-full text-left"
    @click="openFantasyTeam(player.teamId)"
  >
    <p
      class="truncate text-sm font-semibold transition"
      :class="
        player.isCurrentUser
          ? 'text-cyan-300 hover:text-cyan-200'
          : 'text-white hover:text-cyan-300'
          ">
            {{ player.name }}
     </p>
  </button>

  <p
    v-if="player.isCurrentUser"
    class="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-cyan-400/50"
  >
    You
  </p>
</div>

          <!-- Movement -->
          <div class="text-center">
            <span
              class="text-base font-bold"
              :class="{
                'text-emerald-400': player.movement === 'up',
                'text-red-400': player.movement === 'down',
                'text-white/20': player.movement === 'same',
              }"
            >
              {{ movementSymbol(player.movement) }}
            </span>
          </div>

          <!-- Points -->
          <div class="text-right">
            <span class="text-sm font-black text-white">
              {{ player.points }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else
        class="px-6 py-12 text-center"
      >
        <p class="text-sm font-semibold text-white">
          No fantasy teams yet
        </p>

        <p class="mt-1 text-xs text-white/40">
          Players will appear here once they create their fantasy teams.
        </p>
      </div>
    </section>
  </div>
</template>