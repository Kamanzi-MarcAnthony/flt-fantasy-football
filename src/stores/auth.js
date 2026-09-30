import { defineStore } from 'pinia'

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
        const adminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL
        const adminPassword = import.meta.env.VITE_SUPER_ADMIN_PASSWORD

        if (email !== adminEmail || password !== adminPassword) {
          throw new Error('Invalid email or password')
        }

        this.user = {
          id: 1,
          name: 'Super Admin',
          email,
          role: 'super_admin',
        }

        this.token = 'temporary-admin-token'
        this.isAuthenticated = true

        this.saveAuth()

        return true
      } catch (error) {
        this.error = error.message
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

        this.user = auth.user
        this.token = auth.token
        this.isAuthenticated = auth.isAuthenticated
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