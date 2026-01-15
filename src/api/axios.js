import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract backend error message if available
        const backendData = error.response?.data

        if (backendData) {
            console.log('🔥 Interceptor Error Data:', backendData)

            // Case 1: Standard error object { message: "..." }
            if (backendData.message) {
                if (Array.isArray(backendData.message)) {
                    error.customMessage = backendData.message.join(', ')
                } else {
                    error.customMessage = backendData.message
                }
            }
            // Case 2: Direct string error
            else if (typeof backendData === 'string') {
                error.customMessage = backendData
            }

            console.log('✅ Custom error message set to:', error.customMessage)
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient
