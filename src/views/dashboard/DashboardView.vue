<template>
  <div class="space-y-8">
    <!-- Header & Filter -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-1">
          Mostrando datos de: <span class="font-semibold text-primary-600">{{ currentPeriodLabel }}</span>
          <span v-if="lastUpdated" class="text-xs text-slate-400 ml-2">(Actualizado: {{ lastUpdated }})</span>
        </p>
      </div>
      <DashboardFilter @change="handleFilterChange" />
    </div>

    <!-- Section: Financial Overview -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2">
        <CurrencyDollarIcon class="w-5 h-5 text-slate-400" />
        Resumen Financiero
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Ventas Totales"
          :value="stats.totalSales"
          :icon="ChartBarIcon"
          variant="primary"
          :footer="`${currentPeriodLabel}`"
        />
        <StatCard
          label="Ingresos"
          :value="stats.totalRevenue"
          :icon="CurrencyDollarIcon"
          variant="success"
          format="currency"
          :footer="`${currentPeriodLabel}`"
        />
        <!-- Additional KPI: Ticket Promedio -->
        <StatCard
          label="Ticket Promedio"
          :value="averageTicket"
          :icon="ReceiptPercentIcon"
          variant="info"
          format="currency"
        />
      </div>
    </section>

    <!-- Section: Product & Inventory -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2">
        <ShoppingBagIcon class="w-5 h-5 text-slate-400" />
        Inventario y Productos
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Productos Activos"
          :value="stats.totalProducts"
          :icon="ShoppingBagIcon"
          variant="primary"
        />
        <StatCard
          label="Stock Bajo"
          :value="stats.lowStockProducts"
          :icon="ExclamationTriangleIcon"
          variant="warning"
          footer="Requieren atención"
        />
      </div>
    </section>

    <!-- Cash Register Status (Always visible) -->
    <CashRegisterStatus />

    <!-- Analytics Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800">Tendencia de Ventas</h3>
            <p class="text-xs text-slate-400">Ingresos por día en el periodo seleccionado</p>
          </div>
        </template>
        <div class="h-64 relative">
          <div v-if="isLoading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <span class="text-primary-600 font-medium animate-pulse">Cargando datos...</span>
          </div>
          <LineChart
            v-if="salesChart.labels.length > 0"
            :key="chartKey"
            :labels="salesChart.labels"
            :data="salesChart.data"
            label="Ventas ($)"
          />
          <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-lg">
            <ChartBarIcon class="w-12 h-12 text-slate-300" />
            <span class="font-medium text-slate-500">No hay ventas en este periodo</span>
            <span class="text-xs">Intenta seleccionar otro rango de fechas</span>
          </div>
        </div>
      </AppCard>

      <!-- Sales by Category -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800">Ventas por Categoría</h3>
            <p class="text-xs text-slate-400">Distribución de ingresos</p>
          </div>
        </template>
        <div class="h-64 flex items-center justify-center relative">
          <div v-if="isLoading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <span class="text-primary-600 font-medium animate-pulse">Cargando...</span>
          </div>
          <DoughnutChart
            v-if="salesByCategory.length > 0"
            :key="chartKey"
            :data="salesByCategory"
          />
          <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-lg w-full">
            <ShoppingBagIcon class="w-12 h-12 text-slate-300" />
            <span class="font-medium text-slate-500">Sin datos de categorías</span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Detailed Lists Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Products -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">🏆 Top Productos Vendidos</h3>
            <p class="text-sm text-slate-500">Los 5 productos con mayores ingresos en este periodo</p>
          </div>
        </template>
        <div class="overflow-x-auto relative min-h-[150px]">
          <div v-if="isLoading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
             <span class="text-primary-600 font-medium animate-pulse">Actualizando lista...</span>
          </div>
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
                class="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td class="py-2 px-3">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-2 px-3 font-medium text-slate-800">{{ product.name }}</td>
                <td class="py-2 px-3 text-right text-slate-600">{{ product.totalSold }}</td>
                <td class="py-2 px-3 text-right font-bold text-primary-600">${{ product.revenue.toLocaleString() }}</td>
              </tr>
              <tr v-if="topProducts.length === 0 && !isLoading">
                <td colspan="4" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-2">
                    <ShoppingBagIcon class="w-8 h-8 opacity-40" />
                     <span class="font-medium">No hay productos vendidos</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <!-- Recent Sales (Always shows global recent sales, maybe unaffected by filter? Or should affect? Let's keep it mostly recent but allow filter if desirable. User asked to can filter 'each table'. Let's filter recent sales too if API supports it, currently API takes limit only. Ah, DashboardService.getRecentSales only takes limit. Let's keep it as 'Recent Sales'      <!-- Recent Sales -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">📝 Historial de Transacciones ({{ currentPeriodLabel }})</h3>
            <p class="text-sm text-slate-500">Lista detallada de las últimas ventas registradas</p>
          </div>
        </template>
        <div class="overflow-x-auto relative min-h-[150px]">
          <div v-if="isLoading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
             <span class="text-primary-600 font-medium animate-pulse">Cargando transacciones...</span>
          </div>
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
                class="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td class="py-2 px-3 text-slate-800">
                  <div class="font-medium">{{ sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Cliente General' }}</div>
                  <div class="text-[10px] text-slate-400 capitalize">{{ sale.payments?.[0]?.paymentMethod || 'Efectivo' }}</div>
                </td>
                <td class="py-2 px-3 text-sm text-slate-600">
                  {{ formatDate(sale.createdAt) }}
                </td>
                <td class="py-2 px-3 text-right font-bold text-slate-800">
                  ${{ sale.total.toLocaleString() }}
                </td>
              </tr>
               <tr v-if="recentSales.length === 0 && !isLoading">
                <td colspan="3" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-2">
                    <CurrencyDollarIcon class="w-8 h-8 opacity-40" />
                     <span class="font-medium">No se encontraron ventas</span>
                  </div>
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
import { ref, reactive, computed } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import LineChart from '@/components/dashboard/LineChart.vue'
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'
import CashRegisterStatus from '@/components/dashboard/CashRegisterStatus.vue'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon
} from '@heroicons/vue/24/outline'

const { error } = useToast()

const stats = reactive({
  totalSales: 0,
  totalRevenue: 0,
  totalProducts: 0,
  lowStockProducts: 0
})

const salesChart = reactive({
  labels: [],
  data: []
})

const salesByCategory = ref([])
const topProducts = ref([])
const recentSales = ref([])

const currentFilter = reactive({
  startDate: null,
  endDate: null
})

const currentPeriodLabel = ref('Hoy')

const averageTicket = computed(() => {
  return stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0
})

const isLoading = ref(false)

const handleFilterChange = async ({ startDate, endDate, label }) => {
  console.log('Filter Changed:', { startDate, endDate, label })
  currentFilter.startDate = startDate
  currentFilter.endDate = endDate
  currentPeriodLabel.value = label
  await loadAllData()
  lastUpdated.value = new Date().toLocaleTimeString()
}

const chartKey = ref(0)

const loadAllData = async () => {
  isLoading.value = true
  console.log('Loading Data with params:', { startDate: currentFilter.startDate, endDate: currentFilter.endDate })
  const params = {
    startDate: currentFilter.startDate,
    endDate: currentFilter.endDate
  }

  try {
    await Promise.all([
      loadStats(params),
      loadSalesChart(params),
      loadSalesByCategory(params),
      loadTopProducts(params),
      loadRecentSales(params)
    ])
    // Force chart update
    chartKey.value++
  } catch (err) {
    console.error('Error loading dashboard data', err)
  } finally {
    isLoading.value = false
  }
}

const loadStats = async (params) => {
  try {
    const { data } = await dashboardApi.getStats(params)
    Object.assign(stats, data.data)
  } catch (err) {
    console.error(err)
    error('Error al cargar estadísticas')
  }
}

const loadSalesChart = async (params) => {
  try {
    const { data } = await dashboardApi.getSalesChart(params)
    salesChart.labels = data.data.labels
    salesChart.data = data.data.data
  } catch (err) {
    console.error(err)
  }
}

const loadSalesByCategory = async (params) => {
  try {
    const { data } = await dashboardApi.getSalesByCategory(params)
    salesByCategory.value = data.data
  } catch (err) {
    console.error(err)
  }
}

const loadTopProducts = async (params) => {
  try {
    const { data } = await dashboardApi.getTopProducts(5, params)
    topProducts.value = data.data
  } catch (err) {
    console.error(err)
  }
}

const loadRecentSales = async (params) => {
  try {
    const { data } = await dashboardApi.getRecentSales(10, params)
    recentSales.value = data.data
  } catch (err) {
    console.error(err)
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
</script>
