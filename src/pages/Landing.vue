<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useRouter } from 'vue-router'
import pitch from '../assets/images/pitch.jpg'

const router = useRouter()

const goToLogin = () => {
    router.push('/login')
}

const goToSignup = () => {
    router.push('/signup')
}
</script>

<template>
    <div
        class="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-8"
        :style="{ backgroundImage: `url(${pitch})` }"
    >
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-black/60"></div>

        <!-- Content -->
        <div class="relative z-10 w-full max-w-md">

            <!-- Main Card -->
            <div
                class="overflow-hidden flex flex-col items-center p-2 gap-1 rounded-3xl bg-[#010056] shadow-2xl backdrop-blur-xl outline outline-white/10"
            >
            <!-- Logo / Brand -->
            <div class="mb-5 text-center font-black pt-4">
                <h1 class="text-2xl font-black text-white">
                    FLT Fantasy Football
                </h1>
            </div>

                <!-- Hero Image -->
                <div class="h-2/3 rounded-br-4xl overflow-hidden">
                    <img
                        src="../assets/images/fantasy-players.png"
                        alt="Fantasy Football"
                        class="h-full w-full object-cover"
                    />
                </div>

                <!-- Card Content -->
                <div class="p-6 flex flex-col gap-3">

                    <h2
                        class="text-2xl font-bold leading-tight text-white"
                    >
                        Build your team.
                        <br />
                        Own the matchday.
                    </h2>

                    <p
                        class="mt-4 text-sm leading-relaxed text-white/90"
                    >
                        Create your fantasy team, pick your
                        favourite players and compete with your
                        friends every matchday.
                    </p>

                    <!-- Actions -->
                    <div class="mt-6 grid grid-cols-2 gap-2">

                        <button
                            type="button"
                            @click="goToLogin"
                            class="rounded-full border border-white px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                            Log in
                        </button>

                        <button
                            type="button"
                            @click="goToSignup"
                            class="rounded-full bg-white px-5 py-3 text-sm font-medium text-purple-950 transition hover:bg-gray-100"
                        >
                            Register now
                        </button>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>