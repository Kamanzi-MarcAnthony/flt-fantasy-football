<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  player: {
    type: Object,
    default: null,
  },
  isCaptain: {
    type: Boolean,
    default: false,
  },
  isViceCaptain: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
  'make-captain',
  'make-vice-captain',
])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-sm rounded-2xl border border-white/10 bg-[#081516] p-5 shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40">
            Select role
          </p>

          <h2 class="mt-1 text-lg font-semibold text-white">
            {{ player?.name }}
          </h2>
        </div>

        <button
          type="button"
          class="rounded-full p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Player -->
      <div class="mt-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div
          class="h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/10"
        >
          <img
            v-if="player?.photoUrl"
            :src="player.photoUrl"
            :alt="player?.name"
            class="h-full w-full object-cover"
          />

          <span
            v-else
            class="flex h-full w-full items-center justify-center text-xl font-bold text-white/40"
          >
            {{ player?.name?.charAt(0) }}
          </span>
        </div>

        <div>
          <p class="font-semibold">
            {{ player?.name }}
          </p>

          <p class="mt-1 text-xs text-white/40">
            {{ player?.position }} · OVR {{ player?.ovr }}
          </p>

          <p class="mt-1 text-xs text-white/40">
            {{ Number(player?.price).toFixed(1) }}M
          </p>
        </div>
      </div>

      <!-- Actions -->
<button
  type="button"
  class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
  :disabled="isCaptain"
  @click="emit('make-captain')"
>
  <span>Make Captain</span>

  <span v-if="isCaptain" class="text-xs text-white/40">
    Current Captain
  </span>
</button>

<button
  type="button"
  class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
  :disabled="isViceCaptain"
  @click="emit('make-vice-captain')"
>
  <span>Make Vice Captain</span>

  <span v-if="isViceCaptain" class="text-xs text-white/40">
    Current Vice Captain
  </span>
</button>

      <button
        type="button"
        class="mt-4 w-full py-2 text-sm text-white/40 transition hover:text-white"
        @click="emit('close')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>