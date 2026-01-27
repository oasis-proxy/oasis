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
          <h3 class="ui-text-primary text-xl font-semibold leading-tight tracking-tight">Create New Policy</h3>
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
            
            <!-- Name Input -->
            <label class="flex flex-col gap-2 w-full">
              <span class="ui-text-primary text-sm font-medium leading-none">Name</span>
              <div class="relative group w-full">
                <input 
                  v-model="name"
                  ref="nameInput"
                  autofocus 
                  class="w-full rounded-lg border ui-input h-10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                  style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                  placeholder="Enter policy name..." 
                  type="text"
                  @keydown.enter="handleConfirm"
                />
              </div>
              <p class="text-xs ui-text-secondary">This name will be used to identify your policy.</p>
            </label>

            <!-- Type Selector -->
            <div class="modal-type-selector">
              
              <!-- Auto Policy Option -->
              <label 
                class="relative flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="type === 'policy' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
              >
                <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="policy"/>
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <span class="block text-xs font-medium mb-1" :class="type === 'policy' ? 'text-primary' : 'ui-text-primary'">Auto Policy</span>
                    <span class="mt-1 flex items-center text-xs ui-text-secondary">Flexible rule sets</span>
                  </span>
                </span>
                <i v-if="type === 'policy'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
              </label>

              <!-- PAC Script Option -->
              <label 
                class="relative flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="type === 'pac' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
              >
                <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="pac"/>
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <span class="block text-xs font-medium mb-1" :class="type === 'pac' ? 'text-primary' : 'ui-text-primary'">PAC Script</span>
                    <span class="mt-1 flex items-center text-xs ui-text-secondary">Custom JS script</span>
                  </span>
                </span>
                <i v-if="type === 'pac'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
              </label>

            </div>
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
            :disabled="!name.trim()"
            class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const name = ref('')
const type = ref('policy')
const nameInput = ref(null)

onMounted(() => {
    name.value = ''
    type.value = 'policy'
    
    nextTick(() => {
       if (nameInput.value) {
           nameInput.value.focus()
       }
    })
})

const handleConfirm = () => {
    if (!name.value.trim()) return
    emit('create', { name: name.value.trim(), type: type.value })
    emit('close')
}
</script>

<style scoped>
/* Modal Overlay - Fixed, Centered, Blurred */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050; /* Bootstrap modal default */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  /* Initial State (Hidden) */
  background-color: rgba(15, 23, 42, 0);
  backdrop-filter: blur(0);
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
}

/* Active State (Visible) */
.modal-mask.visible {
  background-color: rgba(15, 23, 42, 0.5); /* Slate 900 50% */
  backdrop-filter: blur(4px);
  visibility: visible;
  opacity: 1;
}

/* Modal Container/Card */
.modal-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

/* Modal Header */
/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px; /* 20px vertical, 24px horizontal */
}

/* Modal Body */
.modal-body {
  padding: 0 24px; /* Matches header horizontal padding */
  flex: 1;
}

/* Form Group Spacing */
.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* gap-5 equivalent, reasonable spacing */
}

/* Type Selector Layout */
.modal-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Strictly equal width */
  gap: 0.75rem; /* gap-3 equivalent */
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem; /* gap-3 */
  padding: 16px 24px; /* 16px vertical, 24px horizontal */
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.modal-mask.visible .modal-container {
  transform: scale(1);
}
</style>
