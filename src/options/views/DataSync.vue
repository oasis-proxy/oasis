<template>
  <div class="h-100 d-flex flex-column">
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div>
        <h2 class="fs-4 font-bold text-slate-900 dark:text-slate-50 m-0">Data Synchronization</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">Manage cloud synchronization and version comparison.</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5">
      <div class="max-w-5xl mx-auto">
        
        <!-- Maintenance Operations -->
        <section class="mb-5">
             <h3 class="text-sm font-semibold ui-label mb-4 m-0">
                Maintenance Operations
            </h3>
            <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-slate-700 shadow-sm transition-colors">
                
                <!-- Auto Sync -->
                 <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <div class="d-flex items-start">
                    <div>
                      <p class="text-sm font-medium ui-text-primary m-0">Auto Sync</p>
                      <p class="text-xs ui-text-secondary mt-0.5 m-0">Synchronize settings across devices automatically.</p>
                    </div>
                  </div>
                  <div class="form-check form-switch">
                    <input v-model="config.sync.enabled" class="form-check-input" type="checkbox" role="switch" id="autoSyncSwitch">
                  </div>
                </div>

                <!-- Maintenance Buttons -->
                <div class="d-flex align-items-center justify-content-between px-4 pt-3 pb-4 hover:bg-slate-50/50 transition-colors">
                  <div class="d-flex items-start">
                    <div>
                      <p class="text-sm font-medium ui-text-primary m-0">Maintenance</p>
                      <p class="text-xs ui-text-secondary mt-0.5 m-0">Manage configuration data.</p>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="h-8 px-3 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-upload text-sm"></i> Import
                    </button>
                    <button class="h-8 px-3 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-download text-sm"></i> Export
                    </button>
                     <button class="h-8 px-3 text-xs font-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-trash text-sm"></i> Clear
                    </button>
                  </div>
                </div>
            </div>
        </section>

        <!-- Sync Status Section -->
        <div class="d-flex align-items-center justify-content-center gap-4">
            
            <!-- Local Version Card -->
            <div class="flex-1 ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                    <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                        <i class="bi bi-laptop fs-5"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2">
                             <h3 class="text-sm font-semibold ui-text-primary m-0">Local Version</h3>
                             <span v-if="localNewer" class="px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-xs font-bold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">Newer</span>
                        </div>
                        <p class="text-xs ui-text-secondary m-0">This device</p>
                    </div>
                </div>
                
                <div class="d-flex flex-column gap-3 position-relative z-10">
                    <!-- Last Modified -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Last Modified</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">
                            {{ localLastModified || 'Unknown' }}
                        </p>
                    </div>
                    
                    <!-- Config Version -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Config Ver.</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ configVersion }}</p>
                    </div>

                    <!-- Software Version -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Software Ver.</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ softwareVersion }}</p>
                    </div>
                    
                    <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 d-flex flex-column gap-3">
                        <!-- Proxy Hosts -->
                        <div class="d-flex justify-content-between align-items-start">
                             <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Proxy Hosts ({{ proxyCount }})</p>
                             <ul class="d-flex flex-column gap-1 m-0 p-0 text-end align-items-end">
                                <li v-for="host in previewProxies" :key="host.id" class="text-xs ui-text-secondary d-flex align-items-center gap-1.5 truncate flex-row-reverse">
                                    <span class="d-inline-block w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span> {{ host.label }}
                                </li>
                            </ul>
                        </div>

                        <!-- Policies -->
                        <div class="d-flex justify-content-between align-items-start">
                             <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Policies ({{ policyCount }})</p>
                             <ul class="d-flex flex-column gap-1 m-0 p-0 text-end align-items-end">
                                <li v-for="policy in previewPolicies" :key="policy.id" class="text-xs ui-text-secondary d-flex align-items-center gap-1.5 truncate flex-row-reverse">
                                    <span class="d-inline-block w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span> {{ policy.name }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-column justify-content-center gap-3 flex-shrink-0 z-10">
                <button class="group d-flex align-items-center justify-content-between gap-3 w-40 px-3 py-3 ui-card rounded-lg border hover:border-primary hover:text-primary transition-all shadow-sm">
                    <div class="text-start">
                        <span class="d-block text-xs font-bold">Sync to Cloud</span>
                        <span class="d-block text-xs ui-text-secondary group-hover:text-primary/70">Local overwrites Cloud</span>
                    </div>
                    <i class="bi bi-arrow-right text-base group-hover:translate-x-0.5 transition-transform"></i>
                </button>
                 <button class="group d-flex align-items-center justify-content-between gap-3 w-40 px-3 py-3 ui-card rounded-lg border hover:border-primary hover:text-primary transition-all shadow-sm">
                    <i class="bi bi-arrow-left text-base group-hover:-translate-x-0.5 transition-transform"></i>
                    <div class="text-end">
                        <span class="d-block text-xs font-bold">Sync to Local</span>
                        <span class="d-block text-xs ui-text-secondary group-hover:text-primary/70">Cloud overwrites Local</span>
                    </div>
                </button>
            </div>

            <!-- Cloud Version Card -->
            <div class="flex-1 ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                    <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                         <i class="bi bi-cloud fs-5"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <h3 class="text-sm font-semibold ui-text-primary m-0">Cloud Version</h3>
                            <span v-if="cloudNewer" class="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Newer</span>
                        </div>
                        <p class="text-xs ui-text-secondary m-0">Remote repository</p>
                    </div>
                </div>

                <div class="d-flex flex-column gap-3 position-relative z-10">
                     <!-- Last Modified -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Last Modified</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">Unknown</p>
                    </div>
                    
                    <!-- Config Version -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Config Ver.</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ cloudConfigVersion }}</p>
                    </div>

                     <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <div v-if="!cloudConfig" class="d-flex align-items-center justify-content-center py-4">
                            <p class="text-xs ui-text-secondary m-0 fst-italic">Not connected / Empty</p>
                        </div>
                        <div v-else class="d-flex align-items-center justify-content-center py-4">
                            <i class="bi bi-check-circle-fill text-green-500 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { loadConfig, saveGeneralSettings, syncToCloud, syncFromCloud } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { toast } from '../utils/toast'

// State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
const cloudConfig = ref(null)
const localLastModified = ref(new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC')
const localNewer = ref(false)
const cloudNewer = ref(false)
const softwareVersion = ref('Unknown')

// Computed
const configVersion = computed(() => config.version ? `v${config.version}` : 'v1')
const cloudConfigVersion = computed(() => cloudConfig.value?.version ? `v${cloudConfig.value.version}` : '-')

const proxyCount = computed(() => Object.keys(config.proxies || {}).length)
const policyCount = computed(() => Object.keys(config.policies || {}).length)

const previewProxies = computed(() => {
    return Object.values(config.proxies || {}).slice(0, 3)
})

const previewPolicies = computed(() => {
    return Object.values(config.policies || {}).slice(0, 2)
})

// Initialize
const loadData = async () => {
    try {
        // 1. Get Software Version
        try {
            const manifest = chrome.runtime.getManifest()
            softwareVersion.value = manifest.version || 'Unknown'
        } catch (e) { softwareVersion.value = 'Dev Build' }

        // 2. Load Local Config
        const loaded = await loadConfig()
        Object.assign(config, loaded) // Reactive update

        // 3. Load Cloud Config (Simulation or Real)
        try {
            const result = await chrome.storage.sync.get('config')
            if (result && result.config) {
                cloudConfig.value = result.config
            } else {
                cloudConfig.value = null
            }
        } catch (e) {
            console.warn('Cloud storage access failed', e)
            cloudConfig.value = null
        }

        // 4. Compare Versions
        compareVersions()

    } catch (e) {
        console.error('Failed to load data', e)
    }
}

const compareVersions = () => {
    const localVer = config.version || 1
    const cloudVer = cloudConfig.value?.version || 0
    
    localNewer.value = localVer > cloudVer || !cloudConfig.value
    cloudNewer.value = cloudVer > localVer
}

onMounted(() => {
    loadData()
})

// Watch for changes and save (for Auto Sync toggle)
watch(config, (newVal) => {
    saveGeneralSettings(newVal)
    // After auto-sync might have triggered, refresh status
    // Delay slightly to allow storage write
    setTimeout(loadData, 500)
}, { deep: true })

// Handlers
const handleSyncToCloud = async () => {
    await syncToCloud(config)
    toast.success('Synced to cloud successfully')
    await loadData()
}

const handleSyncFromLocal = async () => {
    // Sync TO Local from Cloud
    const success = await syncFromCloud(true) // Force pull
    if (success) {
        toast.success('Synced from cloud successfully')
        await loadData() // Reload local config to reflect changes
    } else {
        toast.error('Failed to sync from cloud (Empty or Error)')
    }
}

</script>
