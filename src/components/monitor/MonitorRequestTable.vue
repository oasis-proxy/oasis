<template>
  <div
    class="flex-1 overflow-auto custom-scrollbar position-relative"
    style="background: var(--ui-bg-card)"
  >
    <!-- Table Header (Sticky) -->
    <div
      class="d-flex align-items-center gap-3 px-4 py-2 border-bottom text-xs font-semibold ui-text-tertiary text-uppercase position-sticky top-0"
      style="background: var(--ui-bg-subtle); min-width: max-content; z-index: 10"
    >
      <div style="width: 80px" class="flex-shrink-0">{{ $t('colTime') }}</div>
      <div style="width: 140px" class="flex-shrink-0 d-flex align-items-center gap-1">
        {{ $t('colDomain') }} <i class="bi bi-clipboard text-muted opacity-50 text-xxs"></i>
      </div>
      <div style="width: 180px" class="flex-shrink-0">{{ $t('colPattern') }}</div>
      <div style="width: 120px" class="flex-shrink-0">{{ $t('colProxyName') }}</div>
      <div style="width: 140px" class="flex-shrink-0 d-flex align-items-center gap-1">
        {{ $t('colIP') }} <i class="bi bi-clipboard text-muted opacity-50 text-xxs"></i>
      </div>
      <div style="width: 70px" class="text-end flex-shrink-0">{{ $t('colDuration') }}</div>
      <div style="width: 60px" class="flex-shrink-0">{{ $t('colMethod') }}</div>
      <div style="width: 60px" class="flex-shrink-0">{{ $t('colStatus') }}</div>
      <div style="width: 300px" class="flex-shrink-0 d-flex align-items-center gap-1">
        {{ $t('colURL') }} <i class="bi bi-clipboard text-muted opacity-50 text-xxs"></i>
      </div>
    </div>

    <!-- Request List -->
    <div v-if="requests.length > 0">
      <MonitorRequestRow
        v-for="request in requests"
        :key="request.id"
        :request="request"
        :ipTags="ipTags"
        @copy="$emit('copy', $event)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="d-flex flex-column align-items-center justify-content-center py-5 ui-text-tertiary"
    >
      <i class="bi bi-inbox fs-1 mb-2"></i>
      <span class="text-sm">{{ $t('msgNoRequests') }}</span>
      <span class="text-xs mt-1">{{ $t('msgNavigateToSeeRequests') }}</span>
    </div>
  </div>
</template>

<script setup>
import MonitorRequestRow from './MonitorRequestRow.vue'

defineProps({
  requests: { type: Array, required: true },
  ipTags: { type: Object, default: () => ({}) }
})

defineEmits(['copy'])
</script>
