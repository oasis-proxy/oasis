<template>
  <aside class="w-72 bg-white border-end border-subtle d-flex flex-column shrink-0 transition-colors">
    <!-- Logo / Brand with Ripple Animation -->
    <div class="brand-section h-24 d-flex align-items-center px-3 transition-colors bg-white">
      <!-- Ripple Animation Container -->
      <div class="ripple-container">
        <div class="ripple-ring ripple-1"></div>
        <div class="ripple-ring ripple-2"></div>
        <div class="ripple-ring ripple-3"></div>
        <div class="ripple-core"></div>
      </div>
      <!-- Brand Text -->
      <img src="../../assets/img/oasis-proxy-primary-96px.png" alt="Oasis Proxy" class="brand-text logo-primary">
      <img src="../../assets/img/oasis-proxy-white-96px.png" alt="Oasis Proxy" class="brand-text logo-white">
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 d-flex flex-column gap-4">
      
      <!-- Fixed: Configuration -->
      <div>
        <div class="mb-2 d-flex align-items-center justify-content-between group cursor-pointer">
          <h3 class="text-xs font-semibold text-slate-400 tracking-wider m-0">Configuration</h3>
        </div>
        <div class="d-flex flex-column gap-1">
          <router-link 
            to="/settings" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
              @click="navigate"
              class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-all group"
              :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
            >
              <i class="bi bi-gear text-base"></i>
              <span class="text-xs text-truncate">General Settings</span>
            </button>
          </router-link>

          <router-link 
            to="/sync" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
              @click="navigate"
              class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-all group"
              :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
            >
              <i class="bi bi-cloud text-base"></i>
              <span class="text-xs text-truncate">Data Synchronization</span>
            </button>
          </router-link>

          <router-link 
            to="/temp-rules" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
               @click="navigate"
               class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
               :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
            >
              <i class="bi bi-clock-history text-base"></i>
              <span class="text-xs text-truncate">Temporary Rules</span>
            </button>
          </router-link>

          <!-- Request Monitor (opens in new tab) -->
          <button 
             v-if="shouldShowMonitor"
             @click="openMonitor"
             class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group nav-item-inactive"
          >
            <i class="bi bi-activity text-base"></i>
            <span class="text-xs text-truncate">Request Monitor</span>
            <i class="bi bi-box-arrow-up-right text-xs ms-auto opacity-50"></i>
          </button>
        </div>
      </div>

      <!-- Variable: Proxy Hosts -->
      <div>
        <div class="mb-2 d-flex align-items-center justify-content-between group">
          <h3 class="text-xs font-semibold text-slate-400 tracking-wider m-0">Proxy Hosts</h3>
          <button 
            @click="showProxyModal = true"
            class="ui-button-icon"
          >
            <i class="bi bi-plus-lg text-sm"></i>
          </button>
        </div>
        <div class="d-flex flex-column gap-1">
          <router-link 
            v-for="host in proxyHosts" 
            :key="host.id"
            :to="`/host/${host.id}`"
            custom 
            v-slot="{ navigate, isActive }"
          >
             <button 
                @click="navigate"
                class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
                :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
             >
                <i :class="['bi text-base', host.icon, (isActive || host.color) ? '' : 'text-slate-400 group-hover:text-slate-600']" :style="{ color: host.color ? host.color : undefined }"></i>
                <span class="text-xs text-truncate">{{ host.name }}</span>
                <span v-if="host.status" :class="['ml-auto w-2 h-2 rounded-full', host.statusColor]"></span>
             </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Proxy Host Groups -->
      <div>
        <div class="mb-2 d-flex align-items-center justify-content-between group">
          <h3 class="text-xs font-semibold text-slate-400 tracking-wider m-0">Proxy Host Groups</h3>
          <button 
            @click="showGroupModal = true"
            class="ui-button-icon"
          >
            <i class="bi bi-plus-lg text-sm"></i>
          </button>
        </div>
        <div class="d-flex flex-column gap-1">
          <router-link 
            v-for="group in proxyGroupsList" 
            :key="group.id"
            :to="`/group/${group.id}`"
            custom 
            v-slot="{ navigate, isActive }"
          >
             <button 
                @click="navigate"
                class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
                :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
             >
                <i class="bi bi-layers-half text-base" :class="[(isActive || group.color) ? '' : 'text-slate-400 group-hover:text-slate-600']" :style="{ color: group.color ? group.color : undefined }"></i>
                <span class="text-xs text-truncate">{{ group.name }}</span>
             </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Policy Rules -->
      <div>
        <div class="mb-2 d-flex align-items-center justify-content-between group">
          <h3 class="text-xs font-semibold text-slate-400 tracking-wider m-0">Policy Rules</h3>
          <button 
            @click="showPolicyModal = true"
            class="ui-button-icon"
          >
            <i class="bi bi-plus-lg text-sm"></i>
          </button>
        </div>
        <div class="d-flex flex-column gap-1">
          <router-link 
            v-for="rule in policyRules" 
            :key="rule.id"
            :to="rule.type === 'pac' ? `/pac/${rule.id}` : `/policy/${rule.id}`"
            custom 
            v-slot="{ navigate, isActive }"
          >
             <button 
                @click="navigate"
                class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
                :class="isActive ? 'nav-item-active shadow-sm text-primary font-medium' : 'nav-item-inactive'"
             >
                <i :class="['bi text-base', rule.icon, (isActive || rule.color) ? '' : 'text-slate-400 group-hover:text-slate-600']" :style="{ color: rule.color ? rule.color : undefined }"></i>
                <span class="text-xs text-truncate">{{ rule.name }}</span>
             </button>
          </router-link>
        </div>
      </div>

    </nav>
    


    <!-- Modals -->
    <PolicyCreationModal 
      :visible="showPolicyModal"
      @close="showPolicyModal = false"
      @create="handleCreatePolicy"
    />
    <ProxyCreationModal 
      :visible="showProxyModal"
      @close="showProxyModal = false"
      @create="handleCreateProxy"
    />
    <ProxyGroupCreationModal
      :visible="showGroupModal"
      @close="showGroupModal = false"
      @create="handleCreateProxyGroup"
    />
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loadConfig, saveProxies, savePolicies, savePacs, saveProxyGroups } from '../../common/storage'
import { hasUnsavedChanges } from '../router'
import { toast } from '../utils/toast'
import PolicyCreationModal from './PolicyCreationModal.vue'
import ProxyCreationModal from './ProxyCreationModal.vue'
import ProxyGroupCreationModal from './ProxyGroupCreationModal.vue'

const router = useRouter()
const config = ref(null)
const showPolicyModal = ref(false)
const showProxyModal = ref(false)
const showGroupModal = ref(false)

// Computed lists for sidebar
const proxyHosts = computed(() => {
  if (!config.value?.proxies) return []
  return Object.values(config.value.proxies).map(p => ({
    id: p.id,
    name: p.label || p.host, // Fallback to host if label missing
    icon: 'bi-pc-display', // Static icon for now, could be dynamic based on type
    color: p.color, // Custom color
    status: null // No real status checking yet
  }))
})

const proxyGroupsList = computed(() => {
    if (!config.value?.proxyGroups) return []
    return Object.values(config.value.proxyGroups).map(g => ({
        id: g.id,
        name: g.name || 'Unnamed Group',
        color: g.color,
        type: 'group'
    }))
})

const policyRules = computed(() => {
    if (!config.value) return []
    const rules = []
    
    // 1. PAC Scripts
    if (config.value.pacs) {
        Object.values(config.value.pacs).forEach(pac => {
            rules.push({
                id: pac.id,
                name: pac.name || pac.url || 'Unnamed PAC', // Support 'name' property
                icon: 'bi-file-earmark-code', // Distinct icon for PAC
                color: pac.color,
                type: 'pac'
            })
        })
    }

    // 2. Auto Policies
    if (config.value.policies) {
        Object.values(config.value.policies).forEach(policy => {
            rules.push({
                id: policy.id,
                name: policy.name || policy.id, // Support 'name' property
                icon: 'bi-signpost-split-fill',
                color: policy.color,
                type: 'policy'
            })
        })
    }
    
    return rules
})

// Load Data
const refreshConfig = async () => {
    config.value = await loadConfig()
}

onMounted(() => {
    refreshConfig()
    // Listen for storage changes to update sidebar list
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            refreshConfig()
        }
    })
})

const handleCreateProxy = async ({ name }) => {
    // Check for unsaved changes
    const unsaved = hasUnsavedChanges()
    if (unsaved) {
        return // Toast already shown
    }
    
    const latestConfig = await loadConfig()
    const id = `proxy_${Date.now()}`
    
    if (!latestConfig.proxies || typeof latestConfig.proxies !== 'object') latestConfig.proxies = {}
    
    latestConfig.proxies[id] = {
        id: id,
        type: 'server',
        label: name,
        scheme: 'http', // Default to HTTP
        host: '',
        port: null,
        auth: null,
        bypassList: [],
        color: '#137fec' // Default Primary Blue
    }

    await saveProxies(latestConfig.proxies)
    toast.success('Proxy host created successfully')
    showProxyModal.value = false
    router.push(`/host/${id}`)
}

const handleCreatePolicy = async ({ name, type }) => {
    // Check for unsaved changes
    const unsaved = hasUnsavedChanges()
    if (unsaved) {
        return // Toast already shown
    }
    
    // Reload latest config to ensure atomicity-ish
    const latestConfig = await loadConfig()
    // Simple ID generation - in real app might want UUID or check collision
    const id = `${type}_${Date.now()}`

    if (type === 'pac') {
        if (!latestConfig.pacs || typeof latestConfig.pacs !== 'object') latestConfig.pacs = {}
        latestConfig.pacs[id] = {
            id: id,
            name: name, // Saving the user-provided name
            url: '',
            color: '#8b5cf6' // violet-500
        }
    } else {
        if (!latestConfig.policies || typeof latestConfig.policies !== 'object') latestConfig.policies = {}
        latestConfig.policies[id] = {
            id: id,
            name: name, // Saving the user-provided name
            defaultProfileId: 'direct',
            rules: [],
            color: '#10b981' // emerald-500
        }
    }

    if (type === 'pac') {
       await savePacs(latestConfig.pacs)
       toast.success('PAC script created successfully')
    } else {
       await savePolicies(latestConfig.policies)
       toast.success('Policy created successfully')
    }
    
    // Navigation
    if (type === 'pac') {
        router.push(`/pac/${id}`)
    } else {
        router.push(`/policy/${id}`)
    }
}

const handleCreateProxyGroup = async ({ name }) => {
    const unsaved = hasUnsavedChanges()
    if (unsaved) return

    const latestConfig = await loadConfig()
    const id = `group_${Date.now()}`
    
    if (!latestConfig.proxyGroups || typeof latestConfig.proxyGroups !== 'object') latestConfig.proxyGroups = {}
    
    latestConfig.proxyGroups[id] = {
        id: id,
        type: 'group',
        name: name,
        proxies: [], // Ordered list of proxy IDs
        fallback: { type: 'direct' }
    }
    
    await saveProxyGroups(latestConfig.proxyGroups)
    toast.success('Proxy group created successfully')
    showGroupModal.value = false
    router.push(`/group/${id}`)
}

// Open Request Monitor in new tab
const openMonitor = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/monitor/index.html') })
}

const shouldShowMonitor = computed(() => {
    if (!config.value) return false
    
    // Check if monitoring is enabled
    if (!config.value.behavior?.connectionMonitoring) return false
    
    // Check if active profile is Auto Policy
    const activeId = config.value.activeProfileId
    const policy = config.value.policies?.[activeId]
    
    if (policy && (policy.rules || policy.defaultProfileId)) {
        return true
    }
    
    return false
})
</script>

<style scoped>
/* Ripple Animation Styles */
.brand-section {
  --ripple-color: var(--bs-primary);
  --ripple-op-1: 0.3;
  --ripple-op-2: 0.5;
  --ripple-op-3: 0.7;
  gap: 4px;
}

.ripple-container {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.ripple-ring {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-style: solid;
  border-color: var(--ripple-color);
}

.ripple-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--ripple-color);
  box-shadow: 0 0 5px rgba(19, 127, 236, 0.8);
}

.brand-text {
  font-size: 24px;
  font-weight: 900;
  height: 36px;
  color: var(--ui-text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Ripple Keyframe Animations - matching 22.html */
@keyframes ripple-1 {
  0%   { width: 64px; height: 64px; border-width: 2px; opacity: var(--ripple-op-1); filter: blur(2px); }
  100% { width: 80px; height: 80px; border-width: 0px; opacity: 0; filter: blur(2px); }
}

@keyframes ripple-2 {
  0%   { width: 48px; height: 48px; border-width: 2px; opacity: var(--ripple-op-2); filter: blur(2px); }
  100% { width: 60px; height: 60px; border-width: 1px; opacity: 0; filter: blur(1px); }
}

@keyframes ripple-3 {
  0%   { width: 32px; height: 32px; border-width: 2px; opacity: var(--ripple-op-3); filter: blur(1px); }
  100% { width: 36px; height: 36px; border-width: 2px; opacity: 0; filter: blur(1px); }
}

.ripple-1 { animation: ripple-1 2s infinite ease-out; }
.ripple-2 { animation: ripple-2 2s infinite ease-out; }
.ripple-3 { animation: ripple-3 2s infinite ease-out; }

/* Dark Mode Adjustments */
:root.dark .brand-section {
  --ripple-color: #ffffff;
  --ripple-op-1: 0.2;
  --ripple-op-2: 0.4;
  --ripple-op-3: 0.6;
}

:root.dark .ripple-core {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.logo-white {
  display: none;
}

:root.dark .logo-primary {
  display: none;
}

:root.dark .logo-white {
  display: block;
}
</style>
