<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
    <!-- Left Panel: Products -->
    <div class="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Search & Categories Header -->
      <div class="p-4 border-b border-slate-100 space-y-4">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar productos..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Categories Pills -->
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="selectCategory(null)"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="selectedCategory === null 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
          >
            Todos
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category)"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="selectedCategory?.id === category.id 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400">
          <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>No se encontraron productos</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            class="group relative flex flex-col bg-white border border-slate-100 rounded-xl hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 p-3 text-left"
            :disabled="product.stock === 0"
            :class="{ 'opacity-60 grayscale cursor-not-allowed': product.stock === 0 }"
          >
            <!-- Badge Stock -->
            <div class="absolute top-2 right-2">
              <span 
                class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
              >
                {{ product.stock }}
              </span>
            </div>

            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3 text-primary-600 group-hover:scale-110 transition-transform">
              <span class="font-bold text-sm">{{ product.name.substring(0, 2).toUpperCase() }}</span>
            </div>
            
            <h3 class="font-semibold text-slate-800 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5em]">{{ product.name }}</h3>
            <p class="text-xs text-slate-400 mb-2">{{ product.category?.name }}</p>
            
            <div class="mt-auto flex items-end justify-between">
              <span class="text-base font-bold text-primary-700">${{ product.price.toLocaleString() }}</span>
              <div 
                class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                :class="product.stock > 0 ? 'bg-slate-100 text-slate-400 group-hover:bg-primary-600 group-hover:text-white' : 'bg-slate-100 text-slate-300'"
              >
                <PlusIcon class="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Right Panel: Cart -->
    <div class="lg:w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div class="flex items-center gap-2 text-slate-800">
          <ShoppingCartIcon class="w-5 h-5 text-primary-600" />
          <h2 class="font-bold">Ticket de Venta</h2>
        </div>
        <span class="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-bold">
          {{ cartStore.items.length }} items
        </span>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        <div v-if="cartStore.items.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 py-12">
          <ShoppingCartIcon class="w-12 h-12 mb-3 opacity-20" />
          <p class="text-sm">El carrito está vacío</p>
          <p class="text-xs">Agrega productos para comenzar</p>
        </div>

        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-primary-100 transition-colors group"
        >
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-slate-800 text-sm truncate">{{ item.name }}</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs font-medium text-primary-600">${{ (item.price * item.quantity).toLocaleString() }}</span>
              <span class="text-[10px] text-slate-400">${{ item.price.toLocaleString() }} c/u</span>
            </div>
          </div>
          
          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
              <button 
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                class="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm text-slate-600 transition-all"
              >
                <MinusIcon class="w-3 h-3" />
              </button>
              <span class="w-8 text-center text-xs font-bold text-slate-700">{{ item.quantity }}</span>
              <button 
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                class="w-6 h-6 flex items-center justify-center hover:bg-white rounded shadow-sm text-primary-600 transition-all"
                :disabled="item.quantity >= item.stock"
                :class="{ 'opacity-50': item.quantity >= item.stock }"
              >
                <PlusIcon class="w-3 h-3" />
              </button>
            </div>
            
            <button 
              @click="cartStore.removeItem(item.id)"
              class="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
        <!-- Totals -->
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-slate-500 text-sm">Total a pagar</span>
            <span class="text-2xl font-bold text-slate-900">${{ cartStore.total.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="cartStore.clear()"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all disabled:opacity-50"
            :disabled="cartStore.items.length === 0"
          >
            Limpiar
          </button>
          <button
            @click="openPaymentDrawer"
            class="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            :disabled="cartStore.items.length === 0"
          >
            Cobrar
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Drawer -->
    <PaymentDrawer
      :show="showPaymentDrawer"
      :ticket="currentTicket"
      @close="showPaymentDrawer = false"
      @complete="handlePaymentComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { productsApi } from '@/api/products'
import { categoriesApi } from '@/api/categories'
import { salesApi } from '@/api/sales'
import { cashRegistersApi } from '@/api/cashRegisters'
import PaymentDrawer from '@/components/sales/PaymentDrawer.vue'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { success, error } = useToast()

const products = ref([])
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)
const showPaymentDrawer = ref(false)
const currentRegister = ref(null)
const currentTicket = ref(null)

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.sku?.toLowerCase().includes(query)
  )
})

const loadCategories = async () => {
  try {
    const { data } = await categoriesApi.getAll()
    categories.value = data.data
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

const selectCategory = async (category) => {
  selectedCategory.value = category
  searchQuery.value = ''
  loading.value = true
  
  try {
    const { data } = category 
      ? await productsApi.getByCategory(category.id)
      : await productsApi.getAll()
      
    // Filter active and stock>0 is handled by backend or manually here?
    // Let's filter manually to be safe based on previous logic
    products.value = data.data.filter(p => p.isActive)
  } catch (err) {
    console.error('Error loading products:', err)
    error(err.customMessage || err.message || 'Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const addToCart = (product) => {
  if (product.stock > 0) {
    cartStore.addItem(product, 1)
  }
}

const openPaymentDrawer = () => {
  currentTicket.value = {
    id: Date.now(),
    items: cartStore.items.map(item => ({
      name: item.name,
      price: item.price * item.quantity,
      type: 'product'
    })),
    total: cartStore.total
  }
  showPaymentDrawer.value = true
}

const handlePaymentComplete = async (paymentData) => {
  try {
    const saleData = {
      userId: authStore.user.id,
      customerId: paymentData.customerId, // Add customerId
      cashRegisterId: currentRegister.value?.id,
      items: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      payments: paymentData.payments.map(p => ({
        method: p.method,
        amount: p.amount,
        voucherNumber: p.voucher || null,
      })),
    }

    await salesApi.create(saleData)
    
    cartStore.clear()
    showPaymentDrawer.value = false
    currentTicket.value = null
    
    // Reload current view products
    selectCategory(selectedCategory.value)
    
    success('✅ Venta completada exitosamente')
  } catch (err) {
    console.error('Error completing sale:', err)
    error(err.customMessage || err.message || '❌ Error al procesar la venta')
  }
}

const loadInitialData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadCategories(),
      selectCategory(null), // Load all products initially
      loadCashRegister()
    ])
  } catch (err) {
    console.error('Error loading initial data:', err)
  } finally {
    loading.value = false
  }
}

const loadCashRegister = async () => {
  try {
    const { data } = await cashRegistersApi.getOpen()
    if (data.data.length > 0) {
      currentRegister.value = data.data[0]
    } else {
      error('⚠️ No hay caja abierta. Por favor abre una caja primero.')
      router.push('/cash-register')
    }
  } catch (err) {
    console.error('Error loading cash register:', err)
    error(err.customMessage || err.message || 'Error al cargar caja registradora')
  }
}

onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
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
