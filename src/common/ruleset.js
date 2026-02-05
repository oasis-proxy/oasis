
/**
 * Common utilities for handling RuleSets (remote policy rules).
 */

/**
 * Fetch content from a RuleSet URL and return a standardized object.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<{content: string, lastUpdated: number, lastFetched: number, fetchError: null}|{fetchError: string, lastFetched: number}>}
 */

/**
 * Try to decode content if it looks like Base64.
 * @param {string} text 
 * @returns {string} Decoded text or original text
 */
export function decodeRuleSetContent(text) {
  try {
    const cleanContent = text.replace(/[\r\n]/g, '')
    // Simple base64 regex (matches if the whole content looks like base64)
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/
    if (base64Pattern.test(cleanContent)) {
      try {
        return atob(cleanContent)
      } catch (e) {
        // Ignore, treat as plain text
      }
    }
  } catch (e) {
    // Ignore
  }
  return text
}

export async function fetchRuleSetContent(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    let text = await response.text()
    
    // Process content based on format (Base64 detection)
    text = decodeRuleSetContent(text)
    
    const now = Date.now()
    return {
      content: text,
      lastUpdated: now,
      lastFetched: now,
      fetchError: null
    }
  } catch (e) {
    return {
      fetchError: e.message,
      lastFetched: Date.now()
    }
  }
}


/**
 * Update RuleSets for a given policy.
 * @param {object} policy - The policy object containing rules.
 * @returns {Promise<boolean>} - True if any rule was updated.
 */
export async function updatePolicyRuleSets(policy) {
  let configChanged = false

  const rules = policy.rules
  if (!rules || !Array.isArray(rules)) return false

  for (const rule of rules) {
      // Check if rule has a subscription URL (RuleSet)
      // Use rule.pattern as the source of truth for URL
      if (rule.ruleType === 'ruleset' && rule.pattern && rule.pattern.trim()) {
          const url = rule.pattern.trim()
          
          try {
             // console.log(`Oasis: Updating RuleSet for policy...`) // Logging can be handled by caller or optionally passed
             const result = await fetchRuleSetContent(url)

             // Initialize ruleSet object if missing
             if (!rule.ruleSet) rule.ruleSet = {}

             if (!result.fetchError) {
                // Success
                rule.ruleSet.content = result.content
                rule.ruleSet.lastUpdated = result.lastUpdated
                rule.ruleSet.lastFetched = result.lastFetched
                rule.ruleSet.fetchError = null
                configChanged = true
             } else {
                // Error
                rule.ruleSet.fetchError = result.fetchError
                rule.ruleSet.lastFetched = result.lastFetched
                configChanged = true // Save error state
             }
              
          } catch (e) {
              // Should be caught by fetchRuleSetContent, but safe to have extra catch
              console.error('Unexpected error updating ruleset', e)
              if (!rule.ruleSet) rule.ruleSet = {}
              rule.ruleSet.fetchError = e.message
              configChanged = true
          }
      }
  }
  return configChanged
}
