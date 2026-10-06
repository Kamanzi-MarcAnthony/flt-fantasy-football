<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  player: {
    type: Object,
    default: null,
  },

  availablePlayers: {
    type: Array,
    default: () => [],
  },

  bank: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm', 'view-player'])

const transferStarted = ref(false)
const selectedReplacement = ref(null)
const searchQuery = ref('')
const activePosition = ref('ALL')

const filteredPlayers = computed(() => {
  return props.availablePlayers.filter((player) => {
    const matchesSearch =
      !searchQuery.value ||
      player.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    const matchesPosition =
      activePosition.value === 'ALL' ||
      player.position === activePosition.value

    return matchesSearch && matchesPosition
  })
})

const transferDifference = computed(() => {
  if (!props.player || !selectedReplacement.value) {
    return 0
  }

  return (
    Number(props.player.price) -
    Number(selectedReplacement.value.price)
  )
})

const bankAfter = computed(() => {
  return props.bank + transferDifference.value
})

const formatMoney = (value) => {
  return `${Number(value).toFixed(1)}M`
}

const startTransfer = () => {
  transferStarted.value = true
}

const selectReplacement = (player) => {
  selectedReplacement.value = player
}

const viewPlayer = () => {
  if (!props.player) return

  emit('view-player', props.player)
}

const goBack = () => {
  selectedReplacement.value = null
  searchQuery.value = ''
  activePosition.value = 'ALL'
}

const closeModal = () => {
  transferStarted.value = false
  selectedReplacement.value = null
  searchQuery.value = ''
  activePosition.value = 'ALL'

  emit('close')
}

const confirmTransfer = () => {
  if (!selectedReplacement.value || !props.player) return

  emit('confirm', {
    outgoingPlayerId: props.player.id,
    incomingPlayerId: selectedReplacement.value.id,
    outgoingPlayer: props.player,
    incomingPlayer: selectedReplacement.value,
  })
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      transferStarted.value = false
      selectedReplacement.value = null
      searchQuery.value = ''
      activePosition.value = 'ALL'
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="closeModal"
      >
        <div
          class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#010056] shadow-2xl sm:max-w-lg sm:rounded-2xl"
        >

          <!-- HEADER -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4"
          >
            <div>
              <p
                class="text-[10px] font-medium uppercase tracking-widest text-white/40"
              >
                {{ transferStarted ? 'Transfer Player' : 'Player Profile' }}
              </p>

              <h2 class="mt-1 text-base font-bold text-white">
                {{ transferStarted ? 'Choose Replacement' : player?.name }}
              </h2>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <div class="min-h-0 overflow-y-auto">

            <!-- ================================================= -->
            <!-- PLAYER PROFILE -->
            <!-- ================================================= -->

            <div
              v-if="!transferStarted"
              class="p-5"
            >

              <!-- Player -->
              <div
                class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div class="flex">

                  <!-- Image -->
                  <div
                    class="h-36 w-32 shrink-0 overflow-hidden bg-white/10"
                  >
                    <img
                      v-if="player?.photoUrl"
                      :src="player.photoUrl"
                      :alt="player.name"
                      class="h-full w-full object-cover"
                    />

                    <span
                      v-else
                      class="flex h-full w-full items-center justify-center text-4xl font-black text-white/20"
                    >
                      {{ player?.name?.charAt(0) || '?' }}
                    </span>
                  </div>

                  <!-- Info -->
                  <div class="flex flex-1 flex-col justify-center p-4">

                    <p
                      class="truncate text-lg font-black uppercase text-white"
                    >
                      {{ player?.name }}
                    </p>

                    <p
                      class="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40"
                    >
                      {{ player?.position }}
                    </p>

                    <!-- Stats -->
                    <div class="mt-5 grid grid-cols-3 gap-3">

                      <div>
                        <p class="text-[9px] uppercase tracking-wide text-white/30">
                          OVR
                        </p>

                        <p class="mt-1 text-sm font-black text-white">
                          {{ player?.ovr ?? 0 }}
                        </p>
                      </div>

                      <div>
                        <p class="text-[9px] uppercase tracking-wide text-white/30">
                          Price
                        </p>

                        <p class="mt-1 text-sm font-black text-white">
                          {{ formatMoney(player?.price) }}
                        </p>
                      </div>

                      <div>
                        <p class="text-[9px] uppercase tracking-wide text-white/30">
                          Points
                        </p>

                        <p class="mt-1 text-sm font-black text-[#00EEFF]">
                          {{ player?.totalPoints ?? 0 }}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <!-- View Player -->
              <button
                type="button"
                class="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                @click="viewPlayer"
              >
                View Player
              </button>

              <!-- Transfer Out -->
              <button
                type="button"
                class="mt-3 w-full rounded-xl bg-[#00EEFF] px-4 py-3 text-sm font-black text-[#010056] transition hover:brightness-110"
                @click="startTransfer"
              >
                Transfer Out
              </button>
            </div>

            <!-- ================================================= -->
            <!-- REPLACEMENT SELECTION -->
            <!-- ================================================= -->

            <div
              v-else-if="!selectedReplacement"
              class="p-5"
            >

              <!-- Selected Player -->
              <div
                class="rounded-xl border border-red-400/10 bg-red-400/5 p-4"
              >
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-red-300/60"
                >
                  Transfer Out
                </p>

                <div class="mt-2 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold text-white">
                      {{ player?.name }}
                    </p>

                    <p class="mt-0.5 text-[10px] text-white/40">
                      {{ player?.position }}
                      · OVR {{ player?.ovr }}
                    </p>
                  </div>

                  <p class="text-sm font-bold text-white">
                    {{ formatMoney(player?.price) }}
                  </p>
                </div>
              </div>

              <!-- Search -->
              <div class="mt-5">
                <p
                  class="mb-2 text-[10px] font-medium uppercase tracking-widest text-white/40"
                >
                  Select Replacement
                </p>

                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search players..."
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#00EEFF]/40"
                />
              </div>

              <!-- Positions -->
              <div class="mt-3 flex gap-2 overflow-x-auto pb-1">
                <button
                  v-for="position in ['ALL', 'GK', 'DEF', 'MID', 'ST']"
                  :key="position"
                  type="button"
                  :class="[
                    'rounded-lg px-3 py-2 text-[10px] font-bold transition',
                    activePosition === position
                      ? 'bg-[#00EEFF] text-[#010056]'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white',
                  ]"
                  @click="activePosition = position"
                >
                  {{ position }}
                </button>
              </div>

              <!-- Players -->
              <div class="mt-4 space-y-2">

                <button
                  v-for="replacement in filteredPlayers"
                  :key="replacement.id"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#00EEFF]/30 hover:bg-[#00EEFF]/5"
                  @click="selectReplacement(replacement)"
                >
                  <div
                    class="h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-white/10"
                  >
                    <img
                      v-if="replacement.photoUrl"
                      :src="replacement.photoUrl"
                      :alt="replacement.name"
                      class="h-full w-full object-cover"
                    />

                    <span
                      v-else
                      class="flex h-full w-full items-center justify-center text-sm font-bold text-white/30"
                    >
                      {{ replacement.name?.charAt(0) || '?' }}
                    </span>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold text-white">
                      {{ replacement.name }}
                    </p>

                    <p class="mt-0.5 text-[10px] text-white/40">
                      {{ replacement.position }}
                      · OVR {{ replacement.ovr }}
                    </p>
                  </div>

                  <div class="text-right">
                    <p class="text-sm font-bold text-white">
                      {{ formatMoney(replacement.price) }}
                    </p>

                    <p
                      class="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#00EEFF]"
                    >
                      Select
                    </p>
                  </div>
                </button>

                <div
                  v-if="filteredPlayers.length === 0"
                  class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center"
                >
                  <p class="text-sm font-semibold text-white/60">
                    No players found
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                @click="goBack"
              >
                Back to Player
              </button>
            </div>

            <!-- ================================================= -->
            <!-- CONFIRM TRANSFER -->
            <!-- ================================================= -->

            <div
              v-else
              class="p-5"
            >

              <div class="grid grid-cols-2 gap-3">

                <!-- Out -->
                <div
                  class="rounded-xl border border-red-400/10 bg-red-400/5 p-4"
                >
                  <p class="text-[9px] font-bold uppercase tracking-widest text-red-300/60">
                    Out
                  </p>

                  <p class="mt-3 truncate text-sm font-bold text-white">
                    {{ player?.name }}
                  </p>

                  <p class="mt-1 text-[10px] text-white/40">
                    {{ formatMoney(player?.price) }}
                  </p>
                </div>

                <!-- In -->
                <div
                  class="rounded-xl border border-[#00EEFF]/20 bg-[#00EEFF]/5 p-4"
                >
                  <p class="text-[9px] font-bold uppercase tracking-widest text-[#00EEFF]/70">
                    In
                  </p>

                  <p class="mt-3 truncate text-sm font-bold text-white">
                    {{ selectedReplacement.name }}
                  </p>

                  <p class="mt-1 text-[10px] text-white/40">
                    {{ formatMoney(selectedReplacement.price) }}
                  </p>
                </div>

              </div>

              <!-- Bank -->
              <div
                class="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs text-white/40">
                    Bank before
                  </span>

                  <span class="text-xs font-semibold text-white">
                    {{ formatMoney(bank) }}
                  </span>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <span class="text-xs text-white/40">
                    Difference
                  </span>

                  <span
                    :class="
                      transferDifference >= 0
                        ? 'text-[#00EEFF]'
                        : 'text-red-300'
                    "
                    class="text-xs font-bold"
                  >
                    {{ transferDifference >= 0 ? '+' : '' }}{{
                      formatMoney(transferDifference)
                    }}
                  </span>
                </div>

                <div class="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <span class="text-sm font-bold text-white">
                    Bank after
                  </span>

                  <span class="text-lg font-black text-white">
                    {{ formatMoney(bankAfter) }}
                  </span>
                </div>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                  @click="selectedReplacement = null"
                >
                  Back
                </button>

                <button
  type="button"
  :disabled="loading"
  @click="confirmTransfer"
  class="rounded-xl bg-[#00EEFF] px-4 py-3 text-sm font-black text-[#010056] transition hover:brightness-110"
>
  <Loader2
    v-if="loading"
    class="w-4 h-4 animate-spin"
  />

  <span>
    {{ loading ? 'Processing...' : 'Confirm Transfer' }}
  </span>
</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active > div > div,
.modal-leave-active > div > div {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div > div,
.modal-leave-to > div > div {
  transform: translateY(20px);
}
</style>