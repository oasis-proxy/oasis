<template>
  <BaseModal :visible="visible" :title="$t('appmTitle')" maxWidth="640px" @close="emit('close')">
    <!-- Description -->
    <p class="text-xs ui-text-secondary mb-3">{{ $t('appmDesc') }}</p>

    <!-- Filters -->
    <div class="d-flex align-items-center gap-2 mb-3">
      <!-- Proxy Filter -->
      <select
        v-if="!hideProxyFilter"
        v-model="filterProxy"
        class="form-select ui-input rounded border py-0 px-1.5 text-xs"
        style="max-width: 140px"
      >
        <option value="">{{ $t('appmFilterAll') }} {{ $t('appmFilterProxy') }}</option>
        <option value="direct">Direct</option>
        <option v-for="opt in proxyOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
      </select>

      <!-- Type Filter -->
      <select
        v-model="filterType"
        class="form-select ui-input rounded border py-0 px-1.5 text-xs"
        style="max-width: 120px"
      >
        <option value="">{{ $t('appmFilterAll') }} {{ $t('appmFilterType') }}</option>
        <option value="wildcard">{{ $t('optWildcard') }}</option>
        <option value="regex">{{ $t('optRegex') }}</option>
      </select>
    </div>

    <!-- Rules Display -->
    <div
      class="d-flex flex-column flex-1 overflow-hidden rounded-lg border shadow-sm"
      style="min-height: 360px"
    >
      <div class="ui-card-header d-flex justify-content-between align-items-center">
        <span>{{ filteredRules.length }} / {{ allRules.length }} {{ $t('appmCountSuffix') }}</span>
        <button
          @click="copyToClipboard"
          class="d-flex align-items-center gap-1 ui-button-icon"
          :title="$t('appmBtnCopy')"
        >
          <i
            :class="copied ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"
            class="ui-icon-sm"
          ></i>
          <!-- <span class="text-xs">{{ copied ? $t('appmCopied') : $t('appmBtnCopy') }}</span> -->
        </button>
      </div>
      <textarea
        :value="displayText"
        readonly
        class="w-100 ui-input px-3 py-2 text-xs font-monospace custom-scrollbar ui-text-secondary"
        style="resize: none; flex: 1; min-height: 0; border: none; border-radius: 0 0 0.5rem 0.5rem"
        :placeholder="$t('rscmMsgNoContent')"
      ></textarea>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-subtle transition-colors"
      >
        {{ $t('btnClose') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import { convertInternalToAutoProxy } from '../../common/autoproxy'

const props = defineProps({
  visible: Boolean,
  rules: {
    type: Array,
    default: () => []
  },
  proxies: {
    type: Object,
    default: () => ({})
  },
  proxyGroups: {
    type: Object,
    default: () => ({})
  },
  hideProxyFilter: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const filterProxy = ref('')
const filterType = ref('')
const copied = ref(false)

const allRules = computed(() => {
  return convertInternalToAutoProxy(props.rules, {
    proxies: props.proxies,
    proxyGroups: props.proxyGroups
  })
})

const filteredRules = computed(() => {
  return allRules.value.filter((r) => {
    if (filterProxy.value && r.proxyId !== filterProxy.value) return false
    if (filterType.value && r.ruleType !== filterType.value) return false
    return true
  })
})

const displayText = computed(() => {
  return filteredRules.value.map((r) => r.line).join('\n')
})

const proxyOptions = computed(() => {
  const opts = []
  if (props.proxies) {
    for (const p of Object.values(props.proxies)) {
      opts.push({ id: p.id, label: p.label || p.name })
    }
  }
  if (props.proxyGroups) {
    for (const g of Object.values(props.proxyGroups)) {
      opts.push({ id: g.id, label: g.name })
    }
  }
  return opts.sort((a, b) => a.label.localeCompare(b.label))
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(displayText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = displayText.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// Reset filters when modal opens
watch(
  () => props.visible,
  (val) => {
    if (val) {
      filterProxy.value = ''
      filterType.value = ''
      copied.value = false
    }
  }
)
</script>
