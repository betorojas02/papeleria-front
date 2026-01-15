<template>
  <AppCard>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg" :class="isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'">
          <ArchiveBoxIcon class="w-6 h-6" />
        </div>
        <div>
          <h3 class="font-bold text-slate-800">Caja Registradora</h3>
          <p class="text-xs text-slate-500">{{ isOpen ? 'Turno Activo' : 'Caja Cerrada' }}</p>
        </div>
      </div>
      <span 
        class="px-2.5 py-1 rounded-full text-xs font-bold border"
        :class="isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'"
      >
        {{ isOpen ? 'ABIERTA' : 'CERRADA' }}
      </span>
    </div>

    <div v-if="isOpen" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Base Inicial</p>
          <p class="text-lg font-bold text-slate-800">${{ currentRegister.openingAmount?.toLocaleString() }}</p>
        </div>
        <div class="bg-primary-50 p-3 rounded-xl border border-primary-100">
          <p class="text-[10px] font-bold text-primary-400 uppercase">Ventas Turno (Efectivo)</p>
          <p class="text-lg font-bold text-primary-700">${{ currentRegister.totalCashSales?.toLocaleString() || '0' }}</p>
        </div>
      </div>
      
      <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
        <div>
           <p class="text-xs font-bold text-emerald-600 uppercase">Total en Caja (Estimado)</p>
           <p class="text-[10px] text-emerald-500">Base + Ventas Efectivo</p>
        </div>
        <p class="text-2xl font-black text-emerald-700">${{ currentRegister.currentBalance?.toLocaleString() || currentRegister.openingAmount?.toLocaleString() }}</p>
      </div>
      
      <button 
        @click="showCloseModal = true"
        class="w-full py-2.5 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
      >
        Cerrar Caja
      </button>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-slate-500 text-sm mb-4">Debes abrir caja para realizar ventas.</p>
      <button 
        @click="showOpenModal = true"
        class="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-500/20 transition-all"
      >
        Abrir Nueva Caja
      </button>
    </div>

    <!-- Modals -->
    <AppModal :is-open="showOpenModal" title="Apertura de Caja" @close="showOpenModal = false">
      <form @submit.prevent="handleOpen" class="space-y-6">
         <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
          <InformationCircleIcon class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p class="text-xs text-blue-700">Ingresa el monto de dinero físico con el que inicias el turno (base).</p>
        </div>

        <AppInput
          v-model.number="openForm.openingAmount"
          label="Monto Base Inicial"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="showOpenModal = false">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" :loading="loading" @click="handleOpen">
          Abrir Turno
        </AppButton>
      </template>
    </AppModal>

    <AppModal :is-open="showCloseModal" title="Cierre de Caja" @close="showCloseModal = false">
       <form @submit.prevent="handleClose" class="space-y-6">
        <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
          <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-amber-800 text-sm">¿Confirmas el cierre?</p>
            <p class="text-xs text-amber-700 mt-1">Al cerrar, se generará el reporte final y no podrás registrar más ventas hasta abrir un nuevo turno.</p>
          </div>
        </div>

        <AppInput
          v-model.number="closeForm.closingAmount"
          label="Dinero Total en Caja"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="showCloseModal = false">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="danger" :loading="loading" @click="handleClose">
          Confirmar Cierre
        </AppButton>
      </template>
    </AppModal>
  </AppCard>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { cashRegistersApi } from '@/api/cashRegisters'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { ArchiveBoxIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const { success, error } = useToast()
const emit = defineEmits(['status-changed'])

const currentRegister = ref(null)
const loading = ref(false)
const showOpenModal = ref(false)
const showCloseModal = ref(false)

const isOpen = computed(() => !!currentRegister.value)

const openForm = reactive({ openingAmount: '' })
const closeForm = reactive({ closingAmount: '' })

const loadRegister = async () => {
  try {
    const { data } = await cashRegistersApi.getOpen()
    if (data.data.length > 0) {
      currentRegister.value = data.data[0]
    } else {
      currentRegister.value = null
    }
  } catch (err) {
    console.error('Error loading register:', err)
  }
}

const handleOpen = async () => {
  if (!openForm.openingAmount && openForm.openingAmount !== 0) return
  loading.value = true
  try {
    const { data } = await cashRegistersApi.open({
      openingAmount: Number(openForm.openingAmount),
      userId: authStore.user.id
    })
    success('✅ Caja abierta correctamente')
    showOpenModal.value = false
    currentRegister.value = data.data || data // fallback
    openForm.openingAmount = ''
    emit('status-changed', true)
  } catch (err) {
    console.error(err)
    error(err.response?.data?.message || 'Error al abrir caja')
  } finally {
    loading.value = false
  }
}

const handleClose = async () => {
  if (!closeForm.closingAmount && closeForm.closingAmount !== 0) return
  loading.value = true
  try {
    await cashRegistersApi.close(currentRegister.value.id, {
      closingAmount: Number(closeForm.closingAmount)
    })
    success('🔒 Caja cerrada correctamente')
    showCloseModal.value = false
    currentRegister.value = null
    closeForm.closingAmount = ''
    emit('status-changed', false)
  } catch (err) {
    console.error(err)
    error(err.response?.data?.message || 'Error al cerrar caja')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRegister()
})
</script>
