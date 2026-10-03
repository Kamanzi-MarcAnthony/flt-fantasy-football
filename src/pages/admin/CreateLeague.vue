<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLeagueStore } from '@/stores/leagues'
import { ArrowLeft, CalendarDays, Clock, MapPin, Trophy } from 'lucide-vue-next'
import api from '@/services/api'

const router = useRouter()
const leagueStore = useLeagueStore()

const form = ref({
  name: '',
  location: '',
  matchDay: 'Friday',
  matchTime: '',
  maxTransfers: 3,
})

const loading = ref(false)
const error = ref(null)

const createLeague = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.post('/leagues', {
  name: form.value.name.trim(),
  location: form.value.location.trim(),
  matchDay: form.value.matchDay,
  matchTime: form.value.matchTime,
  maxTransfers: Number(form.value.maxTransfers),
})

leagueStore.addLeague(response.data.data.league)

router.push('/admin/leagues')
  } catch (err) {
    console.error('Failed to create league:', err)

    error.value =
      err.response?.data?.message || 'Unable to create league. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fb] px-6 py-8">
    <div class="mx-auto max-w-3xl">

      <!-- Back -->
      <button
        type="button"
        class="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        @click="router.push('/admin/leagues')"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to leagues
      </button>

      <!-- Header -->
      <div class="mb-8">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-black">
          <Trophy class="h-6 w-6 text-white" />
        </div>

        <h1 class="text-3xl font-semibold tracking-tight text-gray-900">
          Create League
        </h1>

        <p class="mt-2 text-sm text-gray-500">
          Set up a football group and its regular match schedule.
        </p>
      </div>

      <!-- Form -->
      <form
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        @submit.prevent="createLeague"
      >
        <div class="space-y-6">

          <!-- League Name -->
          <div>
            <label
              for="name"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              League Name
            </label>

            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="e.g. Friday Football League"
              required
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-black text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
            />
          </div>

          <!-- Location -->
          <div>
            <label
              for="location"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <div class="relative">
              <MapPin
                class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />

              <input
                id="location"
                v-model="form.location"
                type="text"
                placeholder="e.g. Lugogo, Kampala"
                class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-black text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>

          <!-- Schedule -->
          <div>
            <div class="mb-3">
              <h2 class="text-sm font-semibold text-gray-900">
                Match Schedule
              </h2>

              <p class="mt-1 text-xs text-gray-500">
                Set when this group normally meets to play.
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">

              <!-- Match Day -->
              <div>
                <label
                  for="matchDay"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Match Day
                </label>

                <div class="relative">
                  <CalendarDays
                    class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    id="matchDay"
                    v-model="form.matchDay"
                    required
                    class="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <!-- Match Time -->
              <div>
                <label
                  for="matchTime"
                  class="mb-2 block text-sm font-medium text-gray-700"
                >
                  Match Time
                </label>

                <div class="relative">
                  <Clock
                    class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="matchTime"
                    v-model="form.matchTime"
                    type="time"
                    required
                    class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-black text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

              <!-- Maximum Transfers -->
              <div>
                <label
                  for="maxTransfers"
                  class="mb-2 block text-sm font-medium text-gray-700"
                > Maximum Transfers
                </label>

                <select
                  id="maxTransfers"
                  v-model.number="form.maxTransfers"
                  required
                  class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                >
                  <option :value="1">1 transfer</option>
                  <option :value="2">2 transfers</option>
                  <option :value="3">3 transfers</option>
                  <option :value="4">4 transfers</option>
                  <option :value="5">5 transfers</option>
                  <option :value="6">6 transfers</option>
                  <option :value="7">7 transfers</option>
                </select>

                <p class="mt-2 text-xs text-gray-500">
                  Number of player transfers each fantasy team can make during a transfer window.
                </p>
              </div>

            </div>
          </div>

          <!-- Info -->
          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm leading-6 text-gray-600">
              This league has no fixed end date. Matchdays will continue based
              on the schedule you set above.
            </p>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ error }}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              class="rounded-xl px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              @click="router.push('/admin/leagues')"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'Creating...' : 'Create League' }}
            </button>
          </div>

        </div>
      </form>
    </div>
  </div>
</template>