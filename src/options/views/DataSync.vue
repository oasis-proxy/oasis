<template>
  <BaseDetailView :title="$t('lblDataSync')" maxWidth="5xl">
    <template #default>
        <!-- Maintenance Operations -->
        <section class="mb-5">
             <div class="ui-card-label">
                <span class="label-text">{{ $t('lblMaintenanceOps') }}</span>
            </div>
            <div class="ui-card rounded-xl border shadow-sm transition-colors">
                
                <!-- Auto Sync -->
                 <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
                  <div class="d-flex items-start">
                    <div>
                      <p class="text-sm fw-medium ui-text-primary m-0">{{ $t('lblAutoSync') }}</p>
                      <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descAutoSync') }}</p>
                    </div>
                  </div>
                  <div class="form-check form-switch">
                    <input :checked="config.sync.enabled" @change="toggleAutoSync" class="form-check-input align-self-start" type="checkbox" role="switch" id="autoSyncSwitch">
                  </div>
                </div>
            <!-- Maintenance Buttons -->
                <div class="d-flex align-items-center justify-content-between px-4 pt-3 pb-4 hover-bg-subtle transition-colors">
                  <div class="d-flex items-start">
                    <div>
                      <p class="text-sm fw-medium ui-text-primary m-0">{{ $t('lblMaintenance') }}</p>
                      <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descMaintenance') }}</p>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <input type="file" ref="fileInput" accept=".json" @change="handleImportFile" style="display: none;" />
                    
                    <button @click="triggerImport" class="fw-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-upload text-sm"></i> {{ $t('btnImport') }}
                    </button>
                    <button @click="handleExport" class="fw-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-download text-sm"></i> {{ $t('btnExport') }}
                    </button>
                     <button @click="handleClearLocal" class="fw-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-trash text-sm"></i> {{ $t('btnClearLocal') }}
                    </button>
                    <button @click="handleClearCloud" class="fw-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-cloud-slash text-sm"></i> {{ $t('btnClearSync') }}
                    </button>
                  </div>
                </div>
            </div>
        </section>

        <!-- Sync Status Section -->
        <div class="d-flex flex-column gap-4">
            <!-- Cards Row -->
            <div class="d-flex align-items-stretch justify-content-center gap-4">
                
                <!-- Local Version Card -->
                <div class="flex-1 ui-card rounded-xl border shadow-sm position-relative overflow-hidden d-flex flex-column">
                    <div class="ui-card-header px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style="padding-left: 1.5rem !important">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                 <h3 class="m-0">{{ $t('lblLocalVersion') }}</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex flex-column gap-3 position-relative px-4 py-4 flex-grow-1" style="z-index: 10;">
                        <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase" style="letter-spacing: 0.05em;">{{ $t('lblLastModified') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">
                                {{ formattedLocalLastModified || $t('lblUnknown') }}
                            </p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblConfigVer') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ configVersion }}</p>
                        </div>

                        <!-- Software Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblSoftwareVer') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ softwareVersion }}</p>
                        </div>
                        
                        <!-- Proxy Hosts -->
                        <div class="d-flex flex-column gap-2">
                             <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblProxyHosts') }} ({{ proxyCount }})</p>
                             <div class="d-flex flex-wrap gap-2">
                                <span v-for="host in previewProxies" :key="host.id" class="ui-tag ui-tag-default" :title="host.label">
                                    {{ truncate(host.label, 20) }}
                                </span>
                            </div>
                        </div>

                        <!-- Policies -->
                        <div class="d-flex flex-column gap-2">
                             <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblPolicies') }} ({{ policyCount }})</p>
                             <div class="d-flex flex-wrap gap-2">
                                <span v-for="policy in previewPolicies" :key="policy.id" class="ui-tag ui-tag-primary" :title="policy.name">
                                    {{ truncate(policy.name, 20) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cloud Version Card -->
                <div class="flex-1 ui-card rounded-xl border shadow-sm position-relative overflow-hidden d-flex flex-column">
                    <div class="ui-card-header px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style="padding-left: 1.5rem !important">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                <h3 class="m-0">{{ $t('lblCloudVersion') }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-column gap-3 position-relative px-4 py-4 flex-grow-1" style="z-index: 10;">
                         <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblLastModified') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ formattedCloudLastModified }}</p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblConfigVer') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ cloudConfigVersion }}</p>
                        </div>

                        <div v-if="!cloudConfig" class="d-flex flex-column align-items-center justify-content-center py-4 ui-text-tertiary flex-grow-1">
                            <i class="bi bi-cloud-slash fs-2 mb-2"></i>
                            <span class="text-xs">{{ $t('msgNoCloudData') }}</span>
                        </div>
                        <div v-else class="d-flex flex-column gap-3">
                             <!-- Proxy Hosts -->
                            <div class="d-flex flex-column gap-2">
                                 <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblProxyHosts') }} ({{ cloudProxyCount }})</p>
                                 <div v-if="cloudPreviewProxies.length > 0" class="d-flex flex-wrap gap-2">
                                    <span v-for="host in cloudPreviewProxies" :key="host.id" class="ui-tag ui-tag-default" :title="host.label">
                                        {{ truncate(host.label, 20) }}
                                    </span>
                                </div>
                                <span v-else class="text-xs ui-text-secondary">-</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex flex-column gap-2">
                                 <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblPolicies') }} ({{ cloudPolicyCount }})</p>
                                 <div v-if="cloudPreviewPolicies.length > 0" class="d-flex flex-wrap gap-2">
                                    <span v-for="policy in cloudPreviewPolicies" :key="policy.id" class="ui-tag ui-tag-primary" :title="policy.name">
                                        {{ truncate(policy.name, 20) }}
                                    </span>
                                </div>
                                <span v-else class="text-xs ui-text-secondary">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons Row -->
            <div class="d-flex justify-content-center gap-4">
                <div class="flex-1 d-flex justify-content-center">
                    <button @click="handleSyncToCloud" class="d-flex align-items-center gap-2 px-4 py-2 ui-button-secondary rounded-lg border transition-all">
                        <i class="bi bi-cloud-upload" style="font-size: 12px;"></i>
                        <span class="text-xs fw-semibold">{{ $t('btnPushToCloud') }}</span>
                    </button>
                </div>
                <div class="flex-1 d-flex justify-content-center">
                    <button @click="handleSyncFromLocal" class="d-flex align-items-center gap-2 px-4 py-2 ui-button-secondary rounded-lg border transition-all">
                        <i class="bi bi-cloud-download" style="font-size: 12px;"></i>
                        <span class="text-xs fw-semibold">{{ $t('btnPullFromCloud') }}</span>
                    </button>
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
    </template>
  </BaseDetailView>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { loadConfig, saveGeneralSettings, syncToCloud, syncFromCloud, exportConfig, importConfig, clearLocalConfig, clearCloudConfig } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import SyncConflictModal from '../components/SyncConflictModal.vue'
import BaseDetailView from '../components/BaseDetailView.vue'

// Helpers
const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const d = new Date(timestamp)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const truncate = (text, length) => {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

// State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
const cloudConfig = ref(null)
const formattedLocalLastModified = computed(() => {
    return formatDate(config.updatedAt)
})
const cloudNewer = ref(false)
const softwareVersion = ref('Unknown')
const showConflictModal = ref(false)

// Computed
// Computed
const configVersion = computed(() => config.version ? `v${config.version}` : 'v1')
const cloudConfigVersion = computed(() => cloudConfig.value?.version ? `v${cloudConfig.value.version}` : '-')
const formattedCloudLastModified = computed(() => {
    return formatDate(cloudConfig.value?.timestamp)
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
             toast.success(t('msgAutoSyncEnabled'))
        }
    } else {
        // Turning OFF
        // skipSync=true (don't sync obviously), skipTouch=true (don't version change)
        await saveGeneralSettings(config, true, true) 
    }
}


const handleSyncToCloud = async () => {
    await syncToCloud(config)
    toast.success(t('msgSyncedToCloud'))
    showConflictModal.value = false
    await loadData()
}

const handleSyncFromLocal = async () => {
    // Sync TO Local from Cloud
    const success = await syncFromCloud(true) // Force pull
    if (success) {
        toast.success(t('msgSyncedFromCloud'))
        showConflictModal.value = false
        await loadData() // Reload local config to reflect changes
    } else {
        toast.error(t('msgSyncFromCloudFailed'))
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
    toast.success(t('msgLocalPushedAutoSync'))
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
        
        toast.success(t('msgSyncedFromCloudAutoSync'))
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
                toast.success(t('msgConfigImported'))
                await loadData()
            } else {
                toast.error(t('msgConfigImportFailed'))
            }
        } catch (err) {
            console.error(err)
            toast.error(t('msgInvalidConfig'))
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
        toast.success(t('msgConfigExported'))
    } catch (e) {
        console.error(e)
        toast.error(t('msgConfigExportFailed'))
    }
}

const handleClearLocal = async () => {
    if (confirm(t('confirmClearLocal'))) {
        await clearLocalConfig()
        toast.success(t('msgLocalCleared'))
        // We need to reload the page or re-init state fully
        await loadData() 
        // Force refresh state variables if loadData doesn't catch everything (it usually does as it overwrites reactive config)
    }
}

const handleClearCloud = async () => {
    if (confirm(t('confirmClearCloud'))) {
        try {
            await clearCloudConfig()
            
            // Also disable Auto Sync locally to prevent accidental immediate re-upload
            config.sync.enabled = false
            await saveGeneralSettings(config, true, true) // Save disabled state, skip sync, skip touch

            toast.success(t('msgCloudCleared'))
            await loadData()
        } catch (e) {
            toast.error(t('msgClearCloudFailed'))
        }
    }
}

</script>
