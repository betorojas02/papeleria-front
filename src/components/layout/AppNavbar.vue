<template>
  <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20 shadow-sm/50">
    <!-- Left: Page Title & Toggle -->
    <div class="flex items-center gap-4">
      <button
        @click="uiStore.toggleSidebar"
        class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>
      
      <div>
        <h2 class="text-xl font-bold text-slate-800">{{ pageTitle }}</h2>
        <p class="text-xs text-slate-500">{{ pageSubtitle }}</p>
      </div>
    </div>

    <!-- Right: Actions & User -->
    <div class="flex items-center gap-6">
      <!-- Date Display -->
      <div class="text-right hidden sm:block">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha</p>
        <p class="text-sm font-bold text-slate-700 capitalize">{{ currentDate }}</p>
      </div>

      <!-- Notifications -->
      <button class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
        <BellIcon class="w-6 h-6" />
        <span class="absolute top-2 right-2.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white badge-pulse"></span>
      </button>

      <!-- User Menu -->
      <Menu as="div" class="relative">
        <MenuButton class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-slate-800">
              {{ authStore.user?.name || 'Usuario' }}
            </p>
            <p class="text-xs text-slate-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 border-2 border-white shadow-sm">
            {{ authStore.user?.name?.charAt(0) || 'U' }}
          </div>
        </MenuButton>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 focus:outline-none overflow-hidden border border-slate-200">
            <div class="p-2">
              <MenuItem v-slot="{ active }">
                <button
                  @click="handleLogout"
                  :class="[
                    'flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl transition-all font-medium',
                    active ? 'bg-danger-50 text-danger-700' : 'text-slate-700'
                  ]"
                >
                  <ArrowRightOnRectangleIcon class="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  Bars3Icon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/products': 'Productos',
    '/products/create': 'Nuevo Producto',
    '/categories': 'Categorías',
    '/brands': 'Marcas',
    '/customers': 'Clientes',
    '/pos': 'Punto de Venta',
    '/cash-register': 'Caja Registradora',
    '/sales': 'Historial de Ventas',
  }
  return titles[route.path] || 'Papelería'
})

const pageSubtitle = computed(() => {
  const subtitles = {
    '/': 'Resumen y estadísticas',
    '/products': 'Gestión de inventario',
    '/pos': 'Sistema de ventas',
    '/cash-register': 'Control de caja',
    '/sales': 'Registro de transacciones',
  }
  return subtitles[route.path] || ''
})

const currentDate = computed(() => {
  const now = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return now.toLocaleDateString('es-ES', options)
})

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    await authStore.logout()
    router.push({ name: 'login' })
  }
}
</script>
