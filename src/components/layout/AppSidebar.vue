<template>
  <aside
    :class="[
      'bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 z-40',
      uiStore.sidebarOpen ? 'w-72' : 'w-20'
    ]"
  >
    <!-- Logo Header -->
    <div class="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
      <div class="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div v-if="uiStore.sidebarOpen" class="ml-3">
        <span class="font-black text-lg tracking-tight text-slate-800 block leading-none">Papelería</span>
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sistema POS</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto scroller">
      <div v-for="(group, idx) in menuGroups" :key="idx" class="mb-6">
        <p v-if="uiStore.sidebarOpen" class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          {{ group.title }}
        </p>
        <RouterLink
          v-for="item in group.items"
          :key="item.name"
          :to="item.to"
          v-slot="{ isActive }"
          custom
        >
          <a
            :href="item.to"
            @click.prevent="$router.push(item.to)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative',
              uiStore.sidebarOpen ? 'justify-start' : 'justify-center',
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <component 
              :is="item.icon" 
              class="w-5 h-5 shrink-0" 
              :class="isActive ? 'text-primary-400' : ''"
            />
            <span v-if="uiStore.sidebarOpen" class="font-medium text-sm">{{ item.name }}</span>
          </a>
        </RouterLink>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
      <div class="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
        <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm border-2 border-white shadow-sm">
          {{ authStore.user?.name?.charAt(0) || 'U' }}
        </div>
        <div v-if="uiStore.sidebarOpen" class="overflow-hidden flex-1">
          <p class="text-sm font-bold truncate text-slate-800">{{ authStore.user?.name || 'Usuario' }}</p>
          <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{{ authStore.user?.role || 'User' }}</p>
        </div>
        <button 
          v-if="uiStore.sidebarOpen"
          @click="handleLogout" 
          class="text-slate-400 hover:text-danger-500 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  TruckIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()

const menuGroups = computed(() => {
  const groups = [
    {
      title: 'Principal',
      items: [
        { name: 'Dashboard', to: '/', icon: HomeIcon },
      ]
    },
    {
      title: 'Inventario',
      items: [
        { name: 'Productos', to: '/products', icon: ShoppingBagIcon },
        { name: 'Categorías', to: '/categories', icon: Squares2X2Icon },
        { name: 'Marcas', to: '/brands', icon: TagIcon },
        { name: 'Proveedores', to: '/suppliers', icon: TruckIcon },
        { name: 'Compras', to: '/purchases', icon: ClipboardDocumentCheckIcon },
      ]
    },
    {
      title: 'Ventas',
      items: []
    },
    {
      title: 'Administración',
      items: [
        { name: 'Clientes', to: '/customers', icon: UsersIcon },
      ]
    }
  ]

  // Add POS items for cashiers and admins
  if (authStore.isCashier || authStore.isAdmin) {
    groups[2].items.push(
      { name: 'Punto de Venta', to: '/pos', icon: ShoppingCartIcon },
      { name: 'Caja', to: '/cash-register', icon: CurrencyDollarIcon }
    )
  }

  groups[2].items.push({ name: 'Historial', to: '/sales', icon: ChartBarIcon })

  return groups.filter(g => g.items.length > 0)
})

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
