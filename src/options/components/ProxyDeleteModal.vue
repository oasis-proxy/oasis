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
          <h3 class="text-xl font-semibold leading-tight tracking-tight text-red-600 dark:text-red-400">Delete Proxy Host</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 -mt-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <div class="flex flex-col gap-4">
            <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm">
                <div class="flex items-start gap-3">
                    <i class="bi bi-exclamation-triangle-fill text-xl shrink-0"></i>
                    <div>
                        <p class="font-bold mb-1">Warning: Destructive Action</p>
                        <p class="opacity-90 leading-relaxed">
                            Are you sure you want to delete <span class="font-bold underline">{{ proxyName }}</span>? 
                            This action cannot be undone and will permanently remove this proxy configuration.
                        </p>
                    </div>
                </div>
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
            @click="emit('delete')"
            class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 border-0"
          >
            Delete Forever
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  proxyName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'delete'])
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
