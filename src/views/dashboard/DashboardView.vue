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
        
        <StatCard
          label="Gastos Operativos"
          :value="stats.totalExpenses"
          :icon="CreditCardIcon"
          variant="warning"
          format="currency"
          :footer="`${currentPeriodLabel}`"
        />

        <StatCard
          label="Utilidad Neta"
          :value="stats.netProfit"
          :icon="CurrencyDollarIcon"
          :variant="stats.netProfit >= 0 ? 'success' : 'danger'"
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

    <!-- Section: Products vs Services Breakdown -->
    <section v-if="itemsBreakdown.length > 0" class="space-y-4">
      <h2 class="text-lg font-bold text-slate-700 flex items-center gap-2">
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Desglose de Ventas
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          v-for="item in itemsBreakdown"
          :key="item.type"
          :label="item.type === 'product' ? 'Ingresos por Productos' : 'Ingresos por Servicios'"
          :value="item.revenue"
          :icon="item.type === 'product' ? ShoppingBagIcon : WrenchScrewdriverIcon"
          :variant="item.type === 'product' ? 'primary' : 'info'"
          format="currency"
          :footer="`${item.totalQuantity} unidades vendidas`"
        />
      </div>
    </section>

    <!-- Cash Register Status (Always visible) -->
    <CashRegisterStatus />

    <!-- New Row: Payment Methods & Monthly Goal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Payment Methods Breakdown -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">💳 Métodos de Pago</h3>
            <p class="text-sm text-slate-500">Distribución de pagos en este período</p>
          </div>
        </template>
        <div class="h-64">
          <HorizontalBarChart v-if="paymentMethods.length > 0" :data="paymentMethods" />
          <div v-else class="flex items-center justify-center h-full text-slate-400">
            <span>Sin datos de métodos de pago</span>
          </div>
        </div>
      </AppCard>

      <!-- Monthly Goal Progress -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">🎯 Meta Mensual</h3>
            <p class="text-sm text-slate-500">Progreso de ventas del mes actual</p>
          </div>
        </template>
        <div class="p-2">
          <MonthlyGoalProgress :current="stats.totalRevenue" :goal="1000000" />
        </div>
      </AppCard>
    </div>

    <!-- Low Stock Alerts -->
    <AppCard v-if="lowStockProducts.length > 0">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-orange-500" />
              Alertas de Stock Crítico
            </h3>
            <p class="text-sm text-slate-500">Productos que requieren reabastecimiento urgente</p>
          </div>
        </div>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Producto</th>
              <th class="text-center py-2 px-3 text-xs font-bold text-slate-500 uppercase">Stock Actual</th>
              <th class="text-center py-2 px-3 text-xs font-bold text-slate-500 uppercase">Stock Mínimo</th>
              <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in lowStockProducts"
              :key="product.id"
              class="border-b border-slate-100 last:border-0 hover:bg-orange-50"
            >
              <td class="py-2 px-3 font-medium text-slate-800">{{ product.name }}</td>
              <td class="py-2 px-3 text-center">
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-bold',
                  product.stock === 0 ? 'bg-red-100 text-red-700' :
                  product.stock <= 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                ]">
                  {{ product.stock }}
                </span>
              </td>
              <td class="py-2 px-3 text-center text-slate-600">{{ product.minStock }}</td>
              <td class="py-2 px-3 text-right text-slate-600">{{ formatCurrency(product.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

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
      <!-- Top Items (Products + Services) -->
      <AppCard>
        <template #header>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">🏆 Top Items Vendidos</h3>
            <p class="text-sm text-slate-500">Los 10 items con mayores ingresos (productos y servicios)</p>
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
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Item</th>
                <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Vendidos</th>
                <th class="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in topItems"
                :key="item.id + '-' + item.type"
                :class="[
                  'border-b border-slate-100 last:border-0 hover:bg-slate-50',
                  item.type === 'service' ? 'bg-blue-50/20' : ''
                ]"
              >
                <td class="py-2 px-3">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-2 px-3">
                  <span v-if="item.type === 'service'" class="text-lg" title="Servicio">🔧</span>
                  <span v-else class="text-lg" title="Producto">📦</span>
                </td>
                <td class="py-2 px-3 font-medium text-slate-800">{{ item.name }}</td>
                <td class="py-2 px-3 text-right text-slate-600">{{ item.totalSold }}</td>
                <td :class="[
                  'py-2 px-3 text-right font-bold',
                  item.type === 'service' ? 'text-blue-600' : 'text-primary-600'
                ]">
                  {{ formatCurrency(item.revenue) }}
                </td>
              </tr>
              <tr v-if="topItems.length === 0 && !isLoading">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-2">
                    <ShoppingBagIcon class="w-8 h-8 opacity-40" />
                     <span class="font-medium">No hay items vendidos</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <!-- Recent Sales -->
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
                  {{ formatCurrency(sale.total) }}
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
import { useCurrency } from '@/composables/useCurrency'
import AppCard from '@/components/common/AppCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import LineChart from '@/components/dashboard/LineChart.vue'
import DoughnutChart from '@/components/dashboard/DoughnutChart.vue'
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart.vue'
import MonthlyGoalProgress from '@/components/dashboard/MonthlyGoalProgress.vue'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'
import CashRegisterStatus from '@/components/dashboard/CashRegisterStatus.vue'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

const { error } = useToast()
const { formatCurrency } = useCurrency()

const stats = reactive({
  totalSales: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  totalProducts: 0,
  lowStockProducts: 0
})

const salesChart = reactive({
  labels: [],
  data: []
})

const salesByCategory = ref([])
const topProducts = ref([])
const topItems = ref([])  // NEW: Combined products + services
const itemsBreakdown = ref([])  // NEW: Revenue breakdown
const recentSales = ref([])
const paymentMethods = ref([])  // NEW: Payment methods breakdown
const lowStockProducts = ref([])  // NEW: Low stock alerts

const currentFilter = reactive({
  startDate: null,
  endDate: null
})

const currentPeriodLabel = ref('Hoy')

const averageTicket = computed(() => {
  return stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0
})

const isLoading = ref(false)
const lastUpdated = ref('')

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
  
  // Build params object, excluding null values
  const params = {}
  if (currentFilter.startDate) params.startDate = currentFilter.startDate
  if (currentFilter.endDate) params.endDate = currentFilter.endDate

  try {
    await Promise.all([
      loadStats(params),
      loadSalesChart(params),
      loadSalesByCategory(params),
      loadTopProducts(params),
      loadTopItems(params),
      loadItemsBreakdown(params),
      loadPaymentMethods(params),  // NEW
      loadRecentSales(params),
      loadLowStock()  // NEW - no date filter
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

const loadTopItems = async (params) => {
  try {
    const { data } = await dashboardApi.getTopItems({ limit: 10, ...params })
    topItems.value = data.data
  } catch (err) {
    console.error('Error loading top items:', err)
  }
}

const loadItemsBreakdown = async (params) => {
  try {
    const { data } = await dashboardApi.getItemsBreakdown(params)
    itemsBreakdown.value = data.data
  } catch (err) {
    console.error('Error loading items breakdown:', err)
  }
}

const loadPaymentMethods = async (params) => {
  try {
    const { data } = await dashboardApi.getPaymentMethods(params)
    paymentMethods.value = data.data
  } catch (err) {
    console.error('Error loading payment methods:', err)
  }
}

const loadLowStock = async () => {
  try {
    const { data } = await dashboardApi.getLowStock({ limit: 10 })
    lowStockProducts.value = data.data
  } catch (err) {
    console.error('Error loading low stock:', err)
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
