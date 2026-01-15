import apiClient from './axios'

export const authApi = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
    refreshToken: () => apiClient.post('/auth/refresh'),
}
