<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Caja Registradora</h1>
    
    <AppCard v-if="!currentRegister">
      <div class="text-center py-12">
        <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay caja abierta</h3>
        <p class="mt-1 text-sm text-gray-500">Abre una caja para comenzar a vender</p>
        <div class="mt-6">
          <AppButton variant="primary" @click="showOpenModal = true">
            Abrir Caja
          </AppButton>
        </div>
      </div>
    </AppCard>

    <AppCard v-else>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-600">Monto Inicial</p>
            <p class="text-2xl font-bold text-gray-900">${{ currentRegister.openingAmount.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Estado</p>
            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
              Abierta
            </span>
          </div>
        </div>
        
        <AppButton variant="danger" @click="showCloseModal = true">
          Cerrar Caja
        </AppButton>
      </div>
    </AppCard>

    <!-- Open Modal -->
    <AppModal :is-open="showOpenModal" title="Abrir Caja" @close="showOpenModal = false">
      <form @submit.prevent="handleOpen" class="space-y-4">
        <AppInput
          v-model.number="openForm.openingAmount"
          label="Monto Inicial"
          type="number"
          step="0.01"
          required
        />
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="showOpenModal = false">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" :loading="loading" @click="handleOpen">
          Abrir Caja
        </AppButton>
      </template>
    </AppModal>

    <!-- Close Modal -->
    <AppModal :is-open="showCloseModal" title="Cerrar Caja" @close="showCloseModal = false">
      <form @submit.prevent="handleClose" class="space-y-4">
        <AppInput
          v-model.number="closeForm.closingAmount"
          label="Monto Final"
          type="number"
          step="0.01"
          required
        />
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="showCloseModal = false">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="danger" :loading="loading" @click="handleClose">
          Cerrar Caja
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { cashRegistersApi } from '@/api/cashRegisters'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const currentRegister = ref(null)
const loading = ref(false)
const showOpenModal = ref(false)
const showCloseModal = ref(false)

const openForm = reactive({
  openingAmount: 0,
})

const closeForm = reactive({
  closingAmount: 0,
})

const loadCurrentRegister = async () => {
  try {
    const { data } = await cashRegistersApi.getOpen()
    if (data.data.length > 0) {
      currentRegister.value = data.data[0]
    }
  } catch (error) {
    console.error('Error loading cash register:', error)
  }
}

const handleOpen = async () => {
  loading.value = true
  try {
    await cashRegistersApi.open({
      ...openForm,
      userId: authStore.user.id,
    })
    showOpenModal.value = false
    loadCurrentRegister()
  } catch (error) {
    console.error('Error opening cash register:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = async () => {
  loading.value = true
  try {
    await cashRegistersApi.close(currentRegister.value.id, closeForm)
    showCloseModal.value = false
    currentRegister.value = null
  } catch (error) {
    console.error('Error closing cash register:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCurrentRegister()
})
</script>
