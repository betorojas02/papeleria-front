<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Navbar -->
      <AppNavbar />

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
</script>
