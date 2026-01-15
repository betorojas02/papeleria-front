<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Title -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
          <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Papelería
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Inicia sesión en tu cuenta
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="rounded-lg bg-danger-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-danger-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-danger-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <AppInput
            id="email"
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="tu@email.com"
            required
          />

          <AppInput
            id="password"
            v-model="form.password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Recordarme
            </label>
          </div>
        </div>

        <AppButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="loading"
        >
          Iniciar Sesión
        </AppButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  loading.value = false

  if (result.success) {
    router.push({ name: 'dashboard' })
  } else {
    errorMessage.value = result.message
  }
}
</script>
