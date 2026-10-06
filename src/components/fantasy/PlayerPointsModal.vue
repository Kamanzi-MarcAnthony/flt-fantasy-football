<script setup>
defineProps({
  player: {
    type: Object,
    default: null,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible'])
</script>

<template>
  <div
    v-if="visible && player"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    @click.self="emit('update:visible', false)"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#24002d] shadow-2xl"
    >
      <!-- Header -->
      <div class="relative px-5 pb-5 pt-6 text-center">
        <button
          type="button"
          class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          @click="emit('update:visible', false)"
        >
          ×
        </button>

        <!-- Player Photo -->
        <div
          class="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/10"
        >
          <img
            v-if="player.photoUrl"
            :src="player.photoUrl"
            :alt="player.name"
            class="h-full w-full object-cover"
          />

          <div
            v-else
            class="flex h-full w-full items-center justify-center text-2xl font-bold text-white"
          >
            {{ player.name?.charAt(0) }}
          </div>
        </div>

        <h2 class="text-lg font-bold text-white">
          {{ player.name }}
        </h2>

        <p class="mt-1 text-xs text-white/50">
          {{ player.position }}
          <span v-if="player.ovr">
            · OVR {{ player.ovr }}
          </span>
        </p>
      </div>

      <!-- Breakdown -->
      <div class="border-t border-white/10 px-5 py-5">
        <p
          class="mb-4 text-xs font-semibold uppercase tracking-wide text-white/40"
        >
          Points Breakdown
        </p>

        <div
          v-if="player.breakdown && player.breakdown.length > 0"
          class="space-y-3"
        >
          <div
            v-for="(item, index) in player.breakdown"
            :key="`${item.type}-${index}`"
            class="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-white">
                {{ item.label }}
              </p>

              <p
                v-if="item.detail"
                class="mt-0.5 text-xs text-white/40"
              >
                {{ item.detail }}
              </p>
            </div>

            <p class="text-sm font-bold text-white">
              +{{ item.points }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="py-5 text-center text-sm text-white/40"
        >
          No points awarded yet.
        </div>

        <!-- Total -->
<!-- Gameweek Points -->
<div class="mt-5 rounded-xl bg-white/5 px-4 py-4">
  <p class="text-xs uppercase tracking-wide text-white/40">
    Gameweek Points
  </p>

  <p class="mt-1 text-3xl font-bold text-white">
    {{ player.points ?? 0 }}
  </p>
</div>
      </div>
    </div>
  </div>
</template>