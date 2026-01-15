<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Productos</h1>
        <p class="text-sm text-slate-500 mt-1">Gestiona tu inventario de productos</p>
      </div>
      <AppButton
        v-if="authStore.isAdmin"
        variant="primary"
        @click="$router.push('/products/create')"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nuevo Producto
      </AppButton>
    </div>

    <!-- Filters -->
    <AppCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AppInput
          v-model="filters.search"
          placeholder="Buscar por nombre o SKU..."
          @input="handleSearch"
        >
          <template #prefix>
            <MagnifyingGlassIcon class="w-5 h-5 text-slate-400" />
          </template>
        </AppInput>
        
        <AppSelect
          v-model="filters.category"
          :options="categoryOptions"
          @update:modelValue="loadProducts"
        />
        
        <AppSelect
          v-model="filters.brand"
          :options="brandOptions"
          @update:modelValue="loadProducts"
        />
        
        <AppSelect
          v-model="filters.stockStatus"
          :options="stockStatusOptions"
          @update:modelValue="loadProducts"
        />
        
        <AppButton variant="secondary" @click="clearFilters" full-width>
          <XMarkIcon class="w-4 h-4 mr-2" />
          Limpiar
        </AppButton>
      </div>
    </AppCard>

    <!-- Products Table -->
    <AppCard>
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-slate-600">Cargando productos...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <ShoppingBagIcon class="mx-auto h-12 w-12 text-slate-400" />
        <p class="mt-2 text-slate-600">No hay productos</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Producto
              </th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Categoría
              </th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Marca
              </th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Precio
              </th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <!-- Product -->
              <td class="py-3 px-4">
                <div>
                  <p class="font-medium text-slate-800">{{ product.name }}</p>
                  <p class="text-xs text-slate-500">SKU: {{ product.sku || '-' }}</p>
                </div>
              </td>
              
              <!-- Category -->
              <td class="py-3 px-4">
                <span class="text-sm text-slate-600">{{ product.category?.name || '-' }}</span>
              </td>
              
              <!-- Brand -->
              <td class="py-3 px-4">
                <span class="text-sm text-slate-600">{{ product.brand?.name || '-' }}</span>
              </td>
              
              <!-- Price -->
              <td class="py-3 px-4 text-right">
                <span class="font-bold text-slate-800">{{ formatCurrency(product.price) }}</span>
              </td>
              
              <!-- Stock -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span
                    :class="[
                      'font-bold',
                      product.stock === 0 ? 'text-danger-600' :
                      product.stock <= product.minStock ? 'text-warning-600' :
                      'text-slate-800'
                    ]"
                  >
                    {{ product.stock }}
                  </span>
                  <span
                    v-if="product.stock === 0"
                    class="px-2 py-0.5 text-[10px] font-bold uppercase bg-danger-100 text-danger-700 rounded-full"
                  >
                    Sin stock
                  </span>
                  <span
                    v-else-if="product.stock <= product.minStock"
                    class="px-2 py-0.5 text-[10px] font-bold uppercase bg-warning-100 text-warning-700 rounded-full"
                  >
                    Stock bajo
                  </span>
                </div>
              </td>
              
              <!-- Status -->
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    product.isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-slate-100 text-slate-600'
                  ]"
                >
                  {{ product.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewProduct(product)"
                    class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.isAdmin"
                    @click="$router.push(`/products/${product.id}/edit`)"
                    class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.isAdmin"
                    @click="handleDelete(product)"
                    class="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Pagination Controls -->
    <div 
      v-if="pagination.total > 0 && isServerPagination" 
      class="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-lg shadow-sm"
    >
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import { productsApi } from '@/api/products'
import { categoriesApi } from '@/api/categories'
import { brandsApi } from '@/api/brands'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import {
  PlusIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const { success, error } = useToast()
const { formatCurrency } = useCurrency()

const products = ref([])
const loading = ref(false)
const categoryOptions = ref([])
const brandOptions = ref([])

// Pagination state
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1
})

// Track if we are in "Server Pagination Mode" (no cat/brand filters)
const isServerPagination = computed(() => !filters.category && !filters.brand)

const stockStatusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'in_stock', label: 'En stock' },
  { value: 'low_stock', label: 'Stock bajo' },
  { value: 'out_of_stock', label: 'Sin stock' }
]

const filters = reactive({
  search: '',
  category: '',
  brand: '',
  stockStatus: ''
})

let searchTimeout = null

const filteredProducts = computed(() => {
  let result = products.value || []

  // Client-side stock filter is valid for both modes
  if (filters.stockStatus) {
    result = result.filter(p => {
      if (filters.stockStatus === 'out_of_stock') return p.stock === 0
      if (filters.stockStatus === 'low_stock') return p.stock > 0 && p.stock <= p.minStock
      if (filters.stockStatus === 'in_stock') return p.stock > p.minStock
      return true
    })
  }
  
  // NOTE: If using category/brand filters, they return ALL products, so no pagination needed yet.
  // If no filters, we have server pagination content in 'products.value'.
  
  return result
})

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Reset to page 1 on search
    pagination.value.page = 1
    loadProducts()
  }, 300)
}

const loadProducts = async (page = 1) => {
  loading.value = true
  try {
    let response

    if (filters.category) {
      response = await productsApi.getByCategory(filters.category)
      // Standardize response structure: array of products
      products.value = response.data.data
      pagination.value.total = products.value.length
      pagination.value.lastPage = 1
    } else if (filters.brand) {
      response = await productsApi.getByBrand(filters.brand)
      products.value = response.data.data
      pagination.value.total = products.value.length
      pagination.value.lastPage = 1
    } else {
      // Server-side pagination and search
      response = await productsApi.getAll(page, pagination.value.limit, filters.search)
      products.value = response.data.data.data || []
      
      // Update meta
      pagination.value = {
        page: Number(response.data.data.meta.page),
        limit: 10,
        total: Number(response.data.data.meta.total),
        lastPage: Number(response.data.data.meta.lastPage)
      }
    }
  } catch (err) {
    console.error('Error loading products:', err)
    error(err.customMessage || err.message || 'Error al cargar productos')
    products.value = []
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    loadProducts(pagination.value.page - 1)
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.lastPage) {
    loadProducts(pagination.value.page + 1)
  }
}

const loadFilters = async () => {
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      categoriesApi.getAll(),
      brandsApi.getAll(),
    ])

    categoryOptions.value = [
      { value: '', label: 'Todas las categorías' },
      ...categoriesRes.data.data.map(c => ({ value: c.id, label: c.name }))
    ]

    brandOptions.value = [
      { value: '', label: 'Todas las marcas' },
      ...brandsRes.data.data.map(b => ({ value: b.id, label: b.name }))
    ]
  } catch (err) {
    console.error('Error loading filters:', err)
    error('Error al cargar filtros')
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.brand = ''
  filters.stockStatus = ''
  loadProducts()
}

const viewProduct = (product) => {
  // TODO: Open product detail modal
  console.log('View product:', product)
}

const handleDelete = async (product) => {
  if (!confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
    return
  }
  
  try {
    await productsApi.delete(product.id)
    success('✅ Producto eliminado exitosamente')
    loadProducts()
  } catch (err) {
    console.error('Error deleting product:', err)
    error(err.customMessage || err.message || '❌ Error al eliminar producto')
  }
}

onMounted(() => {
  loadProducts()
  loadFilters()
})
</script>
