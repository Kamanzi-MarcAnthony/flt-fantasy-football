<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    Plus,
    Trophy,
    Users,
    Clock,
    Save,
} from 'lucide-vue-next'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()

const league = ref(null)
const loading = ref(true)
const error = ref(null)

const matchday = ref({
    number: 1,
    deadline: '',
    status: 'UPCOMING',
})

const fetchLeague = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await api.get(`/leagues/${route.params.id}`)

        league.value = response.data.data.league
    } catch (err) {
        console.error('Failed to fetch league:', err)

        error.value =
            err.response?.data?.message ||
            'Unable to load league.'
    } finally {
        loading.value = false
    }
}

const saveMatchday = () => {
    console.log('Matchday:', matchday.value)

    // We will connect this to the backend
    // once matchday persistence is added.
}

const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

onMounted(() => {
    fetchLeague()
})
</script>

<template>
    <div class="min-h-screen bg-[#061112] text-white">

        <!-- Header -->

        <header class="border-b border-white/10 px-5 py-5 sm:px-8">
            <div class="mx-auto flex max-w-7xl items-center justify-between">

                <button type="button" class="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
                    @click="router.push('/admin/leagues')">
                    <ArrowLeft class="h-4 w-4" />
                    Leagues
                </button>

                <div v-if="league" class="flex items-center gap-3">
                    <span class="text-sm font-medium">
                        {{ league.name }}
                    </span>

                    <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                        {{ league.status }}
                    </span>
                </div>

            </div>
        </header>


        <!-- Loading -->

        <div v-if="loading" class="flex min-h-[70vh] items-center justify-center">
            <div class="text-center">
                <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>

                <p class="mt-4 text-sm text-white/40">
                    Loading league...
                </p>
            </div>
        </div>


        <!-- Error -->

        <div v-else-if="error" class="mx-auto max-w-xl px-5 py-20 text-center">
            <h2 class="text-xl font-semibold">
                Unable to load league
            </h2>

            <p class="mt-2 text-sm text-white/40">
                {{ error }}
            </p>
        </div>


        <!-- League -->

        <main v-else-if="league" class="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

            <div class="grid gap-6 lg:grid-cols-2">

                <!-- LEFT: League details -->

                <section class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                    <!-- League heading -->

                    <div class="flex items-start justify-between gap-4">

                        <div>
                            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                                <Trophy class="h-6 w-6" />
                            </div>

                            <h1 class="text-3xl font-bold tracking-tight">
                                {{ league.name }}
                            </h1>

                            <p class="mt-2 text-sm text-white/40">
                                Fantasy Football League
                            </p>
                        </div>

                        <span
                            class="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/60">
                            {{ league.status }}
                        </span>

                    </div>


                    <!-- Details -->

                    <div class="mt-8 space-y-4">

                        <div class="flex items-center gap-3 text-sm">
                            <MapPin class="h-4 w-4 text-white/40" />

                            <span class="text-white/50">
                                Location
                            </span>

                            <span class="ml-auto">
                                {{ league.location || 'Not specified' }}
                            </span>
                        </div>

                        <div class="flex items-center gap-3 text-sm">
                            <CalendarDays class="h-4 w-4 text-white/40" />

                            <span class="text-white/50">
                                Dates
                            </span>

                            <span class="ml-auto">
                                {{ formatDate(league.startDate) }}
                                —
                                {{ formatDate(league.endDate) }}
                            </span>
                        </div>

                        <div class="flex items-center gap-3 text-sm">
                            <Users class="h-4 w-4 text-white/40" />

                            <span class="text-white/50">
                                Players
                            </span>

                            <span class="ml-auto">
                                {{ league.players?.length || 0 }}
                            </span>
                        </div>

                    </div>


                    <!-- Divider -->

                    <div class="my-8 border-t border-white/10"></div>


                    <!-- Matchday controller -->

                    <div>

                        <div class="flex items-center justify-between">

                            <div>
                                <h2 class="text-lg font-semibold">
                                    Matchday Controller
                                </h2>

                                <p class="mt-1 text-xs text-white/40">
                                    Manage the current matchday deadline.
                                </p>
                            </div>

                            <Clock class="h-5 w-5 text-white/40" />

                        </div>


                        <div class="mt-5 grid gap-4 sm:grid-cols-3">

                            <div>
                                <label class="mb-2 block text-xs text-white/40">
                                    Matchday
                                </label>

                                <input v-model="matchday.number" type="number" min="1"
                                    class="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm outline-none focus:border-white/30" />
                            </div>


                            <div>
                                <label class="mb-2 block text-xs text-white/40">
                                    Deadline
                                </label>

                                <input v-model="matchday.deadline" type="datetime-local"
                                    class="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm outline-none focus:border-white/30" />
                            </div>


                            <div>
                                <label class="mb-2 block text-xs text-white/40">
                                    Status
                                </label>

                                <select v-model="matchday.status"
                                    class="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm outline-none focus:border-white/30">
                                    <option value="UPCOMING">
                                        Upcoming
                                    </option>

                                    <option value="OPEN">
                                        Open
                                    </option>

                                    <option value="CLOSED">
                                        Closed
                                    </option>
                                </select>
                            </div>

                        </div>


                        <button type="button"
                            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                            @click="saveMatchday">
                            <Save class="h-4 w-4" />
                            Save Matchday
                        </button>

                    </div>


                    <!-- Add player -->

                    <button type="button"
                        class="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold transition hover:bg-white/[0.08]">
                        <Plus class="h-4 w-4" />
                        Add Player
                    </button>

                </section>


                <!-- RIGHT: Players -->

                <section class="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                    <div class="flex items-center justify-between">

                        <div>
                            <h2 class="text-2xl font-bold">
                                Players
                            </h2>

                            <p class="mt-1 text-sm text-white/40">
                                Players available in this league.
                            </p>
                        </div>

                        <span class="rounded-full bg-white/10 px-3 py-1.5 text-sm">
                            {{ league.players?.length || 0 }}
                        </span>

                    </div>


                    <!-- Player list -->

                    <div v-if="league.players?.length" class="mt-6 divide-y divide-white/10">

                        <div v-for="player in league.players" :key="player.id" class="flex items-center gap-4 py-4">

                            <div
                                class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                                <img v-if="player.photoUrl" :src="player.photoUrl" :alt="player.name"
                                    class="h-full w-full object-cover" />

                                <span v-else class="text-sm font-semibold text-white/60">
                                    {{ player.name?.charAt(0) }}
                                </span>
                            </div>


                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm font-medium">
                                    {{ player.name }}
                                </p>

                                <p class="mt-1 text-xs text-white/40">
                                    {{ player.position }}
                                </p>

                            </div>


                            <div class="text-right">

                                <p class="text-sm font-semibold">
                                    {{ player.ovr }}
                                </p>

                                <p class="mt-1 text-xs text-white/40">
                                    OVR
                                </p>

                            </div>

                        </div>

                    </div>


                    <!-- Empty players -->

                    <div v-else class="flex min-h-[400px] flex-col items-center justify-center text-center">

                        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                            <Users class="h-6 w-6 text-white/50" />
                        </div>

                        <h3 class="mt-5 font-semibold">
                            No players yet
                        </h3>

                        <p class="mt-2 max-w-xs text-sm leading-6 text-white/40">
                            Add players to make them available for fantasy teams.
                        </p>

                        <button type="button"
                            class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                            <Plus class="h-4 w-4" />
                            Add Player
                        </button>

                    </div>

                </section>

            </div>

        </main>

    </div>
</template>