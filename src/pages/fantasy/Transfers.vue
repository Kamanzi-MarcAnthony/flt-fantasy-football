<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
defineProps({
  team: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-8">
    <h2 class="text-xl font-bold">
      Transfers
    </h2>

    <p class="mt-2 text-white/50">
      Your transfers will appear here.
    </p>
  </div>
</template>