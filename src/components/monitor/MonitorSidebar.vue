<template>
  <aside class="d-flex flex-column border-end" style="width: 320px; background: var(--ui-bg-card)">
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- All Requests Option -->
      <div
        class="tab-item px-3 py-2"
        :class="{ active: selectedTabId === null }"
        @click="$emit('select', null)"
      >
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="font-mono text-xs ui-text-tertiary">{{ $t('lblAllTabs') }}</span>
          <span class="ui-tag ui-tag-default">{{ totalRequestCount }}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-globe text-primary"></i>
          <span class="text-sm font-medium ui-text-primary">{{ $t('lblAllRequests') }}</span>
        </div>
      </div>

      <!-- Individual Tabs -->
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item px-3 py-2 border-top"
        :class="{ active: selectedTabId === tab.id }"
        @click="$emit('select', tab.id)"
      >
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="font-mono text-xs ui-text-tertiary">{{ formatTime(tab.lastActivity) }}</span>
          <span class="ui-tag ui-tag-default">{{ getRequestCountForTab(tab.id) }}</span>
        </div>
        <div class="d-flex align-items-start gap-2">
          <img
            v-if="tab.favIconUrl"
            :src="tab.favIconUrl"
            class="mt-1"
            style="width: 16px; height: 16px"
          />
          <i v-else class="bi bi-file-earmark ui-text-tertiary mt-1"></i>
          <div class="flex-1 min-w-0" style="max-width: calc(100% - 24px)">
            <p class="text-sm font-medium ui-text-primary text-truncate m-0">
              {{ tab.title || $t('lblUntitled') }}
            </p>
            <p class="text-xs ui-text-secondary text-truncate m-0">{{ getHostname(tab.url) }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  selectedTabId: { type: [Number, String], default: null },
  totalRequestCount: { type: Number, required: true },
  getRequestCountForTab: { type: Function, required: true },
  getHostname: { type: Function, required: true }
})

defineEmits(['select'])

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
}
</script>
