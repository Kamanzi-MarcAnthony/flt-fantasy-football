<script setup>
import { onMounted, ref } from 'vue'
import { MoreVertical, Users } from 'lucide-vue-next'
import api from '../../services/api'

const players = ref([])
const loading = ref(true)
const error = ref(null)
const openMenuId = ref(null)

const fetchPlayers = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/players')

    players.value = response.data.data.players
  } catch (err) {
    console.error('Failed to fetch players:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load players.'
  } finally {
    loading.value = false
  }
}

const toggleMenu = (playerId) => {
  openMenuId.value =
    openMenuId.value === playerId ? null : playerId
}

const closeMenu = () => {
  openMenuId.value = null
}

onMounted(fetchPlayers)
</script>

<template>
  <div class="min-h-screen">

    <!-- Header -->

    <header class="px-5 pb-5 pt-6 sm:px-8 lg:px-12">
      <div class="mx-auto flex max-w-6xl items-center justify-between">

        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            Players
          </h1>

          <p class="mt-1 text-sm text-white/40">
            All players across your leagues.
          </p>
        </div>

      </div>
    </header>


    <!-- Content -->

    <main class="px-5 pb-10 sm:px-8 lg:px-12">

      <div class="mx-auto max-w-6xl">

        <!-- Loading -->

        <div
          v-if="loading"
          class="flex min-h-[350px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <p class="text-sm text-white/40">
            Loading players...
          </p>
        </div>


        <!-- Error -->

        <div
          v-else-if="error"
          class="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-red-500/10 bg-red-500/[0.03] px-5 text-center"
        >
          <p class="text-sm text-red-300">
            {{ error }}
          </p>

          <button
            type="button"
            class="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            @click="fetchPlayers"
          >
            Try Again
          </button>
        </div>


        <!-- Players -->

        <div
          v-else-if="players.length"
          class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >

          <!-- Table header -->

          <div
            class="grid grid-cols-[minmax(0,3fr)_45px_70px_70px_36px] items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30 sm:grid-cols-[minmax(0,1fr)_100px_80px_100px_44px] sm:gap-3 sm:px-6"
          >
            <span>
              Player
            </span>

            <span class="text-right">
              OVR
            </span>

            <span class="text-right">
              Price
            </span>

            <span class="text-right">
              League
            </span>

            <span></span>
          </div>


          <!-- Rows -->

          <div class="divide-y divide-white/10">

            <div
              v-for="player in players"
              :key="player.id"
              class="grid grid-cols-[minmax(0,3fr)_45px_70px_70px_36px] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_80px_100px_44px] sm:gap-3 sm:px-6"
            >

              <!-- Player -->

              <div class="flex min-w-0 items-center gap-3">

                <!-- Portrait -->

                <div
                  class="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
                >
                  <img
                    v-if="player.photoUrl"
                    :src="player.photoUrl"
                    :alt="player.name"
                    class="h-full w-full object-cover"
                  />

                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-xs font-semibold text-white/30"
                  >
                    {{ player.name?.charAt(0)?.toUpperCase() }}
                  </div>
                </div>


                <!-- Name + position -->

                <div class="min-w-0">

                  <p class="truncate text-sm font-medium text-white">
                    {{ player.name }}
                  </p>

                  <p class="mt-0.5 text-xs text-white/40">
                    {{ player.position }}
                  </p>

                </div>

              </div>


              <!-- OVR -->

              <div class="text-right">
                <span class="text-sm font-semibold text-white">
                  {{ player.ovr }}
                </span>
              </div>


              <!-- Price -->

              <div class="text-right">
                <span class="text-sm font-medium text-white/70">
                  {{ player.price }}
                </span>
              </div>


              <!-- League -->

              <div class="min-w-0 text-right">
                <span
                  class="block truncate text-sm text-white/60"
                  :title="player.league?.name"
                >
                  {{ player.league?.name || '—' }}
                </span>
              </div>


              <!-- Actions -->

              <div class="relative flex justify-end">

                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                  @click="toggleMenu(player.id)"
                >
                  <MoreVertical class="h-4 w-4" />
                </button>


                <!-- Menu -->

                <div
                  v-if="openMenuId === player.id"
                  class="absolute right-0 top-11 z-30 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#111c1d] p-1.5 shadow-2xl"
                >

                  <button
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    @click="closeMenu"
                  >
                    Edit Player
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>


        <!-- Empty -->

        <div
          v-else
          class="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-5 text-center"
        >

          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10"
          >
            <Users class="h-6 w-6 text-white/50" />
          </div>

          <h3 class="mt-5 font-semibold">
            No players yet
          </h3>

          <p class="mt-2 max-w-xs text-sm leading-6 text-white/40">
            Players added to your leagues will appear here.
          </p>

        </div>

      </div>

    </main>

  </div>
</template>