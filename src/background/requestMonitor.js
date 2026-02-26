import { loadConfig } from '../common/storage'

// --- Request Monitor for Monitor Page ---
// Background only forwards webRequest events to Monitor page, no storage here.
// Monitor page manages its own in-memory storage (cleared on refresh/close).

chrome.webRequest.onBeforeRequest.addListener(onRequestStartHandler, { urls: ['<all_urls>'] })
chrome.webRequest.onCompleted.addListener(onRequestCompletedHandler, { urls: ['<all_urls>'] })
chrome.webRequest.onBeforeRedirect.addListener(onRequestRedirectHandler, { urls: ['<all_urls>'] })
chrome.webRequest.onErrorOccurred.addListener(onRequestErrorHandler, { urls: ['<all_urls>'] })
console.log('Oasis: Request Monitor initialized (forward-only mode).')

// Check if we should monitor usage (Auto Policy Active AND Monitoring Enabled)
async function shouldMonitorRequest() {
  try {
    const config = await loadConfig()

    // 1. Check if monitoring is enabled globally
    if (!config.behavior?.connectionMonitoring) {
      return { shouldMonitor: false }
    }

    const activeId = config.activeProfileId

    // 2. Check if it's a policy (has rules or defaultProfileId)
    let profile = null
    if (config.policies) {
      profile = config.policies[activeId]
    }

    if (profile && (profile.rules || profile.defaultProfileId)) {
      return { shouldMonitor: true, policyId: activeId }
    }
    return { shouldMonitor: false, policyId: null }
  } catch (e) {
    return { shouldMonitor: false, policyId: null }
  }
}

// Forward request start to Monitor page (only if auto policy active and monitoring enabled)
async function onRequestStartHandler(details) {
  if (details.tabId === -1) return
  if (!details.url.startsWith('http://') && !details.url.startsWith('https://')) return

  const { shouldMonitor } = await shouldMonitorRequest()
  if (!shouldMonitor) return

  broadcastToMonitor({
    type: 'REQUEST_STARTED',
    request: {
      id: details.requestId,
      tabId: details.tabId,
      url: details.url,
      method: details.method || 'GET',
      type: details.type,
      startTime: details.timeStamp,
      endTime: null,
      status: null,
      duration: null,
      redirected: false,
      ip: null,
      fromCache: false,
      matchedRule: null,
      proxyUsed: null
    }
  })
}

// Forward request completion with IP and cache info
async function onRequestCompletedHandler(details) {
  if (details.tabId === -1) return

  const { shouldMonitor } = await shouldMonitorRequest()
  if (!shouldMonitor) return

  broadcastToMonitor({
    type: 'REQUEST_COMPLETED',
    requestId: details.requestId,
    endTime: details.timeStamp,
    status: details.statusCode,
    ip: details.ip || null,
    fromCache: details.fromCache || false
  })
}

// Forward redirect
async function onRequestRedirectHandler(details) {
  if (details.tabId === -1) return

  const { shouldMonitor } = await shouldMonitorRequest()
  if (!shouldMonitor) return

  broadcastToMonitor({
    type: 'REQUEST_REDIRECTED',
    requestId: details.requestId,
    redirectUrl: details.redirectUrl
  })
}

// Forward error
async function onRequestErrorHandler(details) {
  if (details.tabId === -1) return

  const { shouldMonitor } = await shouldMonitorRequest()
  if (!shouldMonitor) return

  broadcastToMonitor({
    type: 'REQUEST_ERROR',
    requestId: details.requestId,
    endTime: details.timeStamp,
    error: details.error
  })
}

function broadcastToMonitor(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Ignore errors if Monitor page is not open
  })
}
