<template>
  <div class="h-full flex flex-col p-8 items-center justify-center">
     <div class="text-center space-y-4">
       <div class="size-16 settings-icon-wrapper rounded-full flex items-center justify-center mx-auto">
         <i class="bi bi-hdd-network text-3xl"></i>
       </div>
       <div>
         <h2 class="text-lg font-bold settings-text-primary">Proxy Host</h2>
         <p class="text-xs settings-text-secondary mt-1">ID: {{ $route.params.id }}</p>
         <p class="text-xs settings-text-secondary max-w-xs mx-auto mt-1">Configuration details for this proxy server.</p>
       </div>
     </div>
   </div>
 </template>
 
 <script setup>
 </script>
