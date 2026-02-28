<template>
  <div
    :class="[
      'd-flex align-items-start gap-1 p-2 transition-colors',
      dragOver ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover-bg-subtle',
      !rule.valid ? 'opacity-50' : ''
    ]"
    @dragover.prevent="$emit('dragover', $event)"
    @drop="$emit('drop', $event)"
    @dragenter.prevent
  >
    <div style="width: 4%" class="d-flex justify-content-center pt-1">
      <i
        class="bi bi-grip-vertical ui-text-tertiary transition-colors"
        style="font-size: 12px; cursor: grab"
        draggable="true"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
      ></i>
    </div>

    <div style="width: 8%" class="d-flex justify-content-center pt-1">
      <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
        <input
          class="form-check-input align-self-start"
          style="cursor: pointer"
          type="checkbox"
          :checked="rule.valid"
          @change="update('valid', $event.target.checked)"
        />
      </div>
    </div>

    <div style="width: 16%" class="pt-1">
      <select
        :value="rule.ruleType"
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5"
        @change="handleRuleTypeChange"
      >
        <option value="wildcard">{{ $t('optWildcard') }}</option>
        <option value="regex">{{ $t('optRegex') }}</option>
        <option value="ip">{{ $t('optIP') }}</option>
        <option value="ruleset">{{ $t('optRuleSet') }}</option>
      </select>
    </div>

    <div style="width: 44%" class="pt-1">
      <div v-if="rule.ruleType === 'ruleset'" class="w-100 d-flex flex-column pb-0.5">
        <div class="position-relative w-100">
          <input
            :value="rule.pattern"
            @input="update('pattern', $event.target.value)"
            type="text"
            placeholder="https://example.com/rules.txt"
            class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
            :style="`${isDuplicate ? ' border-color: var(--bs-primary) !important;' : hasError ? ' border-color: var(--ui-danger) !important;' : ''} padding-right: 50px;`"
            @focus="$emit('focus')"
            @blur="$emit('blur')"
          />
          <div v-if="!rule.ruleSet?.content && !isFetching && !rule.ruleSet?.fetchError" class="position-absolute h-100 d-flex align-items-center pe-none" style="right: 8px; top: 0;">
            <span class="badge bg-secondary-subtle ui-text-secondary border text-xxs fw-normal px-1 py-0.5" style="font-size: 9px">{{ $t('lblEmpty') || 'Empty' }}</span>
          </div>
        </div>
        <div class="w-100 d-flex align-items-center justify-content-between px-1 mt-1" style="font-size: 10px; line-height: 1;">
          <div class="ui-text-secondary w-75 text-truncate" :title="rule.ruleSet?.fetchError || ''">
            <span v-if="rule.ruleSet?.lastUpdated">
              {{ $t('lblLastUpdated') }} {{ new Date(rule.ruleSet.lastUpdated).toLocaleString() }}
            </span>
            <span v-else-if="rule.ruleSet?.fetchError" class="text-danger">
              {{ rule.ruleSet.fetchError }}
            </span>
          </div>
          <div class="d-flex align-items-center justify-content-end gap-2 w-25">
            <button
              @click="$emit('update-ruleset')"
              :disabled="isFetching || !rule.pattern"
              class="bg-transparent border-0 p-0 ui-text-secondary hover:text-primary transition-colors d-flex align-items-center gap-1"
              :class="{ 'cursor-not-allowed': isFetching || !rule.pattern }"
              style="font-size: 10px;"
            >
              <i
                class="bi bi-arrow-clockwise"
                :style="isFetching ? 'display: inline-block; animation: ruleset-spin 1s linear infinite' : ''"
              ></i>
              <span>{{ $t('lblUpdate') }}</span>
            </button>
            <button
              @click="$emit('open-ruleset')"
              class="bg-transparent border-0 p-0 ui-text-secondary hover:text-primary transition-colors d-flex align-items-center gap-1"
              style="font-size: 10px;"
            >
              <i class="bi bi-eye"></i>
              <span>{{ $t('lblView') }}</span>
            </button>
          </div>
        </div>
      </div>
      <input
        v-else
        :value="rule.pattern"
        @input="update('pattern', $event.target.value)"
        type="text"
        :placeholder="getPlaceholder(rule.ruleType)"
        class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
        :style="`${isDuplicate ? ' border-color: var(--bs-primary) !important;' : hasError ? ' border-color: var(--ui-danger) !important;' : ''}`"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
    </div>

    <div style="width: 20%" class="pt-1">
      <ProxySelect
        v-if="proxies"
        :modelValue="rule.proxyId"
        @update:modelValue="update('proxyId', $event)"
        :proxies="proxies"
        :proxyGroups="proxyGroups"
        size="sm"
        class="w-100 py-0 px-1.5"
      />
      <slot v-else name="proxy-select"></slot>
    </div>

    <div style="width: 8%" class="d-flex align-items-center justify-content-around pt-1">
      <button @click="$emit('add-below')" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
        <i class="bi bi-plus-lg ui-icon-sm"></i>
      </button>
      <button
        @click="$emit('add-divider-below')"
        class="ui-button-icon p-0.5"
        :title="$t('btnAddDividerBelow')"
      >
        <i class="bi bi-inboxes-fill ui-icon-sm"></i>
      </button>
      <button @click="$emit('delete')" class="ui-button-icon p-0.5" :title="$t('btnDelete')">
        <i class="bi bi-trash ui-icon-sm"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import ProxySelect from '../proxy/ProxySelect.vue'

const props = defineProps({
  rule: Object,
  dragOver: Boolean,
  isDuplicate: Boolean,
  hasError: Boolean,
  isFetching: Boolean,
  proxies: Object,
  proxyGroups: Object
})

const emit = defineEmits([
  'update:rule',
  'dragstart',
  'dragover',
  'drop',
  'dragend',
  'type-change',
  'open-ruleset',
  'update-ruleset',
  'focus',
  'blur',
  'add-below',
  'add-divider-below',
  'delete'
])

const update = (key, val) => {
  emit('update:rule', { ...props.rule, [key]: val })
}

const handleRuleTypeChange = (event) => {
  const newType = event.target.value
  const updatedRule = { ...props.rule, ruleType: newType }
  emit('update:rule', updatedRule)
  emit('type-change', updatedRule)
}

const getPlaceholder = (type) => {
  if (type === 'wildcard') return '*.example.com'
  if (type === 'regex') return '^https://.*\\.example\\.com'
  if (type === 'ip') return '192.168.1.0/24'
  return ''
}
</script>

<style scoped>
@keyframes ruleset-spin {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
