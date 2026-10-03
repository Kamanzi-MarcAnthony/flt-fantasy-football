import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useLeagueStore = defineStore('leagues', () => {
  const leagues = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const fetchLeagues = async (force = false) => {
    if (loaded.value && !force) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/leagues')
      leagues.value = response.data.data.leagues
      loaded.value = true
    } catch (err) {
      console.error('Failed to fetch leagues:', err)
      error.value =
        err.response?.data?.message || 'Unable to load leagues.'
    } finally {
      loading.value = false
    }
  }

  const addLeague = (league) => {
    leagues.value.unshift(league)
  }

  const refreshLeagues = () => fetchLeagues(true)

  return {
    leagues,
    loaded,
    loading,
    error,
    fetchLeagues,
    addLeague,
    refreshLeagues,
  }
})