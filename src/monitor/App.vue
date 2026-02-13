<template>
  <div class="d-flex flex-column h-100">
    <!-- Header -->
    <header class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style="background: var(--ui-bg-card);">
      <div class="d-flex align-items-center gap-3">
        <!-- Theme-aware logo -->
        <img :src="isDark ? darkIconUrl : lightIconUrl" alt="Oasis" style="width: 32px; height: 32px;" />
        <img :src="isDark ? darkBrandUrl : lightBrandUrl" alt="Oasis Proxy" style="height: 32px;" />
      </div>

      <!-- Right side: History limit + Filter -->
      <div class="d-flex align-items-center gap-3">
        <!-- History Limit -->
        <div class="d-flex align-items-center gap-2">
          <span class="text-xs font-medium ui-text-tertiary">{{ $t('lblHistory') }}</span>
          <select v-model="historyLimit" class="form-select form-select-sm ui-input" style="width: 80px;">
            <option :value="1000">1000</option>
            <option :value="2000">2000</option>
            <option :value="5000">5000</option>
          </select>
        </div>

        <!-- Filter Input -->
        <div class="position-relative flex-1" style="max-width: 320px;width: 320px;">
          <i class="bi bi-search position-absolute ui-text-tertiary" 
             style="left: 12px; top: 50%; transform: translateY(-50%);"></i>
          <input 
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm ps-5 ui-input w-100"
            style="max-width: none;"
            :placeholder="$t('phSearchRequests')"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 d-flex overflow-hidden">
      <!-- Left Sidebar: Tab List -->
      <aside class="d-flex flex-column border-end" style="width: 320px; background: var(--ui-bg-card);">
        <!-- Tab List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <!-- All Requests Option -->
          <div 
            class="tab-item px-3 py-2"
            :class="{ 'active': selectedTabId === null }"
            @click="selectTab(null)"
          >
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="font-mono text-xs ui-text-tertiary">{{ $t('lblAllTabs') }}</span>
              <span class="ui-tag ui-tag-default">{{ totalRequestCount }}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-globe text-primary"></i>
              <span class="text-sm font-medium ui-text-primary">{{ $t('lblAllRequests') }}</span>
            </div>
          </div>

          <!-- Individual Tabs -->
          <div 
            v-for="tab in sortedTabs" 
            :key="tab.id"
            class="tab-item px-3 py-2 border-top"
            :class="{ 'active': selectedTabId === tab.id }"
            @click="selectTab(tab.id)"
          >
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="font-mono text-xs ui-text-tertiary">{{ formatTime(tab.lastActivity) }}</span>
              <span class="ui-tag ui-tag-default">{{ getTabRequestCount(tab.id) }}</span>
            </div>
            <div class="d-flex align-items-start gap-2">
              <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="mt-1" style="width: 16px; height: 16px;" />
              <i v-else class="bi bi-file-earmark ui-text-tertiary mt-1"></i>
              <div class="flex-1 min-w-0" style="max-width: calc(100% - 24px);">
                <p class="text-sm font-medium ui-text-primary text-truncate m-0" style="max-width: 100%;">{{ tab.title || $t('lblUntitled') }}</p>
                <p class="text-xs ui-text-secondary text-truncate m-0">{{ getHostname(tab.url) }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Panel: Request List -->
      <section class="flex-1 d-flex flex-column overflow-hidden" style="background: var(--bs-body-bg);">
        <!-- Panel Header -->
        <div class="d-flex align-items-center justify-content-between px-4 py-2 border-bottom" style="background: var(--ui-bg-card);">
          <div class="d-flex align-items-center gap-3">
            <h2 class="m-0 text-sm font-bold ui-text-primary">
              {{ selectedTabId ? getSelectedTabTitle() : $t('lblAllRequests') }}
            </h2>
            <span class="text-xs ui-text-tertiary">{{ filteredRequests.length }} {{ $t('lblRequestsSuffix') }}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <!-- Add Tab Domains button (only when a single tab is selected) -->
            <button v-if="selectedTabId"
                    @click="openQuickAdd" 
                    class="ui-button-icon d-flex align-items-center gap-1"
                    :disabled="filteredRequests.length === 0"
                    :title="$t('btnAddTabDomains')">
              <i class="bi bi-plus-circle text-sm"></i>
            </button>
            <!-- Delete button for selected tab or all -->
            <button @click="clearCurrentRequests" 
                    class="ui-button-icon d-flex align-items-center gap-1"
                    :title="selectedTabId ? $t('btnClearTab') : $t('btnClearAll')">
              <i class="bi bi-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Table Container (Handles both X and Y scrolling) -->
        <div class="flex-1 overflow-auto custom-scrollbar position-relative" style="background: var(--ui-bg-card);">
          <!-- Table Header (Sticky) -->
          <div class="d-flex align-items-center gap-3 px-4 py-2 border-bottom text-xs font-semibold ui-text-tertiary text-uppercase position-sticky top-0"
               style="background: var(--ui-bg-subtle); min-width: max-content; z-index: 10;">
          <div style="width: 80px;" class="flex-shrink-0">{{ $t('colTime') }}</div>
          <div style="width: 140px;" class="flex-shrink-0">{{ $t('colDomain') }}</div>
          <div style="width: 180px;" class="flex-shrink-0">{{ $t('colPattern') }}</div>
          <div style="width: 120px;" class="flex-shrink-0">{{ $t('colProxyName') }}</div>
          <div style="width: 140px;" class="flex-shrink-0">{{ $t('colIP') }}</div>
          <div style="width: 70px;" class="text-end flex-shrink-0">{{ $t('colDuration') }}</div>
          <div style="width: 60px;" class="flex-shrink-0">{{ $t('colMethod') }}</div>
          <div style="width: 60px;" class="flex-shrink-0">{{ $t('colStatus') }}</div>
          <div style="width: 300px;" class="flex-shrink-0">{{ $t('colURL') }}</div>
        </div>

          <!-- Request List -->
          <div>
          <div 
            v-for="request in filteredRequests" 
            :key="request.id"
            class="request-row d-flex align-items-center gap-3 px-4 py-2 border-bottom font-mono text-xs"
            style="min-width: max-content;"
          >
            <div style="width: 80px;" class="ui-text-primary flex-shrink-0">{{ formatTime(request.startTime) }}</div>
            <div style="width: 140px;" class="text-truncate ui-text-primary flex-shrink-0" :title="request.domain">
              {{ request.domain }}
            </div>
            <div style="width: 180px;" class="text-truncate ui-text-primary d-flex align-items-center flex-shrink-0" :title="request.matchedRule || $t('lblDefault')">
               <template v-if="request.ruleSource">
                 <i class="bi bi-diagram-3 me-2 ui-text-tertiary" :title="request.ruleSource" style="cursor: pointer;"></i>
               </template>
               <span class="text-truncate">{{ request.matchedRule || $t('lblDefault') }}</span>
            </div>
            <div style="width: 120px;" class="ui-text-primary flex-shrink-0" :title="proxies[request.proxyUsed]?.name || request.proxyUsed">
              <span v-if="request.proxyUsed" class="ui-tag ui-tag-default">{{ request.proxyUsed }}</span>
              <span v-else class="ui-text-primary">-</span>
            </div>
            <div style="width: 140px;" class="text-truncate ui-text-primary d-flex align-items-center gap-2 flex-shrink-0" :title="request.ip || '-'">
              <span v-if="request.fromCache" class="ui-text-tertiary" :title="$t('lblFromCache')" style="cursor: pointer;">
                <i class="bi bi-database-fill-check"></i>
              </span>
              <span>{{ getIpDisplay(request.ip) }}</span>
            </div>
            <div style="width: 70px;" class="text-end ui-text-primary flex-shrink-0">
              {{ request.duration ? `${request.duration}ms` : '-' }}
            </div>
            <div style="width: 60px;" class="flex-shrink-0">
              <span class="ui-tag ui-tag-default" :class="getMethodClass(request.method)">{{ request.method }}</span>
            </div>
            <div style="width: 60px;" class="flex-shrink-0">
              <span v-if="request.status" class="ui-tag ui-tag-default" :class="getStatusClass(request.status)">
                {{ request.status }}
              </span>
              <span v-else class="ui-tag ui-tag-warning">
                <i class="bi bi-arrow-repeat"></i>
              </span>
            </div>
            <div class="text-truncate request-url ui-text-primary flex-shrink-0" style="width: 300px;" :title="request.url">
              {{ request.url }}
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredRequests.length === 0" class="d-flex flex-column align-items-center justify-content-center py-5 ui-text-tertiary">
            <i class="bi bi-inbox fs-1 mb-2"></i>
            <span class="text-sm">{{ $t('msgNoRequests') }}</span>
            <span class="text-xs mt-1">{{ $t('msgNavigateToSeeRequests') }}</span>
          </div>
        </div>
        </div>

        <!-- Footer -->
        <div class="d-flex align-items-center justify-content-between px-4 py-2 border-top text-xs ui-text-tertiary"
             style="background: var(--ui-bg-subtle);">
          <span>{{ $t('lblShowing') }} {{ filteredRequests.length }} {{ $t('lblOf') }} {{ totalRequestCount }} {{ $t('lblRequestsSuffix') }}</span>
          <span>{{ $t('lblMaxHistory') }} {{ historyLimit }}</span>
        </div>
      </section>
    </main>

    <!-- Quick Add Merge Modal -->
    <SmartRulesMergeModal
      :visible="showQuickAddModal"
      :policies="configPolicies"
      :sourceRules="quickAddSourceRules"
      :proxies="configProxies"
      :proxyGroups="configProxyGroups"
      :forcedTargetId="activeProfileId"
      :domainOptimize="true"
      @close="showQuickAddModal = false"
      @merge="handleQuickAddMerge"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { loadConfig, savePolicies } from '../common/storage'
import SmartRulesMergeModal from '../options/components/SmartRulesMergeModal.vue'

// Import logo assets
import lightIconUrl from '../assets/icons/light/ripple-icon-light-64x64-blurred.png'
import darkIconUrl from '../assets/icons/dark/ripple-icon-dark-64x64-blurred.png'
import lightBrandUrl from '../assets/img/oasis-proxy-primary-96px.png'
import darkBrandUrl from '../assets/img/oasis-proxy-white-96px.png'

// Theme state
const isDark = ref(false)
const mediaQuery = ref(null)

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove('dark')
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
      isDark.value = true
    } else {
      isDark.value = false
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
    isDark.value = true
  } else {
    isDark.value = false
  }
}

const handleSystemThemeChange = () => {
  loadConfig().then(config => {
    if (config.ui?.theme === 'auto') {
      applyTheme('auto')
    }
  })
}

// Import auto proxy parsers
import { parseAutoProxyRules, convertAutoProxyToInternalRules } from '../common/autoproxy'

// Policy state for rule matching
const currentPolicy = ref(null)
const tempRules = ref([])
const proxies = ref({})
const ipTags = ref({}) // Format: { [ip]: tagName }
const expandedRules = ref([]) // Cache for flat list of all rules (including expanded rulesets)

// Load current policy for rule matching
async function loadCurrentPolicy() {
  try {
    const config = await loadConfig()
    const activeId = config.activeProfileId
    
    if (config.policies && config.policies[activeId]) {
      currentPolicy.value = config.policies[activeId]
      proxies.value = config.proxies || {}
      ipTags.value = config.ipTags || {}
      
      // Load temp rules from session storage
      const sessionData = await chrome.storage.session.get('tempRules')
      tempRules.value = sessionData?.tempRules || []

      // Pre-expand rules
      expandedRules.value = []
      if (currentPolicy.value.rules) {
        for (const rule of currentPolicy.value.rules) {
          if (rule.type === 'divider' || rule.valid === false) continue
          
          if (rule.ruleType === 'ruleset' && rule.ruleSet?.content) {
             try {
                const parsed = parseAutoProxyRules(rule.ruleSet.content)
                const internal = convertAutoProxyToInternalRules(parsed).map(r => ({
                  ...r,
                  proxyId: rule.proxyId, // Inherit proxy ID
                  // metadata to link back if needed
                  fromRuleset: rule.ruleSet.sourceUrl || rule.ruleSet.name || rule.pattern || 'Ruleset'
                }))
                expandedRules.value.push(...internal)
             } catch (e) {
                console.error('Failed to parse ruleset:', e)
             }
          } else {
             expandedRules.value.push(rule)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load policy:', e)
  }
}

// Match a URL against policy rules
function matchRule(url) {
  if (!currentPolicy.value) return { rule: null, proxy: null, ruleSource: null }
  
  try {
    const urlObj = new URL(url)
    const host = urlObj.hostname
    
    // Check temp rules first
    for (const rule of tempRules.value) {
      if (rule.valid === false) continue
      if (testRuleMatch(rule, url, host)) {
        const proxyName = getProxyName(rule.proxyId)
        // Ensure ruleSource is null for temp rules to avoid icon
        return { rule: rule.pattern, proxy: proxyName, ruleSource: null }
      }
    }
    
    // Check reject rules
    for (const rule of (currentPolicy.value.rejectRules || [])) {
      if (rule.type === 'divider' || rule.valid === false) continue
      if (testRuleMatch(rule, url, host)) {
        // Ensure ruleSource is null for reject rules to avoid icon
        return { rule: rule.pattern, proxy: 'Reject', ruleSource: null }
      }
    }
    
    // Check normal rules (using pre-expanded cache)
    for (const rule of expandedRules.value) {
      if (testRuleMatch(rule, url, host)) {
        const proxyName = getProxyName(rule.proxyId)
        return { 
          rule: rule.pattern, 
          proxy: proxyName, 
          ruleSource: rule.fromRuleset 
        }
      }
    }
    
    // Default
    const defaultProxy = getProxyName(currentPolicy.value.defaultProfileId)
    return { rule: 'Default', proxy: defaultProxy, ruleSource: null }
  } catch (e) {
    return { rule: null, proxy: null, ruleSource: null }
  }
}

// Test if a rule matches the URL/host
function testRuleMatch(rule, url, host) {
  if (!rule.pattern) return false
  
  switch (rule.ruleType) {
    case 'wildcard': {
      const pattern = rule.pattern
      if (pattern.startsWith('**.')) {
        const domain = pattern.substring(3)
        return host.endsWith('.' + domain) && host !== domain
      } else if (pattern.startsWith('*.') || pattern.startsWith('.')) {
        const domain = pattern.startsWith('*.') ? pattern.substring(2) : pattern.substring(1)
        return host.endsWith('.' + domain) || host === domain
      } else if (pattern.includes('*')) {
        // Simple wildcard matching with regex conversion
        const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
        return new RegExp(regexStr).test(host)
      }
      return host === pattern
    }
    case 'regex': {
      try {
        const isUrlRegex = rule.pattern.startsWith('^http') || rule.pattern.includes('/')
        const regex = new RegExp(rule.pattern)
        return isUrlRegex ? regex.test(url) : regex.test(host)
      } catch {
        return false
      }
    }
    case 'ip':
      return host === rule.pattern || (rule.pattern.includes('/') && host.startsWith(rule.pattern.split('/')[0])) // Simplistic IP match
    default:
      return false
  }
}

// Get proxy display name (truncated)
function getProxyName(proxyId) {
  if (!proxyId || proxyId === 'direct') return 'Direct'
  if (proxyId === 'reject') return 'Reject'
  const proxy = proxies.value[proxyId]
  // Use label first (user defined name), then name (if any), then host, then ID
  const name = proxy?.label || proxy?.name || proxy?.host || proxyId
  return name.length > 10 ? name.substring(0, 10) + '...' : name
}

// Get IP display (with tags)
function getIpDisplay(ip) {
  if (!ip) return '-'
  const tag = ipTags.value[ip]
  return tag ? tag : ip
}

// State
const requests = ref([])
const tabs = ref({})
const selectedTabId = ref(null)
const searchQuery = ref('')
const historyLimit = ref(1000)

// Quick Add modal state
const showQuickAddModal = ref(false)
const quickAddSourceRules = ref([])
const configPolicies = ref({})
const configProxies = ref({})
const configProxyGroups = ref({})
const activeProfileId = ref('')

// Computed
const sortedTabs = computed(() => {
  return Object.values(tabs.value)
    .filter(tab => tab.requestCount > 0)
    .sort((a, b) => b.lastActivity - a.lastActivity)
})

const totalRequestCount = computed(() => requests.value.length)

const filteredRequests = computed(() => {
  // Create a shallow copy to avoid mutating the original array when sorting
  let filtered = [...requests.value]

  // Filter by selected tab
  if (selectedTabId.value !== null) {
    filtered = filtered.filter(r => r.tabId === selectedTabId.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.url.toLowerCase().includes(query) ||
      r.method.toLowerCase().includes(query)
    )
  }

  // Sort by time (newest first)
  return filtered.sort((a, b) => b.startTime - a.startTime)
})

// Methods
function selectTab(tabId) {
  selectedTabId.value = tabId
}

function getSelectedTabTitle() {
  if (selectedTabId.value && tabs.value[selectedTabId.value]) {
    return tabs.value[selectedTabId.value].title || 'Untitled'
  }
  return 'All Requests'
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

function getHostname(url) {
  if (!url) return ''
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function getMethodClass(method) {
  const classes = {
    'GET': 'ui-tag-primary',
    'POST': 'ui-tag-success',
    'PUT': 'ui-tag-warning',
    'DELETE': 'ui-tag-danger',
    'PATCH': 'ui-tag-info'
  }
  return classes[method] || ''
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'ui-tag-success'
  if (status >= 300 && status < 400) return 'ui-tag-info'
  if (status >= 400) return 'ui-tag-danger'
  return 'ui-tag-warning'
}

// Get dynamic request count for a tab (based on current requests list)
function getTabRequestCount(tabId) {
  return requests.value.filter(r => r.tabId === tabId).length
}

// Clear requests - for selected tab or all
function clearCurrentRequests() {
  if (selectedTabId.value !== null) {
    // Clear only selected tab's requests
    requests.value = requests.value.filter(r => r.tabId !== selectedTabId.value)
    // Remove tab from list if no requests left
    if (getTabRequestCount(selectedTabId.value) === 0) {
      delete tabs.value[selectedTabId.value]
    }
    selectedTabId.value = null
  } else {
    // Clear all
    requests.value = []
    tabs.value = {}
  }
}

// Quick Add: extract unique domains from filtered requests and open merge modal
async function openQuickAdd() {
  // Extract unique domains from current filtered request list
  const domains = new Set()
  filteredRequests.value.forEach(r => {
    if (r.domain) domains.add(r.domain)
  })

  // Convert to source rules (raw full domains)
  quickAddSourceRules.value = Array.from(domains).sort().map(domain => ({
    ruleType: 'wildcard',
    pattern: domain,
    proxyId: 'direct'
  }))

  // Reload config for fresh policies/proxies
  const config = await loadConfig()
  configPolicies.value = config.policies || {}
  configProxies.value = config.proxies || {}
  configProxyGroups.value = config.proxyGroups || {}
  activeProfileId.value = config.activeProfileId || ''

  showQuickAddModal.value = true
}

// Handle merge confirmation from modal
async function handleQuickAddMerge({ targetId, conflictMode, rules: mergedRules }) {
  const config = await loadConfig()
  const targetPolicy = config.policies?.[targetId]
  if (!targetPolicy) return

  if (!targetPolicy.rules) targetPolicy.rules = []

  let addedCount = 0
  let updatedCount = 0
  const newRulesToAdd = []

  mergedRules.forEach(rule => {
    const existingIndex = targetPolicy.rules.findIndex(r =>
      r.type !== 'divider' &&
      r.ruleType === rule.ruleType &&
      r.pattern === rule.pattern
    )

    if (existingIndex !== -1) {
      if (conflictMode === 'overwrite') {
        targetPolicy.rules[existingIndex].proxyId = rule.proxyId
        targetPolicy.rules[existingIndex].valid = rule.valid !== false
        updatedCount++
      }
    } else {
      newRulesToAdd.push({
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'rule',
        valid: true
      })
      addedCount++
    }
  })

  if (newRulesToAdd.length > 0) {
    targetPolicy.rules.unshift(...newRulesToAdd)
  }

  config.policies[targetId] = targetPolicy
  await savePolicies(config.policies)

  showQuickAddModal.value = false
  console.log(`Quick Add: merged ${addedCount} new, updated ${updatedCount} existing rules.`)
}

function addRequest(request) {
  // Match rule for this request
  const { rule, proxy, ruleSource } = matchRule(request.url)
  request.matchedRule = rule
  request.proxyUsed = proxy
  request.ruleSource = ruleSource
  request.domain = getHostname(request.url)

  // Add to requests array
  requests.value.push(request)

  // Update or refresh tab info
  const existingTab = tabs.value[request.tabId]
  if (existingTab) {
    // Check if domain changed - refresh tab info
    const requestDomain = getHostname(request.url)
    const tabDomain = getHostname(existingTab.url)
    if (requestDomain && tabDomain && requestDomain !== tabDomain) {
      // Domain changed, refresh tab info
      updateTabInfo(request.tabId)
    } else {
      existingTab.lastActivity = request.startTime
    }
  } else {
    updateTabInfo(request.tabId)
  }

  // Enforce history limit (FIFO)
  while (requests.value.length > historyLimit.value) {
    requests.value.shift()
  }
}

function updateRequest(requestId, updates) {
  const index = requests.value.findIndex(r => r.id === requestId)
  if (index !== -1) {
    const req = requests.value[index]
    const newRequest = { ...req, ...updates }
    
    // Calculate duration if valid times exist and duration is missing
    if (newRequest.startTime && newRequest.endTime && !newRequest.duration) {
      newRequest.duration = Math.round(newRequest.endTime - newRequest.startTime)
    }
    
    requests.value[index] = newRequest
  }
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
    // Tab might not exist
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

// Message listener
function handleMessage(message) {
  if (message.type === 'REQUEST_STARTED') {
    addRequest(message.request)
  } else if (message.type === 'REQUEST_COMPLETED') {
    updateRequest(message.requestId, {
      endTime: message.endTime,
      status: message.status,
      duration: message.duration,
      ip: message.ip,
      fromCache: message.fromCache
    })
  } else if (message.type === 'REQUEST_REDIRECTED') {
    updateRequest(message.requestId, {
      redirected: true,
      redirectUrl: message.redirectUrl
    })
  } else if (message.type === 'REQUEST_ERROR') {
    updateRequest(message.requestId, {
      endTime: message.endTime,
      status: 0,
      error: message.error
    })
  }
}

onMounted(async () => {
  // Initialize theme
  const config = await loadConfig()
  applyTheme(config.ui?.theme || 'light')
  
  // Load policy for rule matching
  await loadCurrentPolicy()
  
  // Listen for system theme changes
  mediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.value.addEventListener('change', handleSystemThemeChange)
  
  // Listen for config changes from storage
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.config) {
      const newConfig = changes.config.newValue
      if (newConfig?.ui?.theme) {
        applyTheme(newConfig.ui.theme)
      }
      // Reload policy if config changed
      loadCurrentPolicy()
    }
    // Reload temp rules if they changed
    if (area === 'session' && changes.tempRules) {
      tempRules.value = changes.tempRules.newValue || []
    }
  })
  
  // Register message listener - data starts fresh on page load
  chrome.runtime.onMessage.addListener(handleMessage)
})

// Watch for history limit changes - trim locally only
watch(historyLimit, (newLimit) => {
  while (requests.value.length > newLimit) {
    requests.value.shift()
  }
})

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(handleMessage)
  if (mediaQuery.value) {
    mediaQuery.value.removeEventListener('change', handleSystemThemeChange)
  }
})
</script>