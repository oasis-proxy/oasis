import { loadConfig } from '../common/storage'

let isMonitoringEnabled = false
const monitorMap = new Map() // tabId -> Map<domain, { ips: Set<string>, types: Set<string> }>

// Helper to update monitoring state
export async function updateMonitoringState() {
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
