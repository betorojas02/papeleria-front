<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="inline-flex items-center justify-center font-bold rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span v-if="loading" class="inline-block animate-spin mr-2">
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const buttonClasses = computed(() => {
  const classes = []
  
  // Width
  if (props.fullWidth) {
    classes.push('w-full')
  }
  
  // Size
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  }
  classes.push(sizeClasses[props.size])
  
  // Variant
  const variantClasses = {
    primary: 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 focus:ring-slate-900',
    secondary: 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
    danger: 'bg-danger-600 text-white shadow-lg shadow-danger-500/30 hover:bg-danger-700 hover:-translate-y-0.5 active:translate-y-0 focus:ring-danger-600',
    success: 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary-600',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500'
  }
  classes.push(variantClasses[props.variant])
  
  return classes.join(' ')
})
</script>
