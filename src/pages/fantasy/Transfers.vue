<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'
import FantasyPitch from '../../components/fantasy/FantasyPitch.vue'
import TransferModal from '../../components/fantasy/TransferModal.vue'
import PlayerProfileModal from '../../components/players/PlayerProfileModal.vue'

const props = defineProps({
  team: {
    type: Object,
    required: true,
  },
})

const allLeaguePlayers = ref([])
const playersLoading = ref(false)
const playersError = ref('')

const transferModalOpen = ref(false)
const selectedPlayer = ref(null)

const playerProfileOpen = ref(false)
const profilePlayer = ref(null)

const players = computed(() => {
  return (props.team?.players || [])
    .map((item) => item.player)
    .filter(Boolean)
})

const availablePlayers = computed(() => {
  const ownedPlayerIds = new Set(
    players.value.map((player) => player.id),
  )

  return allLeaguePlayers.value.filter(
    (player) => !ownedPlayerIds.has(player.id),
  )
})

const bank = computed(() => {
  return Number(props.team?.bank || 0)
})

const loadLeaguePlayers = async () => {
  try {
    playersLoading.value = true
    playersError.value = ''

    const response = await api.get('/fantasy/players', {
      params: {
        leagueId: props.team.leagueId,
      },
    })

    allLeaguePlayers.value = response.data.data.players || []
  } catch (error) {
    console.error('Load fantasy players error:', error)

    playersError.value =
      error.response?.data?.message ||
      'Unable to load available players'
  } finally {
    playersLoading.value = false
  }
}

const openTransferModal = (player) => {
  selectedPlayer.value = player
  transferModalOpen.value = true
}

const closeTransferModal = () => {
  transferModalOpen.value = false
  selectedPlayer.value = null
}

const confirmTransfer = (transfer) => {
  console.log('Transfer selected:', transfer)

  closeTransferModal()
}

const viewPlayer = (player) => {
  profilePlayer.value = player
  playerProfileOpen.value = true
}

const closePlayerProfile = () => {
  playerProfileOpen.value = false
  profilePlayer.value = null
}

onMounted(() => {
  loadLeaguePlayers()
})
</script>

<template>
  <div class="w-full space-y-5 md:w-2/3">

    <!-- ===================================================== -->
    <!-- TRANSFER WINDOW -->
    <!-- ===================================================== -->

    <section
      class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#24002d] px-4 py-4"
    >
      <div class="flex items-center justify-between gap-4">

        <div>
          <p
            class="text-[10px] font-medium uppercase tracking-widest text-white/40"
          >
            Transfer Window
          </p>

          <div class="mt-1 flex items-center gap-2">
            <span
              class="h-2 w-2 rounded-full bg-[#00EEFF] shadow-[0_0_10px_#00EEFF]"
            ></span>

            <p class="text-sm font-bold text-white">
              Transfers Open
            </p>
          </div>

          <p class="mt-1 text-[10px] text-white/40">
            Select a player to make a transfer.
          </p>
        </div>

        <div class="text-right">
          <p class="text-[10px] uppercase tracking-wide text-white/40">
            Remaining
          </p>

          <p class="mt-1 text-2xl font-black text-white">
            3
          </p>

          <p class="text-[9px] text-white/40">
            Transfers
          </p>
        </div>

      </div>
    </section>

    <!-- ===================================================== -->
    <!-- SQUAD -->
    <!-- ===================================================== -->

    <section>
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">
            Your Squad
          </h2>

          <p class="mt-0.5 text-[10px] text-white/40">
            Select a player to transfer out
          </p>
        </div>

        <span class="text-xs font-semibold text-white/40">
          {{ players.length }} Players
        </span>
      </div>

      <div
        class="rounded-2xl border border-white/10 bg-white/[0.02] p-1"
      >
        <FantasyPitch
          :players="players"
          :captain-id="team?.captainId"
          :vice-captain-id="team?.viceCaptainId"
          stat-type="ovr"
          @player-click="openTransferModal"
        />
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- LOADING / ERROR -->
    <!-- ===================================================== -->

    <div
      v-if="playersLoading"
      class="text-center text-xs text-white/30"
    >
      Loading available players...
    </div>

    <div
      v-if="playersError"
      class="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-center text-xs text-red-300"
    >
      {{ playersError }}
    </div>

    <!-- ===================================================== -->
    <!-- TRANSFER MODAL -->
    <!-- ===================================================== -->

    <TransferModal
      :open="transferModalOpen"
      :player="selectedPlayer"
      :available-players="availablePlayers"
      :bank="bank"
      @close="closeTransferModal"
      @confirm="confirmTransfer"
      @view-player="viewPlayer"
    />

    <PlayerProfileModal
  :open="playerProfileOpen"
  :player="profilePlayer"
  @close="closePlayerProfile"
/>

  </div>
</template>