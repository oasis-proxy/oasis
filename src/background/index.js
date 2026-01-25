
import { DEFAULT_CONFIG } from '../common/config'
import { loadConfig, saveConfig } from '../common/storage'
import { generatePacScript } from '../common/pac'
import { parseAutoProxyRules } from '../common/autoproxy'

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
    
    // Helper to process a list of sets
    const processSets = async (sets) => {
        if (!sets) return
        for (const set of sets) {
            if (!set.enabled || !set.url) continue
            
            // Optimization: Skip if updated recently (if triggered manually but not enough time passed?)
            // For now we assume this function is called when we WANT to update (alarm or manual)
            // But we could check set.lastUpdated vs config.update.interval
            
            try {
                console.log(`Oasis: Updating rule set '${set.id}' from ${set.url}...`)
                const response = await fetch(set.url)
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                const text = await response.text()
                
                let rules = []
                if (set.format === 'autoproxy') {
                    rules = parseAutoProxyRules(text)
                } 
                // Add more formats here if needed
                
                // Update the set object
                set.rules = rules
                set.lastUpdated = Date.now()
                configChanged = true
                console.log(`Oasis: Updated '${set.id}'. Found ${rules.length} rules.`)
                
            } catch (e) {
                console.error(`Oasis: Failed to update rule set '${set.id}':`, e)
            }
        }
    }

    await processSets(config.auto.rejectRuleSets)
    await processSets(config.auto.proxyRuleSets)

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
    
    // 2. Check Arrays (Proxies, PACs, Policies)
    if (!profile && config.proxies) {
        profile = config.proxies.find(p => p.id === activeId)
    }
    if (!profile && config.pacs) {
        profile = config.pacs.find(p => p.id === activeId)
    }
    if (!profile && config.policies) {
        profile = config.policies.find(p => p.id === activeId)
    }

    if (!profile) {
        console.warn(`Oasis: Active profile '${activeId}' not found. Falling back to system.`)
        await chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' })
        return
    }

    console.log(`Oasis: Applying profile '${activeId}' (Type: ${profile.type || 'unknown'})`)
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
            // Ideally we should have explicit 'type' on all objects. 
            // Assuming PAC object has 'url' and maybe type='pac' (we didn't strictly define type for PAC in DEFAULT, but we can infer)
            proxyConfig.mode = 'pac_script'
            proxyConfig.pacScript = {
                url: profile.url
            }
        }
        else if (profile.rules || profile.defaultProfileId) {
             // Auto Policy
             // Generate PAC script from rules
             const pacScriptData = generatePacScript(config, profile) // Pass full config + specific policy
             proxyConfig.mode = 'pac_script'
             proxyConfig.pacScript = {
                 data: pacScriptData
             }
        }
        else {
            console.warn('Oasis: Unknown profile type', profile)
            proxyConfig.mode = 'system'
        }

        // Apply to Chrome
        await chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' })
        console.log('Oasis: Proxy settings applied successfully.', proxyConfig)

    } catch (err) {
        console.error('Oasis: Failed to apply proxy settings:', err)
    }
}
