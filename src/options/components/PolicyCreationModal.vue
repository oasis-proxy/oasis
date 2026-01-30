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
          <h3 class="ui-text-primary ui-modal-title tracking-tight m-0">Create New Policy</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-3">
            
            <!-- Name Input -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-xs font-medium leading-none">Name</span>
              <div class="relative group w-100">
                <input 
                  v-model="name"
                  ref="nameInput"
                  autofocus 
                  class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                  style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                  placeholder="Enter policy name..." 
                  type="text"
                  @keydown.enter="handleConfirm"
                />
              </div>
              <p class="text-xs ui-text-secondary m-0">This name will be used to identify your policy.</p>
            </label>

            <!-- Type Selector -->
            <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
              
              <!-- Auto Policy Option -->
              <label 
                class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="type === 'policy' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
              >
                <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="policy"/>
                <span class="d-flex flex-1">
                  <span class="d-flex flex-column">
                    <span class="block text-xs font-medium mb-1" :class="type === 'policy' ? 'text-primary' : 'ui-text-primary'">Auto Policy</span>
                    <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">Flexible rule sets</span>
                  </span>
                </span>
                <i v-if="type === 'policy'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
              </label>

              <!-- PAC Script Option -->
              <label 
                class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="type === 'pac' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
              >
                <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="pac"/>
                <span class="d-flex flex-1">
                  <span class="d-flex flex-column">
                    <span class="block text-xs font-medium mb-1" :class="type === 'pac' ? 'text-primary' : 'ui-text-primary'">PAC Script</span>
                    <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">Custom JS script</span>
                  </span>
                </span>
                <i v-if="type === 'pac'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
              </label>

            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!name.trim()"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const name = ref('')
const type = ref('policy')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    name.value = ''
    type.value = 'policy'
    nextTick(() => {
      if (nameInput.value) {
        nameInput.value.focus()
      }
    })
  }
})

const isValid = computed(() => {
  return name.value.trim() !== ''
})

const handleConfirm = () => {
    if (!isValid.value) return
    emit('create', { name: name.value.trim(), type: type.value })
    emit('close')
}
</script>
