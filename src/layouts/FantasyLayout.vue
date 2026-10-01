<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
    Home,
    Users,
    Trophy,
    User,
    LogOut,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="min-h-screen bg-[#061112] text-white">

        <!-- Main content -->

        <main class="mx-auto min-h-screen max-w-2xl pb-24">
            <RouterView />
        </main>


        <!-- Mobile-style bottom navigation -->

        <nav
            class="fixed bottom-0 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center justify-around border-t border-white/10 bg-[#091617]/95 px-4 py-3 backdrop-blur-xl">

            <RouterLink to="/fantasy" class="flex flex-col items-center gap-1 text-xs text-white/50"
                active-class="!text-white">
                <Home class="h-5 w-5" />
                Home
            </RouterLink>

            <RouterLink to="/fantasy/team" class="flex flex-col items-center gap-1 text-xs text-white/50"
                active-class="!text-white">
                <Users class="h-5 w-5" />
                My Team
            </RouterLink>

            <RouterLink to="/fantasy/leagues" class="flex flex-col items-center gap-1 text-xs text-white/50"
                active-class="!text-white">
                <Trophy class="h-5 w-5" />
                Leagues
            </RouterLink>

            <RouterLink to="/fantasy/profile" class="flex flex-col items-center gap-1 text-xs text-white/50"
                active-class="!text-white">
                <User class="h-5 w-5" />
                Profile
            </RouterLink>

        </nav>

    </div>
</template>