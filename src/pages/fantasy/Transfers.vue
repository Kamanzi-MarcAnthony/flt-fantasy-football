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

const emit = defineEmits(['team-updated'])

const allLeaguePlayers = ref([])
const playersLoading = ref(false)
const playersError = ref('')

const transferStatusLoading = ref(false)
const transferError = ref('')
const transferSuccess = ref('')
const transferSubmitting = ref(false)

const transferStatus = ref('OPEN')
const remainingTransfers = ref(3)
const transferLimit = ref(3)

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

const transfersAreOpen = computed(() => {
  return transferStatus.value === 'OPEN'
})

const transferStatusLabel = computed(() => {
  if (transferStatusLoading.value) {
    return 'Checking...'
  }

  return transfersAreOpen.value
    ? 'Transfers Open'
    : 'Transfers Closed'
})

const transferStatusDescription = computed(() => {
  if (transferStatusLoading.value) {
    return 'Checking the current transfer window.'
  }

  return transfersAreOpen.value
    ? 'Select a player to make a transfer.'
    : 'Transfers are closed while the matchday is in progress.'
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

    allLeaguePlayers.value =
      response.data.data.players || []
  } catch (error) {
  console.error('Transfer error:', error)
  console.error('Response:', error.response?.data)
  console.error('Status:', error.response?.status)

  transferError.value =
    error.response?.data?.message ||
    error.message ||
    'Unable to complete transfer.'
}finally {
    playersLoading.value = false
  }
}

const loadTransferStatus = async () => {
  try {
    transferStatusLoading.value = true

    /*
     * We try to use the team data first.
     * If the backend already provides transfer information,
     * use that instead of making an unnecessary request.
     */
    if (props.team?.transferStatus) {
      transferStatus.value = props.team.transferStatus
    }

    if (
      props.team?.remainingTransfers !== undefined &&
      props.team?.remainingTransfers !== null
    ) {
      remainingTransfers.value =
        Number(props.team.remainingTransfers)
    }

    if (
      props.team?.transferLimit !== undefined &&
      props.team?.transferLimit !== null
    ) {
      transferLimit.value =
        Number(props.team.transferLimit)
    }

    /*
     * Keep this request for now if your getMyTeam response
     * does not yet include transfer information.
     *
     * If /fantasy/transfer-status does not exist, the error
     * is safely handled below.
     */
    try {
      const response = await api.get(
        '/fantasy/transfer-status',
        {
          params: {
            leagueId: props.team.leagueId,
          },
        },
      )

      const data = response.data?.data || {}

      transferStatus.value =
        data.transferStatus ||
        transferStatus.value ||
        'OPEN'

      if (
        data.remainingTransfers !== undefined &&
        data.remainingTransfers !== null
      ) {
        remainingTransfers.value =
          Number(data.remainingTransfers)
      }

      if (
        data.transferLimit !== undefined &&
        data.transferLimit !== null
      ) {
        transferLimit.value =
          Number(data.transferLimit)
      }
    } catch (error) {
      /*
       * The transfer endpoint itself will still enforce
       * whether transfers are open or closed.
       *
       * This prevents the page from breaking if the
       * status endpoint hasn't been added yet.
       */
      console.warn(
        'Transfer status endpoint unavailable:',
        error,
      )
    }
  } finally {
    transferStatusLoading.value = false
  }
}

const openTransferModal = (player) => {
  transferError.value = ''
  transferSuccess.value = ''

  if (!transfersAreOpen.value) {
    return
  }

  if (remainingTransfers.value <= 0) {
    transferError.value =
      'You have no transfers remaining for this transfer window.'
    return
  }

  selectedPlayer.value = player
  transferModalOpen.value = true
}

const closeTransferModal = () => {
  transferModalOpen.value = false
  selectedPlayer.value = null
}

const confirmTransfer = async (transfer) => {
  if (transferSubmitting.value) return

  try {
    transferSubmitting.value = true
    transferError.value = ''
    transferSuccess.value = ''

    if (!transfersAreOpen.value) {
      transferError.value = 'Transfers are currently closed.'
      return
    }

    if (remainingTransfers.value <= 0) {
      transferError.value =
        'You have no transfers remaining for this transfer window.'
      return
    }

    const response = await api.post('/fantasy/transfers', {
      leagueId: props.team.leagueId,
      outgoingPlayerId: transfer.outgoingPlayerId,
      incomingPlayerId: transfer.incomingPlayerId,
    })

    const data = response.data?.data || {}

    // Update transfer information
    if (data.remainingTransfers !== undefined) {
      remainingTransfers.value = Number(data.remainingTransfers)
    }

    if (data.transferLimit !== undefined) {
      transferLimit.value = Number(data.transferLimit)
    }

    if (data.transferStatus) {
      transferStatus.value = data.transferStatus
    }

    // IMPORTANT:
    // Send the updated team back to the parent immediately.
    if (data.team) {
      emit('team-updated', data.team)
    }

    transferSuccess.value = 
      response.data?.message || 'Transfer completed successfully.'
    closeTransferModal()

    setTimeout(() => {
      window.location.reload()
    }, 300)
    
  } catch (error) {
    console.error('Transfer error:', error)
    console.error('Response:', error.response?.data)

    transferError.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to complete transfer.'

  } finally {
    transferSubmitting.value = false

    // Close the modal after BOTH success and failure.
    closeTransferModal()
  }
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
  loadTransferStatus()
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
      <div
        class="flex items-center justify-between gap-4"
      >
        <div>
          <p
            class="text-[10px] font-medium uppercase tracking-widest text-white/40"
          >
            Transfer Window
          </p>

          <div class="mt-1 flex items-center gap-2">
            <span
              class="h-2 w-2 rounded-full"
              :class="
                transfersAreOpen
                  ? 'bg-[#00EEFF] shadow-[0_0_10px_#00EEFF]'
                  : 'bg-red-400 shadow-[0_0_10px_#F87171]'
              "
            ></span>

            <p class="text-sm font-bold text-white">
              {{ transferStatusLabel }}
            </p>
          </div>

          <p class="mt-1 text-[10px] text-white/40">
            {{ transferStatusDescription }}
          </p>
        </div>

        <div class="text-right">
          <p
            class="text-[10px] uppercase tracking-wide text-white/40"
          >
            Remaining
          </p>

          <p class="mt-1 text-2xl font-black text-white">
            {{ remainingTransfers }}
          </p>

          <p class="text-[9px] text-white/40">
            of {{ transferLimit }} Transfers
          </p>
        </div>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- SUCCESS -->
    <!-- ===================================================== -->

    <div
      v-if="transferSuccess"
      class="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-center text-xs text-cyan-300"
    >
      {{ transferSuccess }}
    </div>

    <!-- ===================================================== -->
    <!-- ERROR -->
    <!-- ===================================================== -->

    <div
      v-if="transferError"
      class="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-center text-xs text-red-300"
    >
      {{ transferError }}
    </div>

    <!-- ===================================================== -->
    <!-- SQUAD -->
    <!-- ===================================================== -->

    <section>
      <div
        class="mb-3 flex items-center justify-between"
      >
        <div>
          <h2 class="text-base font-bold text-white">
            Your Squad
          </h2>

          <p class="mt-0.5 text-[10px] text-white/40">
            Select a player to transfer out
          </p>
        </div>

        <span
          class="text-xs font-semibold text-white/40"
        >
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
          :class="{
            'pointer-events-none opacity-60':
              !transfersAreOpen ||
              remainingTransfers <= 0,
          }"
          @player-click="openTransferModal"
        />
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- LOADING -->
    <!-- ===================================================== -->

    <div
      v-if="playersLoading"
      class="text-center text-xs text-white/30"
    >
      Loading available players...
    </div>

    <!-- ===================================================== -->
    <!-- ERROR -->
    <!-- ===================================================== -->

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
      :loading="transferSubmitting"
      @close="closeTransferModal"
      @confirm="confirmTransfer"
      @view-player="viewPlayer"
    />

    <!-- ===================================================== -->
    <!-- PLAYER PROFILE -->
    <!-- ===================================================== -->

    <PlayerProfileModal
      :open="playerProfileOpen"
      :player="profilePlayer"
      @close="closePlayerProfile"
    />

  </div>
</template>