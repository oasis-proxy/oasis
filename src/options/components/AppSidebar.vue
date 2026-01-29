<template>
  <aside class="w-72 bg-slate-50 dark:bg-sidebar-dark border-r border-slate-200 dark:border-divider-dark d-flex flex-column shrink-0 transition-colors">
    <!-- Logo / Brand -->
    <div class="h-24 d-flex align-items-center px-4 border-b border-slate-100 dark:border-divider-dark transition-colors">
      <div class="d-flex align-items-center gap-3 text-slate-900 dark:text-white">
        <div class="size-8 bg-primary rounded-lg d-flex align-items-center justify-content-center text-white shadow-lg shadow-primary/30" style="width: 32px; height: 32px;">
          <i class="bi bi-router text-[20px]"></i>
        </div>
        <h1 class="text-base font-bold tracking-tight m-0">Oasis Proxy</h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 d-flex flex-column gap-4">
      
      <!-- Fixed: Configuration -->
      <div>
        <div class="px-2 mb-2 d-flex align-items-center justify-content-between group cursor-pointer">
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
              class="w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-lg transition-all border group"
              :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
            >
              <i class="bi bi-gear text-[20px]"></i>
              <span class="text-sm">General Settings</span>
            </button>
          </router-link>

          <router-link 
            to="/temp-rules" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
               @click="navigate"
               class="w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
               :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
            >
              <i class="bi bi-clock-history text-[20px]"></i>
              <span class="text-sm">Temporary Rules</span>
            </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Proxy Hosts -->
      <div>
        <div class="px-2 mb-2 d-flex align-items-center justify-content-between group">
          <h3 class="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider m-0">Proxy Hosts</h3>
          <button 
            @click="showProxyModal = true"
            class="ui-button-icon"
          >
            <i class="bi bi-plus text-[14px]"></i>
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
                class="w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
                :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
             >
                <i :class="['bi text-[20px]', host.icon, isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300']" :style="{ color: host.color ? host.color : undefined }"></i>
                <span class="text-sm">{{ host.name }}</span>
                <span v-if="host.status" :class="['ml-auto w-2 h-2 rounded-full', host.statusColor]"></span>
             </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Policy Rules -->
      <div>
        <div class="px-2 mb-2 d-flex align-items-center justify-content-between group">
          <h3 class="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider m-0">Policy Rules</h3>
          <button 
            @click="showPolicyModal = true"
            class="ui-button-icon"
          >
            <i class="bi bi-plus text-[14px]"></i>
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
                class="w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
                :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
             >
                <i :class="['bi text-[20px]', rule.icon, isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300']"></i>
                <span class="text-sm">{{ rule.name }}</span>
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
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loadConfig, saveProxies, savePolicies, savePacs } from '../../common/storage'
import PolicyCreationModal from './PolicyCreationModal.vue'
import ProxyCreationModal from './ProxyCreationModal.vue'

const router = useRouter()
const config = ref(null)
const showPolicyModal = ref(false)
const showProxyModal = ref(false)

// Computed lists for sidebar
const proxyHosts = computed(() => {
  if (!config.value?.proxies) return []
  return Object.values(config.value.proxies).map(p => ({
    id: p.id,
    name: p.label || p.host, // Fallback to host if label missing
    icon: 'bi-hdd-network', // Static icon for now, could be dynamic based on type
    color: p.color, // Custom color
    status: null // No real status checking yet
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
                icon: 'bi-diagram-3',
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
        bypassList: []
    }

    await saveProxies(latestConfig.proxies)
    showProxyModal.value = false
    router.push(`/host/${id}`)
}

const handleCreatePolicy = async ({ name, type }) => {
    // Reload latest config to ensure atomicity-ish
    const latestConfig = await loadConfig()
    // Simple ID generation - in real app might want UUID or check collision
    const id = `${type}_${Date.now()}`

    if (type === 'pac') {
        if (!latestConfig.pacs || typeof latestConfig.pacs !== 'object') latestConfig.pacs = {}
        latestConfig.pacs[id] = {
            id: id,
            name: name, // Saving the user-provided name
            url: '' 
        }
    } else {
        if (!latestConfig.policies || typeof latestConfig.policies !== 'object') latestConfig.policies = {}
        latestConfig.policies[id] = {
            id: id,
            name: name, // Saving the user-provided name
            defaultProfileId: 'direct',
            rules: []
        }
    }

    if (type === 'pac') {
       await savePacs(latestConfig.pacs)
    } else {
       await savePolicies(latestConfig.policies)
    }
    
    // Navigation
    router.push(`/policy/${id}`)
}
</script>
