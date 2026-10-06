<script setup>
import { X } from 'lucide-vue-next'
import PlayerProfileCard from './PlayerProfileCard.vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  player: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="profile-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
        @click.self="closeModal"
      >

        <!-- Modal -->
        <div
          class="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl shadow-2xl"
        >

          <!-- Close -->
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
            @click="closeModal"
          >
            <X class="h-4 w-4" />
          </button>

          <!-- Player profile -->
          <PlayerProfileCard :player="player" />

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.profile-modal-enter-active,
.profile-modal-leave-active {
  transition: opacity 0.2s ease;
}

.profile-modal-enter-active > div,
.profile-modal-leave-active > div {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.profile-modal-enter-from,
.profile-modal-leave-to {
  opacity: 0;
}

.profile-modal-enter-from > div,
.profile-modal-leave-to > div {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}
</style>