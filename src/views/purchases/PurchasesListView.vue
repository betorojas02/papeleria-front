<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Compras e Inventario</h1>
        <p class="text-sm text-slate-500 mt-1">Historial de entradas de mercadería</p>
      </div>
      <AppButton variant="primary" icon="PlusIcon" @click="$router.push('/purchases/create')">
        Registrar Nueva Compra
      </AppButton>
    </div>

    <!-- Table Card -->
    <AppCard>
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por proveedor o factura..."
            @input="handleSearch"
            class="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
          />
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Factura</th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="7" class="py-12 text-center text-slate-400">Cargando historial de compras...</td>
            </tr>
            <tr v-else-if="filteredPurchases.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400">
                <ArchiveBoxXMarkIcon class="w-12 h-12 mx-auto mb-2 opacity-20" />
                No se encontraron registros
              </td>
            </tr>
            <tr
              v-for="purchase in filteredPurchases"
              :key="purchase.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4 text-sm text-slate-600">
                {{ formatDate(purchase.purchaseDate) }}
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-slate-800">{{ purchase.supplier?.name || 'Proveedor Eliminado' }}</div>
              </td>
              <td class="py-3 px-4 text-sm text-slate-500 font-mono">
                {{ purchase.invoiceNumber || 'S/N' }}
              </td>
              <td class="py-3 px-4 text-center text-sm font-bold text-slate-600">
                {{ purchase.details?.length || 0 }}
              </td>
              <td class="py-3 px-4 text-right font-bold text-slate-800">
                {{ formatCurrency(purchase.total) }}
              </td>
              <td class="py-3 px-4 text-center">
                 <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                  {{ purchase.user?.name || 'Sistema' }}
                 </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                   Recibido
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <button 
                  @click="openDetails(purchase)"
                  class="text-slate-400 hover:text-primary-600 transition-colors p-1 rounded-full hover:bg-primary-50"
                  title="Ver Detalles"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Pagination Controls -->
    <div class="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-lg shadow-sm">
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          @click="prevPage" 
          :disabled="pagination.page === 1"
          class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button 
          @click="nextPage" 
          :disabled="pagination.page === pagination.lastPage"
          class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-slate-700">
            Mostrando página <span class="font-medium">{{ pagination.page }}</span> de <span class="font-medium">{{ pagination.lastPage }}</span>
            (Total: <span class="font-medium">{{ pagination.total }}</span> registros)
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Anterior</span>
              <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
            </button>
            <button 
              @click="nextPage"
              :disabled="pagination.page === pagination.lastPage"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Siguiente</span>
              <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Purchase Details Drawer -->
    <PurchaseDetailsDrawer 
      :show="showDetailsDrawer"
      :purchase="selectedPurchase"
      @close="closeDetails"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { purchasesApi } from '@/api/purchases'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import PurchaseDetailsDrawer from '@/components/purchases/PurchaseDetailsDrawer.vue'
import { MagnifyingGlassIcon, ArchiveBoxXMarkIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/vue/24/outline'

const { error } = useToast()
const { formatCurrency } = useCurrency()
const purchases = ref([])
const loading = ref(false)
const search = ref('')
const showDetailsDrawer = ref(false)
const selectedPurchase = ref(null)
let searchTimeout = null

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1
})

const filteredPurchases = computed(() => {
  return purchases.value || []
})

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadPurchases()
  }, 300)
}

const loadPurchases = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await purchasesApi.getAll(page, pagination.value.limit, search.value)
    purchases.value = data.data.data
    
    // Update meta
    pagination.value = {
      page: Number(data.data.meta.page),
      limit: 10,
      total: Number(data.data.meta.total),
      lastPage: Number(data.data.meta.lastPage)
    }
  } catch (err) {
    console.error(err)
    error('Error al cargar historial de compras')
    purchases.value = []
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    loadPurchases(pagination.value.page - 1)
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.lastPage) {
    loadPurchases(pagination.value.page + 1)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const openDetails = (purchase) => {
  selectedPurchase.value = purchase
  showDetailsDrawer.value = true
}

const closeDetails = () => {
  showDetailsDrawer.value = false
  setTimeout(() => {
    selectedPurchase.value = null
  }, 300)
}


onMounted(() => {
  loadPurchases()
})
</script>
