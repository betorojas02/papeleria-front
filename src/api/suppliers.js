import apiClient from './axios'

export const suppliersApi = {
    getAll: () => apiClient.get('/suppliers'),
    getById: (id) => apiClient.get(`/suppliers/${id}`),
    create: (data) => apiClient.post('/suppliers', data),
    update: (id, data) => apiClient.patch(`/suppliers/${id}`, data),
    delete: (id) => apiClient.delete(`/suppliers/${id}`),
}
