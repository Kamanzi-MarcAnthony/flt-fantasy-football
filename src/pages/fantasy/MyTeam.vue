<script setup>
import { computed } from 'vue'

import FantasyPitch from '../../components/fantasy/FantasyPitch.vue'

const props = defineProps({
  team: {
    type: Object,
    default: null,
  },
})

const players = computed(() => {
  return (props.team?.players || [])
    .map((item) => item.player)
    .filter(Boolean)
})
</script>

<template>
  <div
  class="md:w-2/3 w-full">
     <FantasyPitch
    :players="players"
    :captain-id="team?.captainId"
    :vice-captain-id="team?.viceCaptainId"
    stat-type="ovr"
  />
  </div>
</template>