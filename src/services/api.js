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
      console.error(
        'Failed to read authentication:',
        error,
      )
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        const storedAuth =
          localStorage.getItem('fantasy_auth')

        if (!storedAuth) {
          throw error
        }

        const auth = JSON.parse(storedAuth)

        if (!auth.refreshToken) {
          throw error
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refreshToken: auth.refreshToken,
          },
        )

        const {
          token,
          refreshToken,
          user,
        } = response.data.data

        const updatedAuth = {
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }

        localStorage.setItem(
          'fantasy_auth',
          JSON.stringify(updatedAuth),
        )

        originalRequest.headers.Authorization =
          `Bearer ${token}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('fantasy_auth')

        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api