<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000
const ACTIVITY_THROTTLE = 60 * 1000

const LAST_ACTIVITY_KEY = 'fantasy_last_activity'

let inactivityTimer = null
let lastActivity = 0

const logoutForInactivity = () => {
  clearTimeout(inactivityTimer)

  localStorage.removeItem(LAST_ACTIVITY_KEY)

  authStore.logout()

  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

const resetInactivityTimer = () => {
  if (!authStore.isAuthenticated) {
    return
  }

  const now = Date.now()

  // Only record activity once every minute
  if (now - lastActivity < ACTIVITY_THROTTLE) {
    return
  }

  lastActivity = now

  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    lastActivity.toString(),
  )

  clearTimeout(inactivityTimer)

  inactivityTimer = setTimeout(() => {
    logoutForInactivity()
  }, INACTIVITY_LIMIT)
}

const checkLastActivity = () => {
  if (!authStore.isAuthenticated) {
    return
  }

  const storedLastActivity =
    localStorage.getItem(LAST_ACTIVITY_KEY)

  if (!storedLastActivity) {
    lastActivity = Date.now()

    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      lastActivity.toString(),
    )

    resetInactivityTimer()

    return
  }

  lastActivity = Number(storedLastActivity)

  const inactiveFor = Date.now() - lastActivity

  if (inactiveFor >= INACTIVITY_LIMIT) {
    logoutForInactivity()
    return
  }

  clearTimeout(inactivityTimer)

  inactivityTimer = setTimeout(() => {
    logoutForInactivity()
  }, INACTIVITY_LIMIT - inactiveFor)
}

const activityEvents = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

onMounted(() => {
  checkLastActivity()

  activityEvents.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer)
  })
})

onUnmounted(() => {
  clearTimeout(inactivityTimer)

  activityEvents.forEach((event) => {
    window.removeEventListener(event, resetInactivityTimer)
  })
})
</script>

<template>
  <RouterView />
</template>