import { ref, computed, watch } from 'vue'

export function useMonitorData(historyLimit, matchFn) {
  const requests = ref([])
  const tabs = ref({})

  function getHostname(url) {
    if (!url) return ''
    try { return new URL(url).hostname } catch { return url }
  }

  async function updateTabInfo(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId)
      tabs.value[tabId] = {
        id: tabId,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        lastActivity: Date.now(),
        requestCount: (tabs.value[tabId]?.requestCount || 0) + 1
      }
    } catch {
      tabs.value[tabId] = {
        id: tabId,
        title: `Tab ${tabId}`,
        url: '',
        favIconUrl: '',
        lastActivity: Date.now(),
        requestCount: (tabs.value[tabId]?.requestCount || 0) + 1
      }
    }
  }

  function addRequest(request) {
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
        updateTabInfo(request.tabId)
      } else {
        existingTab.lastActivity = request.startTime
      }
    } else {
      updateTabInfo(request.tabId)
    }

    while (requests.value.length > historyLimit.value) {
      requests.value.shift()
    }
  }

  function updateRequest(requestId, updates) {
    const index = requests.value.findIndex(r => r.id === requestId)
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
    else if (message.type === 'REQUEST_COMPLETED') updateRequest(message.requestId, { endTime: message.endTime, status: message.status, duration: message.duration, ip: message.ip, fromCache: message.fromCache })
    else if (message.type === 'REQUEST_REDIRECTED') updateRequest(message.requestId, { redirected: true, redirectUrl: message.redirectUrl })
    else if (message.type === 'REQUEST_ERROR') updateRequest(message.requestId, { endTime: message.endTime, status: 0, error: message.error })
  }

  function clearRequests(tabId = null) {
    if (tabId !== null) {
      requests.value = requests.value.filter(r => r.tabId !== tabId)
      if (requests.value.filter(r => r.tabId === tabId).length === 0) delete tabs.value[tabId]
    } else {
      requests.value = []
      tabs.value = {}
    }
  }

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
