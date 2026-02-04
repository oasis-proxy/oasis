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
                    <input :checked="config.sync.enabled" @change="toggleAutoSync" class="form-check-input" type="checkbox" role="switch" id="autoSyncSwitch">
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
                    <input type="file" ref="fileInput" accept=".json" @change="handleImportFile" style="display: none;" />
                    
                    <button @click="triggerImport" class="h-8 px-3 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-upload text-sm"></i> Import
                    </button>
                    <button @click="handleExport" class="h-8 px-3 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-download text-sm"></i> Export
                    </button>
                     <button @click="handleClearLocal" class="h-8 px-3 text-xs font-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-trash text-sm"></i> Clear Local
                    </button>
                    <button @click="handleClearCloud" class="h-8 px-3 text-xs font-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-cloud-slash text-sm"></i> Clear Sync
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
                    <div>
                        <div class="d-flex align-items-center gap-2">
                             <h3 class="text-sm font-semibold ui-text-primary m-0">Local Version</h3>
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
                <button @click="handleSyncToCloud" class="group d-flex align-items-center justify-content-between gap-3 w-40 px-3 py-3 ui-card rounded-lg border hover:border-primary hover:text-primary transition-all shadow-sm">
                    <div class="text-start">
                        <span class="d-block text-xs font-bold ui-text-primary group-hover:text-primary">Sync to Cloud</span>
                        <span class="d-block text-xs ui-text-secondary group-hover:text-primary/70">Local overwrites Cloud</span>
                    </div>
                    <i class="bi bi-arrow-right-circle-fill text-lg text-primary group-hover:translate-x-0.5 transition-transform"></i>
                </button>
                 <button @click="handleSyncFromLocal" class="group d-flex align-items-center justify-content-between gap-3 w-40 px-3 py-3 ui-card rounded-lg border hover:border-primary hover:text-primary transition-all shadow-sm">
                    <i class="bi bi-arrow-left-circle-fill text-lg text-primary group-hover:-translate-x-0.5 transition-transform"></i>
                    <div class="text-end">
                        <span class="d-block text-xs font-bold ui-text-primary group-hover:text-primary">Sync to Local</span>
                        <span class="d-block text-xs ui-text-secondary group-hover:text-primary/70">Cloud overwrites Local</span>
                    </div>
                </button>
            </div>

            <!-- Cloud Version Card -->
            <div class="flex-1 ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <h3 class="text-sm font-semibold ui-text-primary m-0">Cloud Version</h3>
                        </div>
                        <p class="text-xs ui-text-secondary m-0">Remote repository</p>
                    </div>
                </div>

                <div class="d-flex flex-column gap-3 position-relative z-10">
                     <!-- Last Modified -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Last Modified</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ cloudLastModified }}</p>
                    </div>
                    
                    <!-- Config Version -->
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Config Ver.</p>
                        <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ cloudConfigVersion }}</p>
                    </div>

                    <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <div v-if="!cloudConfig" class="d-flex flex-column align-items-center justify-content-center py-4 text-slate-400">
                            <i class="bi bi-cloud-slash text-3xl mb-2"></i>
                            <span class="text-xs">No cloud data found</span>
                        </div>
                        <div v-else class="d-flex flex-column gap-3">
                             <!-- Proxy Hosts -->
                            <div class="d-flex justify-content-between align-items-start">
                                 <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Proxy Hosts ({{ cloudProxyCount }})</p>
                                 <ul v-if="cloudPreviewProxies.length > 0" class="d-flex flex-column gap-1 m-0 p-0 text-end align-items-end">
                                    <li v-for="host in cloudPreviewProxies" :key="host.id" class="text-xs ui-text-secondary d-flex align-items-center gap-1.5 truncate flex-row-reverse">
                                        <span class="d-inline-block w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span> {{ host.label }}
                                    </li>
                                </ul>
                                <span v-else class="text-xs ui-text-secondary">-</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex justify-content-between align-items-start">
                                 <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Policies ({{ cloudPolicyCount }})</p>
                                 <ul v-if="cloudPreviewPolicies.length > 0" class="d-flex flex-column gap-1 m-0 p-0 text-end align-items-end">
                                    <li v-for="policy in cloudPreviewPolicies" :key="policy.id" class="text-xs ui-text-secondary d-flex align-items-center gap-1.5 truncate flex-row-reverse">
                                        <span class="d-inline-block w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span> {{ policy.name }}
                                    </li>
                                </ul>
                                <span v-else class="text-xs ui-text-secondary">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
    <!-- Conflict Modal -->
    <SyncConflictModal 
        v-if="showConflictModal" 
        :localConfig="config" 
        :cloudConfig="cloudConfig" 
        @cancel="cancelAutoSync"
        @sync-local="resolveConflictLocal"
        @sync-cloud="resolveConflictCloud"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { loadConfig, saveGeneralSettings, syncToCloud, syncFromCloud, exportConfig, importConfig, clearLocalConfig, clearCloudConfig } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { toast } from '../utils/toast'
import SyncConflictModal from '../components/SyncConflictModal.vue'

// State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
const cloudConfig = ref(null)
const localLastModified = computed(() => {
    if (!config.updatedAt) return 'Unknown'
    return new Date(config.updatedAt).toLocaleString()
})
const cloudNewer = ref(false)
const softwareVersion = ref('Unknown')
const showConflictModal = ref(false)

// Computed
// Computed
const configVersion = computed(() => config.version ? `v${config.version}` : 'v1')
const cloudConfigVersion = computed(() => cloudConfig.value?.version ? `v${cloudConfig.value.version}` : '-')
const cloudLastModified = computed(() => {
    if (!cloudConfig.value?.timestamp) return 'Unknown'
    return new Date(cloudConfig.value.timestamp).toLocaleString()
})

const proxyCount = computed(() => Object.keys(config.proxies || {}).length)
const policyCount = computed(() => Object.keys(config.policies || {}).length)

const previewProxies = computed(() => {
    return Object.values(config.proxies || {})
})

const previewPolicies = computed(() => {
    return Object.values(config.policies || {})
})

const cloudProxyCount = computed(() => {
    return Object.keys(cloudConfig.value?.proxies || {}).length || 0
})
const cloudPolicyCount = computed(() => {
    return Object.keys(cloudConfig.value?.policies || {}).length || 0
})
const cloudPreviewProxies = computed(() => {
    return Object.values(cloudConfig.value?.proxies || {}).map(p => ({ id: p.id, label: p.label || p.name || p.id }))
})
const cloudPreviewPolicies = computed(() => {
    return Object.values(cloudConfig.value?.policies || {}).map(p => ({ id: p.id, name: p.name || 'Untitled' }))
})

// Initialize
const loadLocalData = async () => {
     try {
        // 1. Get Software Version
        try {
            const manifest = chrome.runtime.getManifest()
            softwareVersion.value = manifest.version || 'Unknown'
        } catch (e) { softwareVersion.value = 'Dev Build' }

        // 2. Load Local Config
        const loaded = await loadConfig()
        Object.assign(config, loaded) // Reactive update
        compareVersions()
    } catch (e) {
        console.error('Failed to load local data', e)
    }
}

const loadCloudData = async () => {
    try {
        // 3. Load Cloud Config (Full Chunk Reassembly for Preview)
        try {

            // Get EVERYTHING from sync storage to find all chunks
            const result = await chrome.storage.sync.get(null) 

            
            if (result.sync_meta) {

                const count = result.sync_meta.count
                let combinedJson = ''
                
                // Reassemble
                try {
                    for (let i = 0; i < count; i++) {
                        if (result[`sync_chunk_${i}`]) {
                            combinedJson += result[`sync_chunk_${i}`]
                        } else {
                            throw new Error(`Missing chunk ${i}`)
                        }
                    }
                    const fullCloudConfig = JSON.parse(combinedJson)
                    
                    // Attach metadata manually if needed, or rely on internal version
                    // We treat the reassembled object as the 'cloudConfig'
                    cloudConfig.value = fullCloudConfig
                    
                    // Inject timestamp from meta if missing in payload (usually payload has no timestamp top-level)
                    if (!cloudConfig.value.timestamp) {
                         cloudConfig.value.timestamp = result.sync_meta.timestamp
                    }
                    

                } catch (err) {
                    console.error('[DataSync] Reassembly failed:', err)
                    // If reassembly fails, we might still show meta version if possible, but safer to show null/error
                    cloudConfig.value = null
                }

            } else if (result.config) {

                cloudConfig.value = result.config
            } else {

                cloudConfig.value = null
            }
        } catch (e) {
            console.warn('[DataSync] Cloud storage access failed', e)
            cloudConfig.value = null
        }

        // 4. Compare Versions
        compareVersions()

    } catch (e) {
        console.error('Failed to load cloud data', e)
    }
}

const loadData = async () => {
    await loadLocalData()
    await loadCloudData()
}

const compareVersions = () => {
    const localVer = config.version || 1
    const cloudVer = cloudConfig.value?.version || 0
    
    // Only used for conflict detection now
    cloudNewer.value = cloudVer > localVer
}

onMounted(() => {
    loadData()
})

// Handlers

// Auto Sync Toggle Handler
// We need to intercept the change to check for conflicts first
const toggleAutoSync = async (event) => {
    const newValue = event.target.checked
    config.sync.enabled = newValue // Optimistic update, will revert if cancelled
    
    if (newValue) {
        // Turning ON: Check for conflicts
        await loadCloudData() // Ensure we have latest cloud data (DO NOT RELOAD LOCAL)
        if (cloudNewer.value) {
            // Conflict! Cloud is newer
            // But verify it's not just same version with different timestamp?
            // compareVersions logic: cloudVer > localVer
            
            showConflictModal.value = true
            // config.sync.enabled = false // Revert while deciding? No, keep logic simple in modal
        } else {
             // Safe to enable, trigger initial push
             // skipTouch=true because the sync itself will increment version if needed (triggerAutoSync -> syncToCloud)
             // If we touch here, we increment version just for the switch, then syncToCloud increments AGAIN.
             // Actually, if we skipTouch, local version stays same. syncToCloud takes local version, +1, saves to Cloud.
             // Then syncToCloud updates local version to +1.
             // So we avoid double increment.
             await saveGeneralSettings(config, false, true) 
             toast.success('Auto Sync Enabled')
        }
    } else {
        // Turning OFF
        // skipSync=true (don't sync obviously), skipTouch=true (don't version change)
        await saveGeneralSettings(config, true, true) 
    }
}


const handleSyncToCloud = async () => {
    await syncToCloud(config)
    toast.success('Synced to cloud successfully')
    showConflictModal.value = false
    await loadData()
}

const handleSyncFromLocal = async () => {
    // Sync TO Local from Cloud
    const success = await syncFromCloud(true) // Force pull
    if (success) {
        toast.success('Synced from cloud successfully')
        showConflictModal.value = false
        await loadData() // Reload local config to reflect changes
    } else {
        toast.error('Failed to sync from cloud (Empty or Error)')
    }
}

const resolveConflictCloud = async () => {
    // User chose to overwrite Cloud with Local
    // We already have Auto Sync enabled in config (optimistically set in toggleAutoSync)
    
    // 1. Push to Cloud
    await handleSyncToCloud()
    
    // 2. Persist Local Config with Sync Enabled
    config.sync.enabled = true
    await saveGeneralSettings(config, false, true) // skipSync=false (safe, just synced), skipTouch=true
    toast.success('Local version pushed to cloud. Auto Sync enabled.')
}

const resolveConflictLocal = async () => {
    // User chose to overwrite Local with Cloud
    // Force pull
    const success = await syncFromCloud(true)
    
    if (success) {
        // syncFromCloud preserves the local 'sync.enabled' state which was optimistically set to true.
        // However, to be absolutely sure and persist it:
        
        await loadData() // Reload to get fresh config from disk
        
        config.sync.enabled = true
        await saveGeneralSettings(config, true, true) // Save enabled state locally only
        
        toast.success('Synced from cloud successfully. Auto Sync enabled.')
        showConflictModal.value = false
    }
}

const cancelAutoSync = async () => {
    showConflictModal.value = false
    config.sync.enabled = false
    await saveGeneralSettings(config, true, true) // Save disabled state, skip sync, skip touch
}

// Maintenance Handlers
const fileInput = ref(null)

const triggerImport = () => {
    fileInput.value.click()
}

const handleImportFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
        try {
            const jsonString = e.target.result
            const success = await importConfig(jsonString)
            if (success) {
                toast.success('Configuration imported successfully')
                await loadData()
            } else {
                toast.error('Failed to import configuration')
            }
        } catch (err) {
            console.error(err)
            toast.error('Invalid configuration file')
        }
        // Reset input
        event.target.value = ''
    }
    reader.readAsText(file)
}

const handleExport = async () => {
    try {
        const jsonString = await exportConfig()
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `oasis_config_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Configuration exported')
    } catch (e) {
        console.error(e)
        toast.error('Failed to export configuration')
    }
}

const handleClearLocal = async () => {
    if (confirm('Are you sure you want to clear LOCAL configuration? This will reset everything to defaults and disable Auto Sync.')) {
        await clearLocalConfig()
        toast.success('Local configuration cleared')
        // We need to reload the page or re-init state fully
        await loadData() 
        // Force refresh state variables if loadData doesn't catch everything (it usually does as it overwrites reactive config)
    }
}

const handleClearCloud = async () => {
    if (confirm('Are you sure you want to clear CLOUD configuration? This action cannot be undone.')) {
        try {
            await clearCloudConfig()
            
            // Also disable Auto Sync locally to prevent accidental immediate re-upload
            config.sync.enabled = false
            await saveGeneralSettings(config, true, true) // Save disabled state, skip sync, skip touch

            toast.success('Cloud configuration cleared & Auto Sync disabled')
            await loadData()
        } catch (e) {
            toast.error('Failed to clear cloud configuration')
        }
    }
}

</script>
