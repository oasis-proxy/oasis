<template>
  <div class="h-full flex flex-col p-8 items-center justify-center">
     <div class="text-center space-y-4">
       <div class="size-16 ui-icon-wrapper rounded-full flex items-center justify-center mx-auto">
         <i class="bi bi-shield-check text-3xl"></i>
       </div>
       <div>
         <h2 class="text-lg font-bold ui-text-primary">Policy Rule</h2>
         <p class="text-sm ui-text-secondary mt-1">ID: {{ $route.params.id }}</p>
         <p class="text-sm ui-text-secondary max-w-xs mx-auto mt-1">Rule definition and patterns.</p>
       </div>
     </div>
   </div>
 </template>
 
 <script setup>
 </script>
