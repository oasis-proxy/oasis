<template>
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
        class="tab-btn" 
        :class="{ active: currentTab === 'monitor' }"
        @click="currentTab = 'monitor'"
      >
        Monitor
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'quick' }"
        @click="currentTab = 'quick'"
      >
        Quick
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'info' }"
        @click="currentTab = 'info'"
      >
        Info
      </button>
    </div>
    
    <div class="header-actions">
       <button @click="openMonitor" class="header-btn" title="Open Monitor">
        <i class="bi bi-activity" style="font-size: 18px;"></i>
      </button>
      <button @click="openOptions" class="header-btn" title="Options">
        <i class="bi bi-gear" style="font-size: 18px;"></i>
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
              <div class="profile-radio">
                <i v-if="isActive('direct')" class="bi bi-check" style="font-size: 10px;"></i>
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
              <div class="profile-radio">
                <i v-if="isActive('system')" class="bi bi-check" style="font-size: 10px;"></i>
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
              <div v-else class="profile-radio"></div>
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
              <div v-else class="profile-radio"></div>
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
              <div v-else class="profile-radio"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- PLACEHOLDERS FOR OTHER TABS -->
      <div v-if="currentTab === 'monitor'" class="d-flex flex-column h-100 bg-white dark:bg-background-dark">
          <!-- Protocol Warning -->
          <div v-if="!isProtocolSupported" class="flex-1 d-flex align-items-center justify-content-center text-secondary">
               <div class="text-center p-4">
                   <i class="bi bi-shield-exclamation text-3xl mb-2 d-block opacity-50"></i>
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
                class="d-flex align-items-center py-3 border-bottom border-light dark:border-divider-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                style="padding-left: 0.75rem; padding-right: 0.75rem;"
             >
                 <!-- Domain Column (60%) -->
                 <div class="pe-3 overflow-hidden" style="flex: 0 0 60%;">
                     <div class="fw-medium text-sm text-body text-truncate" :title="item.domain">
                         {{ item.domain }}
                     </div>
                 </div>
                 
                 <!-- IPs Column (40%) -->
                 <div class="d-flex flex-wrap justify-content-end gap-1.5 overflow-hidden" style="flex: 0 0 40%;">
                     <span v-for="ip in item.ips" :key="ip" 
                        class="badge bg-light text-secondary border fw-normal font-mono max-w-full text-truncate"
                        :title="ip"
                     >
                         {{ formatIp(ip) }}
                     </span>
                 </div>
             </div>
          </div>
      </div>

       <div v-if="currentTab === 'quick'" class="d-flex align-items-center justify-content-center h-100 text-secondary">
          <div class="text-center p-4">
              <i class="bi bi-lightning-charge text-3xl mb-2 d-block"></i>
              <p>Quick Add coming soon.</p>
          </div>
      </div>

       <div v-if="currentTab === 'info'" class="d-flex align-items-center justify-content-center h-100 text-secondary">
          <div class="text-center p-4">
              <i class="bi bi-info-circle text-3xl mb-2 d-block"></i>
              <p class="mb-1 fw-bold">Oasis Proxy</p>
              <p class="small text-muted">Version 1.0.0</p>
          </div>
      </div>

    </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadConfig, saveConfig } from '../common/storage'

const config = ref(null)
const activeProfileId = ref('direct')
const currentTab = ref('proxy') // proxy, monitor, quick, info
const monitorResult = ref([])
const activeTabId = ref(null)
const currentTabUrl = ref('')

// Load configuration
onMounted(async () => {
  config.value = await loadConfig()
  activeProfileId.value = config.value.activeProfileId || 'direct'
  
  // Apply theme based on config
  applyTheme(config.value.ui?.theme || 'auto')

  // Get current tab info
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0) {
      activeTabId.value = tabs[0].id
      currentTabUrl.value = tabs[0].url
  }

  // Auto-switch to monitor if enabled
  if (config.value.behavior?.connectionMonitoring) {
      currentTab.value = 'monitor'
      loadMonitorData()
      chrome.storage.onChanged.addListener(storageListener)
  }
})

import { onUnmounted } from 'vue'

onUnmounted(() => {
    chrome.storage.onChanged.removeListener(storageListener)
})

const applyTheme = (mode) => {
  const html = document.documentElement
  if (mode === 'dark') {
    html.classList.add('dark')
  } else if (mode === 'light') {
    html.classList.remove('dark')
  } else {
    // Auto mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

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

const openOptions = () => {
  chrome.runtime.openOptionsPage()
}

const openMonitor = () => {
   currentTab.value = 'monitor'
}

// --- Monitor Logic ---
const isProtocolSupported = computed(() => {
    return /^https?:/.test(currentTabUrl.value)
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


</script>
