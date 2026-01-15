<template>
  <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-800">Clientes</h1>
        <p class="text-slate-500 mt-1">Gestiona tu base de datos de clientes</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2 active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Nuevo Cliente
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nombre, documento..." 
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th class="p-4 pl-6">Cliente</th>
              <th class="p-4">Documento</th>
              <th class="p-4">Contacto</th>
              <th class="p-4 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="4" class="p-8 text-center text-slate-400">Cargando clientes...</td>
            </tr>
            <tr 
              v-else-if="customers.length > 0"
              v-for="customer in customers" 
              :key="customer.id" 
              class="hover:bg-slate-50 transition-colors group"
            >
              <td class="p-4 pl-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                    {{ customer.firstName[0] }}{{ customer.lastName[0] }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">{{ customer.firstName }} {{ customer.lastName }}</div>
                    <div class="text-xs text-slate-400">ID: {{ customer.id.slice(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span v-if="customer.documentNumber" class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold border border-slate-200">
                  {{ customer.documentNumber }}
                </span>
                <span v-else class="text-slate-400 text-sm italic">Sin documento</span>
              </td>
              <td class="p-4">
                <div class="flex flex-col gap-1">
                  <div v-if="customer.email" class="text-sm text-slate-600 flex items-center gap-2">
                    <EnvelopeIcon class="w-4 h-4 text-slate-400" />
                    {{ customer.email }}
                  </div>
                  <div v-if="customer.phone" class="text-xs text-slate-500 flex items-center gap-2">
                    <PhoneIcon class="w-4 h-4 text-slate-400" />
                    {{ customer.phone }}
                  </div>
                </div>
              </td>
              <td class="p-4 pr-6 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openEditModal(customer)"
                    class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button 
                    @click="confirmDelete(customer)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-else>
              <td colspan="4" class="p-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                    <UserIcon class="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 class="text-slate-900 font-bold">No hay clientes encontrados</h3>
                  <p class="text-slate-500 text-sm">Prueba con otra búsqueda o crea un nuevo cliente.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <CustomerCreateModal 
      :show="showModal"
      :customer="editingCustomer"
      @close="closeModal"
      @created="handleCustomerUpdated"
      @updated="handleCustomerUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { customersApi } from '@/api/customers'
import { useToast } from '@/composables/useToast'
import CustomerCreateModal from '@/components/customers/CustomerCreateModal.vue'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

const { success, error, warning } = useToast()

const customers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingCustomer = ref(null)

// API Calls
const loadCustomers = async () => {
  loading.value = true
  try {
    const { data } = await customersApi.getAll()
    customers.value = data.data
  } catch (err) {
    console.error('Error loading customers:', err)
    error('Error al cargar clientes')
  } finally {
    loading.value = false
  }
}

const performSearch = async (query) => {
  if (!query) {
    loadCustomers()
    return
  }
  
  loading.value = true
  try {
    const { data } = await customersApi.search(query)
    customers.value = data.data
  } catch (err) {
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

const deleteCustomer = async (id) => {
  try {
    await customersApi.delete(id)
    success('Cliente eliminado correctamente')
    // Remove from local list immediately
    customers.value = customers.value.filter(c => c.id !== id)
  } catch (err) {
    console.error('Delete error:', err)
    error('Error al eliminar el cliente')
  }
}

// Actions
const openCreateModal = () => {
  editingCustomer.value = null
  showModal.value = true
}

const openEditModal = (customer) => {
  editingCustomer.value = customer
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    editingCustomer.value = null
  }, 300)
}

const handleCustomerUpdated = () => {
  // Reload list to get fresh data
  loadCustomers()
}

const confirmDelete = (customer) => {
  if (confirm(`¿Estás seguro de que deseas eliminar al cliente ${customer.firstName} ${customer.lastName}?`)) {
    deleteCustomer(customer.id)
  }
}

// Watchers
let searchTimeout
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})

// Validation for empty search
watch(searchQuery, (newVal) => {
  if (newVal === '') loadCustomers()
})

onMounted(() => {
  loadCustomers()
})
</script>
