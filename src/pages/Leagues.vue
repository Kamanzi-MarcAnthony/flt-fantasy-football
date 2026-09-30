<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import LeagueCard from '../components/leagues/LeagueCard.vue'

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
]
</script>

<template>
  <div class="min-h-screen bg-blue-300">

    <!-- Header -->

    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Leagues
          </h1>

          <p class="mt-1 text-sm text-gray-500">
            Manage your fantasy football leagues
          </p>
        </div>

        <RouterLink
          to="/leagues/create"
          class="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Create League
        </RouterLink>

      </div>
    </header>

    <!-- Content -->

    <main class="mx-auto max-w-7xl px-6 py-8">

      <!-- League count -->

      <div class="mb-5">
        <p class="text-sm text-gray-500">
          {{ leagues.length }} league{{ leagues.length === 1 ? '' : 's' }}
        </p>
      </div>

      <!-- League grid -->

      <div
        v-if="leagues.length"
        class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        <LeagueCard
          v-for="league in leagues"
          :key="league.id"
          :league="league"
        />
      </div>

      <!-- Empty state -->

      <div
        v-else
        class="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-900">
          No leagues yet
        </h2>

        <p class="mx-auto mt-2 max-w-sm text-sm text-gray-500">
          Create your first fantasy football league to get started.
        </p>

        <RouterLink
          to="/leagues/create"
          class="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Create League
        </RouterLink>
      </div>

    </main>

  </div>
</template>