<template>
  <div class="space-y-3">
    <!-- Progress Bar -->
    <div class="relative">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-700">Meta del Mes</span>
        <span class="text-sm font-bold text-primary-600">{{ percentage }}%</span>
      </div>
      <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressColor"
          :style="{ width: `${Math.min(percentage, 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-slate-50 rounded-lg p-3">
        <p class="text-xs text-slate-500 mb-1">Actual</p>
        <p class="text-lg font-bold text-slate-800">{{ formatCurrency(current) }}</p>
      </div>
      <div class="bg-slate-50 rounded-lg p-3">
        <p class="text-xs text-slate-500 mb-1">Meta</p>
        <p class="text-lg font-bold text-slate-800">{{ formatCurrency(goal) }}</p>
      </div>
    </div>

    <!-- Remaining -->
    <div class="flex items-center justify-between text-xs">
      <span class="text-slate-500">Faltan {{ daysRemaining }} días</span>
      <span :class="remaining >= 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'">
        {{ remaining >= 0 ? `Faltan $${remaining.toLocaleString()}` : `¡Meta superada!` }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrency } from '@/composables/useCurrency'

const { formatCurrency } = useCurrency()

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  goal: {
    type: Number,
    default: 1000000 // Default 1M
  }
})

const percentage = computed(() => {
  if (props.goal === 0) return 0
  return Math.round((props.current / props.goal) * 100)
})

const remaining = computed(() => {
  return props.goal - props.current
})

const daysRemaining = computed(() => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const diff = lastDay.getDate() - now.getDate()
  return diff
})

const progressColor = computed(() => {
  const pct = percentage.value
  if (pct >= 100) return 'bg-green-500'
  if (pct >= 75) return 'bg-blue-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
})
</script>
