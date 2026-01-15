<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto min-w-[320px] max-w-md rounded-xl shadow-xl border-l-4 p-4 flex items-start gap-3 transition-all',
          toastStyles[toast.type].bg,
          toastStyles[toast.type].border
        ]"
      >
        <!-- Icon -->
        <div :class="['shrink-0', toastStyles[toast.type].icon]">
          <component :is="toastIcons[toast.type]" class="w-6 h-6" />
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p :class="['text-sm font-medium', toastStyles[toast.type].text]">
            {{ toast.message }}
          </p>
        </div>
        
        <!-- Close Button -->
        <button
          @click="removeToast(toast.id)"
          :class="['shrink-0 hover:opacity-70 transition-opacity', toastStyles[toast.type].icon]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const { toasts, removeToast } = useToast()

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon
}

const toastStyles = {
  success: {
    bg: 'bg-primary-50',
    border: 'border-primary-500',
    icon: 'text-primary-600',
    text: 'text-primary-900'
  },
  error: {
    bg: 'bg-danger-50',
    border: 'border-danger-500',
    icon: 'text-danger-600',
    text: 'text-danger-900'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-500',
    icon: 'text-warning-600',
    text: 'text-warning-900'
  },
  info: {
    bg: 'bg-slate-50',
    border: 'border-slate-400',
    icon: 'text-slate-600',
    text: 'text-slate-900'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
