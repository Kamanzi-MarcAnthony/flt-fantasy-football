import { createRouter, createWebHistory } from 'vue-router'
import PlayerProfile from '../pages/admin/PlayerProfile.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // AUTH
    {
      path: '/',
      name: 'Landing',
      component: () => import('../pages/Landing.vue'),
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
      path: '/signup',
      name: 'Signup',
      component: () => import('../pages/Signup.vue'),
    },

    // ADMIN PORTAL
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['SUPER_ADMIN', 'ADMIN'],
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
          path: 'admins',
          name: 'admin-admins',
          component: () => import('../pages/admin/Admins.vue'),
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

        {
          path: '/admin/players',
          component: () => import('../pages/admin/Players.vue'),
          meta: {
            requiresAuth: true,
            roles: ['SUPER_ADMIN', 'ADMIN'],
          },
        },

        {
          path: '/admin/players/:id',
          component: PlayerProfile,
          meta: {
          roles: ['SUPER_ADMIN', 'ADMIN'],
          },
        },
        {
  path: 'fantasy-players',
  name: 'admin-fantasy-players',
  component: () => import('../pages/admin/FantasyPlayers.vue'),
}
      ],
    },

    //FANTASY ONBOARDING 

{
  path: '/fantasy/join-league',
  name: 'FantasyJoinLeague',
  component: () => import('../pages/fantasy/JoinLeague.vue'),
},

    // FANTASY USER PORTAL
{
  path: '/fantasy',
  component: () => import('../layouts/FantasyLayout.vue'),
  meta: {
    requiresAuth: true,
    roles: ['FANTASY_USER'],
  },

  children: [
    {
      path: '',
      redirect: '/fantasy/team',
    },

    {
      path: 'team',
      name: 'fantasy-team',
      component: () => import('../pages/fantasy/CreateTeam.vue'),
    },

    {
      path: 'players',
      name: 'fantasy-players',
      component: () => import('../components/fantasy/PlayerSelectionModal.vue'),
    },

    {
      path: 'leagues',
      name: 'fantasy-leagues',
      component: () => import('../pages/fantasy/JoinLeague.vue'),
    },

    // {
    //   path: 'leaderboard',
    //   name: 'fantasy-leaderboard',
    //   component: () => import('../pages/fantasy/LeaderBoard.vue'),
    // },

    {
      path: 'profile',
      name: 'fantasy-profile',
      component: () => import('../pages/fantasy/Profile.vue'),
    },
  ],
},

{
  path: '/fantasy/team/create',
  name: 'FantasyCreateTeam',
  component: () => import('../pages/fantasy/CreateTeam.vue'),
  meta: {
    requiresAuth: true,
    roles: ['FANTASY_USER'],
  },
},

    // OLD URL REDIRECTS
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

// AUTHENTICATION GUARD
router.beforeEach((to) => {
    const authStore = useAuthStore()

    const requiresAuth = to.meta.requiresAuth
    const isFantasyRoute = to.path.startsWith('/fantasy')
    const isAdminRoute = to.path.startsWith('/admin')

    if (requiresAuth && !authStore.isAuthenticated) {
        return '/login'
    }

    if (isFantasyRoute && authStore.user?.role !== 'FANTASY_USER') {
        return '/login'
    }

    if (
        isAdminRoute &&
        !['ADMIN', 'SUPER_ADMIN'].includes(authStore.user?.role)
    ) {
        return '/login'
    }

    return true
})

export default router
