<template>
  <BaseModal
    :visible="visible"
    :title="$t('pdmTitle')"
    titleClass="text-danger"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-4">
      <div class="d-flex items-start gap-3 text-sm ui-text-secondary">
        <i class="bi bi-exclamation-triangle-fill text-xl text-danger shrink-0"></i>
        <div>
          <p class="fw-bold mb-1 text-danger">{{ $t('pdmWarningTitle') }}</p>
          <p class="opacity-90 leading-relaxed m-0">
            {{ $t('pdmMsgDeleteConfirm') }}
            <span
              class="fw-bold underline ui-text-primary d-inline-block text-truncate align-bottom"
              style="max-width: 15rem"
              :title="proxyName"
              >{{ proxyName }}</span
            >?
            {{ $t('pdmMsgDeleteIrreversible') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-subtle transition-colors"
      >
        {{ $t('btnCancel') }}
      </button>
      <button
        @click="emit('delete')"
        class="px-3 py-2 rounded-lg text-xs fw-bold ui-button-danger shadow-sm transition-all"
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

import BaseModal from '../base/BaseModal.vue'
</script>
