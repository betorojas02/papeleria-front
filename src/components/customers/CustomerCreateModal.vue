<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 class="text-xl font-bold text-slate-800">{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre <span class="text-red-500">*</span></label>
              <input 
                v-model="form.firstName" 
                type="text" 
                required
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Apellido <span class="text-red-500">*</span></label>
              <input 
                v-model="form.lastName" 
                type="text" 
                required
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Documento / Cédula</label>
            <input 
              v-model="form.documentNumber" 
              type="text" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 flex gap-3">
            <button 
              type="button" 
              @click="$emit('close')"
              class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ isEdit ? 'Guardar Cambios' : 'Guardar Cliente' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { customersApi } from '@/api/customers'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  show: Boolean,
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'created', 'updated'])
const { success, error } = useToast()

const loading = ref(false)
const isEdit = computed(() => !!props.customer)

const form = reactive({
  firstName: '',
  lastName: '',
  documentNumber: '',
  email: '',
  phone: ''
})

watch(() => props.customer, (newVal) => {
  if (newVal) {
    form.firstName = newVal.firstName
    form.lastName = newVal.lastName
    form.documentNumber = newVal.documentNumber
    form.email = newVal.email
    form.phone = newVal.phone
  } else {
    // Reset if null (Create mode)
    Object.keys(form).forEach(key => form[key] = '')
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      const { data } = await customersApi.update(props.customer.id, form)
      success('✅ Cliente actualizado exitosamente')
      emit('updated', data.data || data)
    } else {
      const { data } = await customersApi.create(form)
      success('✅ Cliente creado exitosamente')
      emit('created', data.data || data)
    }
    emit('close')
    if (!isEdit.value) Object.keys(form).forEach(key => form[key] = '')
  } catch (err) {
    console.error('Error saving customer:', err)
    error(err.response?.data?.message || 'Error al guardar cliente')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
