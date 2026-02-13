<template>
  <BaseDetailView :title="$t('tempTitle')" maxWidth="6xl">
    <template #actions>
        <button 
          @click="loadData"
          class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
        >
          <i class="bi bi-reply-fill"></i>
          <span>{{ $t('btnReset') }}</span>
        </button>

        <button 
          @click="saveChanges"
          :disabled="!isDirty"
          class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
        >
          <i class="bi bi-floppy-fill"></i>
          <span>{{ $t('btnSave') }}</span>
        </button>
    </template>

    <template #default>
        <!-- Rules Section -->
        <section v-if="isTemporaryRulesActive">
          <div class="ui-card-label">
            <span class="label-text">{{ $t('tempTitle') }}</span>
            <div class="d-flex align-items-center gap-2">
              <button @click="addRule" class="ui-button-icon sm" :title="$t('btnAddRule')">
                <i class="bi bi-plus-lg text-sm"></i>
              </button>
               <button @click="openSmartMerge" :disabled="rules.length === 0" class="ui-button-icon sm" :title="$t('tempBtnMerge')">
                <i class="bi bi-diagram-3-fill" style="font-size: 14px;"></i>
              </button>
              <button @click="acceptAll" :disabled="rules.length === 0" class="ui-button-icon sm" :title="$t('tempBtnAcceptAll')">
                <i class="bi bi-check-all" style="font-size: 16px;"></i>
              </button>
              <button @click="clearAll" :disabled="rules.length === 0" class="ui-button-icon sm" :title="$t('tempBtnClearAll')">
                <i class="bi bi-trash ui-icon-sm"></i>
              </button>
            </div>
          </div>


          <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="ui-card-header">
              <div style="width: 8%;" class="text-center">{{ $t('lblValid') }}</div>
              <div style="width: 16%;">{{ $t('lblType') }}</div>
              <div style="width: 48%;">{{ $t('lblPattern') }}</div>
              <div style="width: 20%;">{{ $t('lblProxy') }}</div>
              <div style="width: 8%;" class="text-center">{{ $t('lblAction') }}</div>
            </div>

            <!-- Rules -->
            <div v-if="rules && rules.length > 0">
              <div v-for="(rule, index) in rules" :key="rule.id || index">
                
                <!-- Rule Row -->
                <div 
                  :class="[
                    'd-flex align-items-center gap-1 p-2 transition-colors',
                    'hover:bg-hover',
                    !rule.valid ? 'opacity-50' : ''
                  ]"
                >
                  <div style="width: 8%;" class="d-flex justify-content-center">
                    <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                      <input 
                        class="form-check-input align-self-start" 
                        style="cursor: pointer;"
                        type="checkbox" 
                        v-model="rule.valid"
                      >
                    </div>
                  </div>
                  <div style="width: 16%;">
                    <select 
                      v-model="rule.ruleType" 
                      class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                      style="height: 28px; max-width: none;"
                      @change="validateRule(index, rule)"
                    >
                      <option value="wildcard">{{ $t('optWildcard') }}</option>
                      <option value="regex">{{ $t('optRegex') }}</option>
                      <option value="ip">{{ $t('optIP') }}</option>
                      <option value="ruleset">{{ $t('optRuleSet') }}</option>
                    </select>
                  </div>
                  <div style="width: 48%;">
                     <input 
                      v-model="rule.pattern" 
                      type="text" 
                      :placeholder="getPlaceholder(rule.ruleType)" 
                      class="form-control ui-input ui-input-sm w-100 mw-100 rounded border py-0 px-2 font-mono"
                      :style="`height: 28px;${validationErrors[index] ? ' border-color: var(--ui-danger) !important;' : ''}`"
                      @blur="validateRule(index, rule)"
                    />
                  </div>
                  <div style="width: 20%;">
                    <ProxySelect
                      v-model="rule.proxyId"
                      :proxies="config?.proxies"
                      :proxyGroups="config?.proxyGroups"
                      size="sm"
                      class="w-100 py-0 px-1.5"
                      style="max-width: none;"
                    />
                  </div>
                  <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                    <button @click="acceptRule(index)" class="ui-button-icon text-success hover:text-success" :title="$t('tooltipAcceptMove')">
                      <i class="bi bi-check-lg ui-icon-sm"></i>
                    </button>
                    <button @click="deleteRule(index)" class="ui-button-icon p-0.5" :title="$t('btnDelete')">
                      <i class="bi bi-trash ui-icon-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-2 d-flex flex-column align-items-center justify-content-center text-center">
              <p class="text-sm font-medium ui-text-primary m-0">{{ $t('tempMsgNoRules') }}</p>
              <p class="text-xs ui-text-secondary mt-1 max-w-xs m-0">{{ $t('tempMsgNoRulesDesc') }}</p>
            </div>
          </div>
        </section>



        <section v-else class="text-center py-10">
            <h3 class="text-lg font-semibold ui-text-primary mb-2">{{ $t('tempTitleUnavailable') }}</h3>
            <p class="text-sm ui-text-secondary">
                {{ $t('tempMsgUnavailable') }}
            </p>
        </section>

    <!-- Modals -->
    <AcceptRulesModal
        :visible="showAcceptModal"
        :policies="config?.policies || {}"
        :ruleCount="selectedRulesForMerge.length"
        :forcedTargetId="activeAutoPolicyId"
        @close="showAcceptModal = false"
        @confirm="handleAcceptConfirm"
    />

    <SmartRulesMergeModal 
        :visible="showSmartMergeModal"
        :policies="config?.policies || {}"
        :sourceRules="smartMergeRules"
        :proxies="config?.proxies || {}"
        :proxyGroups="config?.proxyGroups || {}"
        :forcedTargetId="activeAutoPolicyId"
        :domainOptimize="true"
        @close="showSmartMergeModal = false"
        @merge="handleSmartMergeConfirm"
    />
    </template>
  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, savePolicies } from '../../common/storage'
import { validatePattern } from '../../common/validation'
import { toast } from '../utils/toast'
import AcceptRulesModal from '../components/AcceptRulesModal.vue'
import SmartRulesMergeModal from '../components/SmartRulesMergeModal.vue'
import ProxySelect from '../components/ProxySelect.vue'
import BaseDetailView from '../components/BaseDetailView.vue'

const rules = ref([])
const originalRules = ref([])
const config = ref(null)
const validationErrors = ref({})
const showAcceptModal = ref(false)
const showSmartMergeModal = ref(false)
const mergeSourceIndices = ref([]) // Indices of rules being merged (all or single)

// Load Configuration and Temp Rules
const loadData = async () => {
    config.value = await loadConfig()
    
    // Load temp rules from session storage
    // Assuming chrome.storage.session is available. Fallback to [] if not.
    const sessionData = await chrome.storage.session.get('tempRules')
    const loadedRules = sessionData.tempRules || []
    
    // Initialize structure
    rules.value = JSON.parse(JSON.stringify(loadedRules))
    
    // Ensure defaults
    rules.value.forEach(rule => {
        if (rule.valid === undefined) rule.valid = true
        if (!rule.ruleType) rule.ruleType = 'wildcard'
        if (!rule.proxyId) rule.proxyId = 'direct' 
    })

    originalRules.value = JSON.parse(JSON.stringify(rules.value))
    validationErrors.value = {}
    isInitializing.value = false
}



const isDirty = computed(() => {
    return JSON.stringify(rules.value) !== JSON.stringify(originalRules.value)
})

const activeAutoPolicyId = computed(() => {
    if (!config.value || !config.value.activeProfileId) return ''
    const id = config.value.activeProfileId
    // Check if it's a policy
    if (config.value.policies && config.value.policies[id]) {
        return id
    }
    return ''
})

const isTemporaryRulesActive = computed(() => {
    return !!activeAutoPolicyId.value
})

watch(isTemporaryRulesActive, (active) => {
    if (!active && !isInitializing.value) {
       // logic
    }
})

const isInitializing = ref(true)

const validateRule = (index, rule) => {
  const result = validatePattern(rule.ruleType, rule.pattern)
  if (result.valid) {
    delete validationErrors.value[index]
  } else {
    validationErrors.value[index] = result.message
  }
}

// Actions
const saveChanges = async () => {
    // Save to session storage
    await chrome.storage.session.set({ tempRules: JSON.parse(JSON.stringify(rules.value)) })
    originalRules.value = JSON.parse(JSON.stringify(rules.value))
    toast.success(chrome.i18n.getMessage('tempMsgSaved'))
}

const addRule = () => {
    const newRule = {
        id: `temp_${Date.now()}`,
        type: 'rule',
        ruleType: 'wildcard',
        pattern: '',
        valid: true,
        proxyId: 'direct'
    }
    rules.value.unshift(newRule)
}

const deleteRule = (index) => {
    rules.value.splice(index, 1)
}

const clearAll = () => {
    if (confirm(chrome.i18n.getMessage('tempMsgClearConfirm'))) {
        rules.value = []
    }
}

// Logic for Accept/Merge
const selectedRulesForMerge = computed(() => {
   if (mergeSourceIndices.value.length > 0) {
       return mergeSourceIndices.value.map(i => rules.value[i])
   }
   return rules.value // Default to all if none specifically selected (Accept All/Merge Rules)
})

const smartMergeRules = computed(() => {
    return selectedRulesForMerge.value.filter(r => 
        r.ruleType === 'wildcard' && 
        r.pattern && 
        r.pattern.trim() !== ''
    )
})

// "Accept" actions (Original Simple Flow)
const acceptRule = (index) => {
    mergeSourceIndices.value = [index]
    showAcceptModal.value = true
}

const acceptAll = () => {
    mergeSourceIndices.value = [] // Empty implies all
    showAcceptModal.value = true
}

// "Merge Rules" action (Smart Merge Flow)
const openSmartMerge = () => {
    // Merge Rules implies merging ALL rules currently in the table (or maybe selection if we had checkboxes, but we don't)
    // Design says "Merge rules" button in header.
    mergeSourceIndices.value = [] // All
    showSmartMergeModal.value = true
}

const handleAcceptConfirm = async ({ targetId, conflictMode }) => {
    // Use the raw rules, no optimization
    await executeMerge(targetId, conflictMode, JSON.parse(JSON.stringify(selectedRulesForMerge.value)))
}

const handleSmartMergeConfirm = async ({ targetId, conflictMode, rules: optimizedRules }) => {
    // Use optimized rules
    await executeMerge(targetId, conflictMode, optimizedRules)
}

// Shared execution logic
const executeMerge = async (targetId, conflictMode, rulesToMerge) => {
   if (!config.value || !config.value.policies || !config.value.policies[targetId]) {
       toast.error(chrome.i18n.getMessage('msgPolicyNotFound'))
       return
   }

   const targetPolicy = config.value.policies[targetId]
   if (!targetPolicy.rules) targetPolicy.rules = []

   let addedCount = 0
   let updatedCount = 0

   const newRulesToAdd = []

   rulesToMerge.forEach(tempRule => {
       // Check duplicate
       const existingIndex = targetPolicy.rules.findIndex(r => 
           r.type !== 'divider' && 
           r.ruleType === tempRule.ruleType && 
           r.pattern === tempRule.pattern
       )

       if (existingIndex !== -1) {
           if (conflictMode === 'overwrite') {
               const targetRule = targetPolicy.rules[existingIndex]
               targetRule.proxyId = tempRule.proxyId
               targetRule.valid = tempRule.valid
               updatedCount++
           }
       } else {
           const newRule = { ...tempRule, id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }
           newRulesToAdd.push(newRule)
           addedCount++
       }
   })
   
   if (newRulesToAdd.length > 0) {
       targetPolicy.rules.unshift(...newRulesToAdd)
   }

   config.value.policies[targetId] = targetPolicy
   await savePolicies(config.value.policies)

   // Cleanup source rules
   if (mergeSourceIndices.value.length > 0) {
       const indices = [...mergeSourceIndices.value].sort((a, b) => b - a)
       indices.forEach(i => rules.value.splice(i, 1))
   } else {
       rules.value = []
   }

   await saveChanges()
   toast.success(chrome.i18n.getMessage('tempMsgMerged', [addedCount, updatedCount]))
   
   // Close modals
   showAcceptModal.value = false
   showSmartMergeModal.value = false
   mergeSourceIndices.value = []
}


onMounted(() => {
    loadData()
})

// Register unsaved changes checker
onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(chrome.i18n.getMessage('pacMsgUnsaved'))
      return true
    }
    return false
  })
})

onBeforeUnmount(() => {
  unregisterUnsavedChangesChecker()
})

const getPlaceholder = (type) => {
  switch (type) {
    case 'wildcard': return chrome.i18n.getMessage('phWildcard');
    case 'regex': return chrome.i18n.getMessage('phRegex');
    case 'ip': return chrome.i18n.getMessage('phIP');
    case 'ruleset': return chrome.i18n.getMessage('phRuleSet');
    default: return chrome.i18n.getMessage('phDefaultPattern');
  }
};
</script>
