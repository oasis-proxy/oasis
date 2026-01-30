<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="visible" 
        class="toast-container"
        :class="`toast-${type}`"
      >
        <div class="toast-content">
          <i :class="iconClass" class="toast-icon"></i>
          <span class="toast-message">{{ message }}</span>
          <button 
            v-if="showClose"
            @click="close" 
            class="toast-close"
            aria-label="Close"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  showClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timer = null

const iconClass = computed(() => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill'
  }
  return icons[props.type]
})

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

onMounted(() => {
  visible.value = true
  startTimer()
})

watch(() => props.message, () => {
  if (timer) {
    clearTimeout(timer)
  }
  startTimer()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  min-width: 320px;
  max-width: 480px;
  pointer-events: auto;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--ui-card-bg);
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--ui-text-primary);
  line-height: 1.5;
}

.toast-close {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--ui-text-secondary);
  transition: color 0.2s ease;
  flex-shrink: 0;
  font-size: 12px;
}

.toast-close:hover {
  color: var(--ui-text-primary);
}

/* Type-specific styles */
.toast-success .toast-icon {
  color: #10b981;
}

.toast-success .toast-content {
  border-left: 3px solid #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-error .toast-content {
  border-left: 3px solid #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-warning .toast-content {
  border-left: 3px solid #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-info .toast-content {
  border-left: 3px solid #3b82f6;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

/* Dark mode support */
:root[data-theme="dark"] .toast-content {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
