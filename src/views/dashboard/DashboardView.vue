<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Resumen y estadísticas del negocio</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Ventas Totales"
        :value="stats.totalSales"
        :icon="ChartBarIcon"
        variant="primary"
      />
      <StatCard
        label="Ingresos Totales"
        :value="stats.totalRevenue"
        :icon="CurrencyDollarIcon"
        variant="success"
        format="currency"
      />
      <StatCard
        label="Productos"
        :value="stats.totalProducts"
        :icon="ShoppingBagIcon"
        variant="primary"
      />
      <StatCard
        label="Stock Bajo"
        :value="stats.lowStockProducts"
        :icon="ExclamationTriangleIcon"
        variant="warning"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <AppCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800">Ventas</h3>
            <select
              v-model="chartPeriod"
              @change="loadSalesChart"
              class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="year">Último año</option>
            </select>
          </div>
        </template>
        <div class="h-64">
          <LineChart
            v-if="salesChart.labels.length > 0"
            :labels="salesChart.labels"
            :data="salesChart.data"
            label="Ventas"
          />
          <div v-else class="flex items-center justify-center h-full text-slate-400">
            No hay datos de ventas
          </div>
        </div>
      </AppCard>

      <!-- Sales by Category -->
      <AppCard>
        <template #header>
          <h3 class="font-bold text-slate-800">Ventas por Categoría</h3>
        </template>
        <div class="h-64">
          <DoughnutChart
            v-if="salesByCategory.length > 0"
            :data="salesByCategory"
          />
          <div v-else class="flex items-center justify-center h-full text-slate-400">
            No hay datos por categoría
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Tables Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Products -->
      <AppCard>
        <template #header>
          <h3 class="font-bold text-slate-800">Productos Más Vendidos</h3>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">#</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Producto</th>
                <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Vendidos</th>
                <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(product, index) in topProducts"
                :key="product.id"
                class="border-b border-slate-100"
              >
                <td class="py-2 px-3">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-2 px-3 font-medium text-slate-800">{{ product.name }}</td>
                <td class="py-2 px-3 text-right text-slate-600">{{ product.totalSold }}</td>
                <td class="py-2 px-3 text-right font-bold text-slate-800">${{ product.revenue.toLocaleString() }}</td>
              </tr>
              <tr v-if="topProducts.length === 0">
                <td colspan="4" class="py-8 text-center text-slate-400">
                  No hay datos de productos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <!-- Recent Sales -->
      <AppCard>
        <template #header>
          <h3 class="font-bold text-slate-800">Ventas Recientes</h3>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in recentSales"
                :key="sale.id"
                class="border-b border-slate-100"
              >
                <td class="py-2 px-3 text-slate-800">
                  {{ sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Cliente general' }}
                </td>
                <td class="py-2 px-3 text-sm text-slate-600">
                  {{ formatDate(sale.createdAt) }}
                </td>
                <td class="py-2 px-3 text-right font-bold text-slate-800">
                  ${{ sale.total.toLocaleString() }}
                </td>
              </tr>
              <tr v-if="recentSales.length === 0">
                <td colspan="3" class="py-8 text-center text-slate-400">
                  No hay ventas recientes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import LineChart from '@/components/dashboard/LineChart.vue'
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const { error } = useToast()

const stats = reactive({
  totalSales: 0,
  totalRevenue: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  todaySales: 0,
  todayRevenue: 0
})

const salesChart = reactive({
  labels: [],
  data: []
})

const salesByCategory = ref([])
const topProducts = ref([])
const recentSales = ref([])
const chartPeriod = ref('week')

const loadStats = async () => {
  try {
    const { data } = await dashboardApi.getStats()
    Object.assign(stats, data.data)
  } catch (err) {
    console.error('Error loading stats:', err)
    error('Error al cargar estadísticas')
  }
}

const loadSalesChart = async () => {
  try {
    const { data } = await dashboardApi.getSalesChart(chartPeriod.value)
    salesChart.labels = data.data.labels
    salesChart.data = data.data.data
  } catch (err) {
    console.error('Error loading sales chart:', err)
    error('Error al cargar gráfica de ventas')
  }
}

const loadSalesByCategory = async () => {
  try {
    const { data } = await dashboardApi.getSalesByCategory()
    salesByCategory.value = data.data
  } catch (err) {
    console.error('Error loading sales by category:', err)
    error('Error al cargar ventas por categoría')
  }
}

const loadTopProducts = async () => {
  try {
    const { data } = await dashboardApi.getTopProducts(5)
    topProducts.value = data.data
  } catch (err) {
    console.error('Error loading top products:', err)
    error('Error al cargar productos más vendidos')
  }
}

const loadRecentSales = async () => {
  try {
    const { data } = await dashboardApi.getRecentSales(10)
    recentSales.value = data.data
  } catch (err) {
    console.error('Error loading recent sales:', err)
    error('Error al cargar ventas recientes')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadSalesChart(),
    loadSalesByCategory(),
    loadTopProducts(),
    loadRecentSales()
  ])
})
</script>
