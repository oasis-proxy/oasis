<template>
  <div
    class="ui-bg-default ui-text-primary vh-100 overflow-hidden d-flex align-items-center justify-content-center p-4 transition-colors"
  >
    <div
      class="w-100 h-100 ui-card rounded-4 shadow-lg d-flex overflow-hidden border transition-colors"
      style="max-width: 72rem; max-height: 900px"
    >
      <!-- Integrated Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 d-flex flex-column ui-bg-card transition-colors" style="min-width: 0">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Sidebar from '../components/layout/AppSidebar.vue'
import { loadConfig } from '../common/storage'

// Theme management
const mediaQuery = ref(null)

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove('dark', 'light')

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    // 'light' is default, explicit class needed for overrides
    root.classList.add('light')
  }
}

const handleSystemThemeChange = () => {
  loadConfig().then((config) => {
    if (config.ui?.theme === 'auto') {
      applyTheme('auto')
    }
  })
}

onMounted(async () => {
  const config = await loadConfig()
  applyTheme(config.ui?.theme || 'light')

  // Listen for system theme changes
  mediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.value.addEventListener('change', handleSystemThemeChange)

  // Listen for config changes from storage
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.config) {
      const newConfig = changes.config.newValue
      if (newConfig?.ui?.theme) {
        applyTheme(newConfig.ui.theme)
      }
    }
  })
})

onUnmounted(() => {
  if (mediaQuery.value) {
    mediaQuery.value.removeEventListener('change', handleSystemThemeChange)
  }
})
</script>
