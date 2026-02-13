<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <div 
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      :class="visible ? 'visible opacity-100' : 'invisible opacity-0'"
      style="z-index: 1050; transition: all 0.3s ease; background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);"
      @click.self="emit('close')"
    >
      <!-- Modal Card -->
      <div 
        class="ui-card w-100 d-flex flex-column overflow-hidden rounded-xl shadow-lg"
        style="max-width: 480px; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <h3 class="ui-text-primary modal-header tracking-tight m-0">{{ $t('bpmTitle') }}</h3>
          <button 
            @click="emit('close')" 
            class="modal-close-button"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
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
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
          >
            {{ $t('btnCancel') }}
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('btnReplace') }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProxySelect from './ProxySelect.vue'

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
