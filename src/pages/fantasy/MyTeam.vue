<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  X,
  Users,
  ArrowRightLeft,
  Trophy,
  BarChart3,
} from 'lucide-vue-next'

import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const menuOpen = ref(false)
const team = ref(null)

const leagueId = computed(() => Number(route.query.leagueId))

/*
|--------------------------------------------------------------------------
| Team players
|--------------------------------------------------------------------------
*/

const teamPlayers = computed(() => {
  return team.value?.players || []
})

const players = computed(() => {
  return teamPlayers.value
    .map((item) => item.player)
    .filter(Boolean)
})

/*
|--------------------------------------------------------------------------
| Financials
|--------------------------------------------------------------------------
*/

const squadValue = computed(() => {
  return Number(team.value?.squadValue || 0)
})

const squadCost = computed(() => {
  return Number(team.value?.squadCost || 0)
})

const bank = computed(() => {
  return Number(team.value?.bank || 0)
})

const formatMoney = (value) => {
  return `${Number(value).toFixed(1)}M`
}

/*
|--------------------------------------------------------------------------
| Captain / Vice Captain
|--------------------------------------------------------------------------
*/

const isCaptain = (playerId) => {
  return team.value?.captainId === playerId
}

const isViceCaptain = (playerId) => {
  return team.value?.viceCaptainId === playerId
}

/*
|--------------------------------------------------------------------------
| Load team
|--------------------------------------------------------------------------
*/

const loadTeam = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!Number.isInteger(leagueId.value) || leagueId.value <= 0) {
      error.value = 'Invalid league.'
      return
    }

    const response = await api.get('/fantasy/teams/my-team', {
      params: {
        leagueId: leagueId.value,
      },
    })

    team.value = response.data.data.team
  } catch (err) {
    console.error('Failed to load fantasy team:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load your fantasy team.'
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

const goToTransfers = () => {
  menuOpen.value = false

  router.push({
    path: '/fantasy/transfers',
    query: {
      leagueId: leagueId.value,
    },
  })
}

const goToPoints = () => {
  router.push({
    path: '/fantasy/points',
    query: {
      leagueId: leagueId.value,
    },
  })
}

const goToLeaderboard = () => {
  router.push({
    path: '/fantasy/leaderboard',
    query: {
      leagueId: leagueId.value,
    },
  })
}

const goToProfile = () => {
  menuOpen.value = false

  router.push({
    path: '/fantasy/profile',
  })
}

const handleLogout = () => {
  menuOpen.value = false

  authStore.logout()

  router.push('/login')
}

onMounted(loadTeam)
</script>

<template>
  <div class="min-h-screen bg-[#010056] text-white">

    <!-- ========================================================= -->
    <!-- HEADER -->
    <!-- ========================================================= -->

    <header
      class="sticky top-0  z-40 border-b border-white/10 bg-[#010056] px-4 py-4 backdrop-blur-xl"
    >
      <div class="flex items-center justify-between">

        <div>
          <p
            class="text-xs font-medium uppercase tracking-wider text-white/40"
          >
            Fantasy
          </p>

          <h1 class="mt-0.5 font-sans font-bold text-3xl">
            {{ team?.name || 'My Team' }}
          </h1>
        </div>

        <!-- Menu button -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
          @click="menuOpen = true"
        >
          <Menu class="h-5 w-5" />
        </button>

      </div>
    </header>

    <!-- ========================================================= -->
    <!-- MENU OVERLAY -->
    <!-- ========================================================= -->

    <Transition name="fade">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        @click.self="menuOpen = false"
      >
        <aside
          class="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-l border-white/10 bg-[#091617] shadow-2xl"
        >

          <!-- Menu header -->
          <div
            class="flex items-center justify-between border-b border-white/10 px-5 py-5"
          >
            <div>
              <p
                class="text-xs uppercase tracking-wider text-white/40"
              >
                My Team
              </p>

              <h2 class="mt-1 text-lg font-bold">
                {{ team?.name || 'Fantasy Team' }}
              </h2>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5"
              @click="menuOpen = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Financial summary -->
          <div class="grid grid-cols-2 gap-3 p-5">

            <div
              class="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p class="text-xs text-white/40">
                Squad Value
              </p>

              <p class="mt-1 text-lg font-bold">
                {{ formatMoney(squadValue) }}
              </p>
            </div>

            <div
              class="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p class="text-xs text-white/40">
                Bank Balance
              </p>

              <p class="mt-1 text-lg font-bold">
                {{ formatMoney(bank) }}
              </p>
            </div>

            <div
              class="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div class="flex items-center justify-between">

                <div>
                  <p class="text-xs text-white/40">
                    Squad Cost
                  </p>

                  <p class="mt-1 text-lg font-bold">
                    {{ formatMoney(squadCost) }}
                  </p>
                </div>

                <span class="text-xs text-white/30">
                  50.0M Budget
                </span>

              </div>
            </div>

          </div>

          <!-- Menu options -->
          <div class="px-3">

            <!-- Profile -->
            <button
              type="button"
              class="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition hover:bg-white/5"
              @click="goToProfile"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              >
                <Users class="h-5 w-5 text-white/70" />
              </div>

              <div>
                <p class="text-sm font-semibold">
                  Profile
                </p>

                <p class="text-xs text-white/40">
                  Manage your account
                </p>
              </div>
            </button>

            <!-- Transfers -->
            <button
              type="button"
              class="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition hover:bg-white/5"
              @click="goToTransfers"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              >
                <ArrowRightLeft class="h-5 w-5 text-white/70" />
              </div>

              <div>
                <p class="text-sm font-semibold">
                  Transfers
                </p>

                <p class="text-xs text-white/40">
                  Manage your squad
                </p>
              </div>
            </button>

          </div>

          <!-- Logout -->
          <div class="mt-auto border-t border-white/10 p-5">
            <button
              type="button"
              class="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>

        </aside>
      </div>
    </Transition>

    <!-- ========================================================= -->
    <!-- MAIN -->
    <!-- ========================================================= -->

    <main class="px-3 pb-8 pt-4 sm:px-5 flex flex-col gap-4  items-center ">

      <!-- ======================================================= -->
      <!-- FANTASY NAVIGATION -->
      <!-- ======================================================= -->

      <div class="mb-5 grid grid-cols-4 gap-2 md:w-2/3 w-full">

        <!-- My Team -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-2 py-3 text-center"
        >
          <Users class="h-4 w-4 text-white" />

          <span class="text-[11px] font-semibold">
            My Team
          </span>
        </button>

        <!-- Transfers -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center text-white/50 transition hover:bg-white/10 hover:text-white"
          @click="goToTransfers"
        >
          <ArrowRightLeft class="h-4 w-4" />

          <span class="text-[11px] font-semibold">
            Transfers
          </span>
        </button>

        <!-- Points -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center text-white/50 transition hover:bg-white/10 hover:text-white"
          @click="goToPoints"
        >
          <BarChart3 class="h-4 w-4" />

          <span class="text-[11px] font-semibold">
            Points
          </span>
        </button>

        <!-- Leaderboard -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center text-white/50 transition hover:bg-white/10 hover:text-white"
          @click="goToLeaderboard"
        >
          <Trophy class="h-4 w-4" />

          <span class="text-[11px] font-semibold">
            Leaderboard
          </span>
        </button>

      </div>

      <!-- ======================================================= -->
      <!-- LOADING -->
      <!-- ======================================================= -->

      <div
        v-if="loading"
        class="flex min-h-[500px] items-center justify-center"
      >
        <div class="text-center">

          <div
            class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white"
          ></div>

          <p class="mt-3 text-sm text-white/40">
            Loading your team...
          </p>

        </div>
      </div>

      <!-- ======================================================= -->
      <!-- ERROR -->
      <!-- ======================================================= -->

      <div
        v-else-if="error"
        class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
      >
        <p class="text-sm font-medium text-red-400">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#061112]"
          @click="loadTeam"
        >
          Try Again
        </button>
      </div>

      <!-- ======================================================= -->
      <!-- TEAM -->
      <!-- ======================================================= -->

      <div
        v-else-if="team"
        class="space-y-4 w-full md:w-2/3 "
      >

        <!-- ===================================================== -->
        <!-- PITCH -->
        <!-- ===================================================== -->

        <section
          class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f721c] "
        >

          <!-- Pitch markings -->
          <div class="pointer-events-none absolute inset-0">

            <!-- Outer box -->
            <div
              class="absolute inset-5 rounded-xl border border-white/20"
            ></div>

            <!-- Halfway line -->
            <div
              class="absolute left-1/2 top-1/2 h-px w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 bg-white/20"
            ></div>

            <!-- Centre circle -->
            <div
              class="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
            ></div>

            <!-- Top penalty arc -->
            <div
              class="absolute left-1/2 top-5 h-12 w-32 -translate-x-1/2 rounded-b-full border-x border-b border-white/15"
            ></div>

            <!-- Bottom penalty arc -->
            <div
              class="absolute bottom-5 left-1/2 h-12 w-32 -translate-x-1/2 rounded-t-full border-x border-t border-white/15"
            ></div>

          </div>

          <!-- ================================================= -->
          <!-- 3 x 3 PLAYER GRID -->
          <!-- ================================================= -->

          <div
            class="relative grid min-h-[620px] grid-cols-3 grid-rows-3 gap-4 p-10 sm:p-14"
          >

            <div
              v-for="(player, index) in players"
              :key="player.id || index"
              class="flex items-center justify-center"
            >

              <div
                class="flex w-28 flex-col items-center sm:w-32"
              >

                <!-- Player card -->
                <div
                  class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-lg sm:h-24 sm:w-24"
                >

                  <!-- Player image -->
                  <div
                    class="h-full w-[95%] overflow-hidden rounded-lg border-2 border-white/20 bg-white/10"
                  >

                    <img
                      v-if="player.photoUrl"
                      :src="player.photoUrl"
                      :alt="player.name"
                      class="h-full w-full object-cover"
                    />

                    <!-- Fallback -->
                    <span
                      v-else
                      class="flex h-full w-full items-center justify-center text-lg font-bold text-white/50"
                    >
                      {{ player.name?.charAt(0) || '?' }}
                    </span>

                  </div>

                  <!-- Captain -->
                  <span
                  id="captain"
                    v-if="isCaptain(player.id)"
                    class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full  text-[10px]  text-violet-950 bg-[#00EEFF] shadow-lg"
                  >
                    C
                  </span>

                  <!-- Vice Captain -->
                  <span
                  id="vice-captain"
                    v-else-if="isViceCaptain(player.id)"
                    class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#00EEFF] text-violet-950 shadow-lg"
                  >
                    VC
                  </span>

                </div>

                <!-- Player information -->
                <div
                  class="mt-2 rounded-lg bg-black/50 px-2 py-1 text-center backdrop-blur-sm"
                >

                  <p
                    class="max-w-[110px] truncate text-xs font-semibold"
                  >
                    {{ player.name }}
                  </p>

                  <p
                    class="mt-0.5 text-[10px] text-white/50"
                  >
                    {{ player.position }} · {{ player.ovr }}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

#captain, #vice-captain{
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font: black;
    font-size: small;
}
</style>