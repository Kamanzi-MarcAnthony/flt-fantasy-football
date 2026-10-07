<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import signup from '../assets/images/signup.jpg'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validationError = ref('')

const handleSignup = async () => {
    validationError.value = ''

    if (!name.value.trim()) {
        validationError.value = 'Please enter your name.'
        return
    }

    if (!email.value.trim()) {
        validationError.value = 'Please enter your email.'
        return
    }

    if (password.value.length < 8) {
        validationError.value = 'Password must be at least 8 characters.'
        return
    }

    if (password.value !== confirmPassword.value) {
        validationError.value = 'Passwords do not match.'
        return
    }

    const success = await authStore.register(
        name.value,
        email.value,
        password.value,
        confirmPassword.value,
    )

    if (success) {
        router.push('/fantasy/join-league')
    }
}
</script>

<template>
    <div
        class="h-screen min-w-screen bg-cover bg-center bg-no-repeat bg-blend-multiply flex items-center justify-center px-4"
        :style="{ backgroundImage: `url(${signup})` }"
    >
        <div
            class="w-full max-w-md bg-[#01005688] backdrop-blur-xl rounded-3xl gap-2 p-8 shadow-sm flex flex-col justify-center outline outline-blue-500/75"
        >
            <!-- Header -->
            <div class="mb-8 p-2 text-center">
                <h1 class="text-3xl font-sans text-white">
                    FLT Fantasy Football
                </h1>

                <p class="mt-2 text-sm text-white font-medium pt-2">
                    Create your fantasy account
                </p>
            </div>

            <form
                @submit.prevent="handleSignup"
                class="space-y-5 flex flex-col justify-between gap-4"
            >
                <!-- Name -->
                <div>
                    <label
                        for="name"
                        class="mb-2 block text-sm font-medium text-white"
                    >
                        Full Name
                    </label>

                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        placeholder="Enter your full name"
                        class="w-full rounded-lg border bg-white text-black border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10"
                    />
                </div>

                <!-- Email -->
                <div>
                    <label
                        for="email"
                        class="mb-2 block text-sm font-medium text-white"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="Enter your email"
                        class="w-full rounded-lg border bg-white text-black border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10"
                    />
                </div>

                <!-- Password -->
                <div>
                    <label
                        for="password"
                        class="mb-2 block text-sm font-medium text-white"
                    >
                        Password
                    </label>

                    <div class="relative">
                        <input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Create a password"
                            class="bg-white w-full rounded-lg border border-gray-300 text-black px-4 py-3 pr-12 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10"
                        />

                        <button
                            type="button"
                            class="absolute right-3 top-1/2 text-black -translate-y-1/2"
                            @click="showPassword = !showPassword"
                            :aria-label="
                                showPassword
                                    ? 'Hide password'
                                    : 'Show password'
                            "
                        >
                            <EyeOff
                                v-if="showPassword"
                                :size="20"
                            />

                            <Eye
                                v-else
                                :size="20"
                            />
                        </button>
                    </div>
                </div>

                <!-- Confirm Password -->
                <div>
                    <label
                        for="confirmPassword"
                        class="mb-2 block text-sm font-medium text-white"
                    >
                        Confirm Password
                    </label>

                    <div class="relative">
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            :type="
                                showConfirmPassword
                                    ? 'text'
                                    : 'password'
                            "
                            placeholder="Confirm your password"
                            class="bg-white text-black w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10"
                        />

                        <button
                            type="button"
                            class="absolute right-3 top-1/2 text-black -translate-y-1/2"
                            @click="
                                showConfirmPassword =
                                    !showConfirmPassword
                            "
                            :aria-label="
                                showConfirmPassword
                                    ? 'Hide password'
                                    : 'Show password'
                            "
                        >
                            <EyeOff
                                v-if="showConfirmPassword"
                                :size="20"
                            />

                            <Eye
                                v-else
                                :size="20"
                            />
                        </button>
                    </div>
                </div>

                <!-- Error -->
                <div
                    v-if="
                        validationError ||
                        authStore.error
                    "
                    class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                    {{
                        validationError ||
                        authStore.error
                    }}
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    :disabled="authStore.loading"
                    class="w-full rounded-lg bg-[#00EEFF] px-4 py-3 text-sm font-bold text-[#010056] transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {{
                        authStore.loading
                            ? 'Creating account...'
                            : 'Create Account'
                    }}
                </button>
            </form>

            <!-- Login -->
            <div class="mt-5 text-center">
                <p class="text-sm text-white">
                    Already have an account?

                    <button
                        type="button"
                        class="font-semibold text-white underline underline-offset-2 hover:text-gray-200"
                        @click="router.push('/login')"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>