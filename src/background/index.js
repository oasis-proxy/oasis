
import { DEFAULT_CONFIG } from '../common/config'
import { loadConfig, saveConfig } from '../common/storage'
import { generatePacScriptFromPolicy } from '../common/pac'


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
    
    // Helper to process rules in a policy
    const processPolicyRules = async (policyId, rules) => {
        if (!rules || !Array.isArray(rules)) return

        for (const rule of rules) {
            // Check if rule has a subscription URL (RuleSet)
            // Use rule.pattern as the source of truth for URL
            if (rule.ruleType === 'ruleset' && rule.pattern && rule.pattern.trim()) {
                const url = rule.pattern.trim()
                
                try {
                    console.log(`Oasis: Updating RuleSet for policy '${policyId}' from ${url}...`)
                    const response = await fetch(url)
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const text = await response.text()
                    
                    // Initialize ruleSet object if missing (might be stripped by sync)
                    if (!rule.ruleSet) rule.ruleSet = {}
                    
                    const now = Date.now()
                    rule.ruleSet.content = text
                    rule.ruleSet.lastUpdated = now
                    rule.ruleSet.lastFetched = now
                    rule.ruleSet.fetchError = null
                    
                    configChanged = true
                    console.log(`Oasis: Updated RuleSet in policy '${policyId}'. Size: ${text.length} chars.`)
                    
                } catch (e) {
                    console.error(`Oasis: Failed to update RuleSet in policy '${policyId}':`, e)
                    // Ensure ruleSet object exists to store error
                    if (!rule.ruleSet) rule.ruleSet = {}
                    
                    rule.ruleSet.fetchError = e.message
                    rule.ruleSet.lastFetched = Date.now()
                    configChanged = true // Save error state
                }
            }
        }
    }

    // Iterate all policies
    if (config.policies) {
        for (const [policyId, policy] of Object.entries(config.policies)) {
            if (!policy) continue
            await processPolicyRules(policyId, policy.rules)
            await processPolicyRules(policyId, policy.rejectRules)
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


    // Improve type detection for logging
    let profileType = profile.type || 'unknown'
    if (profileType === 'unknown') {
        if (profile.url !== undefined && !profile.rules) {
            profileType = 'pac'
        } else if (profile.rules || profile.defaultProfileId) {
            profileType = 'policy'
        }
    }
    
    console.log(`Oasis: Applying profile '${activeId}' (Type: ${profileType})`)
    const proxyConfig = {}


    try {
        if (profile.type === 'system' || profile.type === 'direct') {
            proxyConfig.mode = profile.type
        } 
        else if (profile.type === 'reject') {
            // Reject Mode -> Point to localhost:65535 or similar
            proxyConfig.mode = 'fixed_servers'
            proxyConfig.rules = {
                singleProxy: {
                    host: profile.host || '127.0.0.1',
                    port: profile.port || 65535,
                    scheme: 'http'
                }
            }
        }
        else if (profile.type === 'server') { // Fixed Proxy
            proxyConfig.mode = 'fixed_servers'
            proxyConfig.rules = {
                singleProxy: {
                    host: profile.host,
                    port: profile.port,
                    scheme: profile.scheme || 'http'
                }
            }
        }
        else if (profile.url !== undefined && !profile.rules) { 
            // PAC Script (Check if it has URL and NO rules, to distinguish from auto/policy if structure is similar)
            proxyConfig.mode = 'pac_script'
            
            // Handle both remote and manual PAC scripts
            if (profile.mode === 'manual' && profile.script) {
                // Manual mode: use script data
                proxyConfig.pacScript = {
                    data: profile.script
                }
            } else if (profile.url) {
                // Remote mode: use URL
                proxyConfig.pacScript = {
                    url: profile.url
                }
            } else {
                // Fallback: empty PAC script returns DIRECT
                proxyConfig.pacScript = {
                    data: 'function FindProxyForURL(url, host) { return "DIRECT"; }'
                }
            }
        }
        else if (profile.rules || profile.defaultProfileId) {
             // Auto Policy
             // Generate PAC script from rules
             const pacScriptData = generatePacScriptFromPolicy(profile, config.proxies || {}) 
             proxyConfig.mode = 'pac_script'
             proxyConfig.pacScript = {
                 data: pacScriptData
             }
        }
        else {
            console.warn('Oasis: Unknown profile type', profile)
            proxyConfig.mode = 'system'
        }

        // Store authentication credentials for current profile
        proxyAuthMap = {}
        
        try {
            if (profile && profile.type === 'server' && profile.auth && profile.auth.username) {
                // Single proxy server
                const key = `${profile.host}:${profile.port}`
                proxyAuthMap[key] = {
                    username: profile.auth.username,
                    password: profile.auth.password || ''
                }
                console.log(`Oasis: Stored auth for proxy ${key}`)
            } else if (profile && profileType === 'policy') {
                // Auto policy - collect credentials from all referenced proxies
                
                // Add default proxy credentials
                if (profile.defaultProfileId && config && config.proxies && config.proxies[profile.defaultProfileId]) {
                    const defaultProxy = config.proxies[profile.defaultProfileId]
                    if (defaultProxy && defaultProxy.auth && defaultProxy.auth.username) {
                        const key = `${defaultProxy.host}:${defaultProxy.port}`
                        proxyAuthMap[key] = {
                            username: defaultProxy.auth.username,
                            password: defaultProxy.auth.password || ''
                        }
                        console.log(`Oasis: Stored auth for default proxy ${key}`)
                    }
                }
                
                // Add credentials from proxies referenced in rules
                if (profile.rules && Array.isArray(profile.rules)) {
                    profile.rules.forEach(rule => {
                        if (rule && rule.proxyId && config && config.proxies && config.proxies[rule.proxyId]) {
                            const proxy = config.proxies[rule.proxyId]
                            if (proxy && proxy.auth && proxy.auth.username) {
                                const key = `${proxy.host}:${proxy.port}`
                                proxyAuthMap[key] = {
                                    username: proxy.auth.username,
                                    password: proxy.auth.password || ''
                                }
                                console.log(`Oasis: Stored auth for rule proxy ${key}`)
                            }
                        }
                    })
                }
                
                const credCount = Object.keys(proxyAuthMap).length
                if (credCount > 0) {
                    console.log(`Oasis: Configured authentication for ${credCount} proxy server(s)`)
                }
            }
        } catch (err) {
            console.error('Oasis: Error collecting proxy credentials:', err)
            proxyAuthMap = {}
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
