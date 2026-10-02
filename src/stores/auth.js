import { defineStore } from 'pinia'
import api from '../services/api'

const STORAGE_KEY = 'fantasy_auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/login', {
          email,
          password,
        })

        const { token, user } = response.data.data

        this.user = user
        this.token = token
        this.isAuthenticated = true

        this.saveAuth()

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Unable to login. Please try again.'

        return false
      } finally {
        this.loading = false
      }
    },

    saveAuth() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: this.user,
          token: this.token,
          isAuthenticated: this.isAuthenticated,
        }),
      )
    },

    loadAuth() {
      const storedAuth = localStorage.getItem(STORAGE_KEY)

      if (!storedAuth) {
        return
      }

      try {
        const auth = JSON.parse(storedAuth)

        // Make sure the saved authentication is actually valid
        if (!auth.token || !auth.user || !auth.user.role) {
          this.logout()
          return
        }

        this.user = auth.user
        this.token = auth.token
        this.isAuthenticated = true
      } catch (error) {
        console.error('Failed to load authentication:', error)
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
