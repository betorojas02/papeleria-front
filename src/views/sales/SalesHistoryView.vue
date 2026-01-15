<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Historial de Ventas</h1>
        <p class="text-sm text-slate-500 mt-1">Consulta y gestiona las ventas realizadas</p>
      </div>
    </div>

    <!-- Filters & Actions -->
    <AppCard>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <AppInput
            v-model="searchQuery"
            placeholder="Buscar por cliente o ID de venta..."
            class="w-full"
          >
            <template #prefix>
              <MagnifyingGlassIcon class="w-5 h-5 text-slate-400" />
            </template>
          </AppInput>
        </div>
        <div class="w-full md:w-48">
          <input
            type="date"
            v-model="dateFilter"
            class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm text-slate-700"
          />
        </div>
      </div>
    </AppCard>

    <!-- Sales Table -->
    <AppCard class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-left">
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Venta</th>
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Productos</th>
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
              <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="sale in filteredSales" 
              :key="sale.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-3 px-4 text-slate-600 text-sm font-mono">#{{ sale.id.toString().slice(-6) }}</td>
              <td class="py-3 px-4 text-slate-800 text-sm">
                <div class="font-medium">{{ formatDate(sale.createdAt).date }}</div>
                <div class="text-xs text-slate-400">{{ formatDate(sale.createdAt).time }}</div>
              </td>
              <td class="py-3 px-4 text-slate-800 text-sm">
                <div v-if="sale.customer" class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                    {{ sale.customer.firstName[0] }}
                  </div>
                  <span>{{ sale.customer.firstName }} {{ sale.customer.lastName }}</span>
                </div>
                <span v-else class="text-slate-500 italic">Público General</span>
              </td>
              <td class="py-3 px-4 text-right text-slate-600 text-sm">{{ sale.items?.length || 0 }}</td>
              <td class="py-3 px-4 text-right font-bold text-slate-800 text-sm">${{ sale.total.toLocaleString() }}</td>
              <td class="py-3 px-4 text-center">
                <button 
                  @click="openDetails(sale)"
                  class="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                  title="Ver detalles"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredSales.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center">
                  <DocumentMagnifyingGlassIcon class="w-12 h-12 opacity-20 mb-2" />
                  <p>No se encontraron ventas</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="selectedSale" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeDetails"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
            <div>
              <h3 class="text-xl font-bold text-slate-800">Detalle de Venta #{{ selectedSale.id.toString().slice(-6) }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ formatDate(selectedSale.createdAt).full }}</p>
            </div>
            <button @click="closeDetails" class="text-slate-400 hover:text-slate-600 transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <!-- Customer Info -->
            <div class="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <UserIcon class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 text-sm">
                    {{ selectedSale.customer ? `${selectedSale.customer.firstName} ${selectedSale.customer.lastName}` : 'Cliente: Público General' }}
                  </h4>
                  <p v-if="selectedSale.user" class="text-xs text-slate-500 mt-0.5">
                    Atendido por: {{ selectedSale.user.firstName }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Items List -->
            <h4 class="font-bold text-slate-800 text-sm mb-3">Productos comprados</h4>
            <div class="space-y-3 mb-6">
              <div 
                v-for="item in selectedSale.items" 
                :key="item.id"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-100 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                    x{{ item.quantity }}
                  </div>
                  <div>
                  <div class="font-medium text-slate-800 text-sm">{{ item.product?.name || 'Producto eliminado' }}</div>
                  <div class="text-xs text-slate-400">${{ (item.price || 0).toLocaleString() }} c/u</div>
                </div>
              </div>
              <div class="font-bold text-slate-800 text-sm">
                ${{ ((item.quantity || 0) * (item.price || 0)).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <h4 class="font-bold text-primary-900 text-sm mb-3">Resumen de Pago</h4>
            <div class="space-y-2 text-sm">
               <div class="flex justify-between items-center text-slate-600" v-for="pay in selectedSale.payments" :key="pay.id">
                  <span>{{ pay.method === 'CASH' ? 'Efectivo' : pay.method === 'CARD' ? 'Tarjeta' : 'Transferencia' }}</span>
                  <span class="font-medium text-slate-800">${{ (pay.amount || 0).toLocaleString() }}</span>
               </div>
               <div class="border-t border-primary-200 my-2 pt-2 flex justify-between items-center text-lg font-bold text-primary-800">
                  <span>Total Pagado</span>
                  <span>${{ (selectedSale.total || 0).toLocaleString() }}</span>
               </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { salesApi } from '@/api/sales'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppInput from '@/components/common/AppInput.vue'
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  XMarkIcon,
  UserIcon,
  DocumentMagnifyingGlassIcon 
} from '@heroicons/vue/24/outline'

const { error } = useToast()
const sales = ref([])
const searchQuery = ref('')
const dateFilter = ref('')
const selectedSale = ref(null)

const filteredSales = computed(() => {
  return sales.value.filter(sale => {
    // Text Filter
    const query = searchQuery.value.toLowerCase()
    const matchesText = 
      sale.id.toString().includes(query) ||
      (sale.customer && (
        sale.customer.firstName.toLowerCase().includes(query) || 
        sale.customer.lastName.toLowerCase().includes(query)
      ))
    
    // Date Filter
    let matchesDate = true
    if (dateFilter.value) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0]
      matchesDate = saleDate === dateFilter.value
    }

    return matchesText && matchesDate
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

const openDetails = (sale) => {
  selectedSale.value = sale
}

const closeDetails = () => {
  selectedSale.value = null
}

const loadSales = async () => {
  try {
    const { data } = await salesApi.getAll()
    // Sort descending by date
    sales.value = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('Error loading sales:', err)
    error(err.message || 'Error al cargar ventas')
  }
}

onMounted(() => {
  loadSales()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
