<script setup>
import {
  Menu,
  X,
} from 'lucide-vue-next'

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import EditTeamModal from '../../components/fantasy/EditTeamModal.vue'



const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)

const loading = ref(true)
const error = ref('')
const team = ref(null)
const editTeamModalOpen = ref(false)
const leagueId = ref(null)
const transferHistoryOpen = ref(false)
const transferHistory = ref([])
const transferHistoryLoading = ref(false)
const transferHistoryError = ref('')

const squadValue = computed(() => Number(team.value?.squadValue || 0))
const squadCost = computed(() => Number(team.value?.squadCost || 0))
const bank = computed(() => Number(team.value?.bank || 0))

const formatMoney = (value) => `${Number(value).toFixed(1)}M`

const activeTab = computed(() => {
  const path = route.path

  if (path.includes('/transfers')) return 'transfers'
  if (path.includes('/points')) return 'points'
  if (path.includes('/leaderboard')) return 'leaderboard'

  return 'team'
})

const loadTeam = async () => {
  try {
    loading.value = true
    error.value = ''

    // First try the league ID from the URL
    const queryLeagueId = Number(route.query.leagueId)

    if (Number.isInteger(queryLeagueId) && queryLeagueId > 0) {
      leagueId.value = queryLeagueId
    } else {
      // URL is missing/invalid.
      // Ask the backend which league this user's team belongs to.
      const statusResponse = await api.get('/fantasy/status')

      const status = statusResponse.data.data

      console.log('Fantasy status fallback:', status)

      if (status.hasTeam && status.teams?.length > 0) {
        const resolvedLeagueId = Number(
          status.teams[0].leagueId,
        )

        if (
          !Number.isInteger(resolvedLeagueId) ||
          resolvedLeagueId <= 0
        ) {
          error.value = 'Unable to determine your league'
          return
        }

        leagueId.value = resolvedLeagueId

        // Clean the URL
        router.replace({
          path: route.path,
          query: {
            leagueId: String(resolvedLeagueId),
          },
        })
      } else {
        error.value = 'You do not have a fantasy team yet'
        return
      }
    }

    // Now load the actual team
    const response = await api.get(
      '/fantasy/teams/my-team',
      {
        params: {
          leagueId: leagueId.value,
        },
      },
    )

    team.value = response.data.data.team

    // Backend is the final source of truth
    leagueId.value = team.value.leagueId

    console.log('Resolved league ID:', leagueId.value)
  } catch (err) {
    console.error('Load team error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load your fantasy team'
  } finally {
    loading.value = false
  }
}

const goToTeam = () => {
  menuOpen.value = false

  if (!leagueId.value) return

  router.push({
    path: '/fantasy/team',
    query: {
      leagueId: String(leagueId.value),
    },
  })
}

const goToTransfers = () => {
  menuOpen.value = false

  if (!leagueId.value) return

  router.push({
    path: '/fantasy/transfers',
    query: {
      leagueId: String(leagueId.value),
    },
  })
}

const goToPoints = () => {
  menuOpen.value = false

  if (!leagueId.value) return

  router.push({
    path: '/fantasy/points',
    query: {
      leagueId: String(leagueId.value),
    },
  })
}

const goToLeaderboard = () => {
  menuOpen.value = false

  if (!leagueId.value) return

  router.push({
    path: '/fantasy/leaderboard',
    query: {
      leagueId: String(leagueId.value),
    },
  })
}

const goToProfile = () => {
  menuOpen.value = false

  router.push({
    path: '/fantasy/profile',
    query: {
      leagueId: String(leagueId.value),
    },
  })
}

const handleLogout = () => {
  menuOpen.value = false
  authStore.logout()
  router.push('/login')
}

const openEditTeam = () => {
  menuOpen.value = false
  editTeamModalOpen.value = true
}

const closeEditTeam = () => {
  editTeamModalOpen.value = false
}

const handleTeamUpdated = (updatedTeam) => {
  team.value = {
    ...team.value,
    ...updatedTeam,
  }

  editTeamModalOpen.value = false
}

const handleAccountDeleted = () => {
  editTeamModalOpen.value = false
  menuOpen.value = false

  authStore.logout()

  router.push('/login')
}

const openTransferHistory = async () => {
  menuOpen.value = false
  transferHistoryOpen.value = true

  transferHistory.value = []
  transferHistoryError.value = ''
  transferHistoryLoading.value = true

  try {
    const response = await api.get('/fantasy/transfers/history', {
      params: {
        leagueId: leagueId.value,
      },
    })

    transferHistory.value =
      response.data?.data?.transfers || []
  } catch (error) {
    console.error('Transfer history error:', error)

    transferHistoryError.value =
      error.response?.data?.message ||
      'Unable to load transfer history.'
  } finally {
    transferHistoryLoading.value = false
  }
}

const closeTransferHistory = () => {
  transferHistoryOpen.value = false
}

onMounted(loadTeam)
</script>

<template>
  <div class="min-h-screen bg-[#010056] text-white">

    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-white/10 bg-[#010056]/95 backdrop-blur">
      <div class="mx-auto flex w-full items-center justify-between px-4 py-4 sm:px-6">

        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-white/40">
            Fantasy
          </p>

          <h1 class="mt-0.5 text-3xl tracking-tight"
            style="font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600;">
            {{ team?.name || 'My Team' }}
          </h1>
        </div>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          @click="menuOpen = true"
        >
          <Menu :size="22" />
        </button>

      </div>

      <!-- Tabs -->
<!-- Tabs -->
<nav class="mx-auto flex w-full justify-center gap-1 overflow-x-hidden px-4 pb-3 sm:px-6">

  <button
    type="button"
    :class="[
      'w-30 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition',
      activeTab === 'team'
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:bg-white/5 hover:text-white',
    ]"
    @click="goToTeam"
  >
    My Team
  </button>
    <button
    type="button"
    :class="[
      'w-30 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition',
      activeTab === 'points'
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:bg-white/5 hover:text-white',
    ]"
    @click="goToPoints"
  >
    Points
  </button>

  <button
    type="button"
    :class="[
      'w-30 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition',
      activeTab === 'transfers'
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:bg-white/5 hover:text-white',
    ]"
    @click="goToTransfers"
  >
    Transfers
  </button>



  <button
    type="button"
    :class="[
      'w-30 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition',
      activeTab === 'leaderboard'
        ? 'bg-white/10 text-white'
        : 'text-white/50 hover:bg-white/5 hover:text-white',
    ]"
    @click="goToLeaderboard"
  >
    Leaderboard
  </button>

</nav>
    </header>

    <!-- Menu -->
    <Transition name="fade">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        @click.self="menuOpen = false"
      >
        <aside
          class="absolute right-0 top-0 h-full w-full max-w-sm border-l border-white/10 bg-[#011607] p-6 shadow-2xl"
        >

          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">
              Menu
            </h2>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              @click="menuOpen = false"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Financial summary -->
          <div class="mt-8 grid grid-cols-2 gap-3">

            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs text-white/40">
                Squad Value
              </p>

              <p class="mt-1 text-lg font-bold">
                {{ formatMoney(squadValue) }}
              </p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs text-white/40">
                Bank Balance
              </p>

              <p class="mt-1 text-lg font-bold">
                {{ formatMoney(bank) }}
              </p>
            </div>

            <div class="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs text-white/40">
                Squad Cost
              </p>

              <p class="mt-1 text-lg font-bold">
                {{ formatMoney(squadCost) }}
              </p>
            </div>

          </div>

          <!-- Menu options -->
          <div class="mt-8 space-y-2">

            <button
              type="button"
              class="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
              @click="goToProfile"
            >
              Profile
            </button>

            <button
              type="button"
              class="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
              @click="openEditTeam"
            >
              Edit Team Details
            </button>

            <button
  type="button"
  class="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
  @click="openTransferHistory"
>
  Transfer History
</button>

            <button
              type="button"
              class="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10"
              @click="handleLogout"
            >
              Logout
            </button>

          </div>

        </aside>
      </div>
    </Transition>

   <!-- Transfer History Modal -->
<Transition name="fade">
  <div
    v-if="transferHistoryOpen"
    class="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    @click.self="closeTransferHistory"
  >
    <div
      class="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#011607] shadow-2xl"
    >

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 class="text-xl font-bold">
            Transfer History
          </h2>

          <p class="mt-1 text-sm text-white/40">
            Your previous player transfers
          </p>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
          @click="closeTransferHistory"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Content -->
      <div class="max-h-[70vh] overflow-y-auto px-6 py-5">

        <!-- Loading -->
        <div
          v-if="transferHistoryLoading"
          class="flex items-center justify-center py-12"
        >
          <p class="text-sm text-white/40">
            Loading transfer history...
          </p>
        </div>

        <!-- Error -->
        <div
          v-else-if="transferHistoryError"
          class="py-12 text-center"
        >
          <p class="text-sm text-red-300">
            {{ transferHistoryError }}
          </p>
        </div>

        <!-- Empty -->
        <div
          v-else-if="transferHistory.length === 0"
          class="py-12 text-center"
        >
          <p class="text-sm text-white/40">
            No transfers yet.
          </p>
        </div>

        <!-- History -->
        <div v-else>

          <!-- Table heading -->
          <div
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-white/10 pb-3 text-xs font-semibold uppercase tracking-wider text-white/40"
          >
            <span>
              Player Out
            </span>

            <span></span>

            <span>
              Player In
            </span>
          </div>

          <!-- Rows -->
          <div
            v-for="transfer in transferHistory"
            :key="transfer.id"
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-white/5 py-4 last:border-b-0"
          >

            <!-- Player Out -->
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">
                {{ transfer.outgoingPlayer?.name || 'Unknown Player' }}
              </p>

              <p class="mt-1 text-xs text-white/40">
                {{ formatMoney(transfer.outgoingPrice) }}
              </p>
            </div>

            <!-- Arrow -->
            <div class="text-white/30">
              →
            </div>

            <!-- Player In -->
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">
                {{ transfer.incomingPlayer?.name || 'Unknown Player' }}
              </p>

              <p class="mt-1 text-xs text-white/40">
                {{ formatMoney(transfer.incomingPrice) }}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</Transition>
    <!-- Page content -->
    <main class="mx-auto flex flex-col justify-center items-center px-1 py-6">
      <div v-if="loading" class="flex min-h-100 items-center justify-center">
        <p class="text-white/50">
          Loading your team...
        </p>
      </div>

      <div v-else-if="error" class="flex min-h-100 items-center justify-center">
        <p class="text-red-300">
          {{ error }}
        </p>
      </div>

    <RouterView v-else v-slot="{ Component }">
        <component
            :is="Component"
            :team="team"
            @team-updated="handleTeamUpdated"
        />
    </RouterView>
    </main>

    <EditTeamModal
  v-if="editTeamModalOpen && team"
  :team="team"
  @close="closeEditTeam"
  @updated="handleTeamUpdated"
  @deleted="handleAccountDeleted"
/>
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
</style>