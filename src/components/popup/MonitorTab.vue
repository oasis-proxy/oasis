<template>
  <div class="monitor-container d-flex flex-column h-100">
    <!-- Protocol Warning -->
    <div
      v-if="!isProtocolSupported"
      class="flex-1 d-flex align-items-center justify-content-center text-secondary"
    >
      <div class="text-center p-4">
        <p class="text-sm">{{ $t('popMsgMonitorUnavailable') }}</p>
        <p class="text-xs text-muted">{{ $t('popMsgMonitorOnlyHttp') }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="monitorResult.length === 0"
      class="flex-1 d-flex align-items-center justify-content-center text-secondary"
    >
      <div class="text-center p-4">
        <i class="bi bi-activity text-3xl mb-2 d-block opacity-50"></i>
        <p class="text-sm">{{ $t('msgNoRequests') }}</p>
        <p class="text-xs text-muted">{{ $t('popMsgRefreshHint') }}</p>
      </div>
    </div>

    <!-- List -->
    <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-0">
      <div
        v-for="(item, index) in monitorResult"
        :key="index"
        class="monitor-item d-flex align-items-center py-3 transition-colors px-3 border-b"
      >
        <div class="monitor-col-domain">
          <div
            class="monitor-domain fw-medium text-truncate text-xs cursor-copy"
            :title="$t('popTooltipCopy', [item.domain])"
            @click="$emit('copy', item.domain)"
          >
            {{ item.domain }}
          </div>
        </div>

        <div class="monitor-col-info">
          <span
            v-if="item.error"
            class="monitor-error text-danger text-truncate text-xs"
            :title="item.error"
          >
            {{ item.error }}
          </span>
          <span
            v-else-if="item.ip"
            class="ui-tag fw-normal font-mono max-w-full text-truncate"
            :title="item.ip"
          >
            {{ formatIp(item.ip) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { normalizeIp } from '../../common/validation'

const props = defineProps({
  isProtocolSupported: Boolean,
  monitorResult: Array,
  ipTags: Object
})

defineEmits(['copy'])

const formatIp = (ip) => {
  if (!ip) return ip
  const cleanIp = normalizeIp(ip)
  if (props.ipTags && (props.ipTags[cleanIp] || props.ipTags[ip])) {
    return props.ipTags[cleanIp] || props.ipTags[ip]
  }
  return ip
}
</script>
