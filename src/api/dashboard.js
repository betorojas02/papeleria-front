import apiClient from './axios'

export const dashboardApi = {
    getStats: (params) => apiClient.get('/dashboard/stats', { params }),
    getSalesChart: (params) => apiClient.get('/dashboard/sales-chart', { params }),
    getTopProducts: (limit = 5, params) => apiClient.get(`/dashboard/top-products`, { params: { limit, ...params } }),
    getSalesByCategory: (params) => apiClient.get('/dashboard/sales-by-category', { params }),
    getRecentSales: (limit = 10, params) => apiClient.get(`/dashboard/recent-sales`, { params: { limit, ...params } }),
}
