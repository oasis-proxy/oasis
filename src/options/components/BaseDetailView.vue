<template>
  <div class="h-100 d-flex flex-column bg-white position-relative transition-colors">
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-light transition-colors">
      <!-- Header Left -->
      <div class="d-flex align-items-center gap-3">
        <slot name="header-start"></slot>
        <h1 
          v-if="title"
          class="fs-4 font-bold ui-text-primary tracking-tight m-0 text-truncate" 
          style="max-width: 300px;" 
          :title="title"
        >
          {{ title }}
        </h1>
        <slot name="header-end"></slot>
      </div>

      <!-- Header Actions -->
      <div class="d-flex align-items-center gap-3">
        <slot name="actions"></slot>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5">
      <div :class="['mx-auto d-flex flex-column gap-4 pb-5', maxWidthClass]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '3xl' // 3xl, 4xl, 5xl, 6xl, etc. matching Tailwind max-w classes conceptual size
  }
})

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case '3xl': return 'max-w-3xl'
    case '4xl': return 'max-w-4xl'
    case '5xl': return 'max-w-5xl'
    case '6xl': return 'max-w-6xl'
    default: return 'max-w-3xl'
  }
})
</script>
