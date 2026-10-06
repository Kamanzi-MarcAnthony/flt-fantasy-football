<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
})

const formatMoney = (value) => {
  return `${Number(value || 0).toFixed(1)}M`
}

const totalPoints = computed(() => {
  return Number(props.player?.totalPoints || 0)
})

const goals = computed(() => {
  return Number(props.player?.goals || 0)
})

const assists = computed(() => {
  return Number(props.player?.assists || 0)
})

const cleanSheets = computed(() => {
  return Number(props.player?.cleanSheets || 0)
})
</script>

<template>
  <div
    v-if="player"
    class="overflow-hidden rounded-3xl border border-white/10 bg-[#010056]"
  >
    <!-- ================================= -->
    <!-- PLAYER HERO -->
    <!-- ================================= -->

    <div class="relative overflow-hidden bg-gradient-to-br from-[#17176b] to-[#010056]">

      <!-- Decorative glow -->
      <div
        class="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#00EEFF]/10 blur-3xl"
      />

      <div class="relative flex items-end gap-5 px-5 pt-6 sm:px-7 sm:pt-7">

        <!-- Player image -->
        <div
          class="h-44 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:h-52 sm:w-40"
        >
          <img
            v-if="player.photoUrl"
            :src="player.photoUrl"
            :alt="player.name"
            class="h-full w-full object-cover"
          />

          <div
            v-else
            class="flex h-full w-full items-center justify-center text-5xl font-black text-white/20"
          >
            {{ player.name?.charAt(0)?.toUpperCase() }}
          </div>
        </div>

        <!-- Player identity -->
        <div class="min-w-0 flex-1 pb-5">

          <p
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00EEFF]/70"
          >
            {{ player.position }}
          </p>

          <h2
            class="mt-2 break-words text-2xl font-black uppercase leading-tight text-white sm:text-3xl"
          >
            {{ player.name }}
          </h2>

          <div class="mt-4 flex items-center gap-2">
            <span
              class="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70"
            >
              OVR {{ player.ovr }}
            </span>

            <span
              class="rounded-lg bg-[#00EEFF]/10 px-3 py-1.5 text-xs font-bold text-[#00EEFF]"
            >
              {{ formatMoney(player.price) }}
            </span>
          </div>

        </div>
      </div>
    </div>

    <!-- ================================= -->
    <!-- KEY STATS -->
    <!-- ================================= -->

    <div class="grid grid-cols-3 border-b border-white/10">

      <div class="border-r border-white/10 px-4 py-5 text-center">
        <p class="text-[9px] font-bold uppercase tracking-widest text-white/30">
          OVR
        </p>

        <p class="mt-1 text-xl font-black text-white">
          {{ player.ovr }}
        </p>
      </div>

      <div class="border-r border-white/10 px-4 py-5 text-center">
        <p class="text-[9px] font-bold uppercase tracking-widest text-white/30">
          Price
        </p>

        <p class="mt-1 text-xl font-black text-white">
          {{ formatMoney(player.price) }}
        </p>
      </div>

      <div class="px-4 py-5 text-center">
        <p class="text-[9px] font-bold uppercase tracking-widest text-white/30">
          Points
        </p>

        <p class="mt-1 text-xl font-black text-[#00EEFF]">
          {{ totalPoints }}
        </p>
      </div>

    </div>

    <!-- ================================= -->
    <!-- PERFORMANCE -->
    <!-- ================================= -->

    <div class="p-5 sm:p-6">

      <p
        class="text-[10px] font-bold uppercase tracking-widest text-white/30"
      >
        Performance
      </p>

      <div class="mt-4 grid grid-cols-3 gap-3">

        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
        >
          <p class="text-xl font-black text-white">
            {{ goals }}
          </p>

          <p class="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/30">
            Goals
          </p>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
        >
          <p class="text-xl font-black text-white">
            {{ assists }}
          </p>

          <p class="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/30">
            Assists
          </p>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
        >
          <p class="text-xl font-black text-white">
            {{ cleanSheets }}
          </p>

          <p class="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/30">
            Clean Sheets
          </p>
        </div>

      </div>
    </div>
  </div>
</template>