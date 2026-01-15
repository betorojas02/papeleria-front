<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Proveedores</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de proveedores y contactos</p>
      </div>
      <AppButton variant="primary" icon="PlusIcon" @click="openModal()">
        Nuevo Proveedor
      </AppButton>
    </div>

    <!-- Table Card -->
    <AppCard>
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar proveedor..."
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
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th class="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="py-12 text-center text-slate-400">Cargando proveedores...</td>
            </tr>
            <tr v-else-if="filteredSuppliers.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
                <ArchiveBoxXMarkIcon class="w-12 h-12 mx-auto mb-2 opacity-20" />
                No se encontraron proveedores
              </td>
            </tr>
            <tr
              v-for="supplier in filteredSuppliers"
              :key="supplier.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium text-slate-800">{{ supplier.name }}</div>
                <div class="text-xs text-slate-500">{{ supplier.taxId || 'Sin RUC/DNI' }}</div>
              </td>
              <td class="py-3 px-4 text-sm text-slate-600">{{ supplier.email || '-' }}</td>
              <td class="py-3 px-4 text-sm text-slate-600">{{ supplier.phone || '-' }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openModal(supplier)"
                    class="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(supplier)"
                    class="p-1 text-slate-400 hover:text-red-600 transition-colors"
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

    <!-- Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle as="h3" class="text-lg font-bold leading-6 text-slate-900 mb-4">
                  {{ editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
                </DialogTitle>

                <form @submit.prevent="saveSupplier" class="space-y-4">
                  <AppInput
                    v-model="form.name"
                    label="Nombre / Razón Social"
                    placeholder="Ej. Distribuidora Central"
                    required
                  />
                  
                  <AppInput
                    v-model="form.taxId"
                    label="RUC / DNI"
                    placeholder="Ej. 10123456789"
                  />

                  <div class="grid grid-cols-2 gap-4">
                    <AppInput
                      v-model="form.email"
                      label="Email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                    />
                    <AppInput
                      v-model="form.phone"
                      label="Teléfono"
                      placeholder="999 999 999"
                    />
                  </div>

                  <AppInput
                    v-model="form.address"
                    label="Dirección"
                    placeholder="Av. Principal 123"
                  />

                  <div class="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-lg border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      @click="closeModal"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      class="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      :disabled="saving"
                    >
                      {{ saving ? 'Guardando...' : 'Guardar' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { suppliersApi } from '@/api/suppliers'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppInput from '@/components/common/AppInput.vue'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/vue/24/outline'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const { success, error, confirm } = useToast()

const suppliers = ref([])
const loading = ref(false)
const search = ref('')
const isModalOpen = ref(false)
const saving = ref(false)
const editingSupplier = ref(null)

const form = reactive({
  name: '',
  taxId: '',
  email: '',
  phone: '',
  address: ''
})

const filteredSuppliers = computed(() => {
  if (!search.value) return suppliers.value
  const q = search.value.toLowerCase()
  return suppliers.value.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.taxId?.includes(q)
  )
})

const loadSuppliers = async () => {
  loading.value = true
  try {
    const { data } = await suppliersApi.getAll()
    suppliers.value = data.data
  } catch (err) {
    console.error(err)
    error('Error al cargar proveedores')
  } finally {
    loading.value = false
  }
}

const openModal = (supplier = null) => {
  editingSupplier.value = supplier
  if (supplier) {
    Object.assign(form, supplier)
  } else {
    Object.assign(form, {
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: ''
    })
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingSupplier.value = null
}

const saveSupplier = async () => {
  saving.value = true
  try {
    if (editingSupplier.value) {
      await suppliersApi.update(editingSupplier.value.id, form)
      success('Proveedor actualizado exitosamente')
    } else {
      await suppliersApi.create(form)
      success('Proveedor creado exitosamente')
    }
    closeModal()
    loadSuppliers()
  } catch (err) {
    console.error(err)
    const message = err.response?.data?.message
    if (Array.isArray(message)) {
      error(message.join('\n'))
    } else {
      error(message || 'Error al guardar proveedor')
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (supplier) => {
  const confirmed = await confirm(
    '¿Eliminar proveedor?',
    `¿Estás seguro de eliminar a ${supplier.name}?`
  )
  
  if (confirmed) {
    try {
      await suppliersApi.delete(supplier.id)
      success('Proveedor eliminado')
      loadSuppliers()
    } catch (err) {
      console.error(err)
      error('Error al eliminar proveedor')
    }
  }
}

onMounted(() => {
  loadSuppliers()
})
</script>
