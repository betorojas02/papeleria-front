import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/auth/LoginView.vue'),
            meta: { requiresGuest: true },
        },
        {
            path: '/',
            component: () => import('@/components/layout/DashboardLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/dashboard/DashboardView.vue'),
                },
                {
                    path: 'products',
                    name: 'products',
                    component: () => import('@/views/products/ProductsListView.vue'),
                },
                {
                    path: 'products/create',
                    name: 'products-create',
                    component: () => import('@/views/products/ProductCreateView.vue'),
                    meta: { requiresAdmin: true },
                },
                {
                    path: 'products/:id/edit',
                    name: 'products-edit',
                    component: () => import('@/views/products/ProductEditView.vue'),
                    meta: { requiresAdmin: true },
                },
                {
                    path: 'categories',
                    name: 'categories',
                    component: () => import('@/views/categories/CategoriesView.vue'),
                },
                {
                    path: 'brands',
                    name: 'brands',
                    component: () => import('@/views/brands/BrandsView.vue'),
                },
                {
                    path: 'suppliers',
                    name: 'suppliers',
                    component: () => import('@/views/suppliers/SuppliersView.vue'),
                },
                {
                    path: 'purchases',
                    name: 'purchases',
                    component: () => import('@/views/purchases/PurchasesListView.vue'),
                },
                {
                    path: 'purchases/create',
                    name: 'purchases-create',
                    component: () => import('@/views/purchases/CreatePurchaseView.vue'),
                },
                {
                    path: 'customers',
                    name: 'customers',
                    component: () => import('@/views/customers/CustomersView.vue'),
                },
                {
                    path: 'pos',
                    name: 'pos',
                    component: () => import('@/views/sales/POSView.vue'),
                    meta: { requiresCashier: true },
                },
                {
                    path: 'sales',
                    name: 'sales',
                    component: () => import('@/views/sales/SalesHistoryView.vue'),
                },
                {
                    path: 'cash-register',
                    name: 'cash-register',
                    component: () => import('@/views/cash-register/CashRegisterView.vue'),
                    meta: { requiresCashier: true },
                },
            ],
        },
    ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login' })
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next({ name: 'dashboard' })
    } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({ name: 'dashboard' })
    } else if (to.meta.requiresCashier && !(authStore.isCashier || authStore.isAdmin)) {
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router
