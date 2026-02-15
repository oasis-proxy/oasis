import { ref, computed } from 'vue'
import { loadConfig, savePolicies } from '../common/storage'
import { validatePattern } from '../common/validation'
import { t } from '../common/i18n'
import { toast } from '../options/utils/toast'

export function useTempRules() {
    const rules = ref([])
    const originalRules = ref([])
    const config = ref(null)
    const validationErrors = ref({})
    const isInitializing = ref(true)
    const showAcceptModal = ref(false)
    const showSmartMergeModal = ref(false)
    const mergeSourceIndices = ref([])

    // Load Configuration and Temp Rules
    const loadData = async () => {
        config.value = await loadConfig()
        const sessionData = await chrome.storage.session.get('tempRules')
        const loadedRules = sessionData.tempRules || []
        
        rules.value = JSON.parse(JSON.stringify(loadedRules)).map(rule => ({
            ...rule,
            valid: rule.valid ?? true,
            ruleType: rule.ruleType || 'wildcard',
            proxyId: rule.proxyId || 'direct'
        }))

        originalRules.value = JSON.parse(JSON.stringify(rules.value))
        validationErrors.value = {}
        isInitializing.value = false
    }

    const isDirty = computed(() => JSON.stringify(rules.value) !== JSON.stringify(originalRules.value))

    const activeAutoPolicyId = computed(() => {
        if (!config.value || !config.value.activeProfileId) return ''
        const id = config.value.activeProfileId
        return (config.value.policies && config.value.policies[id]) ? id : ''
    })

    const isTemporaryRulesActive = computed(() => !!activeAutoPolicyId.value)

    const validateRule = (index, rule) => {
        const result = validatePattern(rule.ruleType, rule.pattern)
        if (result.valid) {
            delete validationErrors.value[index]
        } else {
            validationErrors.value[index] = result.message
        }
    }

    const saveChanges = async () => {
        await chrome.storage.session.set({ tempRules: JSON.parse(JSON.stringify(rules.value)) })
        originalRules.value = JSON.parse(JSON.stringify(rules.value))
        toast.success(t('tempMsgSaved'))
    }

    const addRule = () => {
        rules.value.unshift({
            id: `temp_${Date.now()}`,
            type: 'rule',
            ruleType: 'wildcard',
            pattern: '',
            valid: true,
            proxyId: 'direct'
        })
    }

    const deleteRule = (index) => rules.value.splice(index, 1)

    const clearAll = () => {
        if (confirm(t('tempMsgClearConfirm'))) rules.value = []
    }

    const selectedRulesForMerge = computed(() => {
        if (mergeSourceIndices.value.length > 0) {
            return mergeSourceIndices.value.map(i => rules.value[i])
        }
        return rules.value
    })

    const smartMergeRules = computed(() => {
        return selectedRulesForMerge.value.filter(r => 
            r.ruleType === 'wildcard' && r.pattern && r.pattern.trim() !== ''
        )
    })

    const executeMerge = async (targetId, conflictMode, rulesToMerge) => {
        if (!config.value?.policies?.[targetId]) {
            toast.error(t('msgPolicyNotFound'))
            return
        }

        const targetPolicy = config.value.policies[targetId]
        if (!targetPolicy.rules) targetPolicy.rules = []

        let addedCount = 0
        let updatedCount = 0
        const newRulesToAdd = []

        rulesToMerge.forEach(tempRule => {
            const existingIndex = targetPolicy.rules.findIndex(r => 
                r.type !== 'divider' && r.ruleType === tempRule.ruleType && r.pattern === tempRule.pattern
            )

            if (existingIndex !== -1) {
                if (conflictMode === 'overwrite') {
                    targetPolicy.rules[existingIndex].proxyId = tempRule.proxyId
                    targetPolicy.rules[existingIndex].valid = tempRule.valid
                    updatedCount++
                }
            } else {
                newRulesToAdd.push({ ...tempRule, id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` })
                addedCount++
            }
        })
        
        if (newRulesToAdd.length > 0) targetPolicy.rules.unshift(...newRulesToAdd)

        config.value.policies[targetId] = targetPolicy
        await savePolicies(config.value.policies)

        // Cleanup
        if (mergeSourceIndices.value.length > 0) {
            const indices = [...mergeSourceIndices.value].sort((a, b) => b - a)
            indices.forEach(i => rules.value.splice(i, 1))
        } else {
            rules.value = []
        }

        await saveChanges()
        toast.success(t('tempMsgMerged', [addedCount, updatedCount]))
        
        showAcceptModal.value = false
        showSmartMergeModal.value = false
        mergeSourceIndices.value = []
    }

    return {
        rules, config, validationErrors, isDirty, 
        activeAutoPolicyId, isTemporaryRulesActive,
        showAcceptModal, showSmartMergeModal,
        selectedRulesForMerge, smartMergeRules,
        loadData, validateRule, saveChanges, addRule,
        deleteRule, clearAll, executeMerge, mergeSourceIndices
    }
}
