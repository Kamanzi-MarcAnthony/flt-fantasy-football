import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // --------------------------------------------------
    // AUTH
    // --------------------------------------------------

    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue'),
      meta: {
        guestOnly: true,
      },
    },

    // --------------------------------------------------
    // ADMIN PORTAL
    // --------------------------------------------------

    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['super_admin', 'admin'],
      },

      children: [
        {
          path: '',
          redirect: '/admin/leagues',
        },

        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../pages/admin/Dashboard.vue'),
        },

        {
          path: 'leagues',
          name: 'admin-leagues',
          component: () => import('../pages/admin/Leagues.vue'),
        },

        {
          path: 'leagues/create',
          name: 'admin-create-league',
          component: () => import('../pages/admin/CreateLeague.vue'),
        },

        {
          path: 'leagues/:id',
          name: 'admin-league-details',
          component: () => import('../pages/admin/LeagueDetails.vue'),
        },
      ],
    },

    // --------------------------------------------------
    // FANTASY USER PORTAL
    // --------------------------------------------------

    {
      path: '/fantasy',
      component: () => import('../layouts/FantasyLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['player'],
      },

      children: [
        {
          path: '',
          name: 'fantasy-home',
          component: () => import('../pages/fantasy/Home.vue'),
        },

        {
          path: 'team',
          name: 'fantasy-team',
          component: () => import('../pages/fantasy/MyTeam.vue'),
        },

        {
          path: 'players',
          name: 'fantasy-players',
          component: () => import('../pages/fantasy/Players.vue'),
        },

        {
          path: 'leagues',
          name: 'fantasy-leagues',
          component: () => import('../pages/fantasy/Leagues.vue'),
        },

        {
          path: 'leaderboard',
          name: 'fantasy-leaderboard',
          component: () => import('../pages/fantasy/Leaderboard.vue'),
        },

        {
          path: 'profile',
          name: 'fantasy-profile',
          component: () => import('../pages/fantasy/Profile.vue'),
        },
      ],
    },

    // --------------------------------------------------
    // OLD URL REDIRECTS
    // --------------------------------------------------

    {
      path: '/leagues',
      redirect: '/admin/leagues',
    },

    {
      path: '/leagues/create',
      redirect: '/admin/leagues/create',
    },

    {
      path: '/leagues/:id',
      redirect: (to) => `/admin/leagues/${to.params.id}`,
    },

    {
      path: '/',
      redirect: '/login',
    },
  ],
})

// --------------------------------------------------
// AUTHENTICATION GUARD
// --------------------------------------------------

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // User needs to be logged in
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  // Logged-in users don't need to see login
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.user?.role === 'player') {
      return '/fantasy'
    }

    return '/admin'
  }

  // Check role
  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    if (authStore.user?.role === 'player') {
      return '/fantasy'
    }

    return '/admin'
  }
})

export default router
