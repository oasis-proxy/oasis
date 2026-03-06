<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('lblUpdateAllRules')" 
    titleClass="d-flex align-items-center gap-2"
    @close="$emit('close')" 
    maxWidth="800px"
  >
    <div class="d-flex flex-column gap-3">
      <div v-if="details.length === 0" class="py-5 text-center ui-text-secondary text-sm">
        {{ $t('msgNoUpdatesFound') }}
      </div>
      <div v-else class="ui-card flex-1 border shadow-sm p-0 overflow-hidden d-flex flex-column font-mono text-xs bg-ui-base">
        <!-- Header -->
        <div class="d-flex align-items-center gap-3 px-4 py-2 border-bottom ui-bg-subtle fw-semibold ui-text-secondary">
          <div style="width: 60px" class="flex-shrink-0">{{ $t('lblStatus') }}</div>
          <div style="width: 70px" class="flex-shrink-0">{{ $t('lblType') }}</div>
          <div style="width: 140px" class="flex-shrink-0">{{ $t('lblPolicy') }}</div>
          <div class="flex-1 text-truncate">{{ $t('lblTarget') }}</div>
          <div style="width: 200px" class="flex-shrink-0">{{ $t('lblMessage') }}</div>
        </div>
        <!-- Body -->
        <div class="overflow-y-auto custom-scrollbar bg-ui-base" style="max-height: 60vh">
          <div 
            v-for="(item, idx) in details" 
            :key="idx"
            :class="['d-flex align-items-center gap-3 px-4 py-2 transition-colors hover-bg-subtle', idx !== details.length - 1 ? 'border-bottom border-subtle' : '']"
          >
            <!-- Status -->
            <div style="width: 60px" class="flex-shrink-0">
              <span v-if="item.status === 'pending'" class="ui-tag ui-tag-default">
                <i class="bi me-1 bi-arrow-repeat spin"></i>
                {{ $t('lblUpdating') || 'Updating' }}
              </span>
              <span v-else class="ui-tag" :class="item.success ? 'ui-tag-success' : 'ui-tag-danger'">
                <i class="bi me-1" :class="item.success ? 'bi-check-lg' : 'bi-x-lg'"></i>
                {{ item.success ? $t('lblOK') : $t('lblERR') }}
              </span>
            </div>
            
            <!-- Type -->
            <div style="width: 70px" class="flex-shrink-0">
              <span class="ui-tag ui-tag-default text-uppercase">
                {{ item.type === 'system' ? $t('lblSystemError') : item.type }}
              </span>
            </div>
            
            <!-- Policy -->
            <div style="width: 140px" class="flex-shrink-0 text-truncate ui-text-primary" :title="item.policyName || '-'">
              <template v-if="item.policyName">
                <i class="bi bi-diagram-3 me-1 ui-text-tertiary"></i>
                {{ item.policyName }}
              </template>
              <span v-else class="ui-text-tertiary">-</span>
            </div>
            
            <!-- URL/Name -->
            <div class="flex-1 text-truncate ui-text-primary" :title="item.url || item.name">
              {{ item.url || item.name }}
            </div>
            
            <!-- Message -->
            <div 
              style="width: 200px" 
              class="flex-shrink-0 text-truncate" 
              :class="item.status === 'pending' ? 'ui-text-tertiary fst-italic' : (item.success ? 'ui-text-secondary' : 'text-danger fw-medium')"
              :title="['msgUpdateSuccess', 'msgNoChanges', 'msgPending'].includes(item.message) ? $t(item.message) : item.message"
            >
              {{ ['msgUpdateSuccess', 'msgNoChanges', 'msgPending'].includes(item.message) ? $t(item.message) : item.message }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button 
        type="button"
        @click="$emit('close')" 
        class="btn ui-button-secondary h-8 px-4 text-xs fw-medium rounded-lg d-flex align-items-center"
      >
        {{ $t('btnConfirm') || 'OK' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script setup>
import { computed } from 'vue'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  details: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close'])
</script>
