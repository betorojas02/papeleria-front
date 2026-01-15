<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="selectClasses"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-danger-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: String,
  modelValue: [String, Number],
  label: String,
  options: {
    type: Array,
    required: true,
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
})

defineEmits(['update:modelValue'])

const selectClasses = computed(() => {
  const base = 'block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed'
  const state = props.error
    ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
  
  return [base, state].join(' ')
})
</script>
