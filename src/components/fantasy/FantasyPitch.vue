<script setup>
const props = defineProps({
  players: {
    type: Array,
    default: () => [],
  },

  captainId: {
    type: [Number, String, null],
    default: null,
  },

  viceCaptainId: {
    type: [Number, String, null],
    default: null,
  },

  // "ovr" on My Team, "points" on Points
  statType: {
    type: String,
    default: 'ovr',
  },

  playerPoints: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['player-click'])

const getPlayerPoints = (player) => {
  return Number(props.playerPoints[player.id] || 0)
}

const getDisplayedStat = (player) => {
  if (props.statType === 'points') {
    return getPlayerPoints(player)
  }

  return player.ovr
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f721c]"
  >
    <!-- ========================================================= -->
    <!-- PITCH MARKINGS -->
    <!-- ========================================================= -->

    <div class="pointer-events-none absolute inset-0">

      <!-- Outer box -->
      <div
        class="absolute inset-2 rounded-xl border border-white/20"
      ></div>

      <!-- Halfway line -->
      <div
        class="absolute left-1/2 top-1/2 h-px w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 bg-white/20"
      ></div>

      <!-- Centre circle -->
      <div
        class="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
      ></div>

      <!-- Top penalty arc -->
      <div
        class="absolute left-1/2 top-2 h-12 w-32 -translate-x-1/2 rounded-b-full border-x border-b border-white/15"
      ></div>

      <!-- Bottom penalty arc -->
      <div
        class="absolute bottom-2 left-1/2 h-12 w-32 -translate-x-1/2 rounded-t-full border-x border-t border-white/15"
      ></div>
    </div>

    <!-- ========================================================= -->
    <!-- 3 × 3 PLAYER GRID -->
    <!-- ========================================================= -->

    <div
      class="relative grid min-h-140 grid-cols-3 grid-rows-3 gap-4 p-4 sm:p-14"
    >
      <div
        v-for="(player, index) in players"
        :key="player.id || index"
        class="flex items-center justify-center"
      >
        <!-- Player -->
        <button
          type="button"
          class="flex flex-col items-center"
          @click="emit('player-click', player)"
        >

          <!-- ================================================= -->
          <!-- PLAYER CARD -->
          <!-- ================================================= -->

          <div
            class="relative h-28 w-25 md:w-30 md:h-32 overflow-hidden rounded-lg border border-white/15 bg-[#010056] shadow-lg sm:h-[120px] sm:w-[88px]"
          >

            <!-- =============================================== -->
            <!-- TOP 80% -->
            <!-- =============================================== -->

            <div class="flex h-[70%]">

              <!-- =========================================== -->
              <!-- PLAYER IMAGE - 70% -->
              <!-- =========================================== -->

              <div
                class="relative w-[70%] overflow-hidden bg-white/10"
              >
                <img
                  v-if="player.photoUrl"
                  :src="player.photoUrl"
                  :alt="player.name"
                  class="h-full w-full object-cover"
                />

                <!-- Fallback -->
                <span
                  v-else
                  class="flex h-full w-full items-center justify-center text-xl font-bold  text-white/40"
                >
                  {{ player.name?.charAt(0) || '?' }}
                </span>
              </div>

              <!-- =========================================== -->
              <!-- OVR / POINTS + POSITION - 30% -->
              <!-- =========================================== -->

              <div
                class="flex flex-col w-10 items-center justify-between py-2 bg-black/30 pt-2"
              >

                <!-- OVR / Points -->
                <p
                  class="text-base font-black leading-none text-white"
                >
                {{ getDisplayedStat(player) }}
                </p>

                <!-- Position -->
                <p
                  class="mt-2 text-[8px] font-bold uppercase tracking-wide text-white/60"
                >
                  {{ player.position }}
                </p>
              </div>
            </div>

            <!-- =============================================== -->
            <!-- BOTTOM 20% - PLAYER NAME -->
            <!-- =============================================== -->

            <div
              class="flex h-[30%] items-center justify-center border-t border-white/10 bg-[#010056] px-1.5"
            >
              <p
                class="w-full uppercase truncate text-center text-[10px] font-bold leading-none text-white"
              >
                {{ player.name }}
              </p>
            <!-- =============================================== -->
            <!-- CAPTAIN -->
            <!-- =============================================== -->

              <span 
                v-if="captainId === player.id"
                class="flex h-5 w-6 items-center justify-center rounded-full bg-[#00EEFF] text-[9px] font-black text-violet-950 shadow-lg"
              >C</span>
              
            <!-- =============================================== -->
            <!-- VICE CAPTAIN -->
            <!-- =============================================== -->

              <span
              v-else-if="viceCaptainId === player.id"
              class="flex h-5 w-6 items-center justify-center rounded-full bg-[#00EEFF] text-[8px] font-black text-violet-950 shadow-lg"
            >
              VC
            </span>
            </div>

          </div>

        </button>
      </div>
    </div>
  </section>
</template>