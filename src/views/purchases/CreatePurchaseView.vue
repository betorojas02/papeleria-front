<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Registrar Entrada de Mercadería</h1>
        <p class="text-sm text-slate-500 mt-1">Registra una compra y actualiza el stock</p>
      </div>
      <AppButton variant="secondary" @click="$router.push('/purchases')">
        Cancelar / Volver
      </AppButton>
    </div>

    <!-- Step 1: Supplier & Invoice Info -->
    <AppCard title="1. Datos del Proveedor y Factura">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Proveedor *</label>
          <select
            v-model="form.supplierId"
            class="w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="" disabled>Seleccione un proveedor</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }} ({{ supplier.taxId }})
            </option>
          </select>
        </div>
        <div>
           <AppInput
             v-model="form.invoiceNumber"
             label="Número de Factura / Boleta"
             placeholder="Ej. F001-12345"
           />
        </div>
      </div>
    </AppCard>

    <!-- Step 2: Product Selection -->
    <AppCard title="2. Productos">
       <div class="mb-4 relative">
          <label class="block text-sm font-medium text-slate-700 mb-2">Buscar Producto para agregar</label>
          <input
            v-model="productSearch"
            type="text"
            placeholder="Escribe el nombre o código del producto..."
            class="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @focus="showProductDropdown = true"
          />
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 bottom-3" />
          
          <!-- Product Dropdown -->
          <div v-if="showProductDropdown && filteredProducts.length > 0" class="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 max-h-60 overflow-y-auto">
             <div
               v-for="product in filteredProducts"
               :key="product.id"
               class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center"
               @click="addProductToCart(product)"
             >
                <div>
                  <p class="font-bold text-slate-800">{{ product.name }}</p>
                  <p class="text-xs text-slate-500 font-mono">{{ product.code || 'Sin Código' }} | Stock Actual: {{ product.stock }}</p>
                </div>
                <div class="text-xs font-bold text-primary-600">
                  + Agregar
                </div>
             </div>
          </div>
       </div>

       <!-- Selected Products Table -->
       <div v-if="cart.length > 0" class="overflow-x-auto border rounded-lg border-slate-200">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                 <th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Producto</th>
                 <th class="px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase w-32">Costo Unit.</th>
                 <th class="px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase w-32">Cantidad</th>
                 <th class="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase w-32">Subtotal</th>
                 <th class="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
               <tr v-for="(item, index) in cart" :key="item.product.id">
                  <td class="px-4 py-2">
                     <div class="font-medium text-slate-800">{{ item.product.name }}</div>
                  </td>
                  <td class="px-4 py-2">
                     <input
                       type="number"
                       min="0"
                       step="0.01"
                       v-model.number="item.unitCost"
                       class="w-full text-center text-sm border-slate-200 rounded focus:ring-primary-500 focus:border-primary-500"
                     />
                  </td>
                  <td class="px-4 py-2">
                     <input
                       type="number"
                       min="1"
                       v-model.number="item.quantity"
                       class="w-full text-center text-sm border-slate-200 rounded focus:ring-primary-500 focus:border-primary-500"
                     />
                  </td>
                  <td class="px-4 py-2 text-right font-bold text-slate-700">
                     {{ formatCurrency(item.unitCost * item.quantity) }}
                  </td>
                  <td class="px-4 py-2 text-center">
                     <button @click="removeFromCart(index)" class="text-slate-400 hover:text-red-500">
                        <TrashIcon class="w-5 h-5" />
                     </button>
                  </td>
               </tr>
            </tbody>
            <tfoot class="bg-slate-50 font-bold text-slate-800">
               <tr>
                  <td colspan="3" class="px-4 py-3 text-right">TOTAL COMPRA:</td>
                  <td class="px-4 py-3 text-right text-primary-700 text-lg">{{ formatCurrency(totalPurchase) }}</td>
                  <td></td>
               </tr>
            </tfoot>
          </table>
       </div>
       <div v-else class="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
          Agrega productos para registrar la compra
       </div>
    </AppCard>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
       <AppButton variant="secondary" @click="$router.push('/purchases')">Cancelar</AppButton>
       <AppButton 
         variant="primary" 
         icon="CheckIcon" 
         :loading="saving"
         :disabled="cart.length === 0 || !form.supplierId"
         @click="submitPurchase"
       >
         Confirmar y Actualizar Stock
       </AppButton>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { purchasesApi } from '@/api/purchases'
import { suppliersApi } from '@/api/suppliers'
import { productsApi } from '@/api/products' // Standard products API
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppInput from '@/components/common/AppInput.vue'
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

const suppliers = ref([])
const products = ref([])
const loading = ref(false)
const saving = ref(false)

const productSearch = ref('')
const showProductDropdown = ref(false)
const cart = ref([])

const form = reactive({
  supplierId: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0] // Optional Date Field? Model mostly uses server date, but purchaseDate can be useful.
})

const filteredProducts = computed(() => {
  if (!productSearch.value) return []
  const q = productSearch.value.toLowerCase()
  return products.value.filter(p => 
     p.name.toLowerCase().includes(q) || 
     p.code?.toLowerCase().includes(q)
  ).slice(0, 10) // Limit results
})

const totalPurchase = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
})

// Validation
const isValid = computed(() => {
  return form.supplierId && cart.value.length > 0 && cart.value.every(i => i.quantity > 0 && i.unitCost >= 0)
})

const loadData = async () => {
  try {
     const [suppliersRes, productsRes] = await Promise.all([
        suppliersApi.getAll(),
        productsApi.getAll()
     ])
     suppliers.value = suppliersRes.data.data
     products.value = productsRes.data.data
  } catch (err) {
     console.error(err)
     error('Error al cargar datos necesarios')
  }
}

const addProductToCart = (product) => {
   const existing = cart.value.find(i => i.product.id === product.id)
   if (existing) {
     existing.quantity++
   } else {
     cart.value.push({
        product,
        quantity: 1,
        unitCost: product.cost || 0 // Default to current cost
     })
   }
   productSearch.value = ''
   showProductDropdown.value = false
}

const removeFromCart = (index) => {
   cart.value.splice(index, 1)
}

const submitPurchase = async () => {
   if (!isValid.value) return

   saving.value = true
   try {
      const payload = {
         supplierId: form.supplierId,
         userId: authStore.user.id,
         invoiceNumber: form.invoiceNumber,
         details: cart.value.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitCost: item.unitCost
         }))
      }

      await purchasesApi.create(payload)
      success('Compra registrada y stock actualizado')
      router.push('/purchases')
   } catch (err) {
      console.error(err)
      error('Error al registrar compra')
   } finally {
      saving.value = false
   }
}

const formatCurrency = (val) => {
   return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val)
}

// Close dropdown on click outside logic could be added here, simplified for now
onMounted(() => {
   loadData()
})
</script>
