import apiClient from './axios'

export const productsApi = {
    getAll: (page = 1, limit = 10, search = '') => apiClient.get(`/products?page=${page}&limit=${limit}&search=${search}`),
    getById: (id) => apiClient.get(`/products/${id}`),
    getByCategory: (categoryId) => apiClient.get(`/products/category/${categoryId}`),
    getByBrand: (brandId) => apiClient.get(`/products/brand/${brandId}`),
    getLowStock: () => apiClient.get('/products/low-stock'),
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.patch(`/products/${id}`, data),
    updateStock: (id, quantity) => apiClient.patch(`/products/${id}/stock`, { quantity }),
    delete: (id) => apiClient.delete(`/products/${id}`),
}
