<script setup>
import { ref, watch } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import api from '../../services/api'

const props = defineProps({
  team: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'updated', 'deleted'])

const teamName = ref('')
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const showDeleteConfirmation = ref(false)

watch(
  () => props.team,
  (team) => {
    if (team) {
      teamName.value = team.name || ''
    }
  },
  { immediate: true },
)

const close = () => {
  if (saving.value || deleting.value) return

  error.value = ''
  showDeleteConfirmation.value = false
  emit('close')
}

const saveChanges = async () => {
  const name = teamName.value.trim()

  if (!name) {
    error.value = 'Team name is required'
    return
  }

  try {
    saving.value = true
    error.value = ''

    const response = await api.patch(
      `/fantasy/teams/${props.team.id}`,
      {
        name,
      },
    )

    emit('updated', response.data.data.team)
  } catch (err) {
    console.error('Update team error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to update team details'
  } finally {
    saving.value = false
  }
}

const deleteAccount = async () => {
  try {
    deleting.value = true
    error.value = ''

    await api.delete('/fantasy/account')

    emit('deleted')
  } catch (err) {
    console.error('Delete account error:', err)

    error.value =
      err.response?.data?.message ||
      'Unable to delete your account'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
    @click.self="close"
  >
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#010056] p-6 shadow-2xl flex flex-col gap-2"
    >

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold mt-4">
            Edit My Team
          </h2>

          <p class="mt-1 text-sm text-white/40">
            Update your fantasy team.
          </p>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          @click="close"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Team name -->
      <div class="pt-4 pb-4">
        <label
          for="team-name"
          class="mb-2 block text-sm font-medium text-white/70"
        >
          Team Name
        </label>

        <input
          id="team-name"
          v-model="teamName"
          type="text"
          maxlength="50"
          placeholder="Enter team name"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-white/10"
        />
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-3 pb-4">
        <button
          type="button"
          class="rounded-xl border px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          :disabled="saving || deleting"
          @click="close"
        >
          Cancel
        </button>

        <button
          type="button"
          class="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#010056] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving || deleting"
          @click="saveChanges"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Danger zone -->
      <div class="mt-4 border border-red-900 bg-[#ff000018] w-full p-4 rounded-2xl pt-6">
        <p class="text-sm font-semibold text-white">
          Delete Account
        </p>

        <p class="mt-1 text-sm leading-5 text-white/40">
          Permanently delete your account and log you out.
        </p>

        <button
          v-if="!showDeleteConfirmation"
          type="button"
          class="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
          :disabled="saving"
          @click="showDeleteConfirmation = true"
        >
          <Trash2 :size="16" />
          Delete My Account
        </button>

        <!-- Delete confirmation -->
        <div
          v-else
          class="mt-4 rounded-2xl border border-red-400/20 bg-red-500/5 p-4"
        >
          <p class="text-sm font-semibold text-white">
            Are you sure?
          </p>

          <p class="mt-1 text-sm leading-5 text-white/50">
            This will permanently disable your account. You will be
            logged out and won't be able to sign in again.
          </p>

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white"
              :disabled="deleting"
              @click="showDeleteConfirmation = false"
            >
              Cancel
            </button>

            <button
              type="button"
              class="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deleting"
              @click="deleteAccount"
            >
              {{ deleting ? 'Deleting...' : 'Yes, Delete Account' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>