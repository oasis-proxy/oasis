import { ref, computed, watch, onUnmounted } from 'vue'

export function useMonitorData(historyLimit, matchFn) {
  const requests = ref([])
  const tabs = ref({})

  function getHostname(url) {
    if (!url) return ''
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  function isHttpTab(url) {
    if (!url || typeof url !== 'string') return false
    return url.startsWith('http://') || url.startsWith('https://')
  }

  async function updateTabInfo(tabId, fallbackUrl) {
    try {
      const tab = await chrome.tabs.get(tabId)
      let url = tab.url || tab.pendingUrl || ''
      
      // If the URL isn't HTTP, but we have a valid fallback (e.g., from a main_frame request)
      // we use it to initialize the tab.
      if (!isHttpTab(url) && fallbackUrl && isHttpTab(fallbackUrl)) {
        url = fallbackUrl
      }
      
      // Final validation
      if (!isHttpTab(url)) return

      tabs.value[tabId] = {
        id: tabId,
        title: tab.title,
        url,
        favIconUrl: tab.favIconUrl,
        lastActivity: Date.now()
      }
    } catch {
      // chrome.tabs.get failed — tab is likely closed.
      const existing = tabs.value[tabId]
      if (!existing) return
      tabs.value[tabId] = {
        ...existing,
        lastActivity: Date.now(),
        closed: existing.closed ?? false
      }
    }
  }

  async function addRequest(request) {
    // Rely mostly on background filter, but handle any edge cases where
    // a non-HTTP transition isn't caught.
    let tabUrl = ''
    try {
      const tab = await chrome.tabs.get(request.tabId)
      tabUrl = tab.url || tab.pendingUrl || ''
    } catch {}

    const isHttp = isHttpTab(tabUrl)
    
    // If it's a completely new tab that isn't HTTP yet, we only track it
    // if this request is representing the navigation to a new valid page.
    if (!isHttp && request.type !== 'main_frame' && !tabs.value[request.tabId]) {
      return // Drop background noise from non-HTTP idle tabs
    }
    const { rule, proxy, ruleSource } = matchFn(request.url)
    request.matchedRule = rule
    request.proxyUsed = proxy
    request.ruleSource = ruleSource
    request.domain = getHostname(request.url)

    requests.value.push(request)

    const existingTab = tabs.value[request.tabId]
    if (existingTab) {
      const requestDomain = getHostname(request.url)
      const tabDomain = getHostname(existingTab.url)
      if (requestDomain && tabDomain && requestDomain !== tabDomain) {
        updateTabInfo(request.tabId, request.url)
      } else {
        existingTab.lastActivity = request.startTime
      }
    } else {
      updateTabInfo(request.tabId, request.url)
    }

    while (requests.value.length > historyLimit.value) {
      requests.value.shift()
    }
  }

  function updateRequest(requestId, updates) {
    const index = requests.value.findIndex((r) => r.id === requestId)
    if (index !== -1) {
      const req = requests.value[index]
      const newRequest = { ...req, ...updates }
      if (newRequest.startTime && newRequest.endTime && !newRequest.duration) {
        newRequest.duration = Math.round(newRequest.endTime - newRequest.startTime)
      }
      requests.value[index] = newRequest
    }
  }

  function handleMessage(message) {
    if (message.type === 'REQUEST_STARTED') addRequest(message.request)
    else if (message.type === 'REQUEST_COMPLETED')
      updateRequest(message.requestId, {
        endTime: message.endTime,
        status: message.status,
        duration: message.duration,
        ip: message.ip,
        fromCache: message.fromCache
      })
    else if (message.type === 'REQUEST_REDIRECTED')
      updateRequest(message.requestId, { redirected: true, redirectUrl: message.redirectUrl })
    else if (message.type === 'REQUEST_ERROR')
      updateRequest(message.requestId, {
        endTime: message.endTime,
        status: 0,
        error: message.error
      })
  }

  function clearRequests(tabId = null) {
    if (tabId !== null) {
      requests.value = requests.value.filter((r) => r.tabId !== tabId)
      if (requests.value.filter((r) => r.tabId === tabId).length === 0) delete tabs.value[tabId]
    } else {
      requests.value = []
      tabs.value = {}
    }
  }

  // When a tracked tab finishes loading, refresh its title/URL.
  // This handles tabs opened via right-click ("Open in new tab") where the
  // initial updateTabInfo call races against page load and only sees "New Tab".
  function onTabUpdated(tabId, changeInfo) {
    if (changeInfo.status === 'complete' && tabs.value[tabId]) {
      updateTabInfo(tabId)
    }
  }
  chrome.tabs.onUpdated.addListener(onTabUpdated)

  // When a tracked tab is closed, mark it as closed rather than removing it.
  // The sidebar will show a 'Closed' badge for these tabs.
  function onTabRemoved(tabId) {
    if (tabs.value[tabId]) {
      tabs.value[tabId] = { ...tabs.value[tabId], closed: true }
    }
  }
  chrome.tabs.onRemoved.addListener(onTabRemoved)

  onUnmounted(() => {
    chrome.tabs.onUpdated.removeListener(onTabUpdated)
    chrome.tabs.onRemoved.removeListener(onTabRemoved)
  })

  watch(historyLimit, (newLimit) => {
    while (requests.value.length > newLimit) requests.value.shift()
  })

  return {
    requests,
    tabs,
    handleMessage,
    clearRequests,
    getHostname
  }
}
