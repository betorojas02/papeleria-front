import apiClient from './axios'

export const brandsApi = {
    getAll: () => apiClient.get('/brands'),
    getById: (id) => apiClient.get(`/brands/${id}`),
    create: (data) => apiClient.post('/brands', data),
    update: (id, data) => apiClient.patch(`/brands/${id}`, data),
    delete: (id) => apiClient.delete(`/brands/${id}`),
}
