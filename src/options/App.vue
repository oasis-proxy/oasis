<template>
  <div class="bg-background-light font-display text-slate-900 h-screen overflow-hidden flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-6xl h-full max-h-[900px] bg-white rounded-2xl shadow-lg flex overflow-hidden border border-slate-200">
      
      <!-- Integrated Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-white">
          <router-view></router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>
