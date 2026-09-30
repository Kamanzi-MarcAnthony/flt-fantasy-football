<script setup>
defineProps({
  league: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">
          {{ league.name }}
        </h2>

        <p class="mt-1 text-sm text-gray-500">
          {{ league.location }}
        </p>
      </div>

      <span
        class="rounded-full px-3 py-1 text-xs font-medium"
        :class="
          league.status === 'ACTIVE'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        "
      >
        {{ league.status }}
      </span>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs text-gray-500">Starts</p>
        <p class="mt-1 text-sm font-medium text-gray-900">
          {{ league.startDate }}
        </p>
      </div>

      <div>
        <p class="text-xs text-gray-500">Ends</p>
        <p class="mt-1 text-sm font-medium text-gray-900">
          {{ league.endDate }}
        </p>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
      <p class="text-sm text-gray-500">
        {{ league.playerCount }} players
      </p>

      <RouterLink
        :to="`/leagues/${league.id}`"
        class="text-sm font-semibold text-black hover:underline"
      >
        View league →
      </RouterLink>
    </div>
  </div>
</template>