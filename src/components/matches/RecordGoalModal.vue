<script setup>
import { ref, computed, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  players: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const scorerId = ref('')
const assistId = ref('')
const error = ref('')

const availableAssistPlayers = computed(() => {
  return props.players.filter(
    (player) => String(player.id) !== String(scorerId.value),
  )
})

watch(
  () => scorerId.value,
  () => {
    if (
      assistId.value &&
      String(assistId.value) === String(scorerId.value)
    ) {
      assistId.value = ''
    }
  },
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      scorerId.value = ''
      assistId.value = ''
      error.value = ''
    }
  },
)

const handleSubmit = () => {
  error.value = ''

  if (!scorerId.value) {
    error.value = 'Goal scorer is required.'
    return
  }

  emit('submit', {
    scorerId: Number(scorerId.value),
    assistId: assistId.value
      ? Number(assistId.value)
      : null,
  })
}

const handleClose = () => {
  if (props.loading) return

  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111c1d] shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-white/10 px-6 py-5"
      >
        <div>
          <h2 class="text-lg font-semibold text-white">
            Record Goal
          </h2>

          <p class="mt-1 text-sm text-white/40">
            Record a goal and optional assist.
          </p>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          :disabled="loading"
          @click="handleClose"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <form
        class="space-y-5 p-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Goal Scorer -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Goal Scorer *
          </label>

          <select
            v-model="scorerId"
            class="w-full rounded-xl border border-white/10 bg-[#111c1d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="">
              Select player
            </option>

            <option
              v-for="player in players"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }}
            </option>
          </select>
        </div>

        <!-- Assist -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Assist
            <span class="text-white/30">(optional)</span>
          </label>

          <select
            v-model="assistId"
            class="w-full rounded-xl border border-white/10 bg-[#111c1d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="">
              No assist
            </option>

            <option
              v-for="player in availableAssistPlayers"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }}
            </option>
          </select>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            :disabled="loading"
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#111c1d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Loader2
              v-if="loading"
              class="mr-2 h-4 w-4 animate-spin"
            />

            {{ loading ? 'Recording...' : 'Record Goal' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>