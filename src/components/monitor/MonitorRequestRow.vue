<template>
  <div
    class="request-row d-flex align-items-center gap-3 px-4 py-2 border-bottom font-mono text-xs"
    style="min-width: max-content"
  >
    <div style="width: 80px" class="ui-text-primary flex-shrink-0">
      {{ formatTime(request.startTime) }}
    </div>
    <div
      style="width: 140px"
      class="text-truncate ui-text-primary flex-shrink-0 cursor-copy"
      :title="request.domain"
      @click="$emit('copy', request.domain)"
    >
      {{ request.domain }}
    </div>
    <div
      style="width: 180px"
      class="text-truncate ui-text-primary d-flex align-items-center flex-shrink-0"
      :title="request.matchedRule || $t('lblDefault')"
    >
      <template v-if="request.ruleSource">
        <i
          class="bi bi-diagram-3 me-2 ui-text-tertiary"
          :title="request.ruleSource"
          style="cursor: pointer"
        ></i>
      </template>
      <span class="text-truncate">{{ request.matchedRule || $t('lblDefault') }}</span>
    </div>
    <div style="width: 120px" class="ui-text-primary flex-shrink-0" :title="request.proxyUsed">
      <span v-if="request.proxyUsed" class="ui-tag ui-tag-default">{{ request.proxyUsed }}</span>
      <span v-else class="ui-text-primary">-</span>
    </div>
    <div
      style="width: 140px"
      class="text-truncate ui-text-primary d-flex align-items-center gap-2 flex-shrink-0 cursor-copy"
      :title="request.ip || '-'"
      @click="$emit('copy', request.ip)"
    >
      <span v-if="request.fromCache" class="ui-text-tertiary" :title="$t('lblFromCache')">
        <i class="bi bi-database-fill-check"></i>
      </span>
      <span>{{ getIpDisplay(request.ip) }}</span>
    </div>
    <div style="width: 70px" class="text-end ui-text-primary flex-shrink-0">
      {{ request.duration ? `${request.duration}ms` : '-' }}
    </div>
    <div style="width: 60px" class="flex-shrink-0">
      <span class="ui-tag ui-tag-default" :class="getMethodClass(request.method)">{{
        request.method
      }}</span>
    </div>
    <div style="width: 60px" class="flex-shrink-0">
      <span
        v-if="request.status"
        class="ui-tag ui-tag-default"
        :class="getStatusClass(request.status)"
      >
        {{ request.status }}
      </span>
      <span v-else class="ui-tag ui-tag-warning">
        <i class="bi bi-arrow-repeat"></i>
      </span>
    </div>
    <div
      class="text-truncate request-url ui-text-primary flex-shrink-0 cursor-copy"
      style="width: 300px"
      :title="request.url"
      @click="$emit('copy', request.url)"
    >
      {{ request.url }}
    </div>
  </div>
</template>

<script setup>
import { normalizeIp } from '../../common/validation'

const props = defineProps({
  request: { type: Object, required: true },
  ipTags: { type: Object, default: () => ({}) }
})

defineEmits(['copy'])

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

function getIpDisplay(ip) {
  if (!ip) return '-'
  const cleanIp = normalizeIp(ip)
  return props.ipTags[cleanIp] || props.ipTags[ip] || ip
}

const getMethodClass = (method) => {
  const classes = {
    GET: 'ui-tag-primary',
    POST: 'ui-tag-success',
    PUT: 'ui-tag-warning',
    DELETE: 'ui-tag-danger',
    PATCH: 'ui-tag-info'
  }
  return classes[method] || ''
}

const getStatusClass = (status) => {
  if (status >= 200 && status < 300) return 'ui-tag-success'
  if (status >= 300 && status < 400) return 'ui-tag-info'
  if (status >= 400) return 'ui-tag-danger'
  return 'ui-tag-warning'
}
</script>
