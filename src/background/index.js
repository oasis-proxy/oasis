
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
  await updateContextMenus(config)
  await updateMonitoringState()
})

// Listen for startup to re-apply settings (in case browser cleared them or something)
chrome.runtime.onStartup.addListener(async () => {
    const config = await loadConfig()
    await applyProxySettings(config)
    await updateContextMenus(config)
    await updateMonitoringState()
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

        // Clear temporary rules when active profile changes (detected by re-application)
        // Wait, 'changes' object only tells us what CHANGED. 
        // If activeProfileId changed, we should clear it.
        // We can check if `config.activeProfileId` was part of the change?
        // Let's look at `changes` argument.
        // But `changes` is not available inside `applyProxySettings`.
        // We are inside `onChanged` here.
        if (changes.config && changes.config.newValue && changes.config.oldValue) {
             if (changes.config.newValue.activeProfileId !== changes.config.oldValue.activeProfileId) {
                 await chrome.storage.session.remove('tempRules')
                 console.log('Oasis: Active profile changed, cleared temporary rules.')
             }
        }


        // 3. Update Monitoring State
        await updateMonitoringState()

        // 4. Update Context Menus
        await updateContextMenus(config)

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

// --- Context Menu Logic ---

/**
 * Update Context Menus based on configuration.
 * @param {object} config 
 */
async function updateContextMenus(config) {
    // Always clear first to avoid duplicates or stale state
    await chrome.contextMenus.removeAll()

    if (config.ui && config.ui.showContextMenu) {
        chrome.contextMenus.create({
            id: 'oasis-quick-add',
            title: 'Add domain to Oasis',
            contexts: ['page', 'link']
        })
        console.log('Oasis: Context menu enabled.')
    } else {
        console.log('Oasis: Context menu disabled.')
    }
}

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === 'oasis-quick-add') {
        let targetUrl = ''
        
        // Prioritize link URL, fallback to page URL
        if (info.linkUrl) {
            targetUrl = info.linkUrl
        } else if (info.pageUrl) {
            targetUrl = info.pageUrl
        }

        if (targetUrl) {
            try {
                const url = new URL(targetUrl)
                const domain = url.hostname
                
                // Store intent
                await chrome.storage.session.set({
                    quickAddIntent: {
                        domain: domain,
                        timestamp: Date.now()
                    }
                })
                
                // Open Popup (MV3)
                // Note: requires Chrome 99+
                try {
                    await chrome.action.openPopup()
                } catch (e) {
                    console.warn('Oasis: Failed to open popup programmatically (might require user gesture or newer Chrome):', e)
                    // Fallback could be creating a window, but standard flow usually assumes user clicks extension icon if this fails
                    // or we notify via badge? User requested "popup".
                }

            } catch (e) {
                console.warn('Oasis: Invalid URL in context menu action:', targetUrl)
            }
        }
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
 * Check and update external rule sets and PAC scripts.
 */
async function checkUpdates() {
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

    // Checking if it's an Auto Policy (implicit type check)
    // Same check as in createProxyConfig: profile.rules || profile.defaultProfileId
    if (profile.rules || profile.defaultProfileId) {
        try {
            const sessionData = await chrome.storage.session.get('tempRules')
            if (sessionData && sessionData.tempRules) {
                profile.tempRules = sessionData.tempRules
                console.log(`Oasis: Injected ${profile.tempRules.length} temporary rules into policy.`)
            }
        } catch (e) {
            console.warn('Oasis: Failed to load temporary rules:', e)
        }
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
        
        // Update Extension Badge
        const name = profile.name || profile.label || profile.id
        const shortName = name.length > 3 ? name.substring(0, 3) + '..' : name
        const color = profile.color || '#4b5563' // Default gray
        
        await chrome.action.setBadgeText({ text: shortName })
        await chrome.action.setBadgeBackgroundColor({ color: color })

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

// --- Monitoring Logic ---

let isMonitoringEnabled = false
const monitorMap = new Map() // tabId -> Map<domain, { ips: Set<string>, types: Set<string> }>

// Helper to update monitoring state
async function updateMonitoringState() {
    const config = await loadConfig()
    const enabled = config.behavior && config.behavior.connectionMonitoring
    
    if (enabled && !isMonitoringEnabled) {
        startMonitoring()
    } else if (!enabled && isMonitoringEnabled) {
        stopMonitoring()
    }
    isMonitoringEnabled = !!enabled
}

function startMonitoring() {
    chrome.webRequest.onResponseStarted.addListener(
        onResponseStartedHandler,
        { urls: ["<all_urls>"] }
    )
    chrome.webRequest.onErrorOccurred.addListener(
        onErrorOccurredHandler,
        { urls: ["<all_urls>"] }
    )
    chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)
    chrome.tabs.onRemoved.addListener(onTabRemovedHandler)
    console.log("Oasis: Monitoring started.")
}

function stopMonitoring() {
    if (chrome.webRequest.onResponseStarted.hasListener(onResponseStartedHandler)) {
        chrome.webRequest.onResponseStarted.removeListener(onResponseStartedHandler)
    }
    if (chrome.webRequest.onErrorOccurred.hasListener(onErrorOccurredHandler)) {
        chrome.webRequest.onErrorOccurred.removeListener(onErrorOccurredHandler)
    }
    if (chrome.webNavigation.onBeforeNavigate.hasListener(onBeforeNavigateHandler)) {
        chrome.webNavigation.onBeforeNavigate.removeListener(onBeforeNavigateHandler)
    }
    if (chrome.tabs.onRemoved.hasListener(onTabRemovedHandler)) {
        chrome.tabs.onRemoved.removeListener(onTabRemovedHandler)
    }
    // Clear storage
    monitorMap.clear()
    chrome.storage.session.clear() 
    console.log("Oasis: Monitoring stopped.")
}

// Handlers
function onResponseStartedHandler(details) {
    if (details.tabId === -1 || !details.ip) return

    try {
        const url = new URL(details.url)
        const domain = url.hostname
        const ip = details.ip

        // Store in memory
        let tabData = monitorMap.get(details.tabId)
        if (!tabData) {
            tabData = new Map()
            monitorMap.set(details.tabId, tabData)
        }

        let domainData = tabData.get(domain)
        if (!domainData) {
            domainData = { ip: '', error: '' }
            tabData.set(domain, domainData)
        }
        
        // Update to latest IP, clear error if success
        if (domainData.ip !== ip || domainData.error) {
            domainData.ip = ip
            domainData.error = ''
            scheduleSessionSync(details.tabId)
        }
    } catch (e) {
        // Ignore invalid URLs
    }
}

function onErrorOccurredHandler(details) {
    if (details.tabId === -1) return

    try {
        const url = new URL(details.url)
        const domain = url.hostname
        const error = details.error

        let tabData = monitorMap.get(details.tabId)
        if (!tabData) {
            tabData = new Map()
            monitorMap.set(details.tabId, tabData)
        }

        let domainData = tabData.get(domain)
        if (!domainData) {
            domainData = { ip: '', error: '' }
            tabData.set(domain, domainData)
        }

        if (domainData.error !== error) {
            domainData.error = error
            scheduleSessionSync(details.tabId)
        }
    } catch (e) {
        // Ignore
    }
}

function onBeforeNavigateHandler(details) {
    // Clear data for this tab on main frame navigation
    if (details.frameId === 0) {
        monitorMap.delete(details.tabId)
        scheduleSessionSync(details.tabId)
    }
}

function onTabRemovedHandler(tabId) {
    monitorMap.delete(tabId)
    // Remove from session storage immediately
    const key = `monitor_${tabId}`
    chrome.storage.session.remove(key)
}

// Throttling / Batching Sync
const pendingSyncs = new Set() // Set<tabId>
let syncTimer = null

function scheduleSessionSync(tabId) {
    pendingSyncs.add(tabId)
    if (!syncTimer) {
        syncTimer = setTimeout(syncToSessionStorage, 500)
    }
}

async function syncToSessionStorage() {
    syncTimer = null
    const updates = {}
    const removals = []

    for (const tabId of pendingSyncs) {
        const tabData = monitorMap.get(tabId)
        const key = `monitor_${tabId}`
        
        if (!tabData) {
            // Tab data cleared
            removals.push(key)
        } else {
            // Convert Map to JSON-friendly structure
            const list = []
            for (const [domain, data] of tabData.entries()) {
                list.push({ 
                    domain, 
                    ip: data.ip,
                    error: data.error
                })
            }
            updates[key] = list
        }
    }
    
    pendingSyncs.clear()

    if (removals.length > 0) {
        await chrome.storage.session.remove(removals)
    }
    if (Object.keys(updates).length > 0) {
        await chrome.storage.session.set(updates)
    }
}
