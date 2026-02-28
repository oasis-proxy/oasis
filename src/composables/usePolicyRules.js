import { ref, computed, nextTick } from 'vue'
import { validatePattern } from '../common/validation'
import { useDragDrop } from '../common/dragDrop'
import { t } from '../common/i18n'

export function usePolicyRules(rulesRef, options = {}) {
  const { onRulesChanged, defaultProxyId = 'direct' } = options
  const validationErrors = ref({})
  const focusedIndex = ref(null)
  const fetchingRuleSetIndex = ref(null)

  const validateRule = (index, rule) => {
    if (rule.type === 'divider') return
    const result = validatePattern(rule.ruleType, rule.pattern)
    if (result.valid) {
      delete validationErrors.value[index]

      // Auto-fetch ruleset content if it's a valid new/modified ruleset URL
      if (rule.ruleType === 'ruleset' && rule.pattern?.trim()) {
        const url = rule.pattern.trim()
        const needsFetch = !rule.ruleSet?.content || rule.ruleSet?.url !== url
        
        // If the URL has changed, we should reset the fetch error so it tries again
        if (rule.ruleSet?.url !== url) {
          if (rule.ruleSet) rule.ruleSet.fetchError = null
        }

        const hasFailedRecently = rule.ruleSet?.fetchError && rule.ruleSet?.url === url

        if (needsFetch && !hasFailedRecently) {
          fetchRuleSetContent(index, url)
        }
      }
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
      if (
        rule.type !== 'divider' &&
        rule.ruleType === focusedRule.ruleType &&
        rule.pattern === focusedRule.pattern &&
        rule.pattern.trim() !== ''
      ) {
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
      proxyId: defaultProxyId,
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
      proxyId: defaultProxyId,
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

  const { dragOverIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragDrop(rulesRef)

  // RuleSet Logic
  const fetchRuleSetContent = async (index, url, force = false) => {
    if (!url) return
    const rule = rulesRef.value[index]
    if (!rule) return
    if (!rule.ruleSet) rule.ruleSet = {}
    
    if (!force && rule.ruleSet?.url === url && rule.ruleSet?.content) return

    fetchingRuleSetIndex.value = index
    try {
      const response = await chrome.runtime.sendMessage({ type: 'FETCH_RULESET', url })
      if (response?.success) {
        rule.ruleSet = { url, content: response.content, lastUpdated: Date.now(), fetchError: null }
      } else {
        rule.ruleSet.fetchError = response?.error || 'Failed to fetch'
        rule.ruleSet.url = url
      }
    } catch (e) {
      console.error('Fetch ruleset error', e)
      rule.ruleSet.fetchError = e.message
      rule.ruleSet.url = url
    } finally {
      fetchingRuleSetIndex.value = null
      if (onRulesChanged) onRulesChanged()
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
