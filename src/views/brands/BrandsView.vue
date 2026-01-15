<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Marcas</h1>
        <p class="text-sm text-slate-500 mt-1">Gestiona las marcas de productos</p>
      </div>
      <AppButton variant="primary" @click="openCreateModal">
        <PlusIcon class="h-5 w-5 mr-2" />
        Nueva Marca
      </AppButton>
    </div>

    <AppCard>
      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="brand in brands"
              :key="brand.id"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4">
                <span class="font-medium text-slate-800">{{ brand.name }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-slate-600">{{ brand.description || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(brand)"
                    class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(brand)"
                    class="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="brands.length === 0">
              <td colspan="3" class="py-12 text-center text-slate-500">
                No hay marcas registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Modal Create/Edit -->
    <AppModal 
      :is-open="showModal" 
      :title="modalMode === 'create' ? 'Nueva Marca' : 'Editar Marca'" 
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput v-model="form.name" label="Nombre" required />
        <AppInput v-model="form.description" label="Descripción" />
      </form>
      
      <template #footer>
        <AppButton type="button" variant="secondary" @click="closeModal">
          Cancelar
        </AppButton>
        <AppButton 
          type="submit" 
          :variant="modalMode === 'create' ? 'primary' : 'success'" 
          :loading="loading" 
          @click="handleSubmit"
        >
          {{ modalMode === 'create' ? 'Crear' : 'Actualizar' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { brandsApi } from '@/api/brands'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const { success, error } = useToast()

const brands = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const editingBrand = ref(null)

const form = reactive({
  name: '',
  description: '',
})

const loadBrands = async () => {
  try {
    const { data } = await brandsApi.getAll()
    brands.value = data.data
  } catch (err) {
    console.error('Error loading brands:', err)
    error(err.customMessage || err.message || 'Error al cargar marcas')
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.name = ''
  form.description = ''
  editingBrand.value = null
  showModal.value = true
}

const openEditModal = (brand) => {
  modalMode.value = 'edit'
  form.name = brand.name
  form.description = brand.description || ''
  editingBrand.value = brand
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.name = ''
  form.description = ''
  editingBrand.value = null
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (modalMode.value === 'create') {
      await brandsApi.create(form)
      success('✅ Marca creada exitosamente')
    } else {
      await brandsApi.update(editingBrand.value.id, form)
      success('✅ Marca actualizada exitosamente')
    }
    closeModal()
    loadBrands()
  } catch (err) {
    console.error('Error saving brand:', err)
    error(err.customMessage || err.message || '❌ Error al guardar marca')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (brand) => {
  if (!confirm(`¿Estás seguro de eliminar la marca "${brand.name}"?`)) {
    return
  }
  
  try {
    await brandsApi.delete(brand.id)
    success('✅ Marca eliminada exitosamente')
    loadBrands()
  } catch (err) {
    console.error('Error deleting brand:', err)
    error(err.customMessage || err.message || '❌ Error al eliminar marca')
  }
}

onMounted(() => {
  loadBrands()
})
</script>
