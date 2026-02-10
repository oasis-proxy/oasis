<template>
  <!-- Global Notifications -->
  <div v-if="showNotification" class="position-fixed top-0 start-0 w-100 d-flex justify-content-center mt-4" style="z-index: 9999; pointer-events: none;">
      <div class="badge bg-secondary px-3 py-2 shadow-lg animate-fade-in" style="font-size: 13px; opacity: 0.95;">
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
        Proxy
      </button>
      <button 
        v-if="showMonitorTab"
        class="tab-btn" 
        :class="{ active: currentTab === 'monitor' }"
        @click="currentTab = 'monitor'"
      >
        Monitor
      </button>
      <button 
        v-if="showQuickTab"
        class="tab-btn" 
        :class="{ active: currentTab === 'quick' }"
        @click="currentTab = 'quick'"
      >
        Quick
      </button>
    </div>
    
    <div class="header-actions">
       <button @click="openSidePanel" class="ui-button-icon" title="Open Downloads">
        <i class="bi bi-layout-sidebar-reverse" style="font-size: 16px;"></i>
      </button>
       <button v-if="showMonitorTab" @click="openMonitor" class="ui-button-icon" title="Open Monitor">
        <i class="bi bi-activity" style="font-size: 16px;"></i>
      </button>
      <button @click="openOptions" class="ui-button-icon" title="Options">
        <i class="bi bi-gear" style="font-size: 16px;"></i>
      </button>
    </div>
  </header>

    <!-- Main Content -->
    <main class="popup-main">
      
      <!-- PROXY TAB -->
      <div v-if="currentTab === 'proxy'">
        <!-- Defaults Section -->
        <div class="mb-2">
          <h3 class="section-heading">Defaults</h3>
          <div>
            <label 
              class="profile-item"
              :class="{ active: isActive('direct') }"
              @click="selectProfile('direct')"
            >
              <div class="profile-icon">
                <i class="bi bi-lightning" style="font-size: 18px;"></i>
              </div>
              <p class="profile-name">Direct Connect</p>
              <div 
                v-if="isActive('direct')"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
              </div>
            </label>

            <label 
              class="profile-item"
              :class="{ active: isActive('system') }"
              @click="selectProfile('system')"
            >
              <div class="profile-icon">
                <i class="bi bi-globe" style="font-size: 18px;"></i>
              </div>
              <p class="profile-name">System Proxy</p>
              <div 
                v-if="isActive('system')"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- Host Proxy Section -->
        <div v-if="hostProxies.length > 0" class="mb-2">
          <h3 class="section-heading">Host Proxy</h3>
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
                <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- PAC Script Section -->
        <div v-if="pacScripts.length > 0" class="mb-2">
          <h3 class="section-heading">PAC Script</h3>
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
                <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
              </div>
            </label>
          </div>
        </div>

        <!-- Auto Policy Section -->
        <div v-if="autoPolicies.length > 0" class="mb-2">
          <h3 class="section-heading">Auto Policy</h3>
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
                <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
              </div>
              <p class="profile-name">{{ profile.name }}</p>
              <div 
                v-if="isActive(profile.id)"
                class="text-primary"
              >
                <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
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
                   <p class="text-sm">Monitoring not available.</p>
                   <p class="text-xs text-muted">Only HTTP/HTTPS pages are supported.</p>
               </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="monitorResult.length === 0" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
             <div class="text-center p-4">
                 <i class="bi bi-activity text-3xl mb-2 d-block opacity-50"></i>
                 <p class="text-sm">No requests recorded.</p>
                 <p class="text-xs text-muted">Refresh the page to capture traffic.</p>
             </div>
          </div>
          
          <!-- List -->
          <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-0">
             <div v-for="(item, index) in monitorResult" :key="index" 
                class="monitor-item d-flex align-items-center py-3 transition-colors"
                style="padding-left: 0.75rem; padding-right: 0.75rem; border-bottom: 1px solid var(--ui-border);"
             >
                 <!-- Domain Column (60%) -->
                 <div class="pe-3 overflow-hidden" style="flex: 0 0 60%;">
                     <div 
                        class="monitor-domain fw-medium text-truncate" 
                        style="cursor: pointer; font-size: 12px;"
                        :title="`Click to copy: ${item.domain}`"
                        @click="copyDomain(item.domain)"
                     >
                         {{ item.domain }}
                     </div>
                 </div>
                 
                 <!-- IP/Error Column (40%) -->
                 <div class="d-flex flex-wrap justify-content-end gap-1.5 overflow-hidden" style="flex: 0 0 40%;">
                     <span v-if="item.error" class="monitor-error text-danger text-truncate" style="font-size: 12px;" :title="item.error">
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
       <div v-if="currentTab === 'quick'" class="monitor-container d-flex flex-column h-100" style="font-size: 12px;">
          <p class="py-2 text-xs m-0 ui-text-primary z-10 sticky-top flex-shrink-0" style="padding-left: 0.75rem; padding-right: 0.75rem; background-color: var(--ui-bg-card);">Select domains to proxy from current page</p>
          
          <div v-if="failedDomains.length === 0" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
             <div class="text-center p-4">
                 <i class="bi bi-check-circle text-3xl mb-2 d-block opacity-50 text-success"></i>
                 <p class="text-xs">No failed requests.</p>
                 <p class="text-xs text-muted">Page is working correctly.</p>
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
                    class="form-check-input"
                  />
                  <span class="text-truncate text-xs">{{ domain }}</span>
                </label>
              </div>
            </div>

            <!-- Proxy Host Section -->
            <div class="quick-section">
              <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">Proxy Host</label>
              <select v-model="quickProxyId" class="form-select ui-input border text-xs cursor-pointer" style="height: 28px; width: 100px; padding: 0 6px; border-radius: 6px; font-size: 12px !important;">
                <option v-for="proxy in proxyOptionsArray" :key="proxy.id" :value="proxy.id">
                    {{ proxy.label }}
                </option>
              </select>
            </div>

            <!-- Destination Section -->
            <div class="quick-section">
              <label class="fw-bold ui-text-secondary uppercase tracking-wider text-xs m-0">Add To</label>
              <select v-model="quickDestination" class="form-select ui-input border text-xs cursor-pointer" style="height: 28px; width: 120px; padding: 0 6px; border-radius: 6px; font-size: 12px !important;">
                <option value="policy">Current Policy</option>
                <option value="temporary">Temporary Rules</option>
              </select>
            </div>

            <!-- Actions Section -->
            <div class="quick-section justify-content-end gap-2 pb-3"> 
              <button @click="currentTab = 'proxy'" class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all">
                Cancel
              </button>
              <button @click="confirmQuickAdd" :disabled="selectedDomains.length === 0" class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg shadow-primary/30 transition-colors border-0">
                Confirm
              </button>
            </div>
          </div>
       </div>



    </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
  root.classList.remove('dark')
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  }
  // 'light' is default, no class needed
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
const isActiveProfilePolicy = computed(() => {
    return !!config.value?.policies?.[activeProfileId.value]
})

const showQuickTab = computed(() => {
    return isActiveProfilePolicy.value && (failedDomains.value.length > 0 || !!contextMenuDomain.value)
})

const failedDomains = computed(() => {
    // Priority: Context Menu Intent
    if (contextMenuDomain.value) {
        return [contextMenuDomain.value]
    }

    const errorItems = monitorResult.value.filter(i => i.error)
    if (errorItems.length === 0) return []

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

const proxyOptionsArray = computed(() => {
  if (!config.value) return [{ id: 'direct', label: 'Direct' }]
  const options = [{ id: 'direct', label: 'Direct' }]
  if (config.value.proxies) {
    Object.values(config.value.proxies).forEach(p => {
      options.push({ id: p.id, label: p.label || p.name })
    })
  }
  return options
})

// Removed isAllSelected as per user request (Select All header removed)
// Removed toggleSelectAll as per user request (Select All header removed)

const confirmQuickAdd = async () => {
    if (selectedDomains.value.length === 0) return
    
    const newRules = selectedDomains.value.map(pattern => ({
        id: `rule_quick_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'rule',
        ruleType: 'wildcard',
        pattern: pattern,
        valid: true,
        proxyId: quickProxyId.value,
        ruleSet: {}
    }))

    if (quickDestination.value === 'temporary') {
        // Add to temporary rules
        if (!Array.isArray(config.value.temporaryRules)) {
            config.value.temporaryRules = []
        }
        config.value.temporaryRules = [...newRules, ...config.value.temporaryRules]
        
        // Save
        await saveConfig(config.value)
        
        // Clear selection and switch back
        selectedDomains.value = []
        currentTab.value = 'proxy'
        
        toast.success(`${newRules.length} rules added to Temporary Rules`)
    } else {
        // Add to current policy
        const policy = config.value.policies[activeProfileId.value]
        if (!policy) return

        if (!Array.isArray(policy.rules)) policy.rules = []

        // Prepend new rules
        policy.rules = [...newRules, ...policy.rules]

        // Save
        await saveConfig(config.value)
        
        // Clear selection and switch back
        selectedDomains.value = []
        currentTab.value = 'proxy'
        
        toast.success(`${newRules.length} rules added to ${policy.name}`)
    }
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
        showToast('Copied to clipboard')
    })
}

// ... Quick Add Helper ...
const toast = {
    success: (msg) => {
        showToast(msg)
    }
}



</script>
