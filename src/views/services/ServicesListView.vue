<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Servicios</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de servicios sin inventario (fotocopias, impresiones, etc.)</p>
      </div>
      <AppButton variant="primary" icon="PlusIcon" @click="openCreateModal">
        Nuevo Servicio
      </AppButton>
    </div>

    <!-- Table Card -->
    <AppCard>
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar servicios..."
            class="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
          />
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
              <th class="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="py-12 text-center text-slate-400">Cargando servicios...</td>
            </tr>
            <tr v-else-if="filteredServices.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
                <WrenchScrewdriverIcon class="w-12 h-12 mx-auto mb-2 opacity-20" />
                No se encontraron servicios
              </td>
            </tr>
            <tr
              v-for="service in filteredServices"
              :key="service.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium text-slate-800">{{ service.name }}</div>
              </td>
              <td class="py-3 px-4 text-sm text-slate-600">
                {{ service.description || '-' }}
              </td>
              <td class="py-3 px-4 text-right font-bold text-slate-800">
                {{ formatCurrency(service.price) }}
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                    service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ service.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(service)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(service)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 border-b border-slate-200">
            <h2 class="text-xl font-bold text-slate-800">
              {{ editingService ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h2>
          </div>

          <form @submit.prevent="saveService" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input
                v-model="form.name"
                type="text"
                required
                maxlength="100"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Fotocopia B/N"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descripción del servicio"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Precio *</label>
              <input
                v-model.number="form.price"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                id="isActive"
                class="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label for="isActive" class="ml-2 text-sm font-medium text-slate-700">Servicio activo</label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { servicesApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const { success, error } = useToast()
const { formatCurrency } = useCurrency()

const services = ref([])
const loading = ref(false)
const search = ref('')
const showModal = ref(false)
const editingService = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  price: 0,
  isActive: true
})

const filteredServices = computed(() => {
  if (!search.value) return services.value
  const query = search.value.toLowerCase()
  return services.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.description?.toLowerCase().includes(query)
  )
})

const loadServices = async () => {
  loading.value = true
  try {
    const { data } = await servicesApi.getAll()
    services.value = data.data
  } catch (err) {
    console.error(err)
    error('Error al cargar servicios')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingService.value = null
  form.value = {
    name: '',
    description: '',
    price: 0,
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (service) => {
  editingService.value = service
  form.value = {
    name: service.name,
    description: service.description || '',
    price: service.price,
    isActive: service.isActive
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingService.value = null
}

const saveService = async () => {
  saving.value = true
  try {
    if (editingService.value) {
      await servicesApi.update(editingService.value.id, form.value)
      success('✅ Servicio actualizado correctamente')
    } else {
      await servicesApi.create(form.value)
      success('✅ Servicio creado correctamente')
    }
    closeModal()
    loadServices()
  } catch (err) {
    console.error(err)
    error(err.customMessage || err.message || 'Error al guardar servicio')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (service) => {
  if (!confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) return

  try {
    await servicesApi.delete(service.id)
    success('✅ Servicio eliminado correctamente')
    loadServices()
  } catch (err) {
    console.error(err)
    error(err.customMessage || err.message || 'Error al eliminar servicio')
  }
}

onMounted(() => {
  loadServices()
})
</script>
