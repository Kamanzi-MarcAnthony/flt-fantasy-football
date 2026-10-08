<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const unlimitedTransfers = ref(false)
const gameweekNumber = ref(null)


const transferModalOpen = ref(false)

const transferWindowEndsAt = ref(null)
const countdown = ref('')
let countdownInterval = null

const selectedPlayer = ref(null)

const playerProfileOpen = ref(false)
const profilePlayer = ref(null)

const players = computed(() => {
  return (props.team?.players || [])
    .filter((item) => item.player)
    .sort((a, b) => (a.pitchSlot ?? 999) - (b.pitchSlot ?? 999))
    .map((item) => ({
      ...item.player,
      pitchSlot: item.pitchSlot,
    }))
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

const transfersAreUnlimited = computed(() => {
  return unlimitedTransfers.value
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
     * Use transfer information already provided by the team first.
     */
    if (props.team?.transferStatus) {
      transferStatus.value = props.team.transferStatus
    }

    if (
      props.team?.remainingTransfers !== undefined &&
      props.team?.remainingTransfers !== null
    ) {
      remainingTransfers.value = Number(
        props.team.remainingTransfers,
      )
    }

    if (
      props.team?.transferLimit !== undefined &&
      props.team?.transferLimit !== null
    ) {
      transferLimit.value = Number(
        props.team.transferLimit,
      )
    }

    /*
     * Load the current transfer window status.
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
      if (data.transferCloseDate) {
        transferWindowEndsAt.value = data.transferCloseDate
      }

      transferStatus.value =
        data.transferStatus ||
        transferStatus.value ||
        'OPEN'

      /*
       * Gameweek information.
       *
       * GW1 is the only gameweek with unlimited transfers.
       */
      if (
        data.gameweekNumber !== undefined &&
        data.gameweekNumber !== null
      ) {
        gameweekNumber.value = Number(
          data.gameweekNumber,
        )
      }

      /*
       * Prefer an explicit backend flag if available.
       * Otherwise fall back to Gameweek 1.
       */
      if (data.unlimitedTransfers !== undefined) {
        unlimitedTransfers.value =
          Boolean(data.unlimitedTransfers)
      } else {
        unlimitedTransfers.value =
          gameweekNumber.value === 1
      }

      /*
       * If the backend says this is Gameweek 1,
       * force unlimited mode even if transferLimit is 3.
       */
      if (gameweekNumber.value === 1) {
        unlimitedTransfers.value = true
      }

      if (
        data.remainingTransfers !== undefined &&
        data.remainingTransfers !== null
      ) {
        remainingTransfers.value = Number(
          data.remainingTransfers,
        )
      }

      if (
        data.transferLimit !== undefined &&
        data.transferLimit !== null
      ) {
        transferLimit.value = Number(
          data.transferLimit,
        )
      }
    } catch (error) {
      console.warn(
        'Transfer status endpoint unavailable:',
        error,
      )

      if (transferWindowEndsAt.value) {
  updateCountdown()
}

      /*
       * If the endpoint isn't available, fall back to
       * the information already available on the team.
       */
      unlimitedTransfers.value =
      gameweekNumber.value === 1
    }
  } finally {
    transferStatusLoading.value = false
  }
}

const openTransferModal = (player) => {
  transferError.value = ''
  transferSuccess.value = ''

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

if (
  !transfersAreUnlimited.value &&
  remainingTransfers.value <= 0
) {
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

    if (data.unlimitedTransfers !== undefined) {
  unlimitedTransfers.value =
    Boolean(data.unlimitedTransfers)
}

if (
  data.gameweekNumber !== undefined &&
  data.gameweekNumber !== null
) {
  gameweekNumber.value = Number(
    data.gameweekNumber,
  )
}

/*
 * GW1 always remains unlimited even if the backend
 * doesn't return unlimitedTransfers on the transfer response.
 */
if (gameweekNumber.value === 1) {
  unlimitedTransfers.value = true
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

const makeCaptain = async (player) => {
  if (!player || player.id === props.team?.captainId) return

  try {
    transferError.value = ''
    transferSuccess.value = ''

    const currentCaptainId = props.team?.captainId
    const currentViceCaptainId = props.team?.viceCaptainId

    let captainId = player.id
    let viceCaptainId = currentViceCaptainId

    // If this player is currently vice captain,
    // swap the existing captain to vice captain.
    if (player.id === currentViceCaptainId) {
      viceCaptainId = currentCaptainId
    }

    if (!captainId || !viceCaptainId) {
      transferError.value =
        'Please select both a captain and vice captain.'
      return
    }

    const response = await api.patch(
      `/fantasy/teams/${props.team.id}/captains`,
      {
        captainId,
        viceCaptainId,
      },
    )

    const data = response.data?.data || {}

    if (data.team) {
      emit('team-updated', data.team)
    }

    transferSuccess.value =
      response.data?.message ||
      'Captain updated successfully.'

    closeTransferModal()

  } catch (error) {
    console.error('Update captain error:', error)

    transferError.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to update captain.'
  }
}

const makeViceCaptain = async (player) => {
  if (!player || player.id === props.team?.viceCaptainId) return

  try {
    transferError.value = ''
    transferSuccess.value = ''

    const currentCaptainId = props.team?.captainId
    const currentViceCaptainId = props.team?.viceCaptainId

    let captainId = currentCaptainId
    let viceCaptainId = player.id

    // If this player is currently captain,
    // swap the existing vice captain to captain.
    if (player.id === currentCaptainId) {
      captainId = currentViceCaptainId
    }

    if (!captainId || !viceCaptainId) {
      transferError.value =
        'Please select both a captain and vice captain.'
      return
    }

    const response = await api.patch(
      `/fantasy/teams/${props.team.id}/captains`,
      {
        captainId,
        viceCaptainId,
      },
    )

    const data = response.data?.data || {}

    if (data.team) {
      emit('team-updated', data.team)
    }

    transferSuccess.value =
      response.data?.message ||
      'Vice captain updated successfully.'

    closeTransferModal()

  } catch (error) {
    console.error('Update vice captain error:', error)

    transferError.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to update vice captain.'
  }
}

const closePlayerProfile = () => {
  playerProfileOpen.value = false
  profilePlayer.value = null
}

const updateCountdown = () => {
  if (!transferWindowEndsAt.value) {
    countdown.value = ''
    return
  }

  const end = new Date(transferWindowEndsAt.value).getTime()
  const now = Date.now()
  const difference = end - now

  if (difference <= 0) {
    countdown.value = 'Window closed'
    return
  }

  const totalSeconds = Math.floor(difference / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    countdown.value = `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    countdown.value = `${hours}h ${minutes}m ${seconds}s`
  } else {
    countdown.value = `${minutes}m ${seconds}s`
  }
}

onMounted(() => {
  loadLeaguePlayers()
  loadTransferStatus()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="w-full space-y-4 flex flex-col gap-2 md:w-2/3">

    <!-- ===================================================== -->
    <!-- TRANSFER WINDOW -->
    <!-- ===================================================== -->

    <section
      class="relative overflow-hidden  rounded-2xl border border-white/10 bg-[#24002d] px-4 py-4"
    >
      <div
        class="flex items-center h-18 justify-between gap-4 pb-3"
      >
        <div class="flex flex-col h-full p-2  justify-between">
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
            <template v-if="transfersAreUnlimited && transfersAreOpen">
              Unlimited transfers are available for Gameweek 1.
            </template>

            <template v-else>
              {{ transferStatusDescription }}
            </template>
          </p>
        </div>

<div class="text-right">
  <p
    class="text-[10px] uppercase tracking-wide text-white/40"
  >
    {{ transfersAreUnlimited ? 'Transfers' : 'Remaining' }}
  </p>

  <p class="mt-1 text-2xl font-black text-white">
    {{ transfersAreUnlimited ? '∞' : remainingTransfers }}
  </p>

  <p class="text-[9px] text-white/40">
    {{
      transfersAreUnlimited
        ? 'Unlimited • Gameweek 1'
        : `of ${transferLimit} Transfers`
    }}
  </p>
</div>
      </div>

      <div
  v-if="transfersAreOpen && countdown"
  class="mt-3 flex items-center justify-between border-t border-white/10 pt-3"
>
  <p class="text-[10px] uppercase tracking-wide text-white/40">
    Transfer window ends in
  </p>

  <p class="text-sm font-bold text-white">
    {{ countdown }}
  </p>
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
        class="mb-3 flex items-center px-5  h-13 justify-between"
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
        class=" bg-white/2 p-1"
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
  :captain-id="team?.captainId"
  :vice-captain-id="team?.viceCaptainId"
  @close="closeTransferModal"
  @confirm="confirmTransfer"
  @view-player="viewPlayer"
  @make-captain="makeCaptain"
  @make-vice-captain="makeViceCaptain"
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