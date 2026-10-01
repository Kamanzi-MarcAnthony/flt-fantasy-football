<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import {
  Play,
  MoreVertical,
  Plus,
  Trophy,
} from 'lucide-vue-next'

import LeagueCard from '../components/leagues/LeagueCard.vue'
import pitch from '../assets/images/pitch.jpg'

const leagues = [
  {
    id: 1,
    name: 'Friday Office League',
    location: 'Kampala',
    startDate: '02 Oct 2026',
    endDate: '18 Dec 2026',
    status: 'ACTIVE',
    playerCount: 12,
  },
  {
    id: 2,
    name: 'Golden Friday Cup',
    location: 'Kampala',
    startDate: '09 Oct 2026',
    endDate: '20 Nov 2026',
    status: 'ACTIVE',
    playerCount: 18,
  },
  {
    id: 3,
    name: 'End of Year League',
    location: 'Kampala',
    startDate: '01 Dec 2026',
    endDate: '20 Dec 2026',
    status: 'UPCOMING',
    playerCount: 24,
  },
]
const router = useRouter()
const authStore = useAuthStore()

const showMenu = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-t from-[#011f22] from-80% via-cyan-900 via-100% to-cyan-950 to-160% bg text-white">

    <!-- Header -->

    <header class="px-5 pb-5 pt-6 sm:px-8 lg:px-12">
      <div class="mx-auto flex max-w-6xl items-center justify-between">

        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            Fantasy
          </h1>

          <p class="mt-1 text-sm text-white/40">
            Admin
          </p>
        </div>

        <div class="relative">
          <button type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/10"
            @click="showMenu = !showMenu">
            <MoreVertical class="h-5 w-5" />
          </button>

          <!-- Menu -->

          <div v-if="showMenu"
            class="absolute right-0 top-14 z-50 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#111c1d] p-1.5 shadow-2xl">
            <button type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              @click="handleLogout">
              <LogOut class="h-4 w-4" />

              <span>Logout</span>
            </button>
          </div>
        </div>

      </div>
    </header>


    <!-- Main -->

    <main class="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-12">

      <!-- Hero -->

      <section class="relative overflow-hidden rounded-[28px] border border-white/10 ">

        <!-- Background image -->

        <img :src="pitch" alt="Football pitch" class="absolute inset-0 h-full w-full object-cover" />

        <!-- Dark overlay -->

        <div class="absolute inset-0 bg-gradient-to-r from-[#061112] via-[#061112]/65 to-[#061112]/10"></div>

        <!-- Content -->

        <div class="relative flex min-h-[280px] items-center p-6 sm:min-h-[320px] sm:p-8 lg:min-h-[350px] lg:p-10">
          <div class="flex flex-col gap-4">
            <div
              class="mb-4 max-w-40 inline-flex items-center gap- rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Trophy class="h-3.5 w-3.5" />
              </span>

              <span class="text-xs font-medium text-white/80">
                Fantasy Football
              </span>
            </div>

            <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">
              Manage your leagues.
            </h2>

            <p class="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">
              Create competitions, manage players and keep your fantasy
              football games running.
            </p>

            <RouterLink to="/leagues/create"
              class="mt-6 max-w-48 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              <Plus class="h-4 w-4 fill-current" />
              Create a league
            </RouterLink>

          </div>

        </div>
      </section>


      <!-- Leagues section -->

      <section class="mt-8 pt-4 flex flex-col gap-4">

        <!-- Section heading -->

        <div class="mb-5 flex items-center justify-between gap-6">

          <div>
            <h2 class="text-2xl font-bold tracking-tight">
              Leagues
            </h2>

            <p class="mt-4 text-sm text-white/40 ">
              Select a League to play
            </p>
          </div>
        </div>


        <!-- League list -->

        <div v-if="leagues.length" class="space-y-3 flex flex-col gap-4">

          <LeagueCard v-for="league in leagues" :key="league.id" :league="league" />

        </div>


        <!-- Empty state -->

        <div v-else class="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">

          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <Trophy class="h-6 w-6 text-white/60" />
          </div>

          <h3 class="mt-5 text-lg font-semibold">
            No leagues yet
          </h3>

          <p class="mx-auto mt-2 max-w-sm text-sm text-white/40">
            Create your first fantasy football league to get started.
          </p>

          <RouterLink to="/leagues/create"
            class="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            <Plus class="h-4 w-4" />
            Create League
          </RouterLink>

        </div>

      </section>

    </main>
  </div>
</template>