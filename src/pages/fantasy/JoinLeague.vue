<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    Trophy,
    ArrowRight,
} from 'lucide-vue-next'
import api from '../../services/api'

const router = useRouter()

const leagues = ref([])
const loading = ref(true)
const joiningLeagueId = ref(null)
const error = ref(null)

const loadLeagues = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await api.get('/fantasy/leagues')

        leagues.value = response.data.data.leagues
    } catch (err) {
        console.error('Failed to load leagues:', err)

        error.value =
            err.response?.data?.message ||
            'Unable to load leagues. Please try again.'
    } finally {
        loading.value = false
    }
}

const joinLeague = async (league) => {
  if (joiningLeagueId.value) return

  joiningLeagueId.value = league.id
  error.value = null

  try {
    await api.post(`/fantasy/leagues/${league.id}/join`)

    router.push({
      path: '/fantasy/team/create',
      query: {
        leagueId: league.id,
      },
    })
  } catch (err) {
    // Already a member — that's okay.
    if (err.response?.status === 409) {
      router.push({
        path: '/fantasy/team/create',
        query: {
          leagueId: league.id,
        },
      })

      return
    }

    console.error('Failed to join league:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to join this league. Please try again.'
  } finally {
    joiningLeagueId.value = null
  }
}

// const continueToTeam = () => {
//   if (!selectedLeague.value) return

//   router.push({
//     path: '/fantasy/team/create',
//     query: {
//       leagueId: selectedLeague.value.id,
//     },
//   })
// }

onMounted(() => {
    loadLeagues()
})
</script>

<template>
    <div class="min-h-screen w-screen bg-[#010056] flex flex-col justify-center items-center overflow-hidden text-white">

        <!-- Header -->
        <header class="w-3/3 border-b border-white/10  flex items-center justify-center text-center py-5 sm:px-8">
            <div class="mx-auto max-w-6xl">

                <div class="flex flex-col gap-2">
                    <p
                        class="text-xs font-bold uppercase tracking-[0.2em] text-white/30"
                    >
                         Welcome to FLT Fantasy Football
                    </p>

                    <h1 class="mt-2 text-2xl text-center font-bold tracking-tight sm:text-3xl">
                        Join your League
                    </h1>

                    <p class="mt-2 text-sm text-white/40">
                        Choose the league you want to compete in.
                    </p>
                </div>

            </div>
        </header>


        <!-- Content -->
        <main class="mx-auto w-full px-8 sm:w-[80%] flex min-h-[calc(100vh-105px)] max-w-5xl flex-col justify-center px-5 py-10 sm:px-8">

            <!-- Error -->
            <div
                v-if="error"
                class="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300"
            >
                {{ error }}
            </div>


            <!-- Loading -->
            <div
                v-if="loading"
                class="flex min-h-[400px] items-center justify-center"
            >
                <div class="text-center">

                    <div
                        class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white"
                    ></div>

                    <p class="mt-4 text-sm text-white/40">
                        Loading leagues...
                    </p>

                </div>
            </div>


            <!-- Empty -->
            <div
                v-else-if="leagues.length === 0"
                class="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-5 text-center"
            >

                <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10"
                >
                    <Trophy class="h-6 w-6 text-white/40" />
                </div>

                <h2 class="mt-5 text-lg font-semibold">
                    No leagues available
                </h2>

                <p class="mt-2 max-w-sm text-sm leading-6 text-white/40">
                    There are currently no leagues available to join.
                    Check back later.
                </p>

            </div>


            <!-- League grid -->
            <div
                v-else
                class="mx-auto grid w-full gap-5 md:grid-cols-2"
            >
                <article
                    v-for="league in leagues"
                    :key="league.id"
                    class="group rounded-3xl flex flex-col gap-3 border border-white/10 bg-white/10 p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                >

                    <!-- League heading -->
                    <div class="flex items-start gap-4">

                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10"
                        >
                            <Trophy class="h-6 w-6 text-white/70" />
                        </div>

                        <div class="min-w-0">

                            <h2 class="truncate text-xl font-semibold">
                                {{ league.name }}
                            </h2>

                            <p
                                v-if="league.location"
                                class="mt-1 flex items-center gap-1.5 text-sm text-white/50"
                            >
                                <MapPin class="h-3.5 w-3.5" />
                                {{ league.location }}
                            </p>

                        </div>

                    </div>


                    <!-- Match information -->
                    <div class="mt-7 grid grid-cols-2 gap-3">

                        <div
                            class="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                        >
                            <div class="flex items-center gap-2 text-white/30">
                                <CalendarDays class="h-4 w-4" />

                                <span class="text-xs">
                                    Matchdays
                                </span>
                            </div>

                            <p class="mt-2 text-sm font-medium">
                                {{ league.matchDay || 'Not set' }} 
                            </p>
                        </div>


                        <div
                            class="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                        >
                            <div class="flex items-center gap-2 text-white/30">
                                <Clock class="h-4 w-4" />

                                <span class="text-xs">
                                    Match time
                                </span>
                            </div>

                            <p class="mt-2 text-sm font-medium">
                                {{ league.matchTime || 'Not set' }}
                            </p>
                        </div>

                    </div>


                    <!-- League stats -->
                    <div
                        class="mt-3 flex items-center justify-between border-t border-white/10 pt-4"
                    >

                        <div class="flex items-center gap-2 text-sm text-white/40">
                            <Users class="h-4 w-4" />

                            <span>
                                {{ league.playerCount }} players
                            </span>
                        </div>

                        <span class="text-sm text-white/30">
                            {{ league.memberCount }} fantasy players
                        </span>

                    </div>


                    <!-- Action -->
                    <div class="mt-6">
  <button
    type="button"
    @click="joinLeague(league)"
    :disabled="joiningLeagueId === league.id"
    class="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {{
      joiningLeagueId === league.id
        ? 'Loading...'
        : league.isJoined
          ? 'Continue to Team'
          : 'Join League'
    }}

    <ArrowRight
      v-if="joiningLeagueId !== league.id"
      class="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
    />
  </button>
</div>

                </article>

            </div>

        </main>

    </div>
</template>