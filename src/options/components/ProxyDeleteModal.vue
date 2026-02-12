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
          <h3 class="modal-header tracking-tight text-red-600  m-0">{{ $t('pdmTitle') }}</h3>
          <button 
            @click="emit('close')" 
            class="modal-close-button"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-4">
            <div class="d-flex items-start gap-3 text-sm text-slate-600 ">
                <i class="bi bi-exclamation-triangle-fill text-xl text-red-600  shrink-0"></i>
                <div>
                    <p class="font-bold mb-1 text-red-600 ">{{ $t('pdmWarningTitle') }}</p>
                    <p class="opacity-90 leading-relaxed m-0">
                        {{ $t('pdmMsgDeleteConfirm') }} <span class="font-bold underline text-slate-900 ">{{ proxyName }}</span>? 
                        {{ $t('pdmMsgDeleteIrreversible') }}
                    </p>
                </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
          >
            {{ $t('btnCancel') }}
          </button>
          <button 
            @click="emit('delete')"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-danger shadow-md shadow-red-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            {{ $t('btnDeleteForever') }}
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
