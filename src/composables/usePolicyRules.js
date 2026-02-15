import { ref, computed, nextTick } from 'vue'
import { validatePattern } from '../common/validation'
import { useDragDrop } from '../common/dragDrop'
import { t } from '../common/i18n'

export function usePolicyRules(rulesRef, options = {}) {
  const { onRulesChanged } = options
  const validationErrors = ref({})
  const focusedIndex = ref(null)
  const fetchingRuleSetIndex = ref(null)
  
  const validateRule = (index, rule) => {
    if (rule.type === 'divider') return
    const result = validatePattern(rule.ruleType, rule.pattern)
    if (result.valid) {
      delete validationErrors.value[index]
    } else {
      validationErrors.value[index] = result.message
    }
    if (onRulesChanged) onRulesChanged()
  }

  const revalidateAll = () => {
    validationErrors.value = {}
    rulesRef.value.forEach((rule, index) => validateRule(index, rule))
  }

  const duplicateIndices = computed(() => {
    if (focusedIndex.value === null) return new Set()
    const focusedRule = rulesRef.value[focusedIndex.value]
    if (!focusedRule || focusedRule.type === 'divider') return new Set()
    
    const duplicates = new Set()
    rulesRef.value.forEach((rule, index) => {
      if (rule.type !== 'divider' && rule.ruleType === focusedRule.ruleType && rule.pattern === focusedRule.pattern && rule.pattern.trim() !== '') {
        duplicates.add(index)
      }
    })
    return duplicates.size > 1 ? duplicates : new Set()
  })

  const addRule = (atEnd = false) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      type: 'rule',
      ruleType: 'wildcard',
      pattern: '',
      valid: true,
      proxyId: 'direct',
      ruleSet: {}
    }
    if (atEnd) rulesRef.value.push(newRule)
    else rulesRef.value.unshift(newRule)
    nextTick(() => revalidateAll())
  }

  const insertRuleBelow = (index) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      type: 'rule',
      ruleType: 'wildcard',
      pattern: '',
      valid: true,
      proxyId: 'direct',
      ruleSet: {}
    }
    rulesRef.value.splice(index + 1, 0, newRule)
    nextTick(() => revalidateAll())
  }

  const insertDividerBelow = (index) => {
    const newDivider = {
      id: `divider_${Date.now()}`,
      type: 'divider',
      label: t('lblNewSection') || 'New Section'
    }
    rulesRef.value.splice(index + 1, 0, newDivider)
    if (onRulesChanged) onRulesChanged()
  }

  const deleteRule = (index) => {
    rulesRef.value.splice(index, 1)
    nextTick(() => revalidateAll())
  }

  const { dragOverIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragDrop(rulesRef)

  // RuleSet Logic
  const fetchRuleSetContent = async (index, url) => {
    if (!url) return
    const rule = rulesRef.value[index]
    if (rule.ruleSet?.sourceUrl === url && rule.ruleSet?.content) return

    fetchingRuleSetIndex.value = index
    try {
      const response = await chrome.runtime.sendMessage({ type: 'FETCH_RULESET', url })
      if (response?.success) {
        rule.ruleSet = { sourceUrl: url, content: response.content, lastUpdated: Date.now() }
      }
    } catch (e) {
      console.error('Fetch ruleset error', e)
    } finally {
      fetchingRuleSetIndex.value = null
    }
  }

  return {
    validationErrors,
    focusedIndex,
    fetchingRuleSetIndex,
    duplicateIndices,
    validateRule,
    revalidateAll,
    addRule,
    insertRuleBelow,
    insertDividerBelow,
    deleteRule,
    fetchRuleSetContent,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  }
}
