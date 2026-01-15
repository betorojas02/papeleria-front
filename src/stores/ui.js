import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const sidebarOpen = ref(true)
    const theme = ref(localStorage.getItem('theme') || 'light')

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value
    }

    function setSidebarOpen(value) {
        sidebarOpen.value = value
    }

    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', theme.value)
    }

    return {
        sidebarOpen,
        theme,
        toggleSidebar,
        setSidebarOpen,
        toggleTheme,
    }
})
