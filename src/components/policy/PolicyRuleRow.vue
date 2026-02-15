<template>
  <div 
    :class="[
      'd-flex align-items-center gap-1 p-2 transition-colors',
      dragOver ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover-bg-subtle',
      !rule.valid ? 'opacity-50' : ''
    ]"
    @dragover.prevent="$emit('dragover', $event)"
    @drop="$emit('drop', $event)"
    @dragenter.prevent
  >
    <div style="width: 4%;" class="d-flex justify-content-center">
      <i 
        class="bi bi-grip-vertical ui-text-tertiary transition-colors" 
        style="font-size: 12px; cursor: grab;"
        draggable="true"
        @dragstart="$emit('dragstart', $event)" 
        @dragend="$emit('dragend')"
      ></i>
    </div>
    
    <div style="width: 8%;" class="d-flex justify-content-center">
      <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
        <input 
          class="form-check-input align-self-start" 
          style="cursor: pointer;"
          type="checkbox" 
          :checked="rule.valid"
          @change="update('valid', $event.target.checked)"
        >
      </div>
    </div>

    <div style="width: 16%;">
      <select 
        :value="rule.ruleType" 
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
        @change="update('ruleType', $event.target.value); $emit('type-change', rule)"
      >
        <option value="wildcard">{{ $t('optWildcard') }}</option>
        <option value="regex">{{ $t('optRegex') }}</option>
        <option value="ip">{{ $t('optIP') }}</option>
        <option value="ruleset">{{ $t('optRuleSet') }}</option>
      </select>
    </div>

    <div style="width: 44%;">
      <div v-if="rule.ruleType === 'ruleset'" class="position-relative w-100">
        <input 
          :value="rule.pattern" 
          @input="update('pattern', $event.target.value)"
          type="text" 
          placeholder="https://example.com/rules.txt" 
          class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 font-monospace"
          :style="`padding-left: 8px; padding-right: 28px;${isDuplicate ? ' border-color: var(--bs-primary) !important;' : (hasError ? ' border-color: var(--ui-danger) !important;' : '')}`"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
        />
        <button 
          @click="$emit('open-ruleset')"
          :disabled="isFetching"
          class="position-absolute bg-transparent border-0 p-0 ui-text-secondary hover:text-primary transition-colors"
          :class="{ 'cursor-not-allowed': isFetching }"
          style="right: 6px; top: 50%; transform: translateY(-50%);"
        >
          <i v-if="isFetching" class="bi bi-arrow-repeat" style="display: inline-block; animation: ruleset-spin 1s linear infinite;"></i>
          <i v-else class="bi bi-eye"></i>
        </button>
      </div>
      <input 
        v-else
        :value="rule.pattern" 
        @input="update('pattern', $event.target.value)"
        type="text" 
        :placeholder="getPlaceholder(rule.ruleType)" 
        class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
        :style="`${isDuplicate ? ' border-color: var(--bs-primary) !important;' : (hasError ? ' border-color: var(--ui-danger) !important;' : '')}`"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
    </div>

    <div style="width: 20%;">
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

    <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
      <button @click="$emit('add-below')" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
        <i class="bi bi-plus-lg ui-icon-sm"></i>
      </button>
      <button @click="$emit('add-divider-below')" class="ui-button-icon p-0.5" :title="$t('btnAddDividerBelow')">
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
    'dragstart', 'dragover', 'drop', 'dragend', 
    'type-change', 'open-ruleset', 'focus', 'blur',
    'add-below', 'add-divider-below', 'delete'
])

const update = (key, val) => {
    emit('update:rule', { ...props.rule, [key]: val })
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
    from { transform: translateY(-50%) rotate(0deg); }
    to { transform: translateY(-50%) rotate(360deg); }
}
</style>
