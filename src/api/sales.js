import apiClient from './axios'

export const salesApi = {
    getAll: (page = 1, limit = 10, search = '', date = '') => apiClient.get(`/sales?page=${page}&limit=${limit}&search=${search}&date=${date}`),
    getById: (id) => apiClient.get(`/sales/${id}`),
    create: (data) => apiClient.post('/sales', data),
    delete: (id) => apiClient.delete(`/sales/${id}`),
}
