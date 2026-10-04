<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useRouter } from 'vue-router'
import pitch from '../../assets/images/pitch.jpg'

const router = useRouter()

const handleStart = () => {
  router.push('/fantasy/join-league')
}
</script>

<template>
  <div
    class="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
    :style="{ backgroundImage: `url(${pitch})` }"
  >
    <div
      class="absolute inset-0 bg-black/60"
    ></div>

    <div
      class="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-sm outline outline-blue-500/75 text-center"
    >
      <div class="mb-8">
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style="background-color: #010056"
        >
          ⚽
        </div>

        <h1 class="text-3xl font-semibold text-white">
          Build your fantasy team
        </h1>

        <p class="mt-4 text-sm leading-6 text-white/80">
          Join a league, pick your players, and compete with your
          friends for the top spot.
        </p>
      </div>

      <button
        type="button"
        @click="handleStart"
        class="w-full rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-black/80"
      >
        Get started
      </button>
    </div>
  </div>
</template>