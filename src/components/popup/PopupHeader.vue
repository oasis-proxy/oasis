<template>
  <header class="popup-header">
    <div class="header-tabs">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'proxy' }"
        @click="$emit('update:currentTab', 'proxy')"
      >
        {{ $t('lblProxy') }}
      </button>
      <button
        v-if="showMonitorTab"
        class="tab-btn"
        :class="{ active: currentTab === 'monitor' }"
        @click="$emit('update:currentTab', 'monitor')"
      >
        {{ $t('monitor') }}
      </button>
      <button
        v-if="showQuickTab"
        class="tab-btn"
        :class="{ active: currentTab === 'quick' }"
        @click="$emit('update:currentTab', 'quick')"
      >
        {{ $t('quick') }}
      </button>
    </div>

    <div class="header-actions">
      <button
        @click="$emit('openSidePanel')"
        class="ui-button-icon"
        :title="$t('popTooltipDownloads')"
      >
        <i class="bi bi-layout-sidebar-reverse ui-icon-md"></i>
      </button>
      <button
        v-if="showMonitorTab"
        @click="$emit('openMonitor')"
        class="ui-button-icon"
        :title="$t('popTooltipMonitor')"
      >
        <i class="bi bi-activity ui-icon-md"></i>
      </button>
      <button @click="$emit('openOptions')" class="ui-button-icon" :title="$t('popTooltipOptions')">
        <i class="bi bi-gear-wide-connected ui-icon-md"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentTab: String,
  showMonitorTab: Boolean,
  showQuickTab: Boolean
})
defineEmits(['update:currentTab', 'openSidePanel', 'openMonitor', 'openOptions'])
</script>
