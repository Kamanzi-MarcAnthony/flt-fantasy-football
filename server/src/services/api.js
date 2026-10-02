import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem('fantasy_auth')

  if (storedAuth) {
    try {
      const auth = JSON.parse(storedAuth)

      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`
      }
    } catch (error) {
      console.error('Failed to read authentication:', error)
    }
  }

  return config
})

export default api
