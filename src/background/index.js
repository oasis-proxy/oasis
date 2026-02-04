
import { DEFAULT_CONFIG } from '../common/config'
import { loadConfig, saveConfig } from '../common/storage'
import { updatePolicyRuleSets } from '../common/ruleset'
import { createProxyConfig, collectProxyCredentials } from '../common/proxy_config'


// Store proxy authentication credentials
// Map structure: "host:port" -> { username, password }
let proxyAuthMap = {}

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  const config = await loadConfig()
  // If config is effectively empty/default (check a key), insure it's saved?
  // loadConfig already merges with DEFAULT, but if storage is empty, we might want to explictly save
  // to ensure subsequent reads find it.
  // actually loadConfig returns DEFAULT_CONFIG if storage is empty.
  // We can just forcefully save it if we want to ensure it's persisted.
  const stored = await chrome.storage.local.get('config')
  if (!stored.config) {
      await saveConfig(DEFAULT_CONFIG)
      console.log('Oasis: Initialized default configuration.')
  }
  
  // Apply settings immediately
  await applyProxySettings(config)
})

// Listen for startup to re-apply settings (in case browser cleared them or something)
chrome.runtime.onStartup.addListener(async () => {
    const config = await loadConfig()
    await applyProxySettings(config)
})

// Listen for configuration changes
chrome.storage.onChanged.addListener(async (changes, area) => {
    // Check if any relevant key changed
    const meaningfulKeys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
    const hasChange = meaningfulKeys.some(key => changes[key])

    if (area === 'local' && hasChange) {
        console.log('Oasis: Config changed, re-applying settings...')
        const config = await loadConfig()
        
        // 0. Update Alarms if interval changed
        const newInterval = config.update && config.update.interval
        // We can't easily get 'oldInterval' without loading old config from 'changes' which is fragmented
        // For simplicity, we just safely re-setup alarm. It clears old one anyway.
        if (newInterval !== undefined) {
             setupUpdateAlarm(newInterval)
        }

        // 1. Re-apply Proxy Settings
        await applyProxySettings(config)
        
        // 2. Refresh logic - simplified for refactor
        if (config.behavior && config.behavior.refreshOnSwitch) {
            // Need robust logic to detect ID switch, but complex with fragmented changes.
            // Skipping automatic refresh implementation details for this step to focus on schema refactor stability.
            // Implementation can be re-added later.
        }

        // 3. Handle Auto Sync (Local -> Sync)
        if (config.sync && config.sync.enabled) {
            // We need to sync ALL keys? Or just the changed one?
            // Sync logic needs update to handle multiple keys.
            // Disabling sync logic temporarily for refactor safety.
            // TODO: Re-implement sync with new schema.
        }
    }

    if (area === 'session' && changes.tempRules) {
         console.log('Oasis: Temp rules changed, re-applying settings...')
         const config = await loadConfig()
         await applyProxySettings(config)
    }
})

// Listen for Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'updateRules') {
        console.log('Oasis: Update alarm triggered.')
        await checkUpdates()
    }
})

/**
 * Setup or clear the update alarm.
 * @param {number} intervalMinutes 
 */
async function setupUpdateAlarm(intervalMinutes) {
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
 * Check and update external rule sets.
 */
async function checkUpdates() {
    const config = await loadConfig()
    let configChanged = false
    
    // Iterate all policies
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
    }
}


/**
 * Apply proxy settings based on configuration.
 * @param {object} config 
 */
async function applyProxySettings(config) {
    const activeId = config.activeProfileId
    let profile = null

    // 1. Check Singletons
    if (activeId === 'system') profile = config.system
    else if (activeId === 'direct') profile = config.direct
    else if (activeId === 'reject') profile = config.reject
    
    // 2. Check Maps (Proxies, PACs, Policies)
    if (!profile && config.proxies) {
        profile = config.proxies[activeId]
    }
    if (!profile && config.pacs) {
        profile = config.pacs[activeId]
    }
    if (!profile && config.policies) {
        profile = config.policies[activeId]
    }

    if (!profile) {
        console.warn(`Oasis: Active profile '${activeId}' not found. Falling back to system.`)
        await chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' })
        return
    }
    
    // Use helper to generate proxy config
    const proxyConfig = createProxyConfig(profile, config)
    
    console.log(`Oasis: Applying profile '${activeId}'`)

    try {
        if (!proxyConfig) {
             console.warn('Oasis: Generated proxy config is invalid. Falling back to system.')
             await chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' })
             return
        }

        // Store authentication credentials for current profile
        proxyAuthMap = collectProxyCredentials(profile, config)
        
        const credCount = Object.keys(proxyAuthMap).length
        if (credCount > 0) {
            console.log(`Oasis: Configured authentication for ${credCount} proxy server(s)`)
        }

        // Apply to Chrome
        await chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' })
        console.log('Oasis: Proxy settings applied successfully.', proxyConfig)

    } catch (err) {
        console.error('Oasis: Failed to apply proxy settings:', err)
    }
}

// Proxy authentication handler
chrome.webRequest.onAuthRequired.addListener(
    (details) => {
        // Only handle proxy authentication
        if (!details.isProxy) {
            return {}
        }
        
        // Extract proxy host and port from challenger
        const challenger = details.challenger
        if (challenger && challenger.host && challenger.port) {
            const key = `${challenger.host}:${challenger.port}`
            const credentials = proxyAuthMap[key]
            
            if (credentials) {
                console.log(`Oasis: Providing auth for proxy ${key}`)
                return { authCredentials: credentials }
            } else {
                console.warn(`Oasis: No credentials found for proxy ${key}`)
            }
        }
        
        return {}
    },
    { urls: ['<all_urls>'] },
    ['blocking']
)

// Listen for messages from options/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_URL') {
        fetch(request.url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.text()
            })
            .then(text => sendResponse({ success: true, text }))
            .catch(error => sendResponse({ success: false, error: error.message }))
        return true // Keep channel open for async response
    }
})
