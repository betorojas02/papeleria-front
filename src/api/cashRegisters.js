import apiClient from './axios'

export const cashRegistersApi = {
    getAll: () => apiClient.get('/cash-registers'),
    getOpen: () => apiClient.get('/cash-registers/open'),
    getById: (id) => apiClient.get(`/cash-registers/${id}`),
    open: (data) => apiClient.post('/cash-registers/open', data),
    close: (id, data) => apiClient.patch(`/cash-registers/${id}/close`, data),
    delete: (id) => apiClient.delete(`/cash-registers/${id}`),
}
