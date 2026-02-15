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
                        console.error(`Oasis: Failed to fetch PAC '${pac.name}': HTTP ${response.status}`)
                    }
                } catch (e) {
                    console.error(`Oasis: Error updating PAC '${pac.name}':`, e)
                }
            }
        }
    }

    // 2. Update Policy RuleSets
    if (config.policies) {
        for (const policy of Object.values(config.policies)) {
            if (!policy) continue
            // Helper handles fetching and tracking changes locally
            const changed = await updatePolicyRuleSets(policy)
            if (changed) configChanged = true
            
            // Also check rejectRules if they exist (though usually rulesets are in main rules)
            // If rejectRules structure mirrors standard rules, we can try to update them too
            if (policy.rejectRules) {
                 // Wrap rejectRules in a pseudo-policy object because updatePolicyRuleSets expects { rules: [] }
                 const rejectWrapper = { rules: policy.rejectRules }
                 const rejectChanged = await updatePolicyRuleSets(rejectWrapper)
                 if (rejectChanged) configChanged = true
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
}

// Listen for Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'updateRules') {
        console.log('Oasis: Update alarm triggered.')
        await checkUpdates()
    }
})
