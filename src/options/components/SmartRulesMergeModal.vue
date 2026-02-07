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
        style="max-width: 800px; height: 90vh; transition: transform 0.3s ease;"
        :style="{ transform: visible ? 'scale(1)' : 'scale(0.95)' }"
      >
        
        <!-- Modal Header -->
        <div class="p-4 d-flex justify-content-between align-items-center border-b border-light ">
          <h3 class="ui-text-primary modal-header tracking-tight m-0">Merge Rules</h3>
          <button 
            @click="emit('close')" 
            class="modal-close-button"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-subtle/50 ">
          <div class="px-4 d-flex flex-column gap-4">

            <!-- Section 1: Target Policy -->
            <section>
               <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Policy</h4>
               <label class="d-flex flex-column gap-2 w-100">
                  <select 
                    v-model="targetPolicyId"
                    :disabled="!!forcedTargetId"
                    :class="{'bg-subtle  text-slate-500 cursor-not-allowed': !!forcedTargetId}"
                    class="form-select ui-input w-100 rounded-lg border h-8 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    style="max-width: 100%;"
                  >
                    <option value="">-- Select Target Policy --</option>
                    <option v-for="policyOption in availablePolicies" :key="policyOption.id" :value="policyOption.id">
                      {{ policyOption.name }}
                    </option>
                  </select>
               </label>
            </section>

             <!-- Section 2: Source Rules (Read-only) -->
            <section>
               <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Source Rules</h4>
                  <span class="text-xs ui-button-secondary px-2 py-0.5 rounded-full">{{ sourceRules.length }} rules</span>
               </div>
               
               <div class="rounded-lg border border-light  overflow-hidden shadow-sm">
                   <div class="ui-card-header">
                       <div style="width: 30%;">Type</div>
                       <div style="width: 50%;">Pattern</div>
                       <div style="width: 20%;">Proxy</div>
                   </div>
                   <div class="max-h-48 overflow-y-auto custom-scrollbar bg-white  divide-y divide-slate-100 ">
                       <div v-for="(rule, idx) in sourceRules" :key="idx" class="d-flex align-items-center gap-2 px-3 py-2 opacity-70">
                           <div style="width: 30%;">
                               <input 
                                type="text" 
                                class="form-control ui-input w-100 rounded border text-xs py-0 px-2 bg-subtle " 
                                :value="rule.ruleType" 
                                readonly 
                                style="height: 28px; max-width: 100%;"
                               />
                           </div>
                           <div style="width: 50%;">
                               <input 
                                type="text" 
                                class="form-control ui-input w-100 rounded border text-xs py-0 px-2 font-mono bg-subtle " 
                                :value="rule.pattern" 
                                readonly 
                                style="height: 28px; max-width: 100%;"
                               />
                           </div>
                           <div style="width: 20%;">
                               <input 
                                type="text" 
                                class="form-control ui-input w-100 rounded border text-xs py-0 px-2 text-muted bg-subtle " 
                                :value="getProxyLabel(rule.proxyId)" 
                                readonly 
                                style="height: 28px; max-width: 100%;"
                               />
                           </div>
                       </div>
                       <div v-if="sourceRules.length === 0" class="p-4 text-center text-xs text-slate-500">No rules selected.</div>
                   </div>
               </div>
            </section>

            <!-- Section 3: Merged Preview (Optimization) -->
            <section>
               <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Merged Preview</h4>
                   <div class="d-flex align-items-center gap-2">
                       <span class="text-xs text-slate-500" v-if="mergedRules.length < sourceRules.length">
                           Optimized: <span class="text-green-600 font-bold">-{{ sourceRules.length - mergedRules.length }}</span> rules
                       </span>
                       <span class="text-xs ui-button-secondary px-2 py-0.5 rounded-full">{{ mergedRules.length }} rules</span>
                   </div>
               </div>

               <div class="rounded-lg border border-light  overflow-hidden shadow-sm">
                   <!-- Header -->
                   <div class="ui-card-header">
                       <div style="width: 30%;">Type</div>
                       <div style="width: 42%;">Pattern</div>
                       <div style="width: 20%;">Proxy</div>
                       <div style="width: 8%;" class="text-center">ACTION</div>
                   </div>
                   
                   <!-- List -->
                    <div class="max-h-64 overflow-y-auto custom-scrollbar bg-white  divide-y divide-slate-100 ">
                       <div v-for="(rule, idx) in mergedRules" :key="idx" class="d-flex align-items-center gap-2 px-3 py-2 hover:bg-subtle  transition-colors group">
                           
                           <!-- Type -->
                           <div style="width: 30%;">
                               <select 
                                v-model="rule.ruleType"
                                class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                                style="height: 28px; max-width: 100%;"
                               >
                                   <option value="wildcard">Wildcard</option>
                                   <option value="regex">Regex</option>
                               </select>
                           </div>
                           
                           <!-- Pattern -->
                           <div style="width: 42%;">
                               <input 
                                v-model="rule.pattern"
                                type="text"
                                class="form-control ui-input w-100 mw-100 rounded text-xs py-0 px-2 font-mono"
                                style="height: 28px;"
                               />
                           </div>
                           
                           <!-- Proxy -->
                           <div style="width: 20%;">
                               <select 
                                v-model="rule.proxyId"
                                class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                                style="height: 28px; max-width: none;"
                               >
                                  <option value="direct">Direct</option>
                                  <option v-for="p in proxyList" :key="p.id" :value="p.id">{{ p.label }}</option>
                               </select>
                           </div>
                           
                           <!-- Action -->
                           <div style="width: 8%;" class="d-flex align-items-center justify-content-center">
                               <button 
                                 @click="removeMergedRule(idx)" 
                                 class="ui-button-icon p-0.5 transition-colors text-red-500 hover:bg-red-50 " 
                                 title="Remove"
                               >
                                   <i class="bi bi-trash text-xs"></i>
                               </button>
                           </div>
                       </div>
                        <div v-if="mergedRules.length === 0" class="p-4 text-center text-xs text-slate-500">No rules to merge.</div>
                   </div>
               </div>
               <p class="text-xs text-slate-500 mt-2 mb-0">
                   Rules have been automatically optimized. You can further edit them here before merging.
               </p>
            </section>

             <!-- Section 4: Conflict Resolution -->
            <section>
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conflict Resolution</h4>
                <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
                
                <!-- Ignore Option -->
                <label 
                  class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm focus:outline-none transition-all"
                  :class="conflictMode === 'ignore' ? 'border-primary bg-blue-50/50' : 'ui-card hover:border-default'"
                >
                  <input v-model="conflictMode" v-show="false" class="sr-only" name="conflict-mode" type="radio" value="ignore"/>
                  <span class="d-flex flex-1">
                    <span class="d-flex flex-column">
                      <span class="block text-xs font-medium mb-1" :class="conflictMode === 'ignore' ? 'text-primary' : 'ui-text-primary'">Ignore Duplicates</span>
                      <span class="mt-1 d-flex align-items-center text-xs text-slate-500">Keep existing rules</span>
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
                      <span class="block text-xs font-medium mb-1" :class="conflictMode === 'overwrite' ? 'text-primary' : 'ui-text-primary'">Overwrite</span>
                      <span class="mt-1 d-flex align-items-center text-xs text-slate-500">Update existing rules</span>
                    </span>
                  </span>
                  <i v-if="conflictMode === 'overwrite'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
                </label>

              </div>
            </section>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 d-flex justify-content-end align-items-center gap-3 border-t border-light ">
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
            Merge {{ mergedRules.length }} Rules
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
  policies: {
    type: Object,
    default: () => ({})
  },
  sourceRules: {
    type: Array,
    default: () => []
  },
  forcedTargetId: {
    type: String,
    default: ''
  },
  proxies: {
      type: Object,
      default: () => ({})
  }
})

const emit = defineEmits(['close', 'merge'])

const targetPolicyId = ref('')
const conflictMode = ref('ignore')
const mergedRules = ref([])

const proxyList = computed(() => {
    return Object.values(props.proxies || {}).map(p => ({ id: p.id, label: p.label || p.name }))
})

const availablePolicies = computed(() => {
  return Object.values(props.policies || {})
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map(p => ({ id: p.id, name: p.name || 'Unnamed Policy' }))
})

const isValid = computed(() => {
  return targetPolicyId.value !== '' && mergedRules.value.length > 0
})

const getProxyLabel = (id) => {
    if (id === 'direct') return 'Direct'
    const p = props.proxies && props.proxies[id]
    return p ? (p.label || p.name) : id
}

// Optimization Logic
const optimizeRules = (rules) => {
    // Deep copy
    let optimized = JSON.parse(JSON.stringify(rules))

    // Group by Proxy
    const byProxy = {}
    optimized.forEach(r => {
        const key = r.proxyId || 'direct'
        if (!byProxy[key]) byProxy[key] = []
        byProxy[key].push(r)
    })

    const finalRules = []

    Object.keys(byProxy).forEach(proxyId => {
        const group = byProxy[proxyId]
        
        // Separate Wildcards
        const wildcards = group.filter(r => r.ruleType === 'wildcard')
        const others = group.filter(r => r.ruleType !== 'wildcard')

        // Optimize Wildcards
        // Sort by length (descending) so we process longer (subdomains) first?
        // Actually, if we have A: 'google.com' and B: 'www.google.com'
        // B ends with A. So B is redundant.
        // We want to keep the SHORTEST one that covers others.
        // So we keep 'google.com'.
        
        // Algorithm:
        // 1. Sort by length ASCENDING.
        // 2. Iterate. Keep rule if it's not covered by any existing kept rule.
        
        wildcards.sort((a, b) => a.pattern.length - b.pattern.length)
        
        const keptWildcards = []
        wildcards.forEach(r => {
            // Check if covered by any already kept rule
            // "Covered" means: r.pattern is a subdomain of kept.pattern
            // Wildcard matching logic:
            // if kept is "google.com", it matches "google.com", ".google.com", "www.google.com".
            // Implementation: does r.pattern generate the same or subset?
            // Simple check: is r.pattern same as kept, or ends with "." + kept?
            // Also handle initial dot: ".google.com" == "google.com" roughly.
            
            const normalize = (p) => p.startsWith('.') ? p.substring(1) : p
            const rDomain = normalize(r.pattern)
            
            const isRedundant = keptWildcards.some(k => {
                const kDomain = normalize(k.pattern)
                return rDomain === kDomain || rDomain.endsWith('.' + kDomain)
            })

            if (!isRedundant) {
                keptWildcards.push(r)
            }
        })

        finalRules.push(...others)
        finalRules.push(...keptWildcards)
    })

    return finalRules
}

const removeMergedRule = (index) => {
    mergedRules.value.splice(index, 1)
}


const handleConfirm = () => {
  if (isValid.value) {
    emit('merge', {
      targetId: targetPolicyId.value,
      conflictMode: conflictMode.value,
      rules: mergedRules.value
    })
    emit('close')
  }
}

const reset = () => {
  targetPolicyId.value = ''
  conflictMode.value = 'ignore'
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
      reset()
       if (props.forcedTargetId) {
           targetPolicyId.value = props.forcedTargetId
       } else if (availablePolicies.value.length > 0 && !targetPolicyId.value) {
          targetPolicyId.value = availablePolicies.value[0].id
      }
      // Trigger optimization
      mergedRules.value = optimizeRules(props.sourceRules)
  }
})
</script>

