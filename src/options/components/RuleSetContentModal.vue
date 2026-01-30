<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <div 
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      :class="visible ? 'visible opacity-100' : 'invisible opacity-0'"
      style="z-index: 1050; transition: all 0.3s ease; background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);"
      @click.self="emit('close')"
    >
      <!-- Modal Card -->
      <div 
        class="ui-card w-100 d-flex flex-column overflow-hidden rounded-xl shadow-lg"
        style="max-width: 720px; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <div class="flex-1">
            <h3 class="ui-text-primary ui-modal-title tracking-tight m-0">RuleSet Content</h3>
            <div v-if="url" class="mt-2 d-flex flex-column gap-1">
              <p class="text-xs ui-text-secondary m-0">
                <i class="bi bi-link-45deg"></i> {{ url }}
              </p>
              <p v-if="lastUpdated" class="text-xs ui-text-secondary m-0">
                <i class="bi bi-clock"></i> Last Updated: {{ formattedTime }}
              </p>
            </div>
          </div>
          <button 
            @click="emit('close')" 
            class="-mr-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 pb-4 flex-1">
          <div class="d-flex flex-column gap-3">
            
            <!-- Content Display -->
            <div class="d-flex flex-column gap-2 w-100">
              <div class="d-flex justify-content-between align-items-center">
                <span class="ui-text-primary text-xs font-medium leading-none">Downloaded Content</span>
                <button 
                  v-if="url"
                  @click="handleUpdate"
                  :disabled="updating"
                  class="px-2 py-1 rounded-lg text-xs font-medium ui-button-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none d-flex align-items-center gap-1"
                  :class="{ 'opacity-50 cursor-not-allowed': updating }"
                >
                  <i class="bi bi-arrow-clockwise" :class="{ 'animate-spin': updating }"></i>
                  {{ updating ? 'Updating...' : 'Manual Update' }}
                </button>
              </div>
              <textarea 
                :value="content"
                readonly
                class="w-100 rounded-lg border ui-input px-3 py-2 text-[10px] font-mono focus:outline-none custom-scrollbar bg-slate-50 dark:bg-white/5 ui-text-secondary"
                style="min-height: 400px; max-height: 500px; resize: vertical;"
                placeholder="No content available"
              ></textarea>
            </div>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close', 'update'])

const visible = ref(props.show)
const updating = ref(false)

const formattedTime = computed(() => {
  if (!props.lastUpdated) return 'Never'
  const date = new Date(props.lastUpdated)
  return date.toLocaleString()
})

const handleUpdate = async () => {
  updating.value = true
  try {
    await emit('update')
  } finally {
    // Reset after a delay to allow the update to complete
    setTimeout(() => {
      updating.value = false
    }, 500)
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    visible.value = true
    updating.value = false
  } else {
    await nextTick()
    setTimeout(() => {
      visible.value = false
    }, 300)
  }
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
