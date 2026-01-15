<template>
  <div :class="[
    'p-6 rounded-2xl border-2 transition-all hover:shadow-lg',
    colorClasses[variant].bg,
    colorClasses[variant].border
  ]">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p :class="['text-sm font-bold uppercase tracking-wider mb-2', colorClasses[variant].label]">
          {{ label }}
        </p>
        <p :class="['text-3xl font-black mb-1', colorClasses[variant].value]">
          {{ formattedValue }}
        </p>
        <p v-if="change" :class="['text-sm font-medium', changeClass]">
          {{ change }}
        </p>
      </div>
      <div :class="['p-3 rounded-xl', colorClasses[variant].iconBg]">
        <component :is="icon" :class="['w-8 h-8', colorClasses[variant].icon]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps({
  label: String,
  value: [Number, String],
  change: String,
  icon: [Object, Function],
  variant: {
    type: String,
    default: 'primary'
  },
  format: {
    type: String,
    default: 'number' // 'number' | 'currency'
  }
})

const { formatCurrency } = useCurrency()

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    label: 'text-primary-600',
    value: 'text-primary-900',
    icon: 'text-primary-600',
    iconBg: 'bg-primary-100'
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    label: 'text-success-600',
    value: 'text-success-900',
    icon: 'text-success-600',
    iconBg: 'bg-success-100'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    label: 'text-warning-600',
    value: 'text-warning-900',
    icon: 'text-warning-600',
    iconBg: 'bg-warning-100'
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    label: 'text-danger-600',
    value: 'text-danger-900',
    icon: 'text-danger-600',
    iconBg: 'bg-danger-100'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'text-blue-600',
    value: 'text-blue-900',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100'
  }
}

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    return formatCurrency(props.value)
  }
  return props.value
})

const changeClass = computed(() => {
  if (!props.change) return ''
  if (props.change.startsWith('+')) return 'text-success-600'
  if (props.change.startsWith('-')) return 'text-danger-600'
  return 'text-slate-600'
})
</script>
