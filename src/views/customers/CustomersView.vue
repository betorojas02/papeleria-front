<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
      <AppButton variant="primary" @click="showModal = true">
        <PlusIcon class="h-5 w-5 mr-2" />
        Nuevo Cliente
      </AppButton>
    </div>

    <AppCard>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ customer.firstName }} {{ customer.lastName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ customer.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ customer.phone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <AppModal :is-open="showModal" title="Nuevo Cliente" @close="showModal = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <AppInput v-model="form.firstName" label="Nombre" required />
          <AppInput v-model="form.lastName" label="Apellido" required />
          <AppInput v-model="form.email" label="Email" type="email" />
          <AppInput v-model="form.phone" label="Teléfono" />
        </div>
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="showModal = false">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" :loading="loading" @click="handleSubmit">
          Crear
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { customersApi } from '@/api/customers'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const { success, error } = useToast()

const customers = ref([])
const loading = ref(false)
const showModal = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const loadCustomers = async () => {
  try {
    const { data } = await customersApi.getAll()
    customers.value = data.data
  } catch (err) {
    console.error('Error loading customers:', err)
    error('Error al cargar clientes')
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await customersApi.create(form)
    success('✅ Cliente creado exitosamente')
    showModal.value = false
    Object.keys(form).forEach(key => form[key] = '')
    loadCustomers()
  } catch (err) {
    console.error('Error creating customer:', err)
    error('❌ Error al crear cliente')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomers()
})
</script>
