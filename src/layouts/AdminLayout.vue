<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
    LayoutDashboard,
    Trophy,
    Users,
    CalendarDays,
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

        <!-- Desktop sidebar -->

        <aside class="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#081516] lg:flex lg:flex-col">

            <!-- Logo -->

            <div class="border-b border-white/10 px-6 py-6">
                <h1 class="text-xl font-bold">
                    Fantasy
                </h1>

                <p class="mt-1 text-xs text-white/40">
                    Admin Portal
                </p>
            </div>

            <!-- Navigation -->

            <nav class="flex-1 space-y-1 p-4">

                <RouterLink to="/admin"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    active-class="bg-white/10 !text-white">
                    <LayoutDashboard class="h-5 w-5" />
                    Dashboard
                </RouterLink>

                <RouterLink to="/admin/leagues"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    active-class="bg-white/10 !text-white">
                    <Trophy class="h-5 w-5" />
                    Leagues
                </RouterLink>

                <RouterLink to="/admin/players"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    active-class="bg-white/10 !text-white">
                    <Users class="h-5 w-5" />
                    Players
                </RouterLink>

                <RouterLink to="/admin/matches"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    active-class="bg-white/10 !text-white">
                    <CalendarDays class="h-5 w-5" />
                    Matches
                </RouterLink>

            </nav>

            <!-- Logout -->

            <div class="border-t border-white/10 p-4">

                <button type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-red-500/10 hover:text-red-400"
                    @click="handleLogout">
                    <LogOut class="h-5 w-5" />
                    Logout
                </button>

            </div>

        </aside>


        <!-- Main area -->

        <div class="lg:pl-64">

            <main>
                <RouterView />
            </main>

        </div>

    </div>
</template>