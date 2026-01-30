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
        style="max-width: 520px; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <h3 class="ui-text-primary ui-modal-title tracking-tight m-0">Merge Policy</h3>
          <button 
            @click="emit('close')" 
            class="-mr-2 p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1">
          <div class="d-flex flex-column gap-3">
            
            <!-- Source Policy Dropdown -->
            <label class="d-flex flex-column gap-2 w-100">
              <span class="ui-text-primary text-xs font-medium leading-none">Source Policy</span>
              <select 
                v-model="sourcePolicy"
                class="form-select ui-input w-100 rounded-lg border h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;"
              >
                <option value="">-- Select Policy to Merge From --</option>
                <option v-for="policyOption in availablePolicies" :key="policyOption.id" :value="policyOption.id">
                  {{ policyOption.name }}
                </option>
              </select>
              <p class="text-xs ui-text-secondary m-0">Choose a policy to import rules from.</p>
            </label>

            <!-- Import Options Checkboxes (Horizontal) -->
            <div class="d-flex flex-column gap-2">
              <span class="ui-text-primary text-xs font-medium leading-none">Import Rules</span>
              <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
                <label class="d-flex align-items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="importNormalRules" class="form-check-input m-0" />
                  <span class="text-xs ui-text-primary">Normal Rules</span>
                </label>
                <label class="d-flex align-items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="importRejectRules" class="form-check-input m-0" />
                  <span class="text-xs ui-text-primary">Reject Rules</span>
                </label>
              </div>
              <p class="text-xs ui-text-secondary m-0">Select which rule types to import.</p>
            </div>

            <!-- Conflict Resolution (Card-based Radio) -->
            <div class="d-flex flex-column gap-2">
              <span class="ui-text-primary text-xs font-medium leading-none">Conflict Resolution</span>
              <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
                
                <!-- Ignore Option -->
                <label 
                  class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                  :class="conflictMode === 'ignore' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
                >
                  <input v-model="conflictMode" v-show="false" class="sr-only" name="conflict-mode" type="radio" value="ignore"/>
                  <span class="d-flex flex-1">
                    <span class="d-flex flex-column">
                      <span class="block text-xs font-medium mb-1" :class="conflictMode === 'ignore' ? 'text-primary' : 'ui-text-primary'">Ignore</span>
                      <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">Skip conflicts</span>
                    </span>
                  </span>
                  <i v-if="conflictMode === 'ignore'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
                </label>

                <!-- Overwrite Option -->
                <label 
                  class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                  :class="conflictMode === 'overwrite' ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : 'ui-card hover:border-slate-300 dark:hover:border-slate-600'"
                >
                  <input v-model="conflictMode" v-show="false" class="sr-only" name="conflict-mode" type="radio" value="overwrite"/>
                  <span class="d-flex flex-1">
                    <span class="d-flex flex-column">
                      <span class="block text-xs font-medium mb-1" :class="conflictMode === 'overwrite' ? 'text-primary' : 'ui-text-primary'">Overwrite</span>
                      <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">Replace conflicts</span>
                    </span>
                  </span>
                  <i v-if="conflictMode === 'overwrite'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
                </label>

              </div>
              <p class="text-xs ui-text-secondary m-0">How to handle rules with same type and pattern.</p>
            </div>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <button 
            @click="emit('close')"
            class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            :disabled="!isValid"
            class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Merge
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
  currentPolicyId: String,
  policies: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'merge'])

const sourcePolicy = ref('')
const conflictMode = ref('ignore')
const importNormalRules = ref(true)
const importRejectRules = ref(true)

const availablePolicies = computed(() => {
  return Object.values(props.policies || {})
    .filter(p => p.id !== props.currentPolicyId)
    .map(p => ({ id: p.id, name: p.name || p.id }))
})

const isValid = computed(() => {
  return sourcePolicy.value && (importNormalRules.value || importRejectRules.value)
})

const handleConfirm = () => {
  if (isValid.value) {
    emit('merge', {
      sourceId: sourcePolicy.value,
      conflictMode: conflictMode.value,
      importNormal: importNormalRules.value,
      importReject: importRejectRules.value
    })
    reset()
  }
}

const reset = () => {
  sourcePolicy.value = ''
  conflictMode.value = 'ignore'
  importNormalRules.value = true
  importRejectRules.value = true
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    reset()
  }
})
</script>
