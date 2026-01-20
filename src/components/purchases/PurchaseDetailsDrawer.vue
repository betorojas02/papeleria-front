<template>
  <transition name="slide-in">
    <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-end">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        @click="$emit('close')"
      ></div>
      
      <!-- Drawer -->
      <div v-if="purchase" class="relative w-full md:w-[600px] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <!-- Header -->
        <div class="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 class="font-bold text-xl">Detalle de Compra</h2>
            <p class="text-xs text-slate-400">Factura #{{ purchase.invoiceNumber || 'S/N' }}</p>
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
          
          <!-- General Info Card -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-2 gap-4">
             <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Proveedor</p>
                <p class="font-bold text-slate-800">{{ purchase.supplier?.name || 'Desconocido' }}</p>
             </div>
             <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Compra</p>
                <p class="font-medium text-slate-800">{{ formatDate(purchase.purchaseDate) }}</p>
             </div>
             <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registrado Por</p>
                <p class="font-medium text-slate-800">{{ purchase.user?.name || 'Sistema' }}</p>
             </div>
             <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Compra</p>
                <p class="font-black text-emerald-600 text-lg">{{ formatCurrency(purchase.total) }}</p>
             </div>
          </div>

          <!-- Products List -->
          <div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                <span>Productos Adquiridos ({{ purchase.details?.length || 0 }})</span>
                <span class="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">Stock Actual en Inventario</span>
            </p>
            <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                <div v-if="!purchase.details || purchase.details.length === 0" class="p-8 text-center text-slate-400">
                    No hay detalles disponibles para esta compra.
                </div>
                <div 
                  v-else
                  v-for="detail in purchase.details" 
                  :key="detail.id" 
                  class="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-bold text-slate-800 text-sm">{{ detail.product?.name || 'Producto Eliminado' }}</p>
                        <p class="text-xs text-slate-500 font-mono">Costo Unit: {{ formatCurrency(detail.unitCost) }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-slate-900">{{ formatCurrency(detail.subtotal) }}</p>
                        <p class="text-xs text-slate-500">Cant: {{ detail.quantity }}</p>
                    </div>
                  </div>
                  
                  <!-- Stock Validation -->
                  <div class="flex justify-end pt-2 border-t border-slate-50 mt-2">
                    <div class="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span class="text-xs font-bold text-indigo-700">Stock Actual: {{ detail.product?.stock ?? 'N/A' }}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-6 bg-white border-t border-slate-100 shrink-0 flex justify-end">
            <button 
                @click="$emit('close')"
                class="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useCurrency } from '@/composables/useCurrency'

const { formatCurrency } = useCurrency()

defineProps({
  show: Boolean,
  purchase: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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
