<script setup>
import { ref, computed, watch } from 'vue'
import {
  X,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  admin: {
    type: Object,
    default: null,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits([
  'close',
  'submit',
])

const password = ref('')
const showPassword = ref(false)

const adminName = computed(() =>
  props.admin?.name || 'this administrator',
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      password.value = ''
      showPassword.value = false
    }
  },
)

const handleSubmit = () => {
  emit('submit', {
    password: password.value,
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
  >
    <div
      class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
    >
      <!-- Header -->
      <div class="mb-6 flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700"
          >
            <KeyRound class="h-5 w-5" />
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Reset Password
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Set a new password for {{ adminName }}.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          :disabled="loading"
          class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <form
        @submit.prevent="handleSubmit"
        autocomplete="off"
        class="space-y-4"
      >
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-gray-700"
          >
            New password
          </label>

          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Minimum 8 characters"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-sm text-black outline-none focus:border-black disabled:bg-gray-100"
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 disabled:opacity-50"
              :aria-label="
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              "
            >
              <EyeOff
                v-if="showPassword"
                class="h-4 w-4"
              />

              <Eye
                v-else
                class="h-4 w-4"
              />
            </button>
          </div>

          <p class="mt-1.5 text-xs text-gray-500">
            Password must be at least 8 characters.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="emit('close')"
            :disabled="loading"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>