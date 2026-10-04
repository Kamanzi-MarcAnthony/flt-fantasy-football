<script setup>
import { computed, ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  players: {
    type: Array,
    default: () => [],
  },

  selectedPlayerIds: {
    type: Array,
    default: () => [],
  },

  bank: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'close',
  'select',
])

const search = ref('')
const selectedPosition = ref('ALL')

const positions = [
  'ALL',
  'GK',
  'DEF',
  'MID',
  'ST',
]

const filteredPlayers = computed(() => {
  const query = search.value.trim().toLowerCase()

  return props.players.filter((player) => {
    const matchesSearch =
      !query ||
      player.name.toLowerCase().includes(query)

    const matchesPosition =
      selectedPosition.value === 'ALL' ||
      player.position === selectedPosition.value

    return matchesSearch && matchesPosition
  })
})

const isSelected = (player) => {
  return props.selectedPlayerIds.includes(player.id)
}

const isAffordable = (player) => {
  return props.bank >= Number(player.price)
}

const selectPlayer = (player) => {
  if (isSelected(player)) return
  if (!isAffordable(player)) return

  emit('select', player)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#061112] shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-white/10 px-5 py-4"
      >
        <div>
          <h2 class="text-base font-semibold text-white">
            Add player
          </h2>

          <p class="mt-1 text-xs text-white/40">
            Choose a player for your squad
          </p>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Controls -->
      <div class="border-b border-white/10 p-4">
        <!-- Search -->
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
          />

          <input
            v-model="search"
            type="text"
            placeholder="Search players..."
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
          />
        </div>

        <!-- Positions -->
        <div class="mt-3 flex gap-2 overflow-x-auto">
          <button
            v-for="position in positions"
            :key="position"
            type="button"
            class="rounded-lg px-3 py-2 text-xs font-medium transition"
            :class="
              selectedPosition === position
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            "
            @click="selectedPosition = position"
          >
            {{ position }}
          </button>
        </div>
      </div>

      <!-- Players -->
      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <!-- Empty -->
        <div
          v-if="filteredPlayers.length === 0"
          class="flex min-h-40 items-center justify-center"
        >
          <p class="text-sm text-white/40">
            No players found.
          </p>
        </div>

        <!-- Player list -->
        <div
          v-else
          class="grid gap-2"
        >
          <button
            v-for="player in filteredPlayers"
            :key="player.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition"
            :class="[
              isSelected(player)
                ? 'cursor-not-allowed opacity-40'
                : !isAffordable(player)
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:border-white/20 hover:bg-white/[0.06]',
            ]"
            :disabled="
              isSelected(player) ||
              !isAffordable(player)
            "
            @click="selectPlayer(player)"
          >
            <!-- Player image -->
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10"
            >
              <img
                v-if="player.photoUrl"
                :src="player.photoUrl"
                :alt="player.name"
                class="h-full w-full object-cover"
              />

              <span
                v-else
                class="text-lg font-bold text-white/50"
              >
                {{ player.name.charAt(0) }}
              </span>
            </div>

            <!-- Player info -->
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-white">
                {{ player.name }}
              </p>

              <p class="mt-1 text-xs text-white/40">
                {{ player.position }} · OVR {{ player.ovr }}
              </p>
            </div>

            <!-- Price -->
            <div class="text-right">
              <p class="text-sm font-semibold text-white">
                {{ Number(player.price).toFixed(1) }}M
              </p>

              <p
                v-if="isSelected(player)"
                class="mt-1 text-[10px] text-white/30"
              >
                Selected
              </p>

              <p
                v-else-if="!isAffordable(player)"
                class="mt-1 text-[10px] text-red-400"
              >
                Can't afford
              </p>

              <p
                v-else
                class="mt-1 text-[10px] text-emerald-400"
              >
                Available
              </p>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="border-t border-white/10 px-5 py-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-white/40">
            Available bank
          </span>

          <span class="text-sm font-semibold text-white">
            {{ bank.toFixed(1) }}M
          </span>
        </div>
      </div>
    </div>
  </div>
</template>