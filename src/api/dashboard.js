import apiClient from './axios'

export const dashboardApi = {
    getStats: () => apiClient.get('/dashboard/stats'),
    getSalesChart: (period = 'week') => apiClient.get(`/dashboard/sales-chart?period=${period}`),
    getTopProducts: (limit = 5) => apiClient.get(`/dashboard/top-products?limit=${limit}`),
    getSalesByCategory: () => apiClient.get('/dashboard/sales-by-category'),
    getRecentSales: (limit = 10) => apiClient.get(`/dashboard/recent-sales?limit=${limit}`),
}
