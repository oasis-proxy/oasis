import { loadConfig, saveConfig } from '../common/storage'
import { updatePolicyRuleSets } from '../common/ruleset'

/**
 * Setup or clear the update alarm.
 * @param {number} intervalMinutes
 */
export async function setupUpdateAlarm(intervalMinutes) {
  await chrome.alarms.clear('updateRules')
  if (intervalMinutes > 0) {
    console.log(`Oasis: Scheduling rule updates every ${intervalMinutes} minutes.`)
    chrome.alarms.create('updateRules', {
      periodInMinutes: intervalMinutes
    })
  } else {
    console.log('Oasis: Rule auto-update disabled.')
  }
}

/**
 * Check and update external rule sets and PAC scripts.
 */
export async function checkUpdates() {
  const config = await loadConfig()
  let configChanged = false
  const errors = []

  // 1. Update Remote PAC Scripts
  if (config.pacs) {
    for (const pac of Object.values(config.pacs)) {
      if (!pac) continue
      // Only update remote PACs with a valid URL
      if (pac.mode === 'remote' && pac.url) {
        try {
          console.log(`Oasis: Updating PAC script '${pac.name}' from ${pac.url}`)
          const response = await fetch(pac.url)
          if (response.ok) {
            const text = await response.text()
            if (text && text !== pac.script) {
              pac.script = text
              // pac.lastUpdated = Date.now() // Ideally we should track this
              configChanged = true
              console.log(`Oasis: PAC script '${pac.name}' updated.`)
            }
          } else {
            const err = `Failed to fetch PAC '${pac.name}': HTTP ${response.status}`
            console.error(`Oasis: ${err}`)
            errors.push(err)
          }
        } catch (e) {
          const err = `Error updating PAC '${pac.name}': ${e.message}`
          console.error(`Oasis: ${err}`, e)
          errors.push(err)
        }
      }
    }
  }

  // 2. Update Policy RuleSets
  if (config.policies) {
    for (const policy of Object.values(config.policies)) {
      if (!policy) continue
      // Helper handles fetching and tracking changes locally
      const result = await updatePolicyRuleSets(policy)
      if (result.changed) configChanged = true
      if (result.errors && result.errors.length) errors.push(...result.errors)

      // Also check rejectRules if they exist (though usually rulesets are in main rules)
      // If rejectRules structure mirrors standard rules, we can try to update them too
      if (policy.rejectRules) {
        // Wrap rejectRules in a pseudo-policy object because updatePolicyRuleSets expects { rules: [] }
        const rejectWrapper = { rules: policy.rejectRules }
        const rejectResult = await updatePolicyRuleSets(rejectWrapper)
        if (rejectResult.changed) configChanged = true
        if (rejectResult.errors && rejectResult.errors.length) errors.push(...rejectResult.errors)
      }
    }
  }

  if (configChanged) {
    await saveConfig(config)
    // saveConfig triggers onChanged -> applyProxySettings
    console.log('Oasis: Updates applied successfully.')
  } else {
    console.log('Oasis: No updates found.')
  }

  return { changed: configChanged, errors }
}

// Listen for Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateRules') {
    console.log('Oasis: Update alarm triggered.')
    await checkUpdates()
  }
})
