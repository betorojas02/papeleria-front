<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h1>
    
    <AppCard v-if="!loading">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppInput v-model="form.name" label="Nombre" required />
          <AppInput v-model="form.sku" label="SKU" />
          <AppInput v-model="form.barcode" label="Código de Barras" />
          <AppInput v-model.number="form.price" label="Precio" type="number" step="0.01" required />
          <AppInput v-model.number="form.stock" label="Stock" type="number" required />
          <AppInput v-model.number="form.minStock" label="Stock Mínimo" type="number" />
          <AppSelect v-model="form.categoryId" label="Categoría" :options="categoryOptions" required />
          <AppSelect v-model="form.brandId" label="Marca" :options="brandOptions" />
        </div>
        
        <div class="flex justify-end gap-3">
          <AppButton type="button" variant="secondary" @click="$router.back()">
            Cancelar
          </AppButton>
          <AppButton type="submit" variant="primary" :loading="saving">
            Guardar Cambios
          </AppButton>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi } from '@/api/products'
import { categoriesApi } from '@/api/categories'
import { brandsApi } from '@/api/brands'
import { useToast } from '@/composables/useToast'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const { success, error } = useToast()

const loading = ref(true)
const saving = ref(false)
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

const loadProduct = async () => {
  try {
    const { data } = await productsApi.getById(route.params.id)
    Object.assign(form, data.data)
  } catch (err) {
    console.error('Error loading product:', err)
    error('Error al cargar producto')
    router.push('/products')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      categoriesApi.getAll(),
      brandsApi.getAll(),
    ])

    categoryOptions.value = categoriesRes.data.data.map(c => ({ value: c.id, label: c.name }))
    brandOptions.value = [
      { value: '', label: 'Sin marca' },
      ...brandsRes.data.data.map(b => ({ value: b.id, label: b.name }))
    ]
  } catch (err) {
    console.error('Error loading options:', err)
    error('Error al cargar opciones')
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    // Only send the fields that can be updated
    const updateData = {
      name: form.name,
      sku: form.sku || null,
      barcode: form.barcode || null,
      price: Number(form.price),
      stock: Number(form.stock),
      minStock: Number(form.minStock) || 10,
      categoryId: form.categoryId,
      brandId: form.brandId || null,
    }
    
    await productsApi.update(route.params.id, updateData)
    success('✅ Producto actualizado exitosamente')
    router.push('/products')
  } catch (err) {
    console.error('Error updating product:', err)
    error(err.customMessage || err.message || '❌ Error al actualizar producto')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadOptions()
  loadProduct()
})
</script>
