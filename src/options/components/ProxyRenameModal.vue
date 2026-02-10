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
        style="max-width: 480px; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <h3 class="ui-text-primary modal-header tracking-tight m-0">{{ title }}</h3>
          <button 
            @click="emit('close')" 
            class="modal-close-button"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-3">
            
            <!-- Original Name (Readonly) -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-xs font-medium leading-none">Original Name</span>
              <div class="px-3 py-2 rounded-lg bg-subtle  border border-subtle  text-xs text-slate-500">
                {{ currentName }}
              </div>
            </label>

            <!-- New Name Input -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-xs font-medium leading-none">New Name</span>
              <div class="relative group w-100">
                <input 
                  v-model="newName"
                  ref="nameInput"
                  autofocus 
                  class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                  style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                  placeholder="e.g. My Fast Proxy" 
                  type="text"
                  maxlength="30"
                  @keydown.enter="handleConfirm"
                />
              </div>
            </label>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  currentName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Rename Proxy'
  }
})

const emit = defineEmits(['close', 'save'])

const newName = ref('')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    newName.value = props.currentName
    nextTick(() => {
       if (nameInput.value) {
           nameInput.value.focus()
           nameInput.value.select()
       }
    })
  }
})

const isValid = computed(() => {
  return newName.value.trim() !== '' && newName.value.trim() !== props.currentName
})

const handleConfirm = () => {
    if (!isValid.value) return
    emit('save', newName.value.trim())
    emit('close')
}
</script>
