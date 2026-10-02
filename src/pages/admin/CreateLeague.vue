<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const form = ref({
  name: '',
  startDate: '',
  endDate: '',
  recurring: false,
  recurrenceType: '',
  location: '',
})

const scoringConfig = {
  goals: {
    enabled: true,
    GK: 7,
    DEF: 6,
    MID: 5,
    ST: 4,
  },

  assists: {
    enabled: true,
    GK: 3,
    DEF: 3,
    MID: 3,
    ST: 3,
  },

  cleanSheets: {
    enabled: true,
    GK: 4,
    DEF: 4,
    MID: 2,
    ST: 1,
  },

  bonus: {
    enabled: true,
    twoOrMoreGoals: 3,
    lessThanTwoGoals: 1,
  },
}

const loading = ref(false)
const error = ref(null)

const createLeague = async () => {
  loading.value = true
  error.value = null

  try {
    await api.post('/leagues', {
      ...form.value,
      scoringConfig,
    })

    router.push('/admin/leagues')
  } catch (err) {
    console.error('Failed to create league:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to create league.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#061112] px-5 py-8 text-white">
    <div class="mx-auto max-w-2xl">

      <!-- Header -->

      <div class="mb-8">
        <button type="button" class="mb-4 text-sm text-white/40 hover:text-white" @click="router.back()">
          ← Back
        </button>

        <h1 class="text-3xl font-bold">
          Create League
        </h1>

        <p class="mt-2 text-sm text-white/40">
          Set up a new fantasy football competition.
        </p>
      </div>

      <!-- Form -->

      <form class="space-y-6" @submit.prevent="createLeague">

        <!-- League name -->

        <div>
          <label class="mb-2 block text-sm font-medium">
            League name
          </label>

          <input v-model="form.name" type="text" placeholder="Friday Office League" required
            class="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-white/30" />
        </div>

        <!-- Location -->

        <div>
          <label class="mb-2 block text-sm font-medium">
            Location
          </label>

          <input v-model="form.location" type="text" placeholder="Kampala"
            class="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-white/30" />
        </div>

        <!-- Dates -->

        <div class="grid gap-4 sm:grid-cols-2">

          <div>
            <label class="mb-2 block text-sm font-medium">
              Start date
            </label>

            <input v-model="form.startDate" type="date" required
              class="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none focus:border-white/30" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium">
              End date
            </label>

            <input v-model="form.endDate" type="date" required
              class="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none focus:border-white/30" />
          </div>

        </div>

        <!-- Recurring -->

        <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <input v-model="form.recurring" type="checkbox" class="h-4 w-4" />

          <div>
            <p class="text-sm font-medium">
              Recurring league
            </p>

            <p class="mt-1 text-xs text-white/40">
              Automatically create future editions of this league.
            </p>
          </div>
        </label>

        <!-- Error -->

        <div v-if="error" class="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-300">
          {{ error }}
        </div>

        <!-- Submit -->

        <button type="submit" :disabled="loading"
          class="w-full rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50">
          {{ loading ? 'Creating league...' : 'Create League' }}
        </button>

      </form>

    </div>
  </div>
</template>