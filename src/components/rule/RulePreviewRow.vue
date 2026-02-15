<template>
  <div class="d-flex align-items-center gap-1 px-2 py-2 hover-bg-subtle transition-colors group border-bottom border-subtle">
    <!-- Type -->
    <div style="width: 30%;">
      <select 
        v-model="rule.ruleType"
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
        style="max-width: 100%;"
      >
        <option value="wildcard">{{ $t('optWildcard') }}</option>
        <option value="regex">{{ $t('optRegex') }}</option>
      </select>
    </div>
    
    <!-- Pattern -->
    <div style="width: 42%;">
      <input 
        v-model="rule.pattern"
        type="text"
        class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
      />
    </div>
    
    <!-- Proxy -->
    <div style="width: 20%;">
      <select 
        v-model="rule.proxyId"
        class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
        style="max-width: none;"
      >
        <option value="direct">{{ $t('directConnect') }}</option>
        <optgroup v-for="group in proxyList" :key="group.label" :label="group.label">
          <option v-for="p in group.options" :key="p.id" :value="p.id">{{ p.label }}</option>
        </optgroup>
      </select>
    </div>
    
    <!-- Action -->
    <div style="width: 8%;" class="d-flex align-items-center justify-content-center">
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
defineProps({
  rule: Object,
  proxyList: Array
})
const emit = defineEmits(['remove'])
</script>
