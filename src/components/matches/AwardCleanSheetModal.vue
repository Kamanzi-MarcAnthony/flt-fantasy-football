<script setup>
import { ref, computed, watch } from 'vue'
import { Check, X, Loader2 } from 'lucide-vue-next'

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

const selectedPlayerIds = ref([])
const error = ref('')

const allSelected = computed(() => {
  return (
    props.players.length > 0 &&
    selectedPlayerIds.value.length === props.players.length
  )
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      selectedPlayerIds.value = []
      error.value = ''
    }
  },
)

const togglePlayer = (playerId) => {
  const id = Number(playerId)

  if (selectedPlayerIds.value.includes(id)) {
    selectedPlayerIds.value =
      selectedPlayerIds.value.filter(
        (selectedId) => selectedId !== id,
      )
  } else {
    selectedPlayerIds.value.push(id)
  }
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedPlayerIds.value = []
  } else {
    selectedPlayerIds.value = props.players.map(
      (player) => player.id,
    )
  }
}

const handleSubmit = () => {
  error.value = ''

  if (selectedPlayerIds.value.length === 0) {
    error.value =
      'Select at least one player who kept a clean sheet.'
    return
  }

  emit('submit', {
    playerIds: selectedPlayerIds.value,
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
      class="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#111c1d] shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-white/10 px-6 py-5"
      >
        <div>
          <h2 class="text-lg font-semibold text-white">
            Award Clean Sheets
          </h2>

          <p class="mt-1 text-sm text-white/40">
            Select all players who kept a clean sheet.
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

      <div class="p-6">
        <!-- Select all -->
        <button
          type="button"
          class="mb-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.06]"
          :disabled="loading"
          @click="toggleAll"
        >
          <span class="font-medium">
            {{ allSelected ? 'Deselect all' : 'Select all' }}
          </span>

          <span class="text-white/40">
            {{ selectedPlayerIds.length }}/{{ players.length }}
          </span>
        </button>

        <!-- Players -->
        <div
          class="max-h-80 space-y-2 overflow-y-auto pr-1"
        >
          <button
            v-for="player in players"
            :key="player.id"
            type="button"
            :disabled="loading"
            class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition"
            :class="
              selectedPlayerIds.includes(player.id)
                ? 'border-white/20 bg-white/[0.08]'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
            "
            @click="togglePlayer(player.id)"
          >
            <span class="text-sm font-medium">
              {{ player.name }}
            </span>

            <span
              class="flex h-6 w-6 items-center justify-center rounded-full border"
              :class="
                selectedPlayerIds.includes(player.id)
                  ? 'border-white bg-white text-[#111c1d]'
                  : 'border-white/20 text-transparent'
              "
            >
              <Check class="h-4 w-4" />
            </span>
          </button>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-6">
          <button
            type="button"
            :disabled="loading"
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="loading"
            class="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#111c1d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleSubmit"
          >
            <Loader2
              v-if="loading"
              class="mr-2 h-4 w-4 animate-spin"
            />

            {{
              loading
                ? 'Awarding...'
                : 'Award Clean Sheets'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>