/* global chrome */
import { DEFAULT_CONFIG, ProxyMode } from '../common/config'
import { loadConfig, saveConfig } from '../common/storage'
import { generatePacScript } from '../common/pac'
import { parseAutoProxy } from '../common/autoproxy'

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  const config = await loadConfig()
  // If config is effectively empty/default (check a key), insure it's saved?
  // loadConfig already merges with DEFAULT, but if storage is empty, we might want to explictly save
  // to ensure subsequent reads find it.
  // actually loadConfig returns DEFAULT_CONFIG if storage is empty.
  // We can just forcefully save it if we want to ensure it's persisted.
  const stored = await chrome.storage.local.get('proxyConfig')
  if (!stored.proxyConfig) {
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
    if (area === 'local' && changes.proxyConfig) {
        console.log('Oasis: Config changed, re-applying settings...')
        const config = await loadConfig()
        
        // 0. Update Alarms if interval changed
        const newInterval = config.update && config.update.interval
        const oldInterval = changes.proxyConfig.oldValue && changes.proxyConfig.oldValue.update && changes.proxyConfig.oldValue.update.interval
        
        if (newInterval !== oldInterval) {
            setupUpdateAlarm(newInterval)
        }

        // 1. Re-apply Proxy Settings
        await applyProxySettings(config)
        
        // 2. Handle Refresh on Switch behavior
        if (config.behavior && config.behavior.refreshOnSwitch) {
             const oldConfig = changes.proxyConfig.oldValue
             // Check if mode or active proxy changed
             if (oldConfig && (oldConfig.mode !== config.mode || 
                (config.mode === ProxyMode.FIXED && oldConfig.fixed.activeProxyId !== config.fixed.activeProxyId))) {
                 try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    if (tab && tab.id) {
                        chrome.tabs.reload(tab.id)
                    }
                 } catch (e) {
                     console.warn('Oasis: Failed to refresh tab', e)
                 }
             }
        }

        // 3. Handle Auto Sync (Local -> Sync)
        if (config.sync && config.sync.enabled) {
            try {
                const syncData = { proxyConfig: changes.proxyConfig.newValue }
                await chrome.storage.sync.set(syncData)
            } catch (e) {
                console.warn('Oasis: Failed to sync to cloud', e)
            }
        }
    }
    // Note: Session storage changes (temp rules) also need to trigger re-apply?
    // Yes, if we are in AUTO mode.
    if (area === 'session' && changes.tempRules) {
         console.log('Oasis: Temp rules changed, re-applying settings...')
         const config = await loadConfig()
         // loadConfig merges session rules automatically
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
                    rules = parseAutoProxy(text)
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
    const mode = config.mode
    const proxyConfig = {}

    console.log(`Oasis: Applying proxy mode '${mode}'`)

    try {
        switch (mode) {
            case ProxyMode.FIXED: {
                const activeId = config.fixed.activeProxyId
                const proxy = config.proxies[activeId]
                
                if (!proxy) {
                    console.warn(`Oasis: Fixed proxy profile '${activeId}' not found. Falling back to direct.`)
                    proxyConfig.mode = 'direct'
                    break
                }
                
                if (proxy.type === 'direct' || proxy.type === 'system') {
                     // For fixed mode, 'direct' means direct connection
                     // 'system' means use system settings
                     proxyConfig.mode = proxy.type
                } else if (proxy.type === 'reject') {
                    // Fixed Reject Mode
                     proxyConfig.mode = 'fixed_servers'
                     proxyConfig.rules = {
                         singleProxy: {
                             host: proxy.host || '127.0.0.1',
                             port: proxy.port || 65535,
                             scheme: 'http' 
                         }
                     }
                } else {
                    // Fixed Server Mode
                    proxyConfig.mode = 'fixed_servers'
                    proxyConfig.rules = {
                        singleProxy: {
                            host: proxy.host,
                            port: proxy.port,
                            scheme: proxy.scheme || 'http'
                        }
                    }
                }
                break
            }
            
            case ProxyMode.PAC: {
                proxyConfig.mode = 'pac_script'
                proxyConfig.pacScript = {
                    url: config.pac.url
                }
                break
            }
            
            case ProxyMode.AUTO: {
                // Generate PAC script
                const pacScriptData = generatePacScript(config)
                proxyConfig.mode = 'pac_script'
                proxyConfig.pacScript = {
                    data: pacScriptData
                }
                break
            }
            
            default:
                // Fallback or Unknown
                console.warn(`Oasis: Unknown mode '${mode}'. Falling back to system.`)
                proxyConfig.mode = 'system'
        }

        // Apply to Chrome
        // scope: 'regular' is standard for extensions
        await chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' })
        console.log('Oasis: Proxy settings applied successfully.', proxyConfig)
        
    } catch (err) {
        console.error('Oasis: Failed to apply proxy settings:', err)
    }
}
