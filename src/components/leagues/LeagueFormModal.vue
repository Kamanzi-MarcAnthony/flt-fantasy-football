<script setup>
import { ref, computed, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  league: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  location: '',
  matchDay: 'Friday',
  matchTime: '19:00',
  maxTransfers: 3,
})

const error = ref('')

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const isEditMode = computed(() => !!props.league)

const title = computed(() =>
  isEditMode.value ? 'Edit League' : 'Create League',
)

const description = computed(() =>
  isEditMode.value
    ? 'Update this league’s settings'
    : 'Create a new Friday football league',
)

const submitLabel = computed(() => {
  if (props.loading) {
    return isEditMode.value ? 'Saving...' : 'Creating...'
  }

  return isEditMode.value ? 'Save Changes' : 'Create League'
})

const populateForm = (league) => {
  error.value = ''

  if (league) {
    form.value = {
      name: league.name || '',
      location: league.location || '',
      matchDay: league.matchDay || 'Friday',
      matchTime: league.matchTime || '19:00',
      maxTransfers: league.maxTransfers ?? 3,
    }
  } else {
    form.value = {
      name: '',
      location: '',
      matchDay: 'Friday',
      matchTime: '19:00',
      maxTransfers: 3,
    }
  }
}

watch(
  () => [props.open, props.league],
  ([open, league]) => {
    if (!open) return

    populateForm(league)
  },
  {
    immediate: true,
  },
)

const handleSubmit = () => {
  error.value = ''

  if (!form.value.name.trim()) {
    error.value = 'League name is required.'
    return
  }

  if (!form.value.matchDay) {
    error.value = 'Match day is required.'
    return
  }

  if (!form.value.matchTime) {
    error.value = 'Match time is required.'
    return
  }

  const maxTransfers = Number(form.value.maxTransfers)

  if (
    !Number.isInteger(maxTransfers) ||
    maxTransfers < 1 ||
    maxTransfers > 7
  ) {
    error.value = 'Maximum transfers must be between 1 and 7.'
    return
  }

  emit('submit', {
    id: props.league?.id,
    name: form.value.name.trim(),
    location: form.value.location.trim(),
    matchDay: form.value.matchDay,
    matchTime: form.value.matchTime,
    maxTransfers,
  })
}

const handleClose = () => {
  if (props.loading) return

  error.value = ''
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
            {{ title }}
          </h2>

          <p class="mt-1 text-sm text-white/40">
            {{ description }}
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
        <!-- League Name -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            League Name
          </label>

          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Friday Ballers"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
          />
        </div>

        <!-- Location -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Location
          </label>

          <input
            v-model="form.location"
            type="text"
            placeholder="e.g. Kampala"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
          />
        </div>

        <!-- Match Day + Time -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-white/80">
              Match Day
            </label>

            <select
              v-model="form.matchDay"
              class="w-full rounded-xl border border-white/10 bg-[#111c1d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              <option
                v-for="day in days"
                :key="day"
                :value="day"
              >
                {{ day }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-white/80">
              Match Time
            </label>

            <input
              v-model="form.matchTime"
              type="time"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            />
          </div>
        </div>

        <!-- Max Transfers -->
        <div>
          <label class="mb-2 block text-sm font-medium text-white/80">
            Maximum Transfers
          </label>

          <input
            v-model="form.maxTransfers"
            type="number"
            min="1"
            max="7"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          />

          <p class="mt-2 text-xs text-white/30">
            Maximum number of player transfers allowed per matchday.
          </p>
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
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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

            {{ submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>