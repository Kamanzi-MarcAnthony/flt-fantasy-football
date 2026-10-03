<script setup>
import { computed, ref, watch } from 'vue'
import {
    X,
    Eye,
    EyeOff,
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

const showPassword = ref(false)

const createEmptyForm = () => ({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
})

const form = ref(createEmptyForm())

const isEditing = computed(() => !!props.admin)

const title = computed(() =>
    isEditing.value
        ? 'Edit Administrator'
        : 'Add Administrator',
)

const description = computed(() =>
    isEditing.value
        ? 'Update this administrator\'s account details.'
        : 'Create a new administrator account.',
)

const submitLabel = computed(() =>
    isEditing.value
        ? 'Save Changes'
        : 'Create Administrator',
)

const resetForm = () => {
    if (!props.admin) {
        form.value = createEmptyForm()
        showPassword.value = false

        return
    }

    form.value = {
        name: props.admin.name || '',
        email: props.admin.email || '',
        password: '',
        role: props.admin.role || 'ADMIN',
    }

    showPassword.value = false
}

watch(
  () => props.admin,
  (admin) => {
    if (!props.open) return

    if (admin) {
      form.value = {
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        role: admin.role || 'ADMIN',
      }
    } else {
      form.value = createEmptyForm()
    }

    showPassword.value = false
  },
  { immediate: true },
)

const handleSubmit = () => {
    emit('submit', {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
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
      <div
        class="mb-6 flex items-start justify-between"
      >
        <div>
          <h2
            class="text-lg font-semibold text-gray-900"
          >
            {{ title }}
          </h2>

          <p
            class="mt-1 text-sm text-gray-500"
          >
            {{ description }}
          </p>
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
        <!-- Name -->
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Full name
          </label>

          <input
            v-model="form.name"
            type="text"
            placeholder="Enter full name"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black text-black disabled:bg-gray-100"
          />
        </div>

        <!-- Email -->
        <div>
          <label
            class="mb-1.5 block text-black text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            v-model="form.email"
            autocomplete="off"
            type="email"
            placeholder="admin@example.com"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-black text-sm outline-none focus:border-black disabled:bg-gray-100"
          />
        </div>

        <!-- Password -->
        <div v-if="!isEditing">
          <label
            class="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>

          <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Minimum 8 characters"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-black text-sm outline-none focus:border-black disabled:bg-gray-100"
          />

          <button
            type="button"
            @click="showPassword = !showPassword"
            :disabled="loading"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            :aria-label="
                showPassword
                    ? 'Hide password'
                    : 'Show password'">
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
</div>
        <!-- Role -->
        <div>
          <label
            class="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Role
          </label>

          <select
            v-model="form.role"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black text-sm outline-none focus:border-black disabled:bg-gray-100"
          >
            <option value="ADMIN">
              Admin
            </option>

            <option value="SUPER_ADMIN">
              Super Admin
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div
          class="flex justify-end gap-3 pt-4"
        >
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
            {{ loading ? 'Saving...' : submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>