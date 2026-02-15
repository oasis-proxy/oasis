<template>
  <BaseModal
    :visible="visible"
    :title="$t('pdmTitle')"
    titleClass="text-red-600"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-4">
      <div class="d-flex items-start gap-3 text-sm text-slate-600 ">
          <i class="bi bi-exclamation-triangle-fill text-xl text-red-600  shrink-0"></i>
          <div>
              <p class="font-bold mb-1 text-red-600 ">{{ $t('pdmWarningTitle') }}</p>
              <p class="opacity-90 leading-relaxed m-0">
                  {{ $t('pdmMsgDeleteConfirm') }} <span class="font-bold underline text-slate-900 d-inline-block text-truncate align-bottom" style="max-width: 15rem;" :title="proxyName">{{ proxyName }}</span>? 
                  {{ $t('pdmMsgDeleteIrreversible') }}
              </p>
          </div>
      </div>
    </div>

    <template #footer>
      <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors"
      >
        {{ $t('btnCancel') }}
      </button>
      <button 
        @click="emit('delete')"
        class="px-3 py-2 rounded-lg text-xs font-bold ui-button-danger shadow-md shadow-red-500/20 transition-all"
      >
        {{ $t('btnDeleteForever') }}
      </button>
    </template>
  </BaseModal>
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

import BaseModal from './BaseModal.vue'
</script>
