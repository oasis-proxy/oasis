<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('pmmTitle')" 
    maxWidth="520px"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
        <!-- Source Policy Dropdown -->
        <label class="d-flex flex-column gap-2 w-100">
            <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('pmmLabelSource') }}</span>
            <select 
            v-model="sourcePolicy"
            class="form-select ui-input w-100 rounded-lg border h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            style="min-width: 100%; width: 100%; max-width: 100% !important;"
            >
            <option value="" disabled>{{ $t('pmmSelectSource') }}</option>
            <option v-for="policyOption in availablePolicies" :key="policyOption.id" :value="policyOption.id">
                {{ policyOption.name }}
            </option>
            </select>
            <p class="text-xs text-slate-500 m-0">{{ $t('pmmDescSource') }}</p>
        </label>

        <!-- Import Options Checkboxes (Horizontal) -->
        <div class="d-flex flex-column gap-2">
            <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('pmmLabelImport') }}</span>
            <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
            <label class="d-flex align-items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="importNormalRules" class="form-check-input m-0" />
                <span class="text-xs ui-text-primary">{{ $t('pmmOptionNormal') }}</span>
            </label>
            <label class="d-flex align-items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="importRejectRules" class="form-check-input m-0" />
                <span class="text-xs ui-text-primary">{{ $t('pmmOptionReject') }}</span>
            </label>
            </div>
            <p class="text-xs text-slate-500 m-0">{{ $t('pmmDescImport') }}</p>
        </div>

        <!-- Conflict Resolution (Card-based Radio) -->
        <div class="d-flex flex-column gap-2">
            <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('pmmLabelConflict') }}</span>
            <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
            
            <!-- Ignore Option -->
            <label 
                class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="conflictMode === 'ignore' ? 'border-primary bg-blue-50/50' : 'ui-card hover:border-default'"
            >
                <input v-model="conflictMode" v-show="false" class="sr-only" name="conflict-mode" type="radio" value="ignore"/>
                <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                    <span class="block text-xs font-medium mb-1" :class="conflictMode === 'ignore' ? 'text-primary' : 'ui-text-primary'">{{ $t('pmmOptionIgnore') }}</span>
                    <span class="mt-1 d-flex align-items-center text-xs text-slate-500">{{ $t('pmmDescIgnore') }}</span>
                </span>
                </span>
                <i v-if="conflictMode === 'ignore'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
            </label>

            <!-- Overwrite Option -->
            <label 
                class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                :class="conflictMode === 'overwrite' ? 'border-primary bg-blue-50/50' : 'ui-card hover:border-default'"
            >
                <input v-model="conflictMode" v-show="false" class="sr-only" name="conflict-mode" type="radio" value="overwrite"/>
                <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                    <span class="block text-xs font-medium mb-1" :class="conflictMode === 'overwrite' ? 'text-primary' : 'ui-text-primary'">{{ $t('pmmOptionOverwrite') }}</span>
                    <span class="mt-1 d-flex align-items-center text-xs text-slate-500">{{ $t('pmmDescOverwrite') }}</span>
                </span>
                </span>
                <i v-if="conflictMode === 'overwrite'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
            </label>

            </div>
            <p class="text-xs text-slate-500 m-0">{{ $t('pmmDescConflict') }}</p>
        </div>
    </div>

    <template #footer>
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
        {{ $t('btnMerge') }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'

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
