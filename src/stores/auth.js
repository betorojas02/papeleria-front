import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const loading = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isEmployee = computed(() => user.value?.role === 'employee')
    const isCashier = computed(() => user.value?.role === 'cashier')

    // Initialize user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        try {
            user.value = JSON.parse(storedUser)
        } catch (e) {
            localStorage.removeItem('user')
        }
    }

    async function login(credentials) {
        loading.value = true
        try {
            console.log('🔐 Attempting login with:', credentials.email)
            console.log('📡 API endpoint:', import.meta.env.VITE_API_URL + '/auth/login')

            const { data } = await authApi.login(credentials)

            console.log('✅ Login response:', data)

            // El backend retorna access_token, no token
            token.value = data.data.access_token
            user.value = data.data.user

            localStorage.setItem('token', data.data.access_token)
            localStorage.setItem('user', JSON.stringify(data.data.user))

            return { success: true }
        } catch (error) {
            console.error('❌ Login error:', error.response?.data || error.message)
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            }
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            token.value = null
            user.value = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }

    async function fetchProfile() {
        try {
            const { data } = await authApi.getProfile()
            user.value = data.data
            localStorage.setItem('user', JSON.stringify(data.data))
        } catch (error) {
            console.error('Fetch profile error:', error)
            logout()
        }
    }

    return {
        user,
        token,
        loading,
        isAuthenticated,
        userRole,
        isAdmin,
        isEmployee,
        isCashier,
        login,
        logout,
        fetchProfile,
    }
})
