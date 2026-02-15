<template>
  <router-link :to="to" custom v-slot="{ navigate, isActive }">
    <button 
      @click="navigate"
      class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-all group"
      :class="isActive ? 'nav-item-active shadow-sm text-primary fw-medium' : 'nav-item-inactive'"
    >
      <i :class="['bi text-base', icon]" :style="iconStyle(isActive)"></i>
      <span class="text-xs text-truncate">{{ label }}</span>
      <span v-if="status" :class="['ms-auto rounded-circle', statusColor]" style="width: 8px; height: 8px;"></span>
      <i v-if="external" class="bi bi-box-arrow-up-right text-xs ms-auto opacity-50"></i>
    </button>
  </router-link>
</template>

<script setup>
const props = defineProps({
  to: { type: String, required: true },
  icon: { type: String, required: true },
  label: { type: String, required: true },
  color: { type: String, default: '' },
  status: { type: String, default: null },
  statusColor: { type: String, default: '' },
  external: { type: Boolean, default: false }
})

const iconStyle = (isActive) => {
  if (isActive || props.color) {
    return { color: props.color || 'var(--bs-primary)' }
  }
  return { color: 'var(--ui-text-tertiary)' }
}
</script>
