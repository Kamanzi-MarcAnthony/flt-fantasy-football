<script setup>
import { onMounted, ref } from 'vue'
import { Trash2, RefreshCw, Users, Trophy, ShieldCheck } from 'lucide-vue-next'
import api from '../../services/api'

const users = ref([])
const loading = ref(true)
const deletingId = ref(null)
const error = ref('')

const loadFantasyUsers = async () => {
    try {
        loading.value = true
        error.value = ''

        const response = await api.get('/admin/fantasy-users')

        users.value = response.data.data.users
    } catch (err) {
        console.error('Load fantasy users error:', err)

        error.value =
            err.response?.data?.message ||
            'Unable to load fantasy players'
    } finally {
        loading.value = false
    }
}

const deleteUser = async (user) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete ${user.name}? This will permanently remove their fantasy account and fantasy data.`,
    )

    if (!confirmed) return

    try {
        deletingId.value = user.id

        await api.delete(`/admin/fantasy-users/${user.id}`)

        users.value = users.value.filter(
            (item) => item.id !== user.id,
        )
    } catch (err) {
        console.error('Delete fantasy user error:', err)

        window.alert(
            err.response?.data?.message ||
            'Unable to delete fantasy player',
        )
    } finally {
        deletingId.value = null
    }
}

const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

onMounted(loadFantasyUsers)
</script>

<template>
    <div class="min-h-screen bg-[#061112] px-6 py-8 text-white lg:px-10">

        <!-- Header -->

        <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
                <div class="flex items-center gap-3">
                    <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                        <Users class="h-5 w-5 text-white/70" />
                    </div>

                    <div>
                        <h1 class="text-2xl font-bold">
                            Fantasy Players
                        </h1>

                        <p class="mt-1 text-sm text-white/40">
                            Manage registered fantasy users
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                @click="loadFantasyUsers"
                :disabled="loading"
                class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                <RefreshCw
                    class="h-4 w-4"
                    :class="{ 'animate-spin': loading }"
                />

                Refresh
            </button>

        </div>


        <!-- Summary -->

        <div class="mb-6 grid gap-4 sm:grid-cols-3">

            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div class="flex items-center justify-between">
                    <p class="text-sm text-white/40">
                        Registered Players
                    </p>

                    <Users class="h-5 w-5 text-white/30" />
                </div>

                <p class="mt-3 text-2xl font-bold">
                    {{ users.length }}
                </p>
            </div>


            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div class="flex items-center justify-between">
                    <p class="text-sm text-white/40">
                        Active Players
                    </p>

                    <ShieldCheck class="h-5 w-5 text-white/30" />
                </div>

                <p class="mt-3 text-2xl font-bold">
                    {{ users.filter(user => user.isActive).length }}
                </p>
            </div>


            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div class="flex items-center justify-between">
                    <p class="text-sm text-white/40">
                        Teams Created
                    </p>

                    <Trophy class="h-5 w-5 text-white/30" />
                </div>

                <p class="mt-3 text-2xl font-bold">
                    {{ users.filter(user => user.teams?.length).length }}
                </p>
            </div>

        </div>


        <!-- Error -->

        <div
            v-if="error"
            class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
            {{ error }}
        </div>


        <!-- Loading -->

        <div
            v-if="loading"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/40"
        >
            Loading fantasy players...
        </div>


        <!-- Empty -->

        <div
            v-else-if="users.length === 0"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center"
        >
            <Users class="mx-auto h-10 w-10 text-white/20" />

            <h3 class="mt-4 text-lg font-semibold">
                No fantasy players yet
            </h3>

            <p class="mt-2 text-sm text-white/40">
                Registered fantasy users will appear here.
            </p>
        </div>


        <!-- Desktop table -->

        <div
            v-else
            class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >

            <div class="overflow-x-auto">

                <table class="w-full min-w-[900px]">

                    <thead>
                        <tr class="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/30">

                            <th class="px-6 py-4 font-medium">
                                Player
                            </th>

                            <th class="px-6 py-4 font-medium">
                                Status
                            </th>

                            <th class="px-6 py-4 font-medium">
                                Leagues
                            </th>

                            <th class="px-6 py-4 font-medium">
                                Team
                            </th>

                            <th class="px-6 py-4 font-medium">
                                Registered
                            </th>

                            <th class="px-6 py-4 text-right font-medium">
                                Actions
                            </th>

                        </tr>
                    </thead>


                    <tbody class="divide-y divide-white/5">

                        <tr
                            v-for="user in users"
                            :key="user.id"
                            class="transition hover:bg-white/[0.02]"
                        >

                            <!-- Player -->

                            <td class="px-6 py-5">

                                <div class="flex items-center gap-3">

                                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                                        {{ user.name?.charAt(0)?.toUpperCase() }}
                                    </div>

                                    <div>
                                        <p class="font-medium">
                                            {{ user.name }}
                                        </p>

                                        <p class="mt-0.5 text-sm text-white/40">
                                            {{ user.email }}
                                        </p>
                                    </div>

                                </div>

                            </td>


                            <!-- Status -->

                            <td class="px-6 py-5">

                                <span
                                    v-if="user.isActive"
                                    class="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                                >
                                    Active
                                </span>

                                <span
                                    v-else
                                    class="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
                                >
                                    Inactive
                                </span>

                            </td>


                            <!-- Leagues -->

                            <td class="px-6 py-5">

                                <div
                                    v-if="user.leagues?.length"
                                    class="flex flex-wrap gap-1.5"
                                >
                                    <span
                                        v-for="league in user.leagues"
                                        :key="league.id"
                                        class="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/60"
                                    >
                                        {{ league.name }}
                                    </span>
                                </div>

                                <span
                                    v-else
                                    class="text-sm text-white/30"
                                >
                                    No leagues
                                </span>

                            </td>


                            <!-- Team -->

                            <td class="px-6 py-5">

                                <span
                                    v-if="user.teams?.length"
                                    class="text-sm text-white/70"
                                >
                                    {{ user.teams[0].name }}
                                </span>

                                <span
                                    v-else
                                    class="text-sm text-white/30"
                                >
                                    No team
                                </span>

                            </td>


                            <!-- Date -->

                            <td class="px-6 py-5 text-sm text-white/50">
                                {{ formatDate(user.createdAt) }}
                            </td>


                            <!-- Actions -->

                            <td class="px-6 py-5 text-right">

                                <button
                                    type="button"
                                    @click="deleteUser(user)"
                                    :disabled="deletingId === user.id"
                                    class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 class="h-4 w-4" />

                                    {{
                                        deletingId === user.id
                                            ? 'Deleting...'
                                            : 'Delete'
                                    }}
                                </button>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>
</template>