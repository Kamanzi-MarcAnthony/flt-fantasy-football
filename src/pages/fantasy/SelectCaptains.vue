<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import CaptainSelectionModal from '../../components/fantasy/CaptainSelectionModal.vue'

const route = useRoute()
const router = useRouter()

const leagueId = computed(() => Number(route.query.leagueId))
const team = ref(null)
const slots = ref(Array(9).fill(null))

const captainId = ref(null)
const viceCaptainId = ref(null)

const loading = ref(true)
const saving = ref(false)
const error = ref('')

const selectedPlayer = ref(null)
const showCaptainModal = ref(false)

const teamValue = computed(() => {
  return slots.value.reduce(
    (total, player) => total + Number(player?.price || 0),
    0,
  )
})

const bank = computed(() => Number(team.value?.bank || 0))

const canContinue = computed(() => {
  return captainId.value !== null && viceCaptainId.value !== null
})

const isCaptain = (player) => {
  return captainId.value === player.id
}

const isViceCaptain = (player) => {
  return viceCaptainId.value === player.id
}

const loadTeam = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!Number.isInteger(leagueId.value) || leagueId.value <= 0) {
      error.value = 'Invalid league'
      return
    }

    const response = await api.get('/fantasy/teams/my-team', {
      params: {
        leagueId: leagueId.value,
      },
    })

    const loadedTeam = response.data.data.team

    team.value = loadedTeam

    slots.value = loadedTeam.players.map((item) => item.player)

    captainId.value = loadedTeam.captainId || null
    viceCaptainId.value = loadedTeam.viceCaptainId || null
  } catch (err) {
    console.error('Load team error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load your fantasy team'
  } finally {
    loading.value = false
  }
}

const openCaptainModal = (player) => {
  selectedPlayer.value = player
  showCaptainModal.value = true
}

const closeCaptainModal = () => {
  selectedPlayer.value = null
  showCaptainModal.value = false
}

const makeCaptain = () => {
  if (!selectedPlayer.value) return

  captainId.value = selectedPlayer.value.id

  closeCaptainModal()
}

const makeViceCaptain = () => {
  if (!selectedPlayer.value) return

  viceCaptainId.value = selectedPlayer.value.id

  closeCaptainModal()
}

const saveCaptains = async () => {
  try {
    error.value = ''

    if (!captainId.value || !viceCaptainId.value) {
      error.value = 'Please select a captain and vice captain'
      return
    }

    if (captainId.value === viceCaptainId.value) {
      error.value = 'Captain and vice captain must be different players'
      return
    }

    saving.value = true

    await api.patch(`/fantasy/teams/${team.value.id}/captains`, {
      captainId: captainId.value,
      viceCaptainId: viceCaptainId.value,
    })

    router.push({
  path: '/fantasy/team',
  query: {
    leagueId: leagueId.value,
  },
})
  } catch (err) {
    console.error('Save captains error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to save captain selections'
  } finally {
    saving.value = false
  }
}

onMounted(loadTeam)
</script>

<template>
  <div class="min-h-screen bg-[#010056] text-white">
    <!-- Header -->
    <header class="border-b border-white/10">
      <div
        class="mx-auto flex w-full items-center justify-between bg-white/10 px-5 py-5 sm:px-8"
      >
        <button
          type="button"
          class="flex h-10 w-20 items-center justify-center gap-2 rounded-3xl bg-white/10 text-sm text-white/70 transition hover:text-white"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </button>

        <div class="text-right">
          <p class="text-xs uppercase tracking-wider text-white/40">
            Captain selection
          </p>

          <p class="text-sm font-medium text-white">
            {{ team?.name || 'Your team' }}
          </p>
        </div>
      </div>
    </header>

    <main
      class="mx-auto flex w-full flex-col items-center justify-center gap-2 px-5 py-6 sm:px-8"
    >
      <!-- Intro -->
      <div class="mb-8 md:w-2/3">
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Select your captain
        </h1>

        <p class="mt-2 max-w-xl text-sm leading-6 text-white/50">
          Choose a captain and vice captain from your squad. Your captain will
          receive a points multiplier in future gameweeks.
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-5 w-full max-w-5xl rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex min-h-[500px] w-full max-w-5xl items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"
      >
        <div class="text-center">
          <div
            class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
          ></div>

          <p class="mt-3 text-sm text-white/40">
            Loading your team...
          </p>
        </div>
      </div>

      <div
        v-else
        class="grid gap-6 lg:grid-cols-[320px_1fr]"
      >
        <!-- Team summary -->
        <section
          class="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <h2 class="text-sm font-medium text-white">
            Team details
          </h2>

          <div class="mt-5">
            <p class="text-xs text-white/40">
              Team name
            </p>

            <p class="mt-1 text-lg font-semibold">
              {{ team?.name }}
            </p>
          </div>

          <!-- Team finances -->
          <div class="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-white/40">
                Team Value
              </span>

              <span class="text-sm font-semibold">
                {{ teamValue.toFixed(1) }}M
              </span>
            </div>

            <div class="mt-4 flex items-end justify-between">
              <div>
                <p class="text-xs text-white/40">
                  Bank Balance
                </p>

                <p class="mt-1 text-lg font-semibold text-emerald-400">
                  {{ bank.toFixed(1) }}M
                </p>
              </div>

              <div class="text-right">
                <p class="text-xs text-white/40">
                  Players
                </p>

                <p class="mt-1 text-lg font-semibold">
                  {{ slots.filter(Boolean).length }}/9
                </p>
              </div>
            </div>
          </div>

          <!-- Captain summary -->
          <div class="mt-5 space-y-3">
            <div
              class="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <p class="text-[10px] uppercase tracking-wider text-white/30">
                Captain
              </p>

              <p class="mt-1 text-sm font-medium">
                {{
                  slots.find((player) => player?.id === captainId)?.name ||
                  'Not selected'
                }}
              </p>
            </div>

            <div
              class="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <p class="text-[10px] uppercase tracking-wider text-white/30">
                Vice Captain
              </p>

              <p class="mt-1 text-sm font-medium">
                {{
                  slots.find((player) => player?.id === viceCaptainId)?.name ||
                  'Not selected'
                }}
              </p>
            </div>
          </div>

          <button
            type="button"
            :disabled="!canContinue || saving"
            class="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
            @click="saveCaptains"
          >
            {{ saving ? 'Saving...' : 'Continue' }}
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
          <div
            class="relative grid min-h-[620px] grid-cols-3 grid-rows-3 gap-4 p-10 sm:p-14"
          >
            <div
              v-for="(player, index) in slots"
              :key="index"
              class="flex items-center justify-center"
            >
              <button
                v-if="player"
                type="button"
                class="group relative flex w-28 flex-col items-center sm:w-32"
                @click="openCaptainModal(player)"
              >
                <!-- Player image -->
                <div
                  class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-lg transition group-hover:border-white/50 sm:h-24 sm:w-24"
                >
                  <div
                    class="h-full w-[95%] overflow-hidden rounded-lg border-2 border-white/20 bg-white/10"
                  >
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

                  <!-- Captain badge -->
                  <span
                    v-if="isCaptain(player)"
                    class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-[#010056] shadow-lg"
                  >
                    C
                  </span>

                  <!-- Vice Captain badge -->
                  <span
                    v-else-if="isViceCaptain(player)"
                    class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-[#010056] text-[10px] font-black text-white shadow-lg"
                  >
                    VC
                  </span>

                  <!-- Click indicator -->
                  <span
                    class="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"
                  >
                    Select
                  </span>
                </div>

                <!-- Player info -->
                <div
                  class="mt-2 rounded-lg bg-black/50 px-2 py-1 text-center backdrop-blur-sm"
                >
                  <p class="truncate text-xs font-semibold">
                    {{ player.name }}
                  </p>

                  <p class="mt-0.5 text-[10px] text-white/50">
                    {{ player.position }} · {{ player.ovr }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Captain modal -->
    <CaptainSelectionModal
      v-if="showCaptainModal"
      :player="selectedPlayer"
      :is-captain="selectedPlayer ? isCaptain(selectedPlayer) : false"
      :is-vice-captain="
        selectedPlayer ? isViceCaptain(selectedPlayer) : false
      "
      @make-captain="makeCaptain"
      @make-vice-captain="makeViceCaptain"
      @close="closeCaptainModal"
    />
  </div>
</template>