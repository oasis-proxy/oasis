<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('smmmTitle')" 
    maxWidth="800px"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-4 h-100" style="max-height: 70vh;">
         <!-- Section 1: Target Policy -->
        <section>
            <h4 class="text-xs fw-bold ui-text-secondary text-uppercase mb-2" style="letter-spacing: 0.1em;">{{ $t('smmmSectionTarget') }}</h4>
            <label class="d-flex flex-column gap-2 w-100">
                <select 
                v-model="targetPolicyId"
                :disabled="!!forcedTargetId"
                :class="{'bg-subtle  ui-text-secondary cursor-not-allowed': !!forcedTargetId}"
                class="form-select ui-input w-100 rounded-lg border px-3 text-xs transition-colors shadow-sm"
                style="max-width: 100%;"
                >
                <option value="">{{ $t('armPlaceholderTarget') }}</option>
                <option v-for="policyOption in availablePolicies" :key="policyOption.id" :value="policyOption.id">
                    {{ policyOption.name }}
                </option>
                </select>
            </label>
        </section>

            <!-- Section 2: Source Rules (Read-only) -->
        <section>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="text-xs fw-bold ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.1em;">{{ $t('smmmSectionSource') }}</h4>
                <span class="text-xs ui-button-secondary px-2 py-1 rounded-pill">{{ sourceRules.length }} rules</span>
            </div>
            
            <div class="rounded-lg border border-subtle overflow-hidden shadow-sm">
                <div class="ui-card-header">
                    <div style="width: 30%;">{{ $t('lblType') }}</div>
                    <div style="width: 50%;">{{ $t('lblPattern') }}</div>
                    <div style="width: 20%;">{{ $t('lblProxy') }}</div>
                </div>
                <div class="overflow-y-auto custom-scrollbar ui-bg-card" style="max-height: 12rem;">
                    <div v-for="(rule, idx) in sourceRules" :key="idx" class="d-flex align-items-center gap-1 px-2 py-2 opacity-70">
                        <div style="width: 30%;">
                            <input 
                            type="text" 
                            class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 bg-subtle " 
                            :value="$t('opt' + (rule.ruleType.charAt(0).toUpperCase() + rule.ruleType.slice(1))) || rule.ruleType"  
                            readonly 
                            style="max-width: 100%;"
                            />
                        </div>
                        <div style="width: 50%;">
                            <input 
                            type="text" 
                            class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 font-monospace bg-subtle " 
                            :value="rule.pattern" 
                            readonly 
                            style="max-width: 100%;"
                            />
                        </div>
                        <div style="width: 20%;">
                            <input 
                            type="text" 
                            class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 text-muted bg-subtle " 
                            :value="getProxyLabel(rule.proxyId)" 
                            readonly 
                            style="max-width: 100%;"
                            />
                        </div>
                    </div>
                    <div v-if="sourceRules.length === 0" class="p-4 text-center text-xs ui-text-secondary">{{ $t('smmmMsgNoSource') }}</div>
                </div>
            </div>
        </section>

            <!-- Section 3: Merged Preview (Optimization) -->
        <section>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="text-xs fw-bold ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.1em;">{{ $t('smmmSectionPreview') }}</h4>
                <div class="d-flex align-items-center gap-2">
                    <span class="text-xs ui-text-secondary" v-if="mergedRules.length < sourceRules.length">
                        {{ $t('smmmMsgOptimized', ['-' + (sourceRules.length - mergedRules.length)]) }}
                    </span>
                    <span class="text-xs ui-button-secondary px-2 py-1 rounded-pill">{{ mergedRules.length }} rules</span>
                </div>
            </div>

            <div class="rounded-lg border border-subtle overflow-hidden shadow-sm">
                <!-- Header -->
                <div class="ui-card-header">
                    <div style="width: 30%;">{{ $t('lblType') }}</div>
                    <div style="width: 42%;">{{ $t('lblPattern') }}</div>
                    <div style="width: 20%;">{{ $t('lblProxy') }}</div>
                    <div style="width: 8%;" class="text-center">{{ $t('lblAction').toUpperCase() }}</div>
                </div>
                
                <!-- List -->
                    <div class="overflow-y-auto custom-scrollbar ui-bg-card" style="max-height: 16rem;">
                    <div v-for="(rule, idx) in mergedRules" :key="idx" class="d-flex align-items-center gap-1 px-2 py-2 hover-bg-subtle  transition-colors group border-bottom border-subtle">
                        
                        <!-- Type -->
                        <div style="width: 30%;">
                            <select 
                            v-model="rule.ruleType"
                            class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
                            style="max-width: 100%;"
                            >
                                <option value="wildcard">{{ $t('optWildcard') }}</option>
                                <option value="regex">{{ $t('optRegex') }}</option>
                            </select>
                        </div>
                        
                        <!-- Pattern -->
                        <div style="width: 42%;">
                            <input 
                            v-model="rule.pattern"
                            type="text"
                            class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-monospace"
                            />
                        </div>
                        
                        <!-- Proxy -->
                        <div style="width: 20%;">
                            <select 
                            v-model="rule.proxyId"
                            class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
                            style="max-width: none;"
                            >
                                <option value="direct">{{ $t('directConnect') }}</option>
                                <optgroup v-for="group in proxyList" :key="group.label" :label="group.label">
                                <option v-for="p in group.options" :key="p.id" :value="p.id">{{ p.label }}</option>
                                </optgroup>
                            </select>
                        </div>
                        
                        <!-- Action -->
                        <div style="width: 8%;" class="d-flex align-items-center justify-content-center">
                            <button 
                                @click="removeMergedRule(idx)" 
                                class="ui-button-icon p-1 transition-colors text-danger hover-bg-danger-subtle " 
                                :title="$t('btnRemove')"
                            >
                                <i class="bi bi-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                        <div v-if="mergedRules.length === 0" class="p-4 text-center text-xs ui-text-secondary">{{ $t('smmmMsgNoMerge') }}</div>
                </div>
            </div>
            <p class="text-xs ui-text-secondary mt-2 mb-0">
                {{ $t('smmmDescOptimization') }}
            </p>
        </section>

            <!-- Section 4: Conflict Resolution -->
        <section>
            <h4 class="text-xs fw-bold ui-text-secondary text-uppercase mb-2" style="letter-spacing: 0.1em;">{{ $t('armLabelConflict') }}</h4>
            <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
            
            <!-- Ignore Option -->
            <label 
                class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-colors"
                :class="conflictMode === 'ignore' ? 'border-primary bg-primary-subtle' : 'ui-card hover-border-primary'"
            >
                <input v-model="conflictMode" v-show="false" class="visually-hidden" name="conflict-mode" type="radio" value="ignore"/>
                <span class="d-flex flex-fill">
                <span class="d-flex flex-column">
                    <span class="d-block text-xs fw-medium mb-1" :class="conflictMode === 'ignore' ? 'text-primary' : 'ui-text-primary'">{{ $t('armOptIgnore') }}</span>
                    <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{ $t('armDescIgnore') }}</span>
                </span>
                </span>
                <i v-if="conflictMode === 'ignore'" class="bi bi-check-circle-fill text-primary text-lg position-absolute top-50 end-0 translate-middle-y me-3"></i>
            </label>

            <!-- Overwrite Option -->
            <label 
                class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-colors"
                :class="conflictMode === 'overwrite' ? 'border-primary bg-primary-subtle' : 'ui-card hover-border-primary'"
            >
                <input v-model="conflictMode" v-show="false" class="visually-hidden" name="conflict-mode" type="radio" value="overwrite"/>
                <span class="d-flex flex-fill">
                <span class="d-flex flex-column">
                    <span class="d-block text-xs fw-medium mb-1" :class="conflictMode === 'overwrite' ? 'text-primary' : 'ui-text-primary'">{{ $t('armOptOverwrite') }}</span>
                    <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{ $t('armDescOverwrite') }}</span>
                </span>
                </span>
                <i v-if="conflictMode === 'overwrite'" class="bi bi-check-circle-fill text-primary text-lg position-absolute top-50 end-0 translate-middle-y me-3"></i>
            </label>

            </div>
        </section>
    </div>

    <template #footer>
        <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-hover  transition-colors"
        >
        {{ $t('btnCancel') }}
        </button>
        <button 
        @click="handleConfirm"
        :disabled="!isValid"
        class="px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {{ $t('smmmBtnMerge', [mergedRules.length]) }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../../common/i18n'
import BaseModal from './BaseModal.vue'

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
  },
  proxyGroups: {
      type: Object,
      default: () => ({})
  },
  domainOptimize: {
      type: Boolean,
      default: false
  }
})

const emit = defineEmits(['close', 'merge'])

const targetPolicyId = ref('')
const conflictMode = ref('ignore')
const mergedRules = ref([])

const proxyList = computed(() => {
    const groups = []
  
    // Proxies
    if (props.proxies) {
        const proxies = Object.values(props.proxies)
            .map(p => ({ id: p.id, label: p.label || p.name }))
            .sort((a, b) => a.label.localeCompare(b.label))
            
        if (proxies.length > 0) {
            groups.push({ label: t('lblProxyHosts'), options: proxies })
        }
    }
    
    // Proxy Groups
    if (props.proxyGroups) {
        const proxyGroups = Object.values(props.proxyGroups)
            .map(g => ({ id: g.id, label: g.name }))
            .sort((a, b) => a.label.localeCompare(b.label))
            
        if (proxyGroups.length > 0) {
            groups.push({ label: t('lblProxyGroups'), options: proxyGroups })
        }
    }
    
    return groups
})

const availablePolicies = computed(() => {
  return Object.values(props.policies || {})
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map(p => ({ id: p.id, name: p.name || t('unnamedPolicy') }))
})

const isValid = computed(() => {
  return targetPolicyId.value !== '' && mergedRules.value.length > 0
})

const getProxyLabel = (id) => {
    if (id === 'direct') return t('directConnect')
    const p = props.proxies && props.proxies[id]
    return p ? (p.label || p.name) : id
}

// Extract the registered domain (second-level domain) from a hostname
// e.g., www.google.com → google.com, a.b.co.uk → b.co.uk
const getRegisteredDomain = (hostname) => {
    if (!hostname) return hostname
    // Skip IPs
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return hostname
    // Strip leading dot for processing
    const h = hostname.startsWith('.') ? hostname.substring(1) : hostname
    const parts = h.split('.')
    if (parts.length <= 2) return h

    const twoPartTlds = new Set([
        'co.uk', 'org.uk', 'ac.uk', 'gov.uk',
        'com.au', 'net.au', 'org.au',
        'com.cn', 'net.cn', 'org.cn',
        'co.jp', 'or.jp', 'ne.jp',
        'co.kr', 'or.kr',
        'com.br', 'org.br',
        'co.nz', 'org.nz',
        'com.tw', 'org.tw',
        'com.hk', 'org.hk',
        'com.sg', 'org.sg',
        'co.in', 'org.in', 'net.in',
        'com.mx', 'org.mx',
        'co.za', 'org.za'
    ])

    const lastTwo = parts.slice(-2).join('.')
    if (twoPartTlds.has(lastTwo) && parts.length >= 3) {
        return parts.slice(-3).join('.')
    }
    return parts.slice(-2).join('.')
}

// Optimization Logic
const optimizeRules = (rules) => {
    // Deep copy
    let optimized = JSON.parse(JSON.stringify(rules))

    // Domain optimization: convert wildcard patterns to .secondLevelDomain format
    if (props.domainOptimize) {
        optimized = optimized.map(r => {
            if (r.ruleType === 'wildcard' && r.pattern) {
                const registered = getRegisteredDomain(r.pattern)
                return { ...r, pattern: '.' + registered }
            }
            return r
        })
    }

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
        // 2. Iterate. Keep rule if it's not covered by existing kept rule.
        
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
