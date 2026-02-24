<template>
  <div
    class="d-flex align-items-center gap-1 px-2 py-2 hover-bg-subtle transition-colors group border-bottom border-subtle"
  >
    <!-- Type -->
    <div style="width: 30%">
      <select
        v-model="localType"
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5"
        style="max-width: 100%"
      >
        <option value="wildcard">{{ $t('optWildcard') }}</option>
        <option value="regex">{{ $t('optRegex') }}</option>
      </select>
    </div>

    <!-- Pattern -->
    <div style="width: 42%">
      <input
        v-model="localPattern"
        type="text"
        class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
      />
    </div>

    <!-- Proxy -->
    <div style="width: 20%">
      <select
        v-model="localProxyId"
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5"
        style="max-width: none"
        :disabled="!!lockedProxy"
      >
        <option value="direct">{{ $t('directConnect') }}</option>
        <option v-if="allowReject || rule.proxyId === 'reject'" value="reject">
          {{ $t('lblReject') }}
        </option>
        <optgroup v-for="group in proxyList" :key="group.label" :label="group.label">
          <option v-for="p in group.options" :key="p.id" :value="p.id">{{ p.label }}</option>
        </optgroup>
      </select>
    </div>

    <!-- Action -->
    <div style="width: 8%" class="d-flex align-items-center justify-content-center">
      <button
        @click="emit('remove')"
        class="ui-button-icon p-1 transition-colors text-danger hover-bg-danger-subtle"
        :title="$t('btnRemove')"
      >
        <i class="bi bi-trash text-xs"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rule: Object,
  proxyList: Array,
  lockedProxy: String,
  allowReject: Boolean
})
const emit = defineEmits(['remove', 'update:rule'])

const localType = computed({
  get: () => props.rule.ruleType,
  set: (val) => emit('update:rule', { ...props.rule, ruleType: val })
})

const localPattern = computed({
  get: () => props.rule.pattern,
  set: (val) => emit('update:rule', { ...props.rule, pattern: val })
})

const localProxyId = computed({
  get: () => props.rule.proxyId,
  set: (val) => emit('update:rule', { ...props.rule, proxyId: val })
})
</script>
