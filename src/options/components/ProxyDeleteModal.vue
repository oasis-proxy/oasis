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
          <h3 class="text-xl font-semibold leading-tight tracking-tight text-red-600 dark:text-red-400 m-0">Delete Proxy Host</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 -mt-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-4">
            <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-base">
                <div class="d-flex items-start gap-3">
                    <i class="bi bi-exclamation-triangle-fill text-xl shrink-0"></i>
                    <div>
                        <p class="font-bold mb-1">Warning: Destructive Action</p>
                        <p class="opacity-90 leading-relaxed m-0">
                            Are you sure you want to delete <span class="font-bold underline">{{ proxyName }}</span>? 
                            This action cannot be undone and will permanently remove this proxy configuration.
                        </p>
                    </div>
                </div>
            </div>
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
            @click="emit('delete')"
            class="px-4 py-2 rounded-lg text-base font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 border-0"
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
