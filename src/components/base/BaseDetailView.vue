<template>
  <div class="h-100 d-flex flex-column ui-bg-card position-relative transition-colors">
    <!-- Header -->
    <header
      class="h-24 px-5 d-flex align-items-center justify-content-between border-light transition-colors"
    >
      <!-- Header Left -->
      <div class="d-flex align-items-center gap-3">
        <slot name="header-start"></slot>
        <h1
          v-if="title"
          class="h4 fw-bold ui-text-primary m-0 text-truncate"
          style="max-width: 300px"
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
      <div class="mx-auto d-flex flex-column gap-4 pb-5" :style="maxWidthStyle">
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

const maxWidthStyle = computed(() => {
  const sizes = {
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem'
  }
  return { maxWidth: sizes[props.maxWidth] || '48rem' }
})
</script>
