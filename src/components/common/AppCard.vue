<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div v-if="title" class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 class="text-lg font-bold text-slate-800 tracking-tight">{{ title }}</h3>
    </div>
    
    <div class="p-6">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String
})
</script>
