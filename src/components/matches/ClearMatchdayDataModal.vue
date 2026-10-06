<script setup>
import { computed } from 'vue'
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  matchday: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'update:visible',
  'confirm',
])

const close = () => {
  if (props.loading) return

  emit('update:visible', false)
}

const confirmClear = () => {
  if (props.loading) return

  emit('confirm')
}

const matchdayLabel = computed(() => {
  if (!props.matchday) return 'this matchday'

  if (props.matchday.number) {
    return `Gameweek ${props.matchday.number}`
  }

  return 'this matchday'
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    @click.self="close"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#24002d] shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-start justify-between px-5 pt-5">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10"
        >
          <AlertTriangle class="h-5 w-5 text-red-400" />
        </div>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          :disabled="loading"
          @click="close"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="px-5 pb-5 pt-4">
        <h2 class="text-lg font-bold text-white">
          Clear Matchday Data?
        </h2>

        <p class="mt-2 text-sm leading-6 text-white/50">
          This will permanently remove all recorded data for
          <span class="font-medium text-white/80">
            {{ matchdayLabel }}
          </span>.
        </p>

        <!-- What will be cleared -->
        <div
          class="mt-5 rounded-xl border border-red-400/10 bg-red-400/5 p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-red-300">
            The following will be cleared
          </p>

          <ul class="mt-3 space-y-2">
            <li class="flex items-center gap-2 text-sm text-white/70">
              <span class="h-1.5 w-1.5 rounded-full bg-red-400" />
              Goals
            </li>

            <li class="flex items-center gap-2 text-sm text-white/70">
              <span class="h-1.5 w-1.5 rounded-full bg-red-400" />
              Assists
            </li>

            <li class="flex items-center gap-2 text-sm text-white/70">
              <span class="h-1.5 w-1.5 rounded-full bg-red-400" />
              Clean sheets
            </li>

            <li class="flex items-center gap-2 text-sm text-white/70">
              <span class="h-1.5 w-1.5 rounded-full bg-red-400" />
              Fantasy points and bonus points
            </li>
          </ul>
        </div>

        <!-- Important note -->
        <div class="mt-4 flex gap-3 rounded-xl bg-white/5 p-4">
          <AlertTriangle
            class="mt-0.5 h-4 w-4 shrink-0 text-yellow-400"
          />

          <p class="text-xs leading-5 text-white/50">
            Players, fantasy teams and the matchday itself will
            <span class="text-white/80">not</span>
            be deleted. Only the recorded match data will be removed.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4"
      >
        <button
          type="button"
          class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </button>

        <button
          type="button"
          class="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          @click="confirmClear"
        >
          <svg
            v-if="loading"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="3"
              class="opacity-30"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>

          <Trash2
            v-else
            class="h-4 w-4"
          />

          {{ loading ? 'Clearing...' : 'Clear Matchday Data' }}
        </button>
      </div>
    </div>
  </div>
</template>