<template>
  <div class="monitor-container d-flex flex-column h-100 text-xs">
    <p class="quick-title">{{ $t('popTitleQuickAdd') }}</p>

    <div
      v-if="failedDomains.length === 0"
      class="flex-1 d-flex align-items-center justify-content-center text-secondary"
    >
      <div class="text-center p-4">
        <i class="bi bi-check-circle text-3xl mb-2 d-block opacity-50 text-success"></i>
        <p class="text-xs">{{ $t('popMsgNoFailedRequests') }}</p>
        <p class="text-xs text-muted">{{ $t('popMsgPageWorking') }}</p>
      </div>
    </div>

    <div v-else class="flex-1 d-flex flex-column min-h-0">
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="pb-2">
          <label v-for="domain in failedDomains" :key="domain" class="quick-item">
            <input
              type="checkbox"
              :checked="modelValue.includes(domain)"
              @change="toggleDomain(domain)"
              class="form-check-input align-self-start"
            />
            <span class="text-truncate text-xs">{{ domain }}</span>
          </label>
        </div>
      </div>

      <!-- Options Section -->
      <div class="d-flex gap-3 pb-2 px-2">
        <div class="flex-1 d-flex flex-column gap-1">
          <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">{{
            $t('lblProxies')
          }}</label>
          <select
            :value="proxyId"
            @change="$emit('update:proxyId', $event.target.value)"
            class="form-select ui-input ui-input-sm w-100 text-xs cursor-pointer"
          >
            <option value="direct">{{ $t('directConnect') }}</option>
            <optgroup v-for="group in proxyOptions" :key="group.label" :label="group.label">
              <option v-for="proxy in group.options" :key="proxy.id" :value="proxy.id">
                {{ proxy.label }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="flex-1 d-flex flex-column gap-1">
          <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">{{
            $t('addTo')
          }}</label>
          <select
            :value="destination"
            @change="$emit('update:destination', $event.target.value)"
            class="form-select ui-input ui-input-sm w-100 text-xs cursor-pointer"
          >
            <option value="policy">{{ $t('currentPolicy') }}</option>
            <option value="temporary">{{ $t('temporarySession') }}</option>
          </select>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="quick-section justify-content-end gap-2 pb-3">
        <button
          @click="$emit('cancel')"
          class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all"
        >
          {{ $t('btnCancel') }}
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="modelValue.length === 0"
          class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-primary-lg transition-colors border-0"
        >
          {{ $t('btnConfirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  failedDomains: Array,
  modelValue: Array, // selectedDomains
  proxyId: String,
  destination: String,
  proxyOptions: Array
})
const emit = defineEmits([
  'update:modelValue',
  'update:proxyId',
  'update:destination',
  'cancel',
  'confirm'
])

const toggleDomain = (domain) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(domain)
  if (index === -1) newValue.push(domain)
  else newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}
</script>
