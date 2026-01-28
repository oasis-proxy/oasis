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
        <div class="d-flex justify-content-between align-items-start p-4">
          <h3 class="ui-text-primary text-xl font-semibold leading-tight tracking-tight m-0">Clone Proxy Host</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 -mt-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-3">
            
            <!-- Source Display -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-base font-medium leading-none">Clone from</span>
              <div class="px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base ui-text-secondary d-flex align-items-center gap-2">
                <i class="bi bi-back"></i>
                <span>{{ currentName }}</span>
              </div>
            </label>

            <!-- New Name Input -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-base font-medium leading-none">New Name</span>
              <div class="relative group w-100">
                <input 
                  v-model="newName"
                  ref="nameInput"
                  autofocus 
                  class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                  style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                  placeholder="Enter name for copy" 
                  type="text"
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
            class="px-4 py-2 rounded-lg text-base font-medium ui-text-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none border-0"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-4 py-2 rounded-lg text-base font-bold text-white bg-primary hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            Clone
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

const emit = defineEmits(['close', 'clone'])

const newName = ref('')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    newName.value = `${props.currentName} Copy`
    nextTick(() => {
       if (nameInput.value) {
           nameInput.value.focus()
           nameInput.value.select()
       }
    })
  }
})

const isValid = computed(() => {
  return newName.value.trim() !== ''
})

const handleConfirm = () => {
    if (!isValid.value) return
    emit('clone', newName.value.trim())
    emit('close')
}
</script>
