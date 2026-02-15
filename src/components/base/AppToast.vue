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
            class="ui-button-icon"
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


