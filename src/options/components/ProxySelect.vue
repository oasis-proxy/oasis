<template>
  <select
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="form-select w-100"
    :class="[customClass, sizeClass]"
    :disabled="disabled"
    :style="customStyle"
  >
    <option v-if="includeDirect" value="direct">{{ $t('directConnect') || 'Direct' }}</option>
    <option v-if="includeReject" value="reject">{{ $t('lblReject') || 'Reject' }}</option>
    
    <optgroup v-for="group in groupedOptions" :key="group.label" :label="group.label">
      <option v-for="option in group.options" :key="option.id" :value="option.id">
        {{ option.label }}
      </option>
    </optgroup>
  </select>
</template>

<script setup>
import { computed, inject } from 'vue'

const { t } = inject('i18n')

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  proxies: {
    type: Object,
    default: () => ({})
  },
  proxyGroups: {
    type: Object,
    default: () => ({})
  },
  includeDirect: {
    type: Boolean,
    default: true
  },
  includeReject: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  },
  customStyle: {
    type: [String, Object],
    default: ''
  },
  size: {
    type: String,
    default: 'md', // 'sm' (28px) or 'md' (32px)
    validator: (value) => ['sm', 'md'].includes(value)
  }
})

defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  return props.size === 'sm' ? 'ui-input-sm' : 'ui-input h-8 text-xs'
})

const groupedOptions = computed(() => {
  const groups = []

  // Proxies
  if (props.proxies) {
    const proxyList = Object.values(props.proxies)
      .map(p => ({ id: p.id, label: p.label || p.name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    if (proxyList.length > 0) {
      groups.push({ label: t('lblProxyHosts') || 'Proxies', options: proxyList })
    }
  }

  // Proxy Groups
  if (props.proxyGroups) {
    const groupList = Object.values(props.proxyGroups)
      .map(g => ({ id: g.id, label: g.name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    if (groupList.length > 0) {
      groups.push({ label: t('lblProxyGroups') || 'Proxy Groups', options: groupList })
    }
  }

  return groups
})
</script>
