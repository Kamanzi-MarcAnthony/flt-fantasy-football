<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import api from '../services/api'
import pitch from '../assets/images/bg-1.jpg'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Eye, EyeOff } from 'lucide-vue-next'


const showPassword = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)

  if (!success) return

 if (authStore.user.role === 'FANTASY_USER') {
  try {
    const response = await api.get('/fantasy/status')
    const status = response.data.data

    console.log('Fantasy status:', status)

    // 1. User already has a fantasy team
    if (status.hasTeam && status.teams?.length > 0) {
      const teamLeagueId = Number(status.teams[0].leagueId)

      console.log('Team league ID:', teamLeagueId)

      if (!Number.isInteger(teamLeagueId) || teamLeagueId <= 0) {
        console.error(
          'Invalid team league ID:',
          status.teams[0],
        )

        router.push('/fantasy/join-league')
        return
      }

      router.push({
        path: '/fantasy/team',
        query: {
          leagueId: String(teamLeagueId),
        },
      })

      return
    }

    // 2. User joined a league but has no team
    if (
      status.hasJoinedLeague &&
      status.memberships?.length > 0
    ) {
      const membershipLeagueId = Number(
        status.memberships[0].leagueId,
      )

      console.log(
        'Membership league ID:',
        membershipLeagueId,
      )

      if (
        !Number.isInteger(membershipLeagueId) ||
        membershipLeagueId <= 0
      ) {
        console.error(
          'Invalid membership league ID:',
          status.memberships[0],
        )

        router.push('/fantasy/join-league')
        return
      }

      router.push({
        path: '/fantasy/team/create',
        query: {
          leagueId: String(membershipLeagueId),
        },
      })

      return
    }

    // 3. User hasn't joined a league
    router.push('/fantasy/join-league')
  } catch (error) {
    console.error(
      'Unable to check fantasy status:',
      error,
    )

    router.push('/fantasy/join-league')
  }

  return
}

  // Admin users
  router.push('/admin')
}
</script>

<template>
    <div class="h-screen min-w-screen h-screen bg-cover bg-center bg-no-repeat bg-blend-multiply flex items-center justify-center px-4"
        :style="{ backgroundImage: `url(${pitch})` }">
        <div
            class="w-full max-w-md bg-[#01005679] backdrop-blur-xl rounded-3xl gap-2 p-8 shadow-sm flex flex-col justify-center outline outline-white/20">
            <div class="mb-8 p-2 text-center">
                <h1 class="text-3xl font-sans text-white">
                    FLT Fantasy Football
                </h1>
                <p class="mt-2 text-sm text-white font-medium pt-2">
                    Sign in to your account
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

                    <!-- <input id="password" v-model="password" type="password" placeholder="Enter your password"
                        class="bg-white w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10" /> -->
                        <div class="relative">
  <input
    v-model="password"
    :type="showPassword ? 'text' : 'password'"
    placeholder="Password"
    class="bg-white w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-black/10"
  />

  <button
    type="button"
    class="absolute right-3 top-1/2 -translate-y-1/2"
    @click="showPassword = !showPassword"
    :aria-label="showPassword ? 'Hide password' : 'Show password'"
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

                <!-- Error -->
                <div v-if="authStore.error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {{ authStore.error }}
                </div>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full h-12 rounded-lg bg-[#00EEFF] px-4 py-3 text-sm font-bold text-[#010056] transition ">
                    {{ authStore.loading ? 'Logging in...' : 'Login' }}
                </button>

            </form>
        </div>
    </div>
</template>
