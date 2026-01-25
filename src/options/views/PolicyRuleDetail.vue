<template>
  <div class="h-full flex flex-col p-8 items-center justify-center bg-slate-50">
     <div class="text-center space-y-4">
       <div class="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
         <i class="bi bi-shield-check text-3xl"></i>
       </div>
       <div>
         <h2 class="text-lg font-bold text-slate-900">Policy Rule</h2>
         <p class="text-xs text-slate-500 mt-1">ID: {{ $route.params.id }}</p>
         <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1">Rule definition and patterns.</p>
       </div>
     </div>
   </div>
 </template>
 
 <script setup>
 </script>
