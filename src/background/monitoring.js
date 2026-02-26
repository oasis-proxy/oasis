import { loadConfig } from '../common/storage'

// Helper to resolve monitoring state on-the-fly to handle Service Worker restarts (P1)
async function isMonitoringActive() {
  const config = await loadConfig()
  return config.behavior && config.behavior.connectionMonitoring
}

const monitorMap = new Map() // tabId -> Map<domain, { ips: Set<string>, types: Set<string> }>

// Keep for compatibility but we don't use it to unregister listeners anymore
export async function updateMonitoringState() {
  const enabled = await isMonitoringActive()
  if (!enabled) {
    console.log('Oasis: Monitoring disabled.')
    
    // Clear in-memory Map
    monitorMap.clear()
    
    // Clear ONLY monitor_* keys to avoid wiping other session data (P2)
    const sessionData = await chrome.storage.session.get(null)
    const monitorKeys = Object.keys(sessionData).filter(key => key.startsWith('monitor_'))
    if (monitorKeys.length > 0) {
      await chrome.storage.session.remove(monitorKeys)
    }
  } else {
    console.log('Oasis: Monitoring enabled.')
  }
}

// Statically register events to avoid service worker sleep issues in MV3
chrome.webRequest.onCompleted.addListener(onCompletedHandler, { urls: ['<all_urls>'] })
chrome.webRequest.onErrorOccurred.addListener(onErrorOccurredHandler, { urls: ['<all_urls>'] })
chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigateHandler)
chrome.tabs.onRemoved.addListener(onTabRemovedHandler)

// Handlers
async function onCompletedHandler(details) {
  const active = await isMonitoringActive()
  if (!active || details.tabId === -1) return

  try {
    const url = new URL(details.url)
    const domain = url.hostname
    const ip = details.ip || ''

    // Store in memory
    let tabData = monitorMap.get(details.tabId)
    if (!tabData) {
      tabData = new Map()
      monitorMap.set(details.tabId, tabData)
    }

    let domainData = tabData.get(domain)
    let isNewDomain = false
    if (!domainData) {
      domainData = { ip: '', error: '' }
      tabData.set(domain, domainData)
      isNewDomain = true
    }

    // Update to latest IP, clear error if success
    if (isNewDomain || (ip && domainData.ip !== ip) || domainData.error) {
      if (ip) {
        domainData.ip = ip
      }
      domainData.error = ''
      scheduleSessionSync(details.tabId)
    }
  } catch (e) {
    // Ignore invalid URLs
  }
}

async function onErrorOccurredHandler(details) {
  const active = await isMonitoringActive()
  if (!active || details.tabId === -1) return

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

async function onBeforeNavigateHandler(details) {
  const active = await isMonitoringActive()
  if (!active) return
  // Clear data for this tab on main frame navigation
  if (details.frameId === 0) {
    monitorMap.delete(details.tabId)
    scheduleSessionSync(details.tabId)
  }
}

async function onTabRemovedHandler(tabId) {
  const active = await isMonitoringActive()
  if (!active) return
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
