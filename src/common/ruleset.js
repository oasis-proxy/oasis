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

/**
 * Validate AutoProxy syntax (must contain [AutoProxy] on the first non-empty line)
 * @param {string} text
 * @returns {boolean}
 */
export function validateAutoProxyContent(text) {
  const lines = text.split(/\r?\n/)
  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    // Allow dynamic suffixes like [AutoProxy 0.2b] or [autoproxy xxxxxx]
    return /^\[autoproxy.*\]$/i.test(line)
  }
  return false
}

/**
 * Encode content for storage (Base64).
 * @param {string} text
 * @returns {string} Base64 encoded text
 */
export function updateRuleSetContent(text) {
  try {
    return btoa(text)
  } catch (e) {
    // Fallback or error handling
    return text
  }
}

export async function fetchRuleSetContent(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    let text = await response.text()

    // Process content based on format (Base64 detection)
    text = decodeRuleSetContent(text)

    if (!validateAutoProxyContent(text)) {
      throw new Error('Invalid AutoProxy format (Missing [AutoProxy] header)')
    }

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
 * @returns {Promise<{changed: boolean, errors: string[]}>} - Result with changed flag and errors array.
 */
export async function updatePolicyRuleSets(policy) {
  let configChanged = false
  const errors = []

  const rules = policy.rules
  if (!rules || !Array.isArray(rules)) return { changed: false, errors }

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

        // CRITICAL P1: Clear old content and errors immediately if the URL has changed,
        // so old PAC rules don't ghost cache during background refresh loops.
        // We do this BEFORE evaluating the fetch result so that even if it fails,
        // the old data is not persisted for the new URL.
        if (rule.ruleSet.url !== url) {
          rule.ruleSet.url = url
          rule.ruleSet.content = null
          rule.ruleSet.lastUpdated = null
          rule.ruleSet.fetchError = null
          configChanged = true
        }

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
          // CRITICAL: Dump old content/timestamp if it fails network even if URL didn't change
          rule.ruleSet.content = null
          rule.ruleSet.lastUpdated = null
          configChanged = true // Save error state
          errors.push(`Failed to update RuleSet '${url}': ${result.fetchError}`)
        }
      } catch (e) {
        // Should be caught by fetchRuleSetContent, but safe to have extra catch
        console.error('Unexpected error updating ruleset', e)
        if (!rule.ruleSet) rule.ruleSet = {}
        rule.ruleSet.fetchError = e.message
        configChanged = true
        errors.push(`Unexpected error updating RuleSet '${url}': ${e.message}`)
      }
    }
  }
  return { changed: configChanged, errors }
}
