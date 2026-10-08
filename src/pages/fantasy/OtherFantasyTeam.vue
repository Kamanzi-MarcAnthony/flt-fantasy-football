<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import FantasyPitch from '../../components/fantasy/FantasyPitch.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const team = ref(null)
const transferInfo = ref(null)

const teamId = computed(() => Number(route.params.teamId))
const leagueId = computed(() => Number(route.query.leagueId))

const loadTeam = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.get(
      `/fantasy/teams/${teamId.value}`,
      {
        params: {
          leagueId: leagueId.value,
        },
      },
    )

    team.value = response.data.data.team
    transferInfo.value = response.data.data.transferInfo

  } catch (err) {
    console.error('Load fantasy team error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load fantasy team'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const transferDisplay = computed(() => {
  if (!transferInfo.value) return '—'

  if (transferInfo.value.unlimitedTransfers) {
    return '∞'
  }

  return `${transferInfo.value.usedTransfers} / ${transferInfo.value.transferLimit}`
})

const transferDescription = computed(() => {
  if (!transferInfo.value) return 'Transfers'

  if (transferInfo.value.unlimitedTransfers) {
    return 'Unlimited • Gameweek 1'
  }

  return 'Used this window'
})

const playerPoints = computed(() => {
  if (!team.value?.players) return {}

  return team.value.players.reduce((points, player) => {
    points[player.id] = player.points ?? 0
    return points
  }, {})
})



onMounted(loadTeam)
</script>

<template>
  <div class="min-h-screen bg-[#010056] flex flex-col items-center text-white">

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-screen items-center justify-center"
    >
      <div class="text-center">
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white"
        ></div>

        <p class="mt-3 text-sm text-white/40">
          Loading team...
        </p>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center px-4"
    >
      <div class="text-center">
        <p class="text-sm text-red-400">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
          @click="loadTeam"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Team Page -->
    <template v-else-if="team">

      <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">

        <!-- Back -->
        <button
          type="button"
          class="mb-2 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          @click="goBack"
        >
          <span class="text-lg">←</span>
          <span>Back to Leaderboard</span>
        </button>

        <!-- ================================================= -->
        <!-- TEAM HEADER -->
        <!-- ================================================= -->

        <section
          class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <div
            class="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >

            <!-- Team -->
            <div class="min-w-0">

              <p
                class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30"
              >
                Fantasy Team
              </p>

              <h1
                class="mt-1 truncate text-2xl font-black sm:text-3xl"
              >
                {{ team.name }}
              </h1>

              <p class="mt-1 text-sm text-white/40">
                {{ team.owner?.name }}
              </p>

            </div>

            <!-- Total Points -->
            <div class="sm:text-right">

              <p
                class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30"
              >
                Total Points
              </p>

              <p class="mt-1 text-4xl font-black">
                {{ team.totalPoints }}
              </p>

            </div>

          </div>
        </section>

<!-- ================================================= -->
<!-- TEAM SUMMARY -->
<!-- ================================================= -->

<section class="grid grid-cols-2 gap-3">

  <!-- Total Points -->
  <div
    class="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
  >
    <p
      class="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30"
    >
      Total Points
    </p>

    <p class="mt-2 text-2xl font-black">
      {{ team.totalPoints }}
    </p>

    <p class="mt-1 text-[9px] text-white/30">
      Fantasy points
    </p>
  </div>

  <!-- Transfers -->
  <div
    class="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
  >
    <p
      class="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30"
    >
      Transfers
    </p>

    <p class="mt-2 text-2xl font-black">
      {{ transferDisplay }}
    </p>

    <p class="mt-1 text-[9px] text-white/30">
      {{ transferDescription }}
    </p>
  </div>

</section>

        <!-- ================================================= -->
        <!-- PITCH -->
        <!-- ================================================= -->

        <section>
          <div class="mb-3 flex items-center justify-between">
            <div>
              <p
                class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30"
              >
                Starting XI
              </p>

              <p class="mt-1 text-sm font-semibold text-white/80">
                Fantasy lineup
              </p>
            </div>

            <p class="text-[10px] text-white/30">
              Read only
            </p>
          </div>

          <FantasyPitch
            :players="team.players"
            :captain-id="team.captainId"
            :vice-captain-id="team.viceCaptainId"
            stat-type="points"
            :player-points="playerPoints"
          />
        </section>

      </div>

    </template>

  </div>
</template>