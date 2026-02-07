<template>
  <div class="bg-background-light text-slate-900 vh-100 overflow-hidden d-flex align-items-center justify-content-center p-4 transition-colors">
    <div class="w-100 max-w-6xl h-100 max-h-[900px] ui-card rounded-2xl shadow-lg d-flex overflow-hidden border transition-colors">
      
      <!-- Integrated Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 d-flex flex-column bg-white transition-colors" style="min-width: 0;">
          <router-view></router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Sidebar from './components/AppSidebar.vue'
import { loadConfig } from '../common/storage'

onMounted(async () => {
    // Just load config for other needs if any, but no theme application
    await loadConfig()
    // Force remove dark class in case it was persisted
    document.documentElement.classList.remove('dark')
})
</script>
