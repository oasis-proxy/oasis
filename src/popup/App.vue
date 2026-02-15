<template>
  <!-- Global Notifications -->
  <div v-if="showNotification" class="ui-toast-container">
      <div class="badge bg-secondary px-3 py-2 shadow-lg animate-fade-in text-xs opacity-95">
          <i class="bi bi-check2 me-1"></i> {{ notificationText }}
      </div>
  </div>

  <!-- Header -->
  <header class="popup-header">
    <div class="header-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'proxy' }"
        @click="currentTab = 'proxy'"
      >
        {{ $t('lblProxy') }}
      </button>
      <button 
        v-if="showMonitorTab"
        class="tab-btn" 
        :class="{ active: currentTab === 'monitor' }"
        @click="currentTab = 'monitor'"
      >
        {{ $t('monitor') }}
      </button>
      <button 
        v-if="showQuickTab"
        class="tab-btn" 
        :class="{ active: currentTab === 'quick' }"
        @click="currentTab = 'quick'"
      >
        {{ $t('quick') }}
      </button>
    </div>
    
    <div class="header-actions">
       <button @click="openSidePanel" class="ui-button-icon" :title="$t('popTooltipDownloads')">
        <i class="bi bi-layout-sidebar-reverse ui-icon-md"></i>
      </button>
       <button v-if="showMonitorTab" @click="openMonitor" class="ui-button-icon" :title="$t('popTooltipMonitor')">
        <i class="bi bi-activity ui-icon-md"></i>
      </button>
      <button @click="openOptions" class="ui-button-icon" :title="$t('popTooltipOptions')">
        <i class="bi bi-gear-wide-connected ui-icon-md"></i>
      </button>
    </div>
  </header>

    <!-- Main Content -->
    <main class="popup-main">
      
      <!-- PROXY TAB -->
      <div v-if="currentTab === 'proxy'">
        <!-- Defaults Section -->
        <div class="mb-2">
          <h3 class="section-heading">{{ $t('defaults') }}</h3>
          <div>
            <label 
              class="profile-item"
              :class="{ active: isActive('direct') }"
              @click="selectProfile('direct')"
            >
              <div class="profile-icon">
                <i class="bi bi-power ui-icon-lg"></i>
              </div>
              <p class="profile-name">{{ $t('directConnect') }}</p>
              <div 
                v-if="isActive('direct')"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill ui-icon-lg"></i>
              </div>
            </label>

            <label 
              class="profile-item"
              :class="{ active: isActive('system') }"
              @click="selectProfile('system')"
            >
              <div class="profile-icon">
                <i class="bi bi-globe ui-icon-lg"></i>
              </div>
              <p class="profile-name">{{ $t('systemProxy') }}</p>
              <div 
                v-if="isActive('system')"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill ui-icon-lg"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- Host Proxy Section -->
        <div v-if="hostProxies.length > 0" class="mb-2">
          <h3 class="section-heading">{{ $t('hostProxy') }}</h3>
          <div>
            <label 
              v-for="profile in hostProxies"
              :key="profile.id"
              class="profile-item"
              :class="{ active: isActive(profile.id) }"
              @click="selectProfile(profile.id)"
            >
              <div 
                class="profile-icon"
                :style="getIconStyle(profile)"
              >
                <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill ui-icon-lg"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- PAC Script Section -->
        <div v-if="pacScripts.length > 0" class="mb-2">
          <h3 class="section-heading">{{ $t('pacScript') }}</h3>
          <div>
            <label 
              v-for="profile in pacScripts"
              :key="profile.id"
              class="profile-item"
              :class="{ active: isActive(profile.id) }"
              @click="selectProfile(profile.id)"
            >
              <div 
                class="profile-icon"
                :style="getIconStyle(profile)"
              >
                <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill ui-icon-lg"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- Auto Policy Section -->
        <div v-if="autoPolicies.length > 0" class="mb-2">
          <h3 class="section-heading">{{ $t('autoPolicy') }}</h3>
          <div>
            <label 
              v-for="profile in autoPolicies"
              :key="profile.id"
              class="profile-item"
              :class="{ active: isActive(profile.id) }"
              @click="selectProfile(profile.id)"
            >
              <div 
                class="profile-icon"
                :style="getIconStyle(profile)"
              >
                <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill ui-icon-lg"></i>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- MONITOR TAB -->
      <div v-if="currentTab === 'monitor'" class="monitor-container d-flex flex-column h-100">
          <!-- Protocol Warning -->
          <div v-if="!isProtocolSupported" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
               <div class="text-center p-4">
                   <p class="text-sm">{{ $t('popMsgMonitorUnavailable') }}</p>
                   <p class="text-xs text-muted">{{ $t('popMsgMonitorOnlyHttp') }}</p>
               </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="monitorResult.length === 0" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
             <div class="text-center p-4">
                 <i class="bi bi-activity text-3xl mb-2 d-block opacity-50"></i>
                 <p class="text-sm">{{ $t('msgNoRequests') }}</p>
                 <p class="text-xs text-muted">{{ $t('popMsgRefreshHint') }}</p>
             </div>
          </div>
          
          <!-- List -->
          <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-0">
             <div v-for="(item, index) in monitorResult" :key="index" 
                class="monitor-item d-flex align-items-center py-3 transition-colors px-3 border-b"
             >
                 <!-- Domain Column (60%) -->
                 <div class="monitor-col-domain">
                     <div 
                        class="monitor-domain fw-medium text-truncate text-xs cursor-pointer" 
                        :title="$t('popTooltipCopy', [item.domain])"
                        @click="copyDomain(item.domain)"
                     >
                         {{ item.domain }}
                     </div>
                 </div>
                 
                 <!-- IP/Error Column (40%) -->
                 <div class="monitor-col-info">
                     <span v-if="item.error" class="monitor-error text-danger text-truncate text-xs" :title="item.error">
                         {{ item.error }}
                     </span>
                     <span v-else-if="item.ip" 
                        class="ui-tag fw-normal font-mono max-w-full text-truncate"
                        :title="item.ip"
                     >
                         {{ formatIp(item.ip) }}
                     </span>
                 </div>
             </div>
          </div>
      </div>

       <!-- QUICK TAB -->
       <div v-if="currentTab === 'quick'" class="monitor-container d-flex flex-column h-100 text-xs">
          <p class="quick-title">{{ $t('popTitleQuickAdd') }}</p>
          
          <div v-if="failedDomains.length === 0" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
             <div class="text-center p-4">
                 <i class="bi bi-check-circle text-3xl mb-2 d-block opacity-50 text-success"></i>
                 <p class="text-xs">{{ $t('popMsgNoFailedRequests') }}</p>
                 <p class="text-xs text-muted">{{ $t('popMsgPageWorking') }}</p>
             </div>
          </div>

          <div v-else class="flex-1 d-flex flex-column min-h-0">
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              <div class="pb-2">
                <label 
                  v-for="domain in failedDomains" 
                  :key="domain"
                  class="quick-item"
                >
                  <input 
                    type="checkbox" 
                    v-model="selectedDomains" 
                    :value="domain"
                    class="form-check-input align-self-start"
                  />
                  <span class="text-truncate text-xs">{{ domain }}</span>
                </label>
              </div>
            </div>

            <!-- Options Section (Side-by-Side) -->
            <div class="d-flex gap-3 pb-2 px-2">
                <!-- Proxy Host -->
                <div class="flex-1 d-flex flex-column gap-1">
                  <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">{{ $t('lblProxies') }}</label>
                  <select v-model="quickProxyId" class="form-select ui-input ui-input-sm w-100 text-xs cursor-pointer">
                    <option value="direct">{{ $t('directConnect') }}</option>
                    <optgroup v-for="group in proxyOptions" :key="group.label" :label="group.label">
                        <option v-for="proxy in group.options" :key="proxy.id" :value="proxy.id">
                          {{ proxy.label }}
                        </option>
                    </optgroup>
                  </select>
                </div>

                <!-- Add To Destination -->
                <div class="flex-1 d-flex flex-column gap-1">
                  <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">{{ $t('addTo') }}</label>
                  <select v-model="quickDestination" class="form-select ui-input ui-input-sm w-100 text-xs cursor-pointer">
                    <option value="policy">{{ $t('currentPolicy') }}</option>
                    <option value="temporary">{{ $t('temporarySession') }}</option>
                  </select>
                </div>
            </div>

            <!-- Actions Section -->
            <div class="quick-section justify-content-end gap-2 pb-3"> 
              <button @click="currentTab = 'proxy'" class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all">
                {{ $t('btnCancel') }}
              </button>
              <button @click="confirmQuickAdd" :disabled="selectedDomains.length === 0" class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg shadow-primary/30 transition-colors border-0">
                {{ $t('btnConfirm') }}
              </button>
            </div>
          </div>
       </div>



    </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { t } from '../common/i18n'
import { loadConfig, saveConfig } from '../common/storage'

const config = ref(null)
const activeProfileId = ref('direct')
const currentTab = ref('proxy') // proxy, monitor, quick, info
const monitorResult = ref([])
const activeTabId = ref(null)
const currentTabUrl = ref('')
const showNotification = ref(false)
const notificationText = ref('')
let notificationTimer = null

// Quick Add State
const selectedDomains = ref([])
const quickProxyId = ref('direct')
const quickDestination = ref('policy')
const contextMenuDomain = ref(null)

// Load configuration
const mediaQuery = ref(null)

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.add('light')
  }
}

const handleSystemThemeChange = () => {
  if (config.value?.ui?.theme === 'auto') {
    applyTheme('auto')
  }
}

onMounted(async () => {
  config.value = await loadConfig()
  activeProfileId.value = config.value.activeProfileId || 'direct'
  
  // Apply theme based on config
  applyTheme(config.value.ui?.theme || 'light')
  
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
    }
  })

  // Check Context Menu Intent (Quick Add)
  try {
      const session = await chrome.storage.session.get('quickAddIntent')
      if (session && session.quickAddIntent) {
          const intent = session.quickAddIntent
          // Check if intent is recent (e.g., within 5 seconds) to avoid stale opens
          if (Date.now() - intent.timestamp < 10000) {
              contextMenuDomain.value = intent.domain
              currentTab.value = 'quick'
              
              // Default to Temporary for Sidepanel and Context Menu actions
              if (intent.source === 'sidepanel' || intent.source === 'context-menu') {
                  quickDestination.value = 'temporary'
              }
              
              // Clear immediately
              await chrome.storage.session.remove('quickAddIntent')
          }
      }
  } catch (e) {
      console.warn('Failed to check context intent', e)
  }

  // Get current tab info
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0) {
      activeTabId.value = tabs[0].id
      currentTabUrl.value = tabs[0].url
  }

  // Auto-switch to monitor if enabled and supported (Only if NOT quick intent)
  if (showMonitorTab.value && !contextMenuDomain.value) {
      currentTab.value = 'monitor'
      loadMonitorData()
      chrome.storage.onChanged.addListener(storageListener)
  }
})

import { onUnmounted } from 'vue'

onUnmounted(() => {
    chrome.storage.onChanged.removeListener(storageListener)
    if (mediaQuery.value) {
        mediaQuery.value.removeEventListener('change', handleSystemThemeChange)
    }
})

// Theme Logic REMOVED

// Compute grouped profiles
const hostProxies = computed(() => {
  if (!config.value?.proxies) return []
  return Object.values(config.value.proxies)
    .filter(p => (p.showInPopup !== false) || isActive(p.id))
    .map(proxy => ({
      id: proxy.id,
      name: proxy.label || proxy.host || 'Unnamed Proxy',
      icon: 'bi-pc-display',
      color: proxy.color,
      type: 'proxy'
    }))
})

const pacScripts = computed(() => {
  if (!config.value?.pacs) return []
  return Object.values(config.value.pacs)
    .filter(p => (p.showInPopup !== false) || isActive(p.id))
    .map(pac => ({
      id: pac.id,
      name: pac.name || pac.url || 'Unnamed PAC',
      icon: 'bi-file-earmark-code',
      color: pac.color,
      type: 'pac'
    }))
})

const autoPolicies = computed(() => {
  if (!config.value?.policies) return []
  return Object.values(config.value.policies)
    .filter(p => (p.showInPopup !== false) || isActive(p.id))
    .map(policy => ({
      id: policy.id,
      name: policy.name || policy.id,
      icon: 'bi-signpost-split-fill',
      color: policy.color,
      type: 'policy'
    }))
})

const isActive = (id) => {
  return activeProfileId.value === id
}

const getIconStyle = (profile) => {
  if (isActive(profile.id)) {
    return {
      color: profile.color || 'var(--bs-primary)'
    }
  }
  return {
    color: profile.color || '#4b5563'
  }
}

const selectProfile = async (profileId) => {
  activeProfileId.value = profileId
  
  // Save to config
  if (config.value) {
    config.value.activeProfileId = profileId
    // Skip Sync (local only) AND Skip Touch (don't bump version)
    await saveConfig(config.value, true, true)

    // Handle Refresh on Switch
    if (config.value.behavior?.refreshOnSwitch) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        if (tab?.id && tab.url && /^https?:/.test(tab.url)) {
          chrome.tabs.reload(tab.id)
        }
      })
    }
  }
}

// Navigation
const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
    } else {
        window.open(chrome.runtime.getURL('options.html'))
    }
}

const openMonitor = () => {
    window.open(chrome.runtime.getURL('src/monitor/index.html'))
}

const openSidePanel = async () => {
  const windowId = (await chrome.windows.getCurrent()).id
  if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ windowId })
      window.close() // Close popup
  }
}


// --- Monitor Logic ---
const isMonitoringConfigEnabled = computed(() => {
    return !!config.value?.behavior?.connectionMonitoring
})

const isProtocolSupported = computed(() => {
    return /^https?:/.test(currentTabUrl.value)
})

const showMonitorTab = computed(() => {
    return isMonitoringConfigEnabled.value
})

const loadMonitorData = async () => {
    if (activeTabId.value) {
        const key = `monitor_${activeTabId.value}`
        const storage = await chrome.storage.session.get(key)
        monitorResult.value = storage[key] || []
    }
}

// Listener for Monitor updates
const storageListener = (changes, area) => {
    if (area === 'session' && activeTabId.value) {
        const key = `monitor_${activeTabId.value}`
        if (changes[key]) {
            monitorResult.value = changes[key].newValue || []
        }
    }
}

// Helper to format types
// Helper to format IPs (check tags)
const formatIp = (ip) => {
    if (config.value?.ipTags && config.value.ipTags[ip]) {
        return config.value.ipTags[ip]
    }
    return ip
}

// --- Quick Add Logic ---
const showQuickTab = computed(() => {
    // 1. Connection Monitoring must be enabled
    if (!config.value?.behavior?.connectionMonitoring) return false

    // 2. Active Profile must be Auto Policy
    return isActiveProfilePolicy.value && (failedDomains.value.length > 0 || !!contextMenuDomain.value)
})

const isActiveProfilePolicy = computed(() => {
    const activeId = activeProfileId.value
    const policy = config.value?.policies?.[activeId]
    // Check if it's a policy (has rules or defaultProfileId)
    if (policy && (policy.rules || policy.defaultProfileId)) {
        return true
    }
    return false
})

const failedDomains = computed(() => {
    // Priority: Context Menu Intent
    if (contextMenuDomain.value) {
        return [contextMenuDomain.value]
    }

    // Since we only show Quick Add if monitoring is enabled, we can use monitorResult
    const errorItems = monitorResult.value.filter(i => i.error)
    if (errorItems.length === 0) {
        // Fallback: If no errors, suggest current tab domain if available
        if (currentTabUrl.value) {
             try {
                 const url = new URL(currentTabUrl.value)
                 if (url.hostname) return [url.hostname]
             } catch (e) {
                 // Ignore invalid URLs
             }
        }
        return []
    }

    const domains = [...new Set(errorItems.map(i => i.domain))]
    
    // Grouping/Merging logic
    const groups = {}
    domains.forEach(domain => {
        const parts = domain.split('.')
        let root = domain
        if (parts.length > 2) {
            // Check for potential root (e.g. google.com for api.google.com)
            root = parts.slice(-2).join('.')
        }
        if (!groups[root]) groups[root] = []
        groups[root].push(domain)
    })

    const results = []
    for (const root in groups) {
        if (groups[root].length > 1 || domains.includes(root)) {
            // Multiple subdomains or the root itself is present, suggest root wildcard
            results.push(`.${root}`)
        } else {
            results.push(groups[root][0])
        }
    }
    return results.sort()
})

// Sync selections with failedDomains by default
watch(failedDomains, (newVal) => {
    selectedDomains.value = [...newVal]
}, { immediate: true })

const proxyOptions = computed(() => {
  if (!config.value) return []
  
  const groups = []
  
  // Proxies
  if (config.value.proxies) {
      const proxies = Object.values(config.value.proxies)
          .map(p => ({ id: p.id, label: p.label || p.name }))
          .sort((a, b) => a.label.localeCompare(b.label))
          
      if (proxies.length > 0) {
          groups.push({ label: t('lblProxies'), options: proxies })
      }
  }
  
  // Proxy Groups
  if (config.value.proxyGroups) {
      const proxyGroups = Object.values(config.value.proxyGroups)
          .map(g => ({ id: g.id, label: g.name }))
          .sort((a, b) => a.label.localeCompare(b.label))
          
      if (proxyGroups.length > 0) {
          groups.push({ label: t('lblProxyGroups'), options: proxyGroups })
      }
  }
  
  return groups
})


const confirmQuickAdd = async () => {
    if (selectedDomains.value.length === 0) return
    
    const newRules = selectedDomains.value.map(pattern => {
        return {
            id: `rule_quick_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: 'rule',
            ruleType: 'wildcard', 
            pattern: pattern,
            proxyId: quickProxyId.value,
            valid: true,
            // ruleSet: {} // Not needed for simple rules
        }
    })

    if (quickDestination.value === 'temporary') {
        // Add to temporary rules (Session)
        // Note: 'tempRules' in session storage, injected by background
        // We need to store in chrome.storage.session
        const sessionData = await chrome.storage.session.get('tempRules')
        let tempRules = sessionData.tempRules || []
        tempRules = [...newRules, ...tempRules]
        
        await chrome.storage.session.set({ tempRules: JSON.parse(JSON.stringify(tempRules)) })
        
        // Notify Background to re-apply if currently active
        // Actually background detects session changes to tempRules and re-applies!
        
        toast.success(t('msgRulesAddedTemp', [newRules.length]))
    } else {
        // Add to current policy (Persistent)
        const policyId = activeProfileId.value
        // Verify it exists in config
        if (!config.value.policies[policyId]) return

        if (!Array.isArray(config.value.policies[policyId].rules)) {
            config.value.policies[policyId].rules = []
        }
        
        // Prepend logic
        config.value.policies[policyId].rules = [...newRules, ...config.value.policies[policyId].rules]
        
        await saveConfig(config.value)
        toast.success(t('msgRulesAddedPolicy', [newRules.length, config.value.policies[policyId].name || 'Policy']))
    }
    
    // Clear selection and switch back
    selectedDomains.value = []
    currentTab.value = 'proxy'
}

const showToast = (text, duration = 2000) => {
    notificationText.value = text
    showNotification.value = true
    if (notificationTimer) clearTimeout(notificationTimer)
    notificationTimer = setTimeout(() => {
        showNotification.value = false
    }, duration)
}

const copyDomain = (domain) => {
    navigator.clipboard.writeText(domain).then(() => {
        showToast(t('msgCopiedGeneric'))
    })
}

// ... Quick Add Helper ...
const toast = {
    success: (msg) => {
        showToast(msg)
    }
}



</script>
