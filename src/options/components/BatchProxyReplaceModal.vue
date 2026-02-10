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
          <h3 class="ui-text-primary modal-header tracking-tight m-0">Batch Replace Proxy</h3>
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
              <span class="ui-text-primary text-xs font-medium leading-none">Replace From</span>
              <select 
                v-model="fromProxy"
                class="form-select ui-input w-100 rounded-lg border h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;"
              >
                <option value="" disabled>-- Select Source Proxy --</option>
                <option value="direct">DIRECT</option>
                <optgroup v-for="group in proxyOptions" :key="group.label" :label="group.label">
                  <option v-for="proxy in group.options" :key="proxy.id" :value="proxy.id">
                    {{ proxy.label }}
                  </option>
                </optgroup>
              </select>
              <p class="text-xs text-slate-500 m-0">Rules using this proxy will be replaced.</p>
            </label>

            <!-- To Proxy Dropdown -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-xs font-medium leading-none">Replace To</span>
              <select 
                v-model="toProxy"
                class="form-select ui-input w-100 rounded-lg border h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;"
              >
                <option value="" disabled>-- Select Target Proxy --</option>
                <option value="direct">DIRECT</option>
                <optgroup v-for="group in proxyOptions" :key="group.label" :label="group.label">
                  <option v-for="proxy in group.options" :key="proxy.id" :value="proxy.id">
                    {{ proxy.label }}
                  </option>
                </optgroup>
              </select>
              <p class="text-xs text-slate-500 m-0">Rules will be changed to use this proxy.</p>
            </label>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Replace
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  proxyOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'replace'])

const fromProxy = ref('')
const toProxy = ref('')

const isValid = computed(() => {
  return fromProxy.value && toProxy.value && fromProxy.value !== toProxy.value
})

const handleConfirm = () => {
  if (isValid.value) {
    emit('replace', fromProxy.value, toProxy.value)
    fromProxy.value = ''
    toProxy.value = ''
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    fromProxy.value = ''
    toProxy.value = ''
  }
})
</script>
