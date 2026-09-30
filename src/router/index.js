import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue'),
    },
    {
      path: '/leagues',
      name: 'leagues',
      component: () => import('../pages/Leagues.vue'),
    },
    {
      path: '/leagues/:id',
      name: 'league-details',
      component: () => import('../pages/LeagueDetails.vue'),
    },
  ],
})

export default router
