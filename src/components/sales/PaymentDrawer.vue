<template>
  <transition name="slide-in">
    <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-end">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        @click="$emit('close')"
      ></div>
      
      <!-- Drawer -->
      <div class="relative w-full md:w-[480px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <!-- Header -->
        <div class="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 class="font-bold text-xl">Procesar Pago</h2>
            <p class="text-xs text-slate-400">Ticket #{{ ticket?.id || '-' }}</p>
          </div>
          <button 
            @click="$emit('close')" 
            class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 scroller bg-slate-50">
          <!-- Ticket Details -->
          <div v-if="ticket" class="mb-6">
            <p class="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Detalle de Cobro</p>
            <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div 
                v-for="(item, idx) in ticket.items" 
                :key="idx" 
                class="p-3 flex justify-between items-center text-sm group"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <span 
                    class="w-1.5 h-1.5 rounded-full shrink-0" 
                    :class="item.type === 'product' ? 'bg-primary-500' : 'bg-indigo-500'"
                  ></span>
                  <span class="truncate text-slate-600">{{ item.name }}</span>
                </div>
                <span class="font-bold text-slate-800">${{ item.price.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Remaining Amount -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
            <span class="text-sm font-bold text-slate-500">Saldo Pendiente</span>
            <span class="text-2xl font-black text-danger-500">${{ remainingAmount.toLocaleString() }}</span>
          </div>

          <!-- Payment Form (only if remaining > 0) -->
          <div v-if="remainingAmount > 0" class="space-y-5">
            <!-- Customer Selection -->
            <div>
               <label class="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
                Cliente (Opcional)
              </label>
              
              <!-- Selected Customer Card -->
              <!-- Selected Customer Card -->
              <div v-if="selectedCustomer" class="bg-primary-50 border border-primary-100 rounded-xl overflow-hidden relative group">
                <!-- Header / Label -->
                <div class="bg-primary-100/50 px-3 py-1 flex justify-between items-center">
                  <span class="text-[10px] font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Cliente Asignado
                  </span>
                </div>
                
                <div class="p-3 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold text-sm border border-primary-100 shadow-sm">
                      {{ selectedCustomer.firstName?.[0] || '?' }}{{ selectedCustomer.lastName?.[0] || '' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800 text-sm">{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</p>
                      <p class="text-xs text-slate-500 font-mono">{{ selectedCustomer.documentNumber || 'Sin documento' }}</p>
                    </div>
                  </div>
                  
                  <button 
                    @click="removeCustomer" 
                    class="pl-4 border-l border-primary-200 text-slate-400 hover:text-red-500 transition-colors flex flex-col items-center gap-1"
                    title="Desvincular cliente"
                  >
                    <XMarkIcon class="w-5 h-5" />
                    <span class="text-[9px] font-bold uppercase">Quitar</span>
                  </button>
                </div>
              </div>

              <!-- Search Input -->
              <div v-else class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
                </div>
                <input
                  v-model="customerSearch"
                  type="text"
                  placeholder="Buscar nombre o documento..."
                  class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all shadow-sm"
                  @focus="showDropdown = true"
                  @blur="handleSearchBlur"
                />
                
                <!-- Dropdown -->
                <transition name="fade">
                  <div v-if="showDropdown && customerSearch" class="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
                    <ul class="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      <li 
                        v-for="customer in filteredCustomers" 
                        :key="customer.id"
                        @click="selectCustomer(customer)"
                        class="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                      >
                        <span class="text-sm font-medium text-slate-700 group-hover:text-primary-700">{{ customer.firstName }} {{ customer.lastName }}</span>
                        <span class="text-xs text-slate-400">{{ customer.documentNumber }}</span>
                      </li>
                      
                      <!-- Create Option -->
                      <li 
                        @click="showCustomerModal = true; showDropdown = false"
                        class="px-4 py-3 bg-slate-50 hover:bg-primary-50 cursor-pointer text-center border-t border-slate-100"
                      >
                        <span class="text-sm font-bold text-primary-600 flex items-center justify-center gap-2">
                          <PlusIcon class="w-4 h-4" />
                          Crear nuevo cliente "{{ customerSearch }}"
                        </span>
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Payment Method Selector -->
            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
                1. Método de Pago
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  @click="selectedMethod = method.id"
                  :class="[
                    'p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all h-20 shadow-sm',
                    selectedMethod === method.id
                      ? 'bg-primary-600 text-white ring-2 ring-primary-300 ring-offset-2 border-transparent'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  ]"
                >
                  <component :is="method.icon" class="w-5 h-5" />
                  <span class="text-[10px] font-bold uppercase">{{ method.label }}</span>
                </button>
              </div>
            </div>

            <!-- Amount Input -->
            <!-- Amount Input -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>

              <!-- Cash Received Input (Only for Cash) -->
              <div v-if="selectedMethod === 'cash'" class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 transition-all">
                <label class="text-xs font-bold text-emerald-700 uppercase mb-1 block">Dinero Recibido</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-emerald-600 font-bold">$</span>
                  <input
                    v-model.number="cashReceived"
                    type="number"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-3 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500 text-lg shadow-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <!-- Change Display -->
                <div class="mt-3 flex justify-between items-center px-2">
                  <span class="text-sm font-bold text-emerald-700">Cambio / Devuelta:</span>
                  <span class="text-xl font-black text-emerald-600">{{ formatCurrency(calculateChange) }}</span>
                </div>
                
                <div v-if="cashReceived > 0 && cashReceived < remainingAmount" class="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>Monto insuficiente. Deberás agregar otro pago por {{ formatCurrency(remainingAmount - cashReceived) }}</span>
                </div>

                <div v-if="calculateChange > cashBalance" class="mt-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p>¡No hay suficiente dinero en caja para dar vueltas!</p>
                    <p class="font-normal mt-0.5 text-[10px]">Disponible: {{ formatCurrency(cashBalance) }} | Requerido: {{ formatCurrency(calculateChange) }}</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Monto a Pagar</label>
                <div class="relative">
                  <span class="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    v-model.number="amountInput"
                    type="number"
                    step="0.01"
                    :max="remainingAmount"
                    class="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <!-- Voucher Input (for card/transfer) -->
              <div v-if="selectedMethod === 'card' || selectedMethod === 'transfer'">
                <label class="text-xs font-bold text-primary-600 uppercase mb-1 block flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                  </svg>
                  Código Voucher / Ref 
                  <span class="text-danger-500">*</span>
                </label>
                <input
                  v-model="voucherInput"
                  type="text"
                  class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl font-medium text-primary-700 outline-none focus:ring-2 focus:ring-primary-500 placeholder-primary-300"
                  placeholder="Ej: 0045821"
                />
              </div>

              <!-- Add Payment Button -->
              <button
                @click="addPayment"
                :disabled="!canAddPayment"
                class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Pago
              </button>
            </div>
          </div>

          <!-- Payments List -->
          <div v-if="payments.length > 0" class="mt-6">
            <p class="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Pagos Registrados</p>
            <div class="space-y-3">
              <div
                v-for="(payment, idx) in payments"
                :key="idx"
                class="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <component :is="getMethodIcon(payment.method)" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-800 text-sm capitalize">{{ getMethodLabel(payment.method) }}</p>
                    <p 
                      v-if="payment.voucher" 
                      class="text-[10px] text-primary-600 font-mono font-bold bg-primary-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-primary-100"
                    >
                      Ref: {{ payment.voucher }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-slate-900 text-lg">${{ payment.amount.toLocaleString() }}</span>
                  <button
                    @click="removePayment(idx)"
                    class="text-slate-300 hover:text-danger-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)] z-20">
          <button
            @click="finalizeSale"
            :disabled="remainingAmount > 0 || (selectedMethod === 'cash' && calculateChange > cashBalance)"
            :class="[
              'w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3',
              remainingAmount <= 0 && !(selectedMethod === 'cash' && calculateChange > cashBalance)
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            ]"
          >
            <span>Confirmar Facturación</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
  <CustomerCreateModal 
    :show="showCustomerModal" 
    @close="showCustomerModal = false"
    @created="handleCustomerCreated"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { customersApi } from '@/api/customers'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import CustomerCreateModal from '@/components/customers/CustomerCreateModal.vue'
import { 
  UserIcon, 
  XMarkIcon, 
  PlusIcon,
  MagnifyingGlassIcon 
} from '@heroicons/vue/24/outline'

const { success, error } = useToast()
const { formatCurrency } = useCurrency()

const props = defineProps({
  show: Boolean,
  ticket: Object,
  cashBalance: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'complete'])

// Payment methods
const paymentMethods = [
  { 
    id: 'cash', 
    label: 'Efectivo', 
    icon: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>' }
  },
  { 
    id: 'card', 
    label: 'Tarjeta', 
    icon: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>' }
  },
  { 
    id: 'transfer', 
    label: 'Transf.', 
    icon: { template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>' }
  }
]

// State
const selectedMethod = ref('cash')
const amountInput = ref(0)
const cashReceived = ref(0)
const voucherInput = ref('')
const payments = ref([])

// Customer State
const customers = ref([])
const customerSearch = ref('')
const selectedCustomer = ref(null)
const showCustomerModal = ref(false)
const showDropdown = ref(false)

const handleSearchBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Computed
const filteredCustomers = computed(() => customers.value)

let searchTimeout
const performSearch = async (query) => {
  if (!query || query.length < 2) {
    customers.value = []
    return
  }
  
  try {
    const { data } = await customersApi.search(query)
    customers.value = data.data
  } catch (err) {
    console.error('Error searching customers:', err)
  }
}

watch(customerSearch, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})

const totalPaid = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0))
const remainingAmount = computed(() => {
  if (!props.ticket) return 0
  return props.ticket.total - totalPaid.value
})

const calculateChange = computed(() => {
  if (selectedMethod.value !== 'cash' || !cashReceived.value) return 0
  return Math.max(0, cashReceived.value - amountInput.value)
})

const canAddPayment = computed(() => {
  if (!amountInput.value || amountInput.value <= 0) return false
  if (amountInput.value > remainingAmount.value) return false
  if ((selectedMethod.value === 'card' || selectedMethod.value === 'transfer') && !voucherInput.value) return false
  return true
})

// Methods
const addPayment = () => {
  if (!canAddPayment.value) return
  
  payments.value.push({
    method: selectedMethod.value,
    amount: amountInput.value,
    voucher: (selectedMethod.value === 'card' || selectedMethod.value === 'transfer') ? voucherInput.value : null
  })
  
  // Reset form
  amountInput.value = remainingAmount.value
  voucherInput.value = ''
}

const removePayment = (index) => {
  payments.value.splice(index, 1)
}

const getMethodIcon = (methodId) => {
  return paymentMethods.find(m => m.id === methodId)?.icon
}

const getMethodLabel = (methodId) => {
  return paymentMethods.find(m => m.id === methodId)?.label
}

const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  customerSearch.value = ''
  showDropdown.value = false
}

const removeCustomer = () => {
  selectedCustomer.value = null
}

const handleCustomerCreated = (newCustomer) => {
  selectedCustomer.value = newCustomer
}

const finalizeSale = () => {
  if (remainingAmount.value > 0) return
  if (selectedMethod.value === 'cash' && calculateChange.value > props.cashBalance) {
    error('❌ No tienes suficiente dinero en caja para dar el cambio')
    return
  }
  
  emit('complete', {
    ticketId: props.ticket.id,
    payments: payments.value,
    totalPaid: totalPaid.value,
    customerId: selectedCustomer.value?.id || null
  })
  
  // Reset
  payments.value = []
  amountInput.value = 0
  voucherInput.value = ''
}

// Watch cashReceived to auto-set amountInput
watch(cashReceived, (val) => {
  if (selectedMethod.value === 'cash' && val > 0) {
    // If cash received is less than remaining, amount to pay is the cash received
    // If cash received is more, amount to pay is the remaining amount (full payment)
    amountInput.value = Math.min(val, remainingAmount.value)
  }
})

// Watch ticket changes
watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    payments.value = []
    amountInput.value = newTicket.total
    cashReceived.value = 0
    voucherInput.value = ''
    selectedMethod.value = 'cash'
  }
}, { immediate: true })
</script>

<style scoped>
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
}

.slide-in-enter-from > div:last-child,
.slide-in-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
