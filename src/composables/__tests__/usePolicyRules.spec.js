import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePolicyRules } from '../usePolicyRules'
import { validatePattern } from '../../common/validation'

// Mock dependencies
vi.mock('../../common/validation', () => ({
  validatePattern: vi.fn()
}))

vi.mock('../../common/i18n', () => ({
  t: (key) => key
}))

describe('usePolicyRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.chrome = {
      runtime: {
        sendMessage: vi.fn()
      }
    }
  })

  it('validates a rule and manages validation errors', () => {
    const rules = ref([
      { type: 'rule', ruleType: 'wildcard', pattern: 'bad pattern', proxyId: 'direct' }
    ])
    
    validatePattern.mockReturnValue({ valid: false, message: 'Invalid wildcard' })
    
    const { validateRule, validationErrors } = usePolicyRules(rules)
    validateRule(0, rules.value[0])
    
    expect(validationErrors.value[0]).toBe('Invalid wildcard')
    
    // Fix the rule
    validatePattern.mockReturnValue({ valid: true })
    validateRule(0, rules.value[0])
    
    expect(validationErrors.value[0]).toBeUndefined()
  })

  describe('RuleSet auto-fetching on validation', () => {
    it('fetches ruleset content if it is valid and missing content', () => {
      const rules = ref([
        { 
          type: 'rule', 
          ruleType: 'ruleset', 
          pattern: ' https://example.com/rules ', // Note the spaces
          proxyId: 'direct',
          ruleSet: {}
        }
      ])
      
      validatePattern.mockReturnValue({ valid: true })
      
      const { validateRule, fetchingRuleSetIndex } = usePolicyRules(rules)
      
      // Should trigger sendMessage to fetch
      validateRule(0, rules.value[0])
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'FETCH_RULESET',
        url: 'https://example.com/rules'
      })
    })

    it('resets fetchError and retries if the URL changes on a failed ruleset', () => {
      const rules = ref([
        { 
          type: 'rule', 
          ruleType: 'ruleset', 
          pattern: 'https://example.com/new',
          proxyId: 'direct',
          ruleSet: {
            url: 'https://example.com/old',
            fetchError: 'Network Error'
          }
        }
      ])
      
      validatePattern.mockReturnValue({ valid: true })
      
      const { validateRule } = usePolicyRules(rules)
      validateRule(0, rules.value[0])
      
      expect(rules.value[0].ruleSet.fetchError).toBeNull()
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'FETCH_RULESET',
        url: 'https://example.com/new'
      })
    })

    it('does not retry fetching if the URL is the same and there is a recent error', () => {
      const rules = ref([
        { 
          type: 'rule', 
          ruleType: 'ruleset', 
          pattern: 'https://example.com/same',
          proxyId: 'direct',
          ruleSet: {
            url: 'https://example.com/same',
            fetchError: 'Network Error'
          }
        }
      ])
      
      validatePattern.mockReturnValue({ valid: true })
      
      const { validateRule } = usePolicyRules(rules)
      validateRule(0, rules.value[0])
      
      expect(rules.value[0].ruleSet.fetchError).toBe('Network Error')
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled()
    })
  })

  it('updates rules array correctly when adding and deleting', async () => {
    const rules = ref([])
    const { addRule, deleteRule, insertRuleBelow } = usePolicyRules(rules)
    
    addRule(true) // add to end
    expect(rules.value.length).toBe(1)
    expect(rules.value[0].ruleType).toBe('wildcard')
    
    insertRuleBelow(0)
    expect(rules.value.length).toBe(2)
    
    deleteRule(1)
    expect(rules.value.length).toBe(1)
  })
})
