import { loadConfig, saveConfig } from '../common/storage'
import { updatePolicyRuleSets } from '../common/ruleset'

/**
 * Parses the config to return a deterministically ordered array of update targets
 * initialized in a 'pending' state. This is used by the UI to render the grid immediately.
 */
export function getUpdateTargets(config) {
  const targets = []
  let counter = 0
  if (config?.pacs) {
    for (const pac of Object.values(config.pacs)) {
      if (pac && pac.mode === 'remote' && pac.url) {
        targets.push({
          id: `pac::${pac.url}::${counter++}`,
          type: 'pac',
          name: pac.name || 'Unnamed PAC',
          url: pac.url,
          status: 'pending',
          message: 'msgPending'
        })
      }
    }
  }
  if (config?.policies) {
    for (const policy of Object.values(config.policies)) {
      if (!policy) continue
      const policyName = policy.name || policy.id || 'Unnamed Policy'
      if (policy.rules) {
        policy.rules.forEach(r => {
          if (r.ruleType === 'ruleset' && r.pattern) {
            targets.push({
              id: `ruleset::${policyName}::${r.pattern}::${counter++}`,
              type: 'ruleset',
              name: policyName,
              policyName,
              url: r.pattern,
              status: 'pending',
              message: 'msgPending'
            })
          }
        })
      }
      if (policy.rejectRules) {
        policy.rejectRules.forEach(r => {
          if (r.ruleType === 'ruleset' && r.pattern) {
            targets.push({
              id: `ruleset::${policyName}(Reject)::${r.pattern}::${counter++}`,
              type: 'ruleset',
              name: `${policyName} (Reject)`,
              policyName,
              url: r.pattern,
              status: 'pending',
              message: 'msgPending'
            })
          }
        })
      }
    }
  }
  return targets
}

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
 * @param {boolean} isManual - Indicates if the update was triggered manually.
 */
export async function checkUpdates(isManual = false, onProgress = null) {
  const config = await loadConfig()
  let configChanged = false
  const errors = []
  const details = []

  // Pre-build a lookup from getUpdateTargets so streamed IDs match exactly
  const targets = getUpdateTargets(config)
  const usedTargetIds = new Set()
  function findTargetId(type, url, policyName) {
    const match = targets.find(t =>
      t.type === type && t.url === url &&
      (policyName ? t.policyName === policyName || t.name === policyName : true) &&
      !usedTargetIds.has(t.id)
    )
    if (match) {
      usedTargetIds.add(match.id)
      return match.id
    }
    return `${type}::${url}::fallback`
  }

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
              const detailObj = {
                id: findTargetId('pac', pac.url, null),
                type: 'pac',
                name: pac.name || 'Unnamed PAC',
                url: pac.url,
                success: true,
                message: 'msgUpdateSuccess'
              }
              details.push(detailObj)
              if (onProgress) onProgress(detailObj)
            } else {
              const detailObj = {
                id: findTargetId('pac', pac.url, null),
                type: 'pac',
                name: pac.name || 'Unnamed PAC',
                url: pac.url,
                success: true,
                message: 'msgNoChanges'
              }
              details.push(detailObj)
              if (onProgress) onProgress(detailObj)
            }
          } else {
            const err = `Failed to fetch PAC '${pac.name}': HTTP ${response.status}`
            console.error(`Oasis: ${err}`)
            errors.push(err)
            const detailObj = {
              id: findTargetId('pac', pac.url, null),
              type: 'pac',
              name: pac.name || 'Unnamed PAC',
              url: pac.url,
              success: false,
              message: `Failed: HTTP ${response.status}`
            }
            details.push(detailObj)
            if (onProgress) onProgress(detailObj)
          }
        } catch (e) {
          const err = `Error updating PAC '${pac.name}': ${e.message}`
          console.error(`Oasis: ${err}`, e)
          errors.push(err)
          const detailObj = {
            id: findTargetId('pac', pac.url, null),
            type: 'pac',
            name: pac.name || 'Unnamed PAC',
            url: pac.url,
            success: false,
            message: `Error: ${e.message}`
          }
          details.push(detailObj)
          if (onProgress) onProgress(detailObj)
        }
      }
    }
  }

  // 2. Update Policy RuleSets
  if (config.policies) {
    for (const policy of Object.values(config.policies)) {
      if (!policy) continue
      // Helper handles fetching and tracking changes locally
      const policyName = policy.name || policy.id || 'Unnamed Policy'
      const result = await updatePolicyRuleSets(policy, isManual, (detail) => {
        if (onProgress) {
          onProgress({
            id: findTargetId('ruleset', detail.url, policyName),
            type: 'ruleset',
            name: policyName,
            policyName,
            ...detail
          })
        }
      })
      if (result.changed) configChanged = true
      if (result.errors && result.errors.length) errors.push(...result.errors)
      if (result.details && result.details.length) {
        details.push(
          ...result.details.map(d => ({
            id: findTargetId('ruleset', d.url, policyName),
            type: 'ruleset',
            name: policyName,
            policyName,
            ...d
          }))
        )
      }

      // Also check rejectRules if they exist (though usually rulesets are in main rules)
      // If rejectRules structure mirrors standard rules, we can try to update them too
      if (policy.rejectRules) {
        // Wrap rejectRules in a pseudo-policy object because updatePolicyRuleSets expects { rules: [] }
        const rejectWrapper = { rules: policy.rejectRules }
        const rejectName = `${policyName} (Reject)`
        const rejectResult = await updatePolicyRuleSets(rejectWrapper, isManual, (detail) => {
          if (onProgress) {
            onProgress({
              id: findTargetId('ruleset', detail.url, rejectName),
              type: 'ruleset',
              name: rejectName,
              policyName,
              ...detail
            })
          }
        })
        if (rejectResult.changed) configChanged = true
        if (rejectResult.errors && rejectResult.errors.length) errors.push(...rejectResult.errors)
        if (rejectResult.details && rejectResult.details.length) {
          details.push(
            ...rejectResult.details.map(d => ({
              id: findTargetId('ruleset', d.url, rejectName),
              type: 'ruleset',
              name: rejectName,
              policyName,
              ...d
            }))
          )
        }
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

  return { changed: configChanged, errors, details }
}

// Listen for Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateRules') {
    console.log('Oasis: Update alarm triggered.')
    await checkUpdates()
  }
})
