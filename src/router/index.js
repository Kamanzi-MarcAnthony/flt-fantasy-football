import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/leagues',
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue'),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/leagues',
      name: 'leagues',
      component: () => import('../pages/Leagues.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/leagues/create',
      name: 'create-league',
      component: () => import('../pages/CreateLeague.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/leagues/:id',
      name: 'league-details',
      component: () => import('../pages/LeagueDetails.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/leagues'
  }
})

export default router
