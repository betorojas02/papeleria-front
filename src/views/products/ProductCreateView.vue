<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Crear Producto</h1>
    
    <AppCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppInput
            v-model="form.name"
            label="Nombre"
            required
            :error="errors.name"
          />
          
          <AppInput
            v-model="form.sku"
            label="SKU"
            :error="errors.sku"
          />
          
          <AppInput
            v-model="form.barcode"
            label="Código de Barras"
            :error="errors.barcode"
          />
          
          <AppInput
            v-model.number="form.price"
            label="Precio"
            type="number"
            step="0.01"
            required
            :error="errors.price"
          />
          
          <AppInput
            v-model.number="form.stock"
            label="Stock Inicial"
            type="number"
            required
            :error="errors.stock"
          />
          
          <AppInput
            v-model.number="form.minStock"
            label="Stock Mínimo"
            type="number"
            :error="errors.minStock"
          />
          
          <AppSelect
            v-model="form.categoryId"
            label="Categoría"
            :options="categoryOptions"
            required
            :error="errors.categoryId"
          />
          
          <AppSelect
            v-model="form.brandId"
            label="Marca (Opcional)"
            :options="brandOptions"
          />
        </div>
        
        <div class="flex justify-end gap-3">
          <AppButton
            type="button"
            variant="secondary"
            @click="$router.back()"
          >
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            :loading="loading"
          >
            Crear Producto
          </AppButton>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi } from '@/api/products'
import { categoriesApi } from '@/api/categories'
import { brandsApi } from '@/api/brands'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'

const router = useRouter()
const { success, error: showError } = useToast()

const loading = ref(false)
const categoryOptions = ref([])
const brandOptions = ref([])

const form = reactive({
  name: '',
  sku: '',
  barcode: '',
  price: 0,
  stock: 0,
  minStock: 10,
  categoryId: '',
  brandId: '',
})

const errors = reactive({})

const loadOptions = async () => {
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      categoriesApi.getAll(),
      brandsApi.getAll(),
    ])

    categoryOptions.value = categoriesRes.data.data.map(c => ({
      value: c.id,
      label: c.name
    }))

    brandOptions.value = [
      { value: '', label: 'Sin marca' },
      ...brandsRes.data.data.map(b => ({ value: b.id, label: b.name }))
    ]
  } catch (err) {
    console.error('Error loading options:', err)
    showError(err.customMessage || err.message || 'Error al cargar opciones')
  }
}

const handleSubmit = async () => {
  loading.value = true
  Object.keys(errors).forEach(key => delete errors[key])

  try {
    const data = { ...form }
    if (!data.brandId) delete data.brandId

    await productsApi.create(data)
    success('✅ Producto creado exitosamente')
    router.push('/products')
  } catch (err) {
    console.error('Error creating product:', err)
    showError(err.customMessage || err.message || '❌ Error al crear producto')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOptions()
})
</script>
