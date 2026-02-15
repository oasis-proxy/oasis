<template>
  <BaseModal
    :visible="visible"
    :title="$t('bpmTitle')"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
      
      <!-- From Proxy Dropdown -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('bpmLabelFrom') }}</span>
        <ProxySelect
          v-model="fromProxy"
          :proxies="proxies"
          :proxyGroups="proxyGroups"
          :includeDirect="true"
          class="w-100 h-10 px-3 py-2 text-xs transition-all shadow-sm"
        />
        <p class="text-xs text-slate-500 m-0">{{ $t('bpmDescFrom') }}</p>
      </label>

      <!-- To Proxy Dropdown -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('bpmLabelTo') }}</span>
        <ProxySelect
          v-model="toProxy"
          :proxies="proxies"
          :proxyGroups="proxyGroups"
          :includeDirect="true"
          class="w-100 h-10 px-3 py-2 text-xs transition-all shadow-sm"
        />
        <p class="text-xs text-slate-500 m-0">{{ $t('bpmDescTo') }}</p>
      </label>

    </div>

    <template #footer>
      <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors"
      >
        {{ $t('btnCancel') }}
      </button>
      <button 
        @click="handleConfirm"
        :disabled="!isValid"
        class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('btnReplace') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProxySelect from './ProxySelect.vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  visible: Boolean,
  proxies: {
    type: Object,
    default: () => ({})
  },
  proxyGroups: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'replace'])

const fromProxy = ref('direct')
const toProxy = ref('direct')

const isValid = computed(() => {
  return fromProxy.value && toProxy.value && fromProxy.value !== toProxy.value
})

const handleConfirm = () => {
  if (isValid.value) {
    emit('replace', fromProxy.value, toProxy.value)
    fromProxy.value = 'direct'
    toProxy.value = 'direct'
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    fromProxy.value = 'direct'
    toProxy.value = 'direct'
  }
})
</script>
