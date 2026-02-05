<template>
  <div class="h-100 d-flex flex-column bg-white dark:bg-background-dark relative transition-colors">
    
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-divider-dark transition-colors">
      <div>
        <div class="d-flex align-items-center gap-3">
          <h2 class="fs-4 font-bold ui-text-primary tracking-tight m-0">
            Temporary Rules
          </h2>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <button 
          @click="loadData"
          class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all"
        >
          Reset
        </button>

        <button 
          @click="saveChanges"
          :disabled="!isDirty"
          class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg shadow-primary/30 transition-colors d-flex align-items-center gap-2"
        >
          <i class="bi bi-check-lg text-lg"></i>
          <span>Save Changes</span>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5 scroll-smooth">
      <div class="max-w-6xl mx-auto d-flex flex-column gap-4 pb-5">
        
        <!-- Rules Section -->
        <section v-if="isTemporaryRulesActive">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="text-sm font-semibold ui-text-primary m-0 uppercase tracking-wide">Temporary Rules</h3>
            <div class="d-flex align-items-center gap-2">
               <button @click="openSmartMerge" :disabled="rules.length === 0" class="ui-button-secondary px-2 py-1 rounded-lg text-xs transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-arrow-up-right-square" style="font-size: 10px;"></i> Merge Rules
              </button>
              <button @click="clearAll" :disabled="rules.length === 0" class="ui-button-secondary px-2 py-1 rounded-lg text-xs transition-colors d-flex align-items-center gap-2 text-red-600 dark:text-red-400">
                <i class="bi bi-trash" style="font-size: 10px;"></i> Clear All
              </button>
              <button @click="acceptAll" :disabled="rules.length === 0" class="ui-button-secondary px-2 py-1 rounded-lg text-xs transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-check-all" style="font-size: 10px;"></i> Accept All
              </button>
              <button @click="addRule" class="ui-button-icon" title="Add Rule">
                <i class="bi bi-plus-lg text-sm"></i>
              </button>
            </div>
          </div>


          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="d-flex gap-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-divider-dark text-xs font-semibold ui-text-secondary uppercase tracking-wider">
              <div style="width: 8%;" class="text-center">Valid</div>
              <div style="width: 16%;">Type</div>
              <div style="width: 48%;">Pattern</div>
              <div style="width: 20%;">Proxy</div>
              <div style="width: 8%;" class="text-center">Action</div>
            </div>

            <!-- Rules -->
            <div v-if="rules && rules.length > 0">
              <div v-for="(rule, index) in rules" :key="rule.id || index">
                
                <!-- Rule Row -->
                <div 
                  :class="[
                    'd-flex align-items-center gap-1 p-2 transition-colors',
                    'hover:bg-slate-50 dark:hover:bg-slate-800',
                    !rule.valid ? 'opacity-50' : ''
                  ]"
                >
                  <div style="width: 8%;" class="d-flex justify-content-center">
                    <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                      <input 
                        class="form-check-input cursor-pointer" 
                        type="checkbox" 
                        v-model="rule.valid"
                        style="width: 28px; height: 16px;"
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
                      <option value="wildcard">Wildcard</option>
                      <option value="regex">Regex</option>
                      <option value="ip">IP/CIDR</option>
                      <option value="ruleset">Rule Set</option>
                    </select>
                  </div>
                  <div style="width: 48%;">
                     <input 
                      v-model="rule.pattern" 
                      type="text" 
                      placeholder="Pattern..." 
                      class="form-control ui-input w-100 mw-100 rounded text-xs py-0 px-2 font-mono"
                      :style="`height: 28px;${validationErrors[index] ? ' border-color: #dc3545 !important;' : ''}`"
                      @blur="validateRule(index, rule)"
                    />
                  </div>
                  <div style="width: 20%;">
                    <select 
                      v-model="rule.proxyId" 
                      class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                      style="height: 28px; max-width: none;"
                    >
                      <option value="direct">Direct</option>
                      <option v-for="proxy in proxyOptions" :key="proxy.id" :value="proxy.id">
                        {{ proxy.label }}
                      </option>
                    </select>
                  </div>
                  <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                    <button @click="acceptRule(index)" class="ui-button-icon text-success hover:text-success/80" title="Accept (Move to Policy)">
                      <i class="bi bi-check-lg text-xs"></i>
                    </button>
                    <button @click="deleteRule(index)" class="ui-button-icon p-0.5" title="Delete">
                      <i class="bi bi-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-8 d-flex flex-column align-items-center justify-content-center text-center">
              <p class="text-sm font-medium ui-text-primary m-0">No temporary rules.</p>
              <p class="text-xs ui-text-secondary mt-1 max-w-xs">Temporary rules created from the popup will appear here.</p>
            </div>
          </div>
        </section>



        <section v-else class="text-center py-10">
            <h3 class="text-lg font-semibold ui-text-primary mb-2">Temporary Rules Unavailable</h3>
            <p class="text-sm ui-text-secondary">
                Temporary rules are only available when the active profile is an Auto Policy.
            </p>
        </section>

      </div>
    </div>

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
        :forcedTargetId="activeAutoPolicyId"
        @close="showSmartMergeModal = false"
        @merge="handleSmartMergeConfirm"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { loadConfig, savePolicies } from '../../common/storage'
import { validatePattern } from '../../common/validation'
import { toast } from '../utils/toast'
import AcceptRulesModal from '../components/AcceptRulesModal.vue'
import SmartRulesMergeModal from '../components/SmartRulesMergeModal.vue'

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

const proxyOptions = computed(() => {
  if (!config.value || !config.value.proxies) return []
  return Object.values(config.value.proxies).map(p => ({ id: p.id, label: p.label || p.name }))
})

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
    toast.success('Temporary rules saved')
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
    if (confirm('Are you sure you want to clear all temporary rules?')) {
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
       toast.error('Target policy not found')
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
   toast.success(`Merged ${addedCount} rules, updated ${updatedCount} rules.`)
   
   // Close modals
   showAcceptModal.value = false
   showSmartMergeModal.value = false
   mergeSourceIndices.value = []
}


onMounted(() => {
    loadData()
})

</script>
