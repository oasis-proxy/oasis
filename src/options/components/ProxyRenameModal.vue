<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <div 
      class="modal-mask"
      :class="{ 'visible': visible }"
      @click.self="emit('close')"
    >
      <!-- Modal Card -->
      <div class="modal-container ui-card">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <h3 class="ui-text-primary text-xl font-semibold leading-tight tracking-tight">Rename Proxy</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 -mt-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <div class="modal-form-group">
            
            <!-- Original Name (Readonly) -->
            <label class="flex flex-col gap-2 w-full">
              <span class="ui-text-primary text-sm font-medium leading-none">Original Name</span>
              <div class="px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm ui-text-secondary">
                {{ currentName }}
              </div>
            </label>

            <!-- New Name Input -->
            <label class="flex flex-col gap-2 w-full">
              <span class="ui-text-primary text-sm font-medium leading-none">New Name</span>
              <div class="relative group w-full">
                <input 
                  v-model="newName"
                  ref="nameInput"
                  autofocus 
                  class="w-full rounded-lg border ui-input h-10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                  style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                  placeholder="Enter new name" 
                  type="text"
                  @keydown.enter="handleConfirm"
                />
              </div>
            </label>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            @click="emit('close')"
            class="px-4 py-2 rounded-lg text-sm font-medium ui-text-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none border-0"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed border-0"
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

<style scoped>
/* Copied from ProxyCreationModal.vue for consistency */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050; 
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(15, 23, 42, 0);
  backdrop-filter: blur(0);
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
}

.modal-mask.visible {
  background-color: rgba(15, 23, 42, 0.5); 
  backdrop-filter: blur(4px);
  visibility: visible;
  opacity: 1;
}

.modal-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.75rem; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px; 
}

.modal-body {
  padding: 0 24px; 
  flex: 1;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; 
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem; 
  padding: 16px 24px; 
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.modal-mask.visible .modal-container {
  transform: scale(1);
}
</style>
