<template>
  <div class="bg-background-light dark:bg-background-dark font-display ui-text-primary vh-100 overflow-hidden d-flex align-items-center justify-content-center p-4 sm:p-8 transition-colors">
    <div class="w-100 max-w-6xl h-100 max-h-[900px] ui-card rounded-2xl shadow-lg d-flex overflow-hidden border transition-colors">
      
      <!-- Integrated Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 d-flex flex-column min-w-0 bg-white dark:bg-background-dark transition-colors">
          <router-view></router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Sidebar from './components/AppSidebar.vue'
import { loadConfig } from '../common/storage'

const theme = ref('auto')

const applyTheme = (mode) => {
    const html = document.documentElement
    
    if (mode === 'dark') {
        html.classList.add('dark')
    } else if (mode === 'light') {
        html.classList.remove('dark')
    } else {
        // Auto
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark')
        } else {
            html.classList.remove('dark')
        }
    }
}

// Watch for system changes if mode is auto
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (theme.value === 'auto') {
        if (e.matches) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }
})

// Listen for storage changes to update theme reactively
// (Since config is loaded in multiple places, we need to listen to changes)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.config) {
        const newTheme = changes.config.newValue?.ui?.theme
        if (newTheme && newTheme !== theme.value) {
            theme.value = newTheme
            applyTheme(newTheme)
        }
    }
})

onMounted(async () => {
    const config = await loadConfig()
    theme.value = config.ui?.theme || 'auto'
    applyTheme(theme.value)
})
</script>
