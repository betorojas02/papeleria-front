<template>
  <div class="space-y-1.5">
    <label 
      v-if="label" 
      :for="id" 
      class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
    >
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>
    
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20': error }"
    />
    
    <p v-if="error" class="text-xs text-danger-600 font-medium ml-1 flex items-center gap-1">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="text-xs text-slate-500 ml-1">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  modelValue: [String, Number],
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
  hint: String
})

defineEmits(['update:modelValue'])
</script>
