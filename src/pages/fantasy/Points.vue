<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed } from 'vue'
import FantasyPitch from '../../components/fantasy/FantasyPitch.vue'

const props = defineProps({
  team: {
    type: Object,
    required: true,
  },
})

// Temporary points for UI testing.
// We'll replace this with real gameweek points from the backend later.
const playerPoints = computed(() => {
  const points = {}

  props.team.players.forEach((item, index) => {
    points[item.player.id] = [6, 3, 8, 2, 5, 7, 4, 9, 3][index] || 0
  })

  return points
})

const totalPoints = computed(() => {
  return Object.values(playerPoints.value).reduce(
    (total, points) => total + points,
    0,
  )
})
</script>

<template>
  <div class="md:w-2/3 w-full flex flex-col gap-4">

    <!-- Points Card -->
<!-- Points Summary -->
<section
  class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#24002d] px-3 py-3"
>
  <div class="grid grid-cols-3 items-center">

    <!-- Highest Points -->
    <div class="text-center">
      <p class="text-[10px] font-medium uppercase tracking-wide text-white/40">
        Highest
      </p>

      <p class="mt-1 text-sm font-bold text-white">
        135
      </p>

      <p class="mt-0.5 text-[9px] text-white/40">
        Points
      </p>
    </div>

    <!-- Total Points -->
    <div
      class="relative -my-1 flex min-h-[78px] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#00e5ff] via-[#29b6f6] to-[#7557ff] shadow-lg shadow-cyan-500/10"
    >
      <p class="text-[10px] font-medium text-[#010056]/70">
        Total Points
      </p>

      <p class="mt-0.5 text-3xl font-black leading-none text-[#010056]">
        {{ totalPoints }}
      </p>
    </div>

    <!-- Transfers -->
    <div class="text-center">
      <p class="text-[10px] font-medium uppercase tracking-wide text-white/40">
        Transfers
      </p>

      <p class="mt-1 text-sm font-bold text-white">
        0
      </p>

      <p class="mt-0.5 text-[9px] text-white/40">
        This Gameweek
      </p>
    </div>

  </div>
</section>

    <!-- Pitch -->
    <FantasyPitch
      :players="team.players.map((item) => item.player)"
      :captain-id="team.captainId"
      :vice-captain-id="team.viceCaptainId"
      stat-type="points"
      :player-points="playerPoints"
    />

  </div>
</template>