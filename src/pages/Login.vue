<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import pitch from '../assets/images/bg-1.jpg'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
    const success = await authStore.login(
        email.value,
        password.value
    )

    if (success) {
        router.push('/Leagues')
    }
}
</script>

<template>
    <div class="h-screen min-w-screen min-h-screen bg-cover bg-center bg-no-repeat bg-blend-multiply flex items-center justify-center px-4"
        :style="{ backgroundImage: `url(${pitch})` }">
        <div
            class="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl gap-2 p-8 shadow-sm flex flex-col justify-center outline outline-blue-500/75">
            <div class="mb-8 p-2 text-center">
                <h1 class="text-3xl font-sans text-white">
                    Fantasy Football
                </h1>
                <p class="mt-2 text-sm text-white font-medium pt-2">
                    Sign in to your admin account
                </p>
            </div>
            <form @submit.prevent="handleLogin" class="space-y-5 flex flex-col  justify-between gap-4 ">
                <div>
                    <label for="email" class="mb-2 block text-sm font-medium text-white">
                        Email
                    </label>

                    <input id="email" v-model="email" type="email" placeholder="Enter your email"
                        class="w-full rounded-lg border bg-white border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10" />
                </div>

                <div>
                    <label for="password" class="mb-2 block text-sm font-medium text-white">
                        Password
                    </label>

                    <input id="password" v-model="password" type="password" placeholder="Enter your password"
                        class="bg-white w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10" />
                </div>

                <!-- Error -->
                <div v-if="authStore.error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {{ authStore.error }}
                </div>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
                    {{ authStore.loading ? 'Logging in...' : 'Login' }}
                </button>

            </form>
        </div>
    </div>
</template>
