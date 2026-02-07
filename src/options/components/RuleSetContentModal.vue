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
        style="max-width: 720px; height: 600px; max-height: 90vh; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <h3 class="ui-text-primary modal-header tracking-tight m-0">RuleSet Content</h3>
          <button 
            @click="emit('close')" 
            class="modal-close-button"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 pb-4 flex-1 overflow-hidden d-flex flex-column">
          <div class="d-flex flex-column gap-4 h-100">
            
            <!-- URL Row -->
            <div v-if="url">
              <label class="d-flex flex-column gap-2 w-100 mb-0">
                <span class="ui-text-primary text-xs font-medium leading-none">RuleSet URL</span>
                <div class="px-3 py-2 rounded-lg border ui-input text-xs text-slate-500 break-all font-mono" style="min-height: 32px;">
                  {{ url }}
                </div>
              </label>
            </div>

            <!-- Last Updated Row -->
            <div v-if="lastUpdated">
               <label class="d-flex flex-column gap-2 w-100 mb-0">
                <span class="ui-text-primary text-xs font-medium leading-none">Last Updated</span>
                <div class="px-3 py-2 rounded-lg border ui-input text-xs text-slate-500" style="min-height: 32px;">
                  {{ formattedTime }}
                </div>
              </label>
            </div>
            
            <!-- Content Display -->
            <label class="d-flex flex-column gap-2 w-100 mb-0 flex-1 overflow-hidden">
              <div class="d-flex justify-content-between align-items-center">
                <span class="ui-text-primary text-xs font-medium leading-none">Downloaded Content</span>
                <button 
                  v-if="url"
                  @click="handleUpdate"
                  :disabled="updating"
                  class="px-2 py-1.5 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none d-flex align-items-center gap-1 border border-subtle "
                  :class="{ 'opacity-50 cursor-not-allowed': updating }"
                >
                  <i class="bi bi-arrow-clockwise" :class="{ 'animate-spin': updating }"></i>
                  {{ updating ? 'Updating...' : 'Update' }}
                </button>
              </div>
              <textarea 
                :value="content"
                readonly
                class="w-100 h-100 rounded-lg border ui-input px-3 py-2 text-xs font-mono focus:outline-none custom-scrollbar text-slate-500"
                style="resize: none;"
                placeholder="No content available"
              ></textarea>
            </label>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
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


