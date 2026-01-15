import apiClient from './axios'

export const customersApi = {
    getAll: () => apiClient.get('/customers'),
    search: (query) => apiClient.get('/customers/search', { params: { q: query } }),
    getById: (id) => apiClient.get(`/customers/${id}`),
    create: (data) => apiClient.post('/customers', data),
    update: (id, data) => apiClient.patch(`/customers/${id}`, data),
    delete: (id) => apiClient.delete(`/customers/${id}`),
}
