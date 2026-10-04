<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Pencil,
  Trophy,
  Users,
} from 'lucide-vue-next'
import api from '../../services/api'
import PlayerFormModal from '../../components/players/PlayerFormModal.vue'

const route = useRoute()
const router = useRouter()

const player = ref(null)
const loading = ref(true)
const error = ref(null)

const showEditModal = ref(false)
const playerSaving = ref(false)

const fetchPlayer = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/players/${route.params.id}`)

    player.value = response.data.data.player
  } catch (err) {
    console.error('Failed to fetch player:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to load player.'
  } finally {
    loading.value = false
  }
}

const statValue = (value) => {
  return value === null || value === undefined ? '-' : value
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return '-'

  return Number(price).toLocaleString()
}

const handlePlayerUpdate = async (playerData) => {
  console.log('UPDATE PAYLOAD:', playerData)

  playerSaving.value = true

  try {
    const response = await api.patch(
      `/players/${player.value.id}`,
      playerData,
    )

    console.log('UPDATE RESPONSE:', response.data)

    showEditModal.value = false

    await fetchPlayer()
  } catch (err) {
    console.error(
      'UPDATE ERROR:',
      err.response?.data || err,
    )
  } finally {
    playerSaving.value = false
  }
}

onMounted(() => {
  fetchPlayer()
})
</script>

<template>
  <div class="min-h-screen bg-[#061112] text-white">

    <!-- Header -->
    <header class="border-b border-white/10 px-5 py-5 sm:px-8">
      <div class="mx-auto flex max-w-5xl items-center justify-between">

        <button
          type="button"
          class="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Players
        </button>

        <button
            v-if="player"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            @click="showEditModal = true"
        >
        <Pencil class="h-4 w-4" />
            Edit Player
        </button>

      </div>
    </header>


    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-[70vh] items-center justify-center"
    >
      <div class="text-center">
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
        ></div>

        <p class="mt-4 text-sm text-white/40">
          Loading player...
        </p>
      </div>
    </div>


    <!-- Error -->
    <div
      v-else-if="error"
      class="mx-auto max-w-xl px-5 py-20 text-center"
    >
      <h2 class="text-xl font-semibold">
        Unable to load player
      </h2>

      <p class="mt-2 text-sm text-white/40">
        {{ error }}
      </p>

      <button
        type="button"
        class="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
        @click="router.back()"
      >
        Go Back
      </button>
    </div>


    <!-- Player -->
    <main
      v-else-if="player"
      class="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10"
    >

      <div class="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">

        <!-- Player card -->
        <section
          class="relative min-h-[650px] overflow-hidden bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#061112]"
        >

          <!-- Decorative background -->
          <div
            class="pointer-events-none absolute inset-0 opacity-30"
          >
            <div
              class="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-white/[0.05] blur-3xl"
            ></div>
          </div>


          <!-- OVR -->
          <div class="absolute left-8 top-8 z-10 sm:left-12 sm:top-12">
            <p
              class="text-7xl font-black leading-none tracking-tighter sm:text-8xl"
            >
              {{ player.ovr }}
            </p>

            <p class="mt-1 text-sm font-bold uppercase tracking-[0.3em] text-white/40">
              OVR
            </p>
          </div>


          <!-- Position -->
          <div class="absolute right-8 top-10 z-10 sm:right-12 sm:top-12">
            <span
              class="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold tracking-widest text-white/60 backdrop-blur"
            >
              {{ player.position }}
            </span>
          </div>


          <!-- Player image -->
          <div class="relative z-10 flex min-h-[500px] items-end justify-center pt-28">

            <div
              v-if="player.photoUrl"
              class="relative h-[430px] w-full max-w-[430px]"
            >
              <img
                :src="player.photoUrl"
                :alt="player.name"
                class="h-full w-full object-contain object-bottom"
              />
            </div>

            <div
              v-else
              class="mb-10 flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]"
            >
              <Users class="h-20 w-20 text-white/20" />
            </div>

          </div>


          <!-- Name -->
          <div class="relative z-20 px-8 pb-10 text-center">

            <h1
              class="text-4xl font-black uppercase tracking-tight sm:text-5xl"
            >
              {{ player.name }}
            </h1>

            <p class="mt-2 text-sm font-medium uppercase tracking-[0.25em] text-white/40">
              {{ player.position }}
            </p>

          </div>

        </section>


        <!-- Player information -->
        <section class="border-t border-white/10">

          <!-- Price -->
          <div class="border-b border-white/10 px-6 py-8 sm:px-10">

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Fantasy Price
                </p>

                <p class="mt-2 text-3xl font-bold">
                  {{ formatPrice(player.price) }}
                </p>
              </div>

              <Trophy class="h-6 w-6 text-white/20" />
            </div>

          </div>


          <!-- Performance -->
          <div class="px-6 py-8 sm:px-10">

            <div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                Performance
              </p>

              <div class="mt-6 grid grid-cols-3 divide-x divide-white/10">

                <div class="text-center">
                  <p class="text-3xl font-bold">
                    {{ statValue(player.stats?.goals) }}
                  </p>

                  <p class="mt-2 text-xs uppercase tracking-widest text-white/30">
                    Goals
                  </p>
                </div>

                <div class="text-center">
                  <p class="text-3xl font-bold">
                    {{ statValue(player.stats?.assists) }}
                  </p>

                  <p class="mt-2 text-xs uppercase tracking-widest text-white/30">
                    Assists
                  </p>
                </div>

                <div class="text-center">
                  <p class="text-3xl font-bold">
                    {{ statValue(player.stats?.cleanSheets) }}
                  </p>

                  <p class="mt-2 text-xs uppercase tracking-widest text-white/30">
                    Clean Sheets
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
<PlayerFormModal
  :open="showEditModal"
  :player="player"
  :loading="playerSaving"
  @close="showEditModal = false"
  @submit="handlePlayerUpdate"
/>
  </div>
</template>