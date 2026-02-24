<template>
  <!-- Global Notifications -->
  <div v-if="showNotification" class="ui-toast-container">
    <div :class="['ui-toast-simple-badge animate-fade-in', notificationType]">
      <i class="bi bi-check2 me-1"></i> {{ notificationText }}
    </div>
  </div>

  <PopupHeader
    v-model:currentTab="currentTab"
    :showMonitorTab="showMonitorTab"
    :showQuickTab="showQuickTab"
    @openSidePanel="openSidePanel"
    @openMonitor="openMonitor"
    @openOptions="openOptions"
  />

  <main class="popup-main">
    <ProxyTab
      v-if="currentTab === 'proxy'"
      :activeProfileId="activeProfileId"
      :hostProxies="hostProxies"
      :pacScripts="pacScripts"
      :autoPolicies="autoPolicies"
      @select="selectProfile"
    />

    <MonitorTab
      v-if="currentTab === 'monitor'"
      :isProtocolSupported="isProtocolSupported"
      :monitorResult="monitorResult"
      :ipTags="config?.ipTags"
      @copy="copyDomain"
    />

    <QuickTab
      v-if="currentTab === 'quick'"
      :failedDomains="failedDomains"
      v-model="selectedDomains"
      v-model:proxyId="quickProxyId"
      v-model:destination="quickDestination"
      :proxyOptions="proxyOptions"
      @cancel="currentTab = 'proxy'"
      @confirm="confirmQuickAdd"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { t } from '../common/i18n'
import { loadConfig, saveConfig } from '../common/storage'

// Components
import PopupHeader from '../components/popup/PopupHeader.vue'
import ProxyTab from '../components/popup/ProxyTab.vue'
import MonitorTab from '../components/popup/MonitorTab.vue'
import QuickTab from '../components/popup/QuickTab.vue'

const config = ref(null)
const activeProfileId = ref('direct')
const currentTab = ref('proxy')
const monitorResult = ref([])
const activeTabId = ref(null)
const currentTabUrl = ref('')
const showNotification = ref(false)
const notificationText = ref('')
const notificationType = ref('')
let notificationTimer = null

// Quick Add State
const selectedDomains = ref([])
const quickProxyId = ref('direct')
const quickDestination = ref('policy')
const contextMenuDomain = ref(null)

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (theme === 'auto') {
    root.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    root.classList.add(theme === 'dark' ? 'dark' : 'light')
  }
}

const handleSystemThemeChange = () => {
  if (config.value?.ui?.theme === 'auto') applyTheme('auto')
}

// Revert to storage-based monitor (compatible with background/monitoring.js)
const storageListener = (changes, area) => {
  if (area === 'local' && changes.config?.newValue?.ui?.theme) {
    applyTheme(changes.config.newValue.ui.theme)
  }
  if (area === 'session' && activeTabId.value) {
    const key = `monitor_${activeTabId.value}`
    if (changes[key]) {
      monitorResult.value = changes[key].newValue || []
    }
  }
}

onMounted(async () => {
  config.value = await loadConfig()
  activeProfileId.value = config.value.activeProfileId || 'direct'
  applyTheme(config.value.ui?.theme || 'light')

  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', handleSystemThemeChange)
  chrome.storage.onChanged.addListener(storageListener)

  // Quick Add Intent
  const session = await chrome.storage.session.get('quickAddIntent')
  if (session?.quickAddIntent && Date.now() - session.quickAddIntent.timestamp < 10000) {
    contextMenuDomain.value = session.quickAddIntent.domain
    currentTab.value = 'quick'
    if (['sidepanel', 'context-menu'].includes(session.quickAddIntent.source)) {
      quickDestination.value = 'temporary'
    }
    await chrome.storage.session.remove('quickAddIntent')
  }

  // Get Active Tab
  let tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length === 0) {
    // Fallback for some contexts
    tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  }

  if (tabs.length > 0) {
    activeTabId.value = tabs[0].id
    currentTabUrl.value = tabs[0].url
  }

  if (showMonitorTab.value && !contextMenuDomain.value) {
    currentTab.value = 'monitor'
    loadMonitorData()
  }
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(storageListener)
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .removeEventListener('change', handleSystemThemeChange)
})

// Computed Profiles
const hostProxies = computed(() => {
  if (!config.value?.proxies) return []
  return Object.values(config.value.proxies)
    .filter((p) => p.showInPopup !== false || activeProfileId.value === p.id)
    .map((p) => ({
      id: p.id,
      name: p.label || p.host || 'Unnamed',
      icon: 'bi-pc-display',
      color: p.color
    }))
})

const pacScripts = computed(() => {
  if (!config.value?.pacs) return []
  return Object.values(config.value.pacs)
    .filter((p) => p.showInPopup !== false || activeProfileId.value === p.id)
    .map((p) => ({
      id: p.id,
      name: p.name || p.url || 'Unnamed',
      icon: 'bi-file-earmark-code',
      color: p.color
    }))
})

const autoPolicies = computed(() => {
  if (!config.value?.policies) return []
  return Object.values(config.value.policies)
    .filter((p) => p.showInPopup !== false || activeProfileId.value === p.id)
    .map((p) => ({
      id: p.id,
      name: p.name || p.id,
      icon: 'bi-signpost-split-fill',
      color: p.color
    }))
})

const selectProfile = async (profileId) => {
  activeProfileId.value = profileId
  if (config.value) {
    config.value.activeProfileId = profileId
    await saveConfig(config.value, true, true)
    if (config.value.behavior?.refreshOnSwitch) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id && /^https?:/.test(tabs[0].url)) chrome.tabs.reload(tabs[0].id)
    }
  }
}

// Navigation
const openOptions = () =>
  chrome.runtime.openOptionsPage
    ? chrome.runtime.openOptionsPage()
    : window.open(chrome.runtime.getURL('options.html'))
const openMonitor = () => window.open(chrome.runtime.getURL('src/monitor/index.html'))
const openSidePanel = async () => {
  const windowId = (await chrome.windows.getCurrent()).id
  if (chrome.sidePanel?.open) {
    await chrome.sidePanel.open({ windowId })
    window.close()
  }
}

const showMonitorTab = computed(() => !!config.value?.behavior?.connectionMonitoring)
const isProtocolSupported = computed(() => /^https?:/.test(currentTabUrl.value))
const loadMonitorData = async () => {
  if (activeTabId.value) {
    const key = `monitor_${activeTabId.value}`
    const storage = await chrome.storage.session.get(key)
    monitorResult.value = storage[key] || []
  }
}

const showQuickTab = computed(() => {
  if (!config.value?.behavior?.connectionMonitoring) return false
  const policy = config.value?.policies?.[activeProfileId.value]
  return (
    policy &&
    (policy.rules || policy.defaultProfileId) &&
    (failedDomains.value.length > 0 || !!contextMenuDomain.value)
  )
})

const failedDomains = computed(() => {
  if (contextMenuDomain.value) return [contextMenuDomain.value]
  const errorItems = monitorResult.value.filter((i) => i.error)
  if (errorItems.length === 0) {
    if (currentTabUrl.value) {
      try {
        const hostname = new URL(currentTabUrl.value).hostname
        if (hostname) return [hostname]
      } catch (e) {
        // Ignore parsing errors for non-URL strings
      }
    }
    return []
  }
  const domains = [...new Set(errorItems.map((i) => i.domain))]
  const groups = {}
  domains.forEach((d) => {
    const parts = d.split('.')
    const root = parts.length > 2 ? parts.slice(-2).join('.') : d
    if (!groups[root]) groups[root] = []
    groups[root].push(d)
  })
  return Object.keys(groups)
    .map((root) =>
      groups[root].length > 1 || domains.includes(root) ? `.${root}` : groups[root][0]
    )
    .sort()
})

watch(
  failedDomains,
  (newVal) => {
    selectedDomains.value = [...newVal]
  },
  { immediate: true }
)

const proxyOptions = computed(() => {
  if (!config.value) return []
  const groups = []
  if (config.value.proxies) {
    const p = Object.values(config.value.proxies)
      .map((p) => ({ id: p.id, label: p.label || p.name }))
      .sort((a, b) => a.label.localeCompare(b.label))
    if (p.length > 0) groups.push({ label: t('lblProxies'), options: p })
  }
  if (config.value.proxyGroups) {
    const g = Object.values(config.value.proxyGroups)
      .map((g) => ({ id: g.id, label: g.name }))
      .sort((a, b) => a.label.localeCompare(b.label))
    if (g.length > 0) groups.push({ label: t('lblProxyGroups'), options: g })
  }
  return groups
})

const confirmQuickAdd = async () => {
  if (selectedDomains.value.length === 0) return
  const newRules = selectedDomains.value.map((pattern) => ({
    id: `rule_quick_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'rule',
    ruleType: 'wildcard',
    pattern,
    proxyId: quickProxyId.value,
    valid: true
  }))
  if (quickDestination.value === 'temporary') {
    const sessionData = await chrome.storage.session.get('tempRules')
    const tempRules = [...newRules, ...(sessionData.tempRules || [])]
    await chrome.storage.session.set({ tempRules: JSON.parse(JSON.stringify(tempRules)) })
    showToast(t('msgRulesAddedTemp', [newRules.length]), 'success')
  } else {
    const policyId = activeProfileId.value
    if (!config.value.policies[policyId]) return
    if (!Array.isArray(config.value.policies[policyId].rules))
      config.value.policies[policyId].rules = []
    config.value.policies[policyId].rules = [...newRules, ...config.value.policies[policyId].rules]
    await saveConfig(config.value)
    showToast(
      t('msgRulesAddedPolicy', [newRules.length, config.value.policies[policyId].name || 'Policy']),
      'success'
    )
  }
  selectedDomains.value = []
  currentTab.value = 'proxy'
}

const showToast = (text, type = '', duration = 2000) => {
  notificationText.value = text
  notificationType.value = type
  showNotification.value = true
  if (notificationTimer) clearTimeout(notificationTimer)
  notificationTimer = setTimeout(() => {
    showNotification.value = false
  }, duration)
}

const copyDomain = (domain) => {
  navigator.clipboard.writeText(domain).then(() => showToast(t('msgCopiedGeneric'), 'success'))
}
</script>
