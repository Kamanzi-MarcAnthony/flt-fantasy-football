<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Plus, X, Users } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import api from '../../services/api'
import PlayerSelectionModal from '../../components/fantasy/PlayerSelectionModal.vue'

const route = useRoute()
const router = useRouter()

const leagueId = Number(route.query.leagueId)

const teamName = ref('')
const startingBank = 50

const players = ref([])
const slots = ref(Array(9).fill(null))

const loading = ref(true)
const creating = ref(false)
const error = ref('')

const showPlayerModal = ref(false)
const selectedSlot = ref(null)

const showExistingTeamModal = ref(false)

const selectedPlayers = computed(() => {
  return slots.value.filter(Boolean)
})

const selectedCount = computed(() => {
  return selectedPlayers.value.length
})

const squadCost = computed(() => {
  return selectedPlayers.value.reduce(
    (total, player) => total + Number(player.price),
    0,
  )
})

const bank = computed(() => {
  return startingBank - squadCost.value
})

const canCreateTeam = computed(() => {
  return (
    teamName.value.trim() !== '' &&
    selectedCount.value === 9 &&
    bank.value >= 0
  )
})

const loadPlayers = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!leagueId) {
      error.value = 'No league selected'
      return
    }

    const response = await api.get('/fantasy/players', {
      params: {
        leagueId,
      },
    })

    players.value = response.data.data.players
  } catch (err) {
    console.error('Load players error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load players'
  } finally {
    loading.value = false
  }
}

const openPlayerSelector = (slotIndex) => {
  if (slots.value[slotIndex]) return

  selectedSlot.value = slotIndex
  showPlayerModal.value = true
}

const removePlayer = (slotIndex) => {
  slots.value[slotIndex] = null
  error.value = ''
}

const handlePlayerSelected = (player) => {
  if (selectedSlot.value === null) return

  slots.value[selectedSlot.value] = player

  selectedSlot.value = null
  showPlayerModal.value = false
  error.value = ''
}

const closePlayerModal = () => {
  showPlayerModal.value = false
  selectedSlot.value = null
}

const createTeam = async () => {
  try {
    error.value = ''

    if (!teamName.value.trim()) {
      error.value = 'Please enter a team name'
      return
    }

    if (selectedCount.value !== 9) {
      error.value = 'Select all 9 players before creating your team'
      return
    }

    if (bank.value < 0) {
      error.value = 'Your squad is over the 50M budget'
      return
    }

    if (!leagueId) {
      error.value = 'No league selected'
      return
    }

    creating.value = true

    const response = await api.post('/fantasy/teams', {
      leagueId,
      name: teamName.value.trim(),
      playerIds: selectedPlayers.value.map(
        (player) => player.id,
      ),
    })

    console.log('Team created:', response.data)

    router.push({
      path: '/fantasy/team/captains',
      query: {
      leagueId,
      },
    })
  } catch (err) {
    console.error('Create team error:', err)

    if (err.response?.status === 409) {
        showExistingTeamModal.value = true
        return
    }

    error.value =
        err.response?.data?.message ||
        'Unable to create your fantasy team'
  } finally {
    creating.value = false
  }
}

    const goToExistingTeam = () => {
    showExistingTeamModal.value = false

    router.push({
        path: '/fantasy/team/captains',
        query: {
            leagueId,
        },
    })
}




onMounted(loadPlayers)
</script>

<template>
  <div class="min-h-screen bg-[#010056] text-white">
    <!-- Header -->
    <header class="border-b border-white/10">
      <div
        class="mx-auto flex w-full bg-white/10 items-center justify-between px-5 py-5 sm:px-8"
      >
        <button
          type="button"
          class="flex bg-white/10 w-20 h-10 justify-center  rounded-3xl items-center gap-2 text-sm text-white/70 transition hover:text-white"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </button>

        <div class="text-right">
          <p class="text-xs uppercase tracking-wider text-white/40">
            Create your team
          </p>
          <p class="text-sm font-medium text-white">
            {{ selectedCount }} / 9 players
          </p>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full px-5 py-6 sm:px-8 flex flex-col gap-2 justify-center items-center">
      <!-- Intro -->
      <div class="mb-8 md:w-2/3">
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Build your squad
        </h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-white/50">
          Pick 9 players within your budget. Arrange your squad on the pitch
          and build a team you believe can dominate.
        </p>
      </div>

      <div class="grid  gap-6 lg:grid-cols-[320px_1fr]">
        <!-- Team settings -->
        <section class="h-fit  rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2">
          <h2 class="text-sm font-medium text-white">
            Team details
          </h2>

          <div class="mt-5">
            <label
              for="team-name"
              class="mb-2 h-6 block text-sm font-medium text-white/50"
            >
              Team name
            </label>

            <input
              id="team-name"
              v-model="teamName"
              type="text"
              placeholder="e.g. Kingsolvers FC"
              maxlength="30"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
            />
          </div>

          <!-- Starting Bank -->
          <div class="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-white/40">
                Starting Bank
              </span>

              <span class="text-sm font-semibold">
                {{ startingBank.toFixed(1) }}M
              </span>
            </div>

            <div class="mt-4 flex items-end justify-between">
              <div>
                <p class="text-xs text-white/40">
                  Squad Cost
                </p>
                <p class="mt-1 text-lg font-semibold">
                  {{ squadCost.toFixed(1) }}M
                </p>
              </div>

              <div class="text-right">
                <p class="text-xs text-white/40">
                  Remaining
                </p>
                <p
                  class="mt-1 text-lg font-semibold"
                  :class="
                    bank < 0
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  "
                >
                  {{ bank.toFixed(1) }}M
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            :disabled="!canCreateTeam"
            class="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
            @click="createTeam"
          >
            Create team
          </button>
        </section>

        <!-- Pitch -->
        <section
          class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f721c]"
        >
          <!-- Pitch markings -->
          <div class="pointer-events-none absolute inset-0">
            <div
              class="absolute inset-5 rounded-xl border border-white/20"
            ></div>

            <div
              class="absolute left-1/2 top-1/2 h-px w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 bg-white/20"
           ></div>

            <div
              class="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
            ></div>

            <div
              class="absolute left-1/2 top-5 h-12 w-32 -translate-x-1/2 rounded-b-full border-x border-b border-white/15"
            ></div>

            <div
              class="absolute bottom-5 left-1/2 h-12 w-32 -translate-x-1/2 rounded-t-full border-x border-t border-white/15"
            ></div>
          </div>

          <!-- Players -->
          <div class="relative grid min-h-[620px] grid-cols-3 grid-rows-3 gap-4 p-10 sm:p-14">
            <div
              v-for="(player, index) in slots"
              :key="index"
              class="flex items-center justify-center"
            >
              <!-- Selected player -->
              <div
                v-if="player"
                class="group relative flex w-28 flex-col items-center sm:w-32"
              >
                <button
                  type="button"
                  class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg transition group-hover:border-white/40 sm:h-24 sm:w-24 p-2"
                  @click="removePlayer(index)"
                >
                  <div class="h-full w-[95%] overflow-hidden rounded-lg border-2 border-white/20 bg-white/10">
                    <img
                        v-if="player.photoUrl"
                        :src="player.photoUrl"
                        :alt="player.name"
                        class="h-full w-full object-cover"
                    />

    <span
      v-else
      class="flex h-full w-full items-center justify-center text-lg font-bold text-white/50"
    >
      {{ player.name.charAt(0) }}
    </span>
  </div>
                  <span
                    class="absolute right-1 top-1 hidden rounded-full bg-black/70 p-1 group-hover:block"
                  >
                    <X class="h-3 w-3" />
                  </span>
                </button>

                <div class="mt-2 rounded-lg bg-black/50 px-2 py-1 text-center backdrop-blur-sm">
                  <p class="truncate text-xs font-semibold">
                    {{ player.name }}
                  </p>

                  <p class="mt-0.5 text-[10px] text-white/50">
                    {{ player.position }} · {{ player.ovr }}
                  </p>
                </div>
              </div>

              <!-- Empty slot -->
              <button
                v-else
                type="button"
                class="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/10 text-white/30 transition hover:border-white/40 hover:bg-white/[0.05] hover:text-white/70 sm:h-28 sm:w-28"
                @click="openPlayerSelector(index)"
              >
                <Plus class="h-5 w-5" />

                <span class="mt-1 text-[10px]">
                  Add player
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <PlayerSelectionModal
  v-if="showPlayerModal"
  :players="players"
  :selected-player-ids="selectedPlayers.map((player) => player.id)"
  :bank="bank"
  @select="handlePlayerSelected"
  @close="closePlayerModal"
/>

<!-- Existing Team Modal -->
<!-- Existing Team Modal -->
<Transition name="fade">
    <div
        v-if="showExistingTeamModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    >
        <div
            class="w-full max-w-sm rounded-3xl border border-white/10 bg-[#091617] p-6 shadow-2xl"
        >
            <div
                class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10"
            >
                <Users class="h-6 w-6 text-white" />
            </div>

            <div class="mt-5 text-center">
                <h2 class="text-xl font-bold text-white">
                    You already have a team
                </h2>

                <p class="mt-2 text-sm leading-6 text-white/50">
                    You can only create one fantasy team for this league.
                    You can manage your existing team instead.
                </p>
            </div>

            <div class="mt-6 space-y-2">
                <button
                    type="button"
                    class="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#061112] transition hover:bg-white/90"
                    @click="goToExistingTeam"
                >
                    Go to My Team
                </button>

                <button
                    type="button"
                    class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white/50 transition hover:bg-white/5 hover:text-white"
                    @click="showExistingTeamModal = false"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</Transition>
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