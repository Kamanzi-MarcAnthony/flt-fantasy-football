<script setup>
import { Trophy, Users, ChevronRight } from 'lucide-vue-next'

defineProps({
  league: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <RouterLink :to="`/admin/leagues/${league.id}`"
    class="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-white/20 hover:bg-white/[0.1]">
    <!-- League icon -->

    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
      <Trophy class="h-6 w-6 text-white" />
    </div>

    <!-- League information -->

    <div class="w-2/2 flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <h3 class="truncate text-base font-semibold text-white">
          {{ league.name }}
        </h3>

        <span
          class="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          {{ league.status }}
        </span>
      </div>

      <p class="mt-1 text-sm text-white/50">
        {{ league.location }}
      </p>

      <div class="mt-2 flex items-center gap-4 text-xs text-white/40">
        <!-- <span>
          {{ league.startDate }} — {{ league.endDate }}
        </span> -->

        <span class="flex items-center gap-1">
          <Users class="h-3.5 w-3.5" />
          {{ league.playerCount }} players
        </span>
      </div>
    </div>

    <!-- Arrow -->

    <!-- <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition group-hover:border-white/20 group-hover:text-white">
      <ChevronRight class="h-5 w-5" />
    </div> -->
  </RouterLink>
</template>