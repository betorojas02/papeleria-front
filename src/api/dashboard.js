import apiClient from './axios'

export const dashboardApi = {
    getStats: (params) => apiClient.get('/dashboard/stats', { params }),
    getSalesChart: (params) => apiClient.get('/dashboard/sales-chart', { params }),
    getTopProducts: (limit = 5, params) => apiClient.get(`/dashboard/top-products`, { params: { limit, ...params } }),
    getSalesByCategory: (params) => apiClient.get('/dashboard/sales-by-category', { params }),
    getRecentSales: (limit = 10, params) => apiClient.get(`/dashboard/recent-sales`, { params: { limit, ...params } }),

    // New: Services analytics
    getTopItems: (params) => apiClient.get('/dashboard/top-items', { params }),
    getItemsBreakdown: (params) => apiClient.get('/dashboard/items-breakdown', { params }),

    // New: Payment methods and stock alerts
    getPaymentMethods: (params) => apiClient.get('/dashboard/payment-methods', { params }),
    getLowStock: (params) => apiClient.get('/dashboard/low-stock', { params }),
}
