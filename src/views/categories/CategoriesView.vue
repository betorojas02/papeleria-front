<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Categorías</h1>
        <p class="text-sm text-slate-500 mt-1">Gestiona las categorías de productos</p>
      </div>
      <AppButton variant="primary" @click="openCreateModal">
        <PlusIcon class="h-5 w-5 mr-2" />
        Nueva Categoría
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
              v-for="category in paginatedCategories"
              :key="category.id"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4">
                <span class="font-medium text-slate-800">{{ category.name }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-slate-600">{{ category.description || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(category)"
                    class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(category)"
                    class="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="3" class="py-12 text-center text-slate-500">
                No hay categorías registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Pagination Controls -->
    <div 
      v-if="categories.length > itemsPerPage" 
      class="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-lg shadow-sm"
    >
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-slate-700">
            Mostrando página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{ totalPages }}</span>
            (Total: <span class="font-medium">{{ categories.length }}</span> registros)
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Anterior</span>
              <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
            </button>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Siguiente</span>
              <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <AppModal 
      :is-open="showModal" 
      :title="modalMode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'" 
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
import { ref, reactive, computed, onMounted } from 'vue'
import { categoriesApi } from '@/api/categories'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const { success, error } = useToast()

const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const editingCategory = ref(null)

// Pagination (Client Side)
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return categories.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(categories.value.length / itemsPerPage))

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const form = reactive({
  name: '',
  description: '',
})

const loadCategories = async () => {
  try {
    const { data } = await categoriesApi.getAll()
    categories.value = data.data
  } catch (err) {
    console.error('Error loading categories:', err)
    error(err.customMessage || err.message || 'Error al cargar categorías')
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.name = ''
  form.description = ''
  editingCategory.value = null
  showModal.value = true
}

const openEditModal = (category) => {
  modalMode.value = 'edit'
  form.name = category.name
  form.description = category.description || ''
  editingCategory.value = category
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.name = ''
  form.description = ''
  editingCategory.value = null
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (modalMode.value === 'create') {
      await categoriesApi.create(form)
      success('✅ Categoría creada exitosamente')
    } else {
      await categoriesApi.update(editingCategory.value.id, form)
      success('✅ Categoría actualizada exitosamente')
    }
    closeModal()
    loadCategories()
  } catch (err) {
    console.error('Error saving category:', err)
    error(err.customMessage || err.message || '❌ Error al guardar categoría')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (category) => {
  if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
    return
  }
  
  try {
    await categoriesApi.delete(category.id)
    success('✅ Categoría eliminada exitosamente')
    loadCategories()
  } catch (err) {
    console.error('Error deleting category:', err)
    error(err.customMessage || err.message || '❌ Error al eliminar categoría')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
