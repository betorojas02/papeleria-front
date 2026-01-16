<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
    <!-- Presets -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectPeriod(period)"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          selectedPeriod === period.value
            ? 'bg-primary-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100'
        ]"
      >
        {{ period.label }}
      </button>
      <!-- Custom Toggle -->
      <button
        @click="selectedPeriod = 'custom'"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          selectedPeriod === 'custom'
            ? 'bg-primary-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100'
        ]"
      >
        Personalizado
      </button>
    </div>

    <!-- Custom Range Inputs -->
    <div v-if="selectedPeriod === 'custom'" class="flex items-center gap-2 animate-fadeIn">
      <div class="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
        <input 
          type="date" 
          v-model="customStart"
          class="bg-transparent border-none text-sm text-slate-700 focus:ring-0 p-0"
        />
        <span class="text-slate-400">-</span>
        <input 
          type="date" 
          v-model="customEnd"
          class="bg-transparent border-none text-sm text-slate-700 focus:ring-0 p-0"
        />
      </div>
      <button
        @click="applyCustomRange"
        class="p-1.5 rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
        title="Aplicar filtro"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initialPeriod: {
    type: String,
    default: 'today'
  }
})

const emit = defineEmits(['update:period', 'change'])

const periods = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
  { value: 'all', label: 'Global (Todo)' },
]

const selectedPeriod = ref(props.initialPeriod)
const customStart = ref('')
const customEnd = ref('')

const getDatesForPeriod = (period) => {
  if (period === 'all') {
    return {
      startDate: null,
      endDate: null,
      label: 'Histórico Global'
    }
  }

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  let start = new Date(today)
  let end = new Date(endOfDay)

  switch (period) {
    case 'today':
      break
    case 'yesterday':
      start.setDate(today.getDate() - 1)
      end = new Date(start) 
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      break
    case 'month':
      start.setDate(1) 
      break
  }

  // Convert to YYYY-MM-DD format for backend
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    label: periods.find(p => p.value === period)?.label
  }
}

const selectPeriod = (period) => {
  selectedPeriod.value = period.value
  const range = getDatesForPeriod(period.value)
  emit('change', range)
}

const applyCustomRange = () => {
  if (!customStart.value || !customEnd.value) return

  // Date inputs already provide YYYY-MM-DD format, use them directly
  emit('change', {
    startDate: customStart.value,
    endDate: customEnd.value,
    label: `${customStart.value} - ${customEnd.value}`
  })
}

// Ensure local date string for inputs
onMounted(() => {
  const now = new Date()
  customEnd.value = now.toISOString().split('T')[0]
  customStart.value = now.toISOString().split('T')[0]
  
  selectPeriod(periods.find(p => p.value === props.initialPeriod) || periods[0])
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
