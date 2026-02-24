<template>
  <div
    class="flex-1 ui-card rounded-xl border shadow-sm position-relative overflow-hidden d-flex flex-column"
  >
    <div
      class="ui-card-header px-4 py-3 border-bottom d-flex align-items-center justify-content-between"
      style="padding-left: 1.5rem !important"
    >
      <h3 class="m-0">{{ title }}</h3>
    </div>

    <div
      class="d-flex flex-column gap-3 position-relative px-4 py-4 flex-grow-1"
      style="z-index: 10"
    >
      <!-- Details -->
      <div v-if="data" class="d-flex flex-column gap-3">
        <div class="d-flex justify-content-between align-items-center">
          <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0">
            {{ $t('lblLastModified') }}
          </p>
          <p class="text-xs font-monospace ui-text-primary m-0 text-end">
            {{ formatDate(data.updatedAt || data.timestamp) }}
          </p>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0">
            {{ $t('lblConfigVer') }}
          </p>
          <p class="text-xs font-monospace ui-text-primary m-0 text-end">
            {{ data.version ? `v${data.version}` : 'v1' }}
          </p>
        </div>

        <div v-if="softwareVersion" class="d-flex justify-content-between align-items-center">
          <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0">
            {{ $t('lblSoftwareVer') }}
          </p>
          <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ softwareVersion }}</p>
        </div>

        <!-- Counts and Tags -->
        <div class="d-flex flex-column gap-2">
          <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0">
            {{ $t('lblProxyHosts') }} ({{ proxyCount }})
          </p>
          <div class="d-flex flex-wrap gap-2">
            <span v-for="p in proxies" :key="p.id" class="ui-tag ui-tag-default">{{
              truncate(p.label || p.name || p.id, 20)
            }}</span>
          </div>
        </div>

        <div class="d-flex flex-column gap-2">
          <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0">
            {{ $t('lblPolicies') }} ({{ policyCount }})
          </p>
          <div class="d-flex flex-wrap gap-2">
            <span v-for="p in policies" :key="p.id" class="ui-tag ui-tag-primary">{{
              truncate(p.name || p.id, 20)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="d-flex flex-column align-items-center justify-content-center py-4 ui-text-tertiary flex-grow-1"
      >
        <i class="bi bi-cloud-slash fs-2 mb-2"></i>
        <span class="text-xs">{{ $t('msgNoCloudData') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  data: Object,
  softwareVersion: String
})

const proxyCount = computed(() => Object.keys(props.data?.proxies || {}).length)
const policyCount = computed(() => Object.keys(props.data?.policies || {}).length)
const proxies = computed(() => Object.values(props.data?.proxies || {}))
const policies = computed(() => Object.values(props.data?.policies || {}))

function formatDate(ts) {
  if (!ts) return 'Unknown'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function truncate(text, len) {
  return text?.length > len ? text.substring(0, len) + '...' : text
}
</script>
