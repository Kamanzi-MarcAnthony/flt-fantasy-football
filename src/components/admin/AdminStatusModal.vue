<script setup>
import { computed } from 'vue'
import {
    X,
    ShieldCheck,
    ShieldOff,
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
    'confirm',
])

const isActivating = computed(() => {
    return props.admin && !props.admin.isActive
})

const title = computed(() =>
    isActivating.value
        ? 'Activate Administrator'
        : 'Deactivate Administrator',
)

const description = computed(() =>
    isActivating.value
        ? `Are you sure you want to activate ${props.admin?.name}? They will be able to access the admin portal again.`
        : `Are you sure you want to deactivate ${props.admin?.name}? They will no longer be able to access the admin portal.`,
)

const confirmLabel = computed(() =>
    isActivating.value
        ? 'Activate Administrator'
        : 'Deactivate Administrator',
)
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
            <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                    <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        :class="
                            isActivating
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                        "
                    >
                        <ShieldCheck
                            v-if="isActivating"
                            class="h-5 w-5"
                        />

                        <ShieldOff
                            v-else
                            class="h-5 w-5"
                        />
                    </div>

                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">
                            {{ title }}
                        </h2>

                        <p class="mt-1 text-sm text-gray-500">
                            {{ description }}
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
                class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
                {{ error }}
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-6">
                <button
                    type="button"
                    @click="emit('close')"
                    :disabled="loading"
                    class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    @click="emit('confirm')"
                    :disabled="loading"
                    class="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    :class="
                        isActivating
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                    "
                >
                    {{ loading ? 'Updating...' : confirmLabel }}
                </button>

            </div>
        </div>
    </div>

</template>