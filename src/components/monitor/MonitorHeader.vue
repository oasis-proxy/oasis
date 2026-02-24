<template>
  <header
    class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
    style="background: var(--ui-bg-card)"
  >
    <div class="d-flex align-items-center gap-3">
      <img
        :src="isDark ? darkIconUrl : lightIconUrl"
        alt="Oasis"
        style="width: 32px; height: 32px"
      />
      <img :src="isDark ? darkBrandUrl : lightBrandUrl" alt="Oasis Proxy" style="height: 32px" />
    </div>

    <div class="d-flex align-items-center gap-3">
      <!-- History Limit -->
      <div class="d-flex align-items-center gap-2">
        <span class="text-xs font-medium ui-text-tertiary">{{ $t('lblHistory') }}</span>
        <select
          :value="historyLimit"
          @change="$emit('update:historyLimit', parseInt($event.target.value))"
          class="form-select form-select-sm ui-input"
          style="width: 80px"
        >
          <option :value="1000">1000</option>
          <option :value="2000">2000</option>
          <option :value="5000">5000</option>
        </select>
      </div>

      <!-- Filter Input -->
      <div class="position-relative flex-1" style="max-width: 320px; width: 320px">
        <i
          class="bi bi-search position-absolute ui-text-tertiary"
          style="left: 12px; top: 50%; transform: translateY(-50%)"
        ></i>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          class="form-control form-control-sm ps-5 ui-input w-100"
          style="max-width: none"
          :placeholder="$t('phSearchRequests')"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isDark: Boolean,
  darkIconUrl: String,
  lightIconUrl: String,
  darkBrandUrl: String,
  lightBrandUrl: String,
  historyLimit: Number,
  searchQuery: String
})

defineEmits(['update:historyLimit', 'update:searchQuery'])
</script>
