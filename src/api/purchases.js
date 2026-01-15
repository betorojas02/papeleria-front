import apiClient from './axios'

export const purchasesApi = {
    getAll: () => apiClient.get('/purchases'),
    getById: (id) => apiClient.get(`/purchases/${id}`),
    create: (data) => apiClient.post('/purchases', data),
    delete: (id) => apiClient.delete(`/purchases/${id}`),
}
