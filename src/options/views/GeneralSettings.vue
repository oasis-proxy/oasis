<template>
  <div class="h-100 d-flex flex-column">
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div>
        <h2 class="text-[22px] font-bold text-slate-900 dark:text-slate-50 m-0">General Settings</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">Configure global behavior for the extension.</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5">
      <div class="max-w-3xl mx-auto d-flex flex-column gap-5">
        
        <!-- Basic Configuration -->
        <section>
          <h3 class="text-sm font-semibold ui-label mb-4 m-0">
            Basic Configuration
          </h3>
          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-slate-700 shadow-sm transition-colors">
            
            <!-- Theme Style -->
            <div class="d-flex align-items-center justify-content-between px-4 pt-4 pb-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Theme Style</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Choose your preferred visual theme.</p>
                </div>
              </div>
              <select v-model="config.ui.theme" class="form-select ui-input block w-32 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 ps-2 pe-4">
                <option v-for="option in styleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </div>

            <!-- Update Cycle -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">External Policy Update Cycle</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Frequency of checking for policy updates.</p>
                </div>
              </div>
              <select v-model="config.update.interval" class="form-select ui-input block w-32 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 ps-2 pe-4">
                <option v-for="interval in updateIntervals" :key="interval.value" :value="interval.value">{{ interval.label }}</option>
              </select>
            </div>

            <!-- Auto Refresh -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Auto Refresh</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Automatically refresh connections when idle.</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.autoRefresh" class="form-check-input" type="checkbox" role="switch" id="autoRefreshSwitch">
              </div>
            </div>

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

            <!-- Maintenance -->
            <div class="d-flex align-items-center justify-content-between px-4 pt-3 pb-4 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Maintenance</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Manage configuration data.</p>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="px-3 py-2 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-1">
                  <i class="bi bi-upload text-[14px]"></i> Import
                </button>
                <button class="px-3 py-2 text-xs font-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-1">
                  <i class="bi bi-download text-[14px]"></i> Export
                </button>
                 <button class="px-3 py-2 text-xs font-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-1">
                  <i class="bi bi-trash text-[14px]"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Advanced Configuration -->
        <section>
          <h3 class="text-sm font-semibold ui-label mb-4 m-0">
            Advanced Configuration
          </h3>
          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-slate-700 shadow-sm">
            
            <!-- Reject Address -->
            <div class="d-flex align-items-center justify-content-between px-4 pt-4 pb-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Reject Address</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Connections to this address will be dropped immediately.</p>
                </div>
              </div>
              <input v-model.lazy="rejectAddress" type="text" placeholder="ip:port" class="form-control ui-input block w-48 rounded-lg border text-xs focus:border-primary focus:ring-primary placeholder:text-slate-400" />
            </div>

             <!-- Connection Monitoring -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Connection Monitoring</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Monitor and log connection attempts.</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.connectionMonitoring" class="form-check-input" type="checkbox" role="switch" id="connectionMonitoringSwitch">
              </div>
            </div>

            <!-- Context Menu -->
             <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Context Menu</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Show proxy options in the browser right-click menu.</p>
                </div>
              </div>
               <div class="form-check form-switch">
                <input v-model="config.ui.showContextMenu" class="form-check-input" type="checkbox" role="switch" id="contextMenuSwitch">
              </div>
            </div>

              <div class="px-4 pt-3 pb-4 hover:bg-slate-50/50 transition-colors">
                  <div class="d-flex align-items-center justify-content-between mb-4">
                    <div class="d-flex items-start">
                        <div>
                            <p class="text-sm font-medium ui-text-primary m-0">IP Tags</p>
                            <p class="text-xs ui-text-secondary mt-0.5 m-0">Assign friendly names to IP addresses.</p>
                        </div>
                    </div>
                    <button 
                        @click="addTag"
                        class="ui-button-icon"
                        title="Add Tag"
                    >
                        <i class="bi bi-plus-lg text-xs"></i>
                    </button>
                  </div>
                  
                  <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
                    <!-- Header -->
                    <div class="d-flex gap-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-divider-dark text-[10px] font-semibold ui-text-secondary uppercase tracking-wider">
                      <div style="width: 50%;" class="px-2">IP Address</div>
                      <div style="width: 40%;" class="px-2">Tag Name</div>
                      <div style="width: 10%;" class="text-center">Action</div>
                    </div>

                    <!-- List -->
                    <div v-if="localIpTags.length > 0">
                      <div 
                        v-for="(item, index) in localIpTags" 
                        :key="index"
                        class="d-flex align-items-center gap-1 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div style="width: 50%;" class="px-2">
                          <input 
                            v-if="item.isEditing"
                            v-model="item.ip" 
                            type="text" 
                            class="form-control ui-input w-100 rounded text-[10px] py-0 px-2 font-mono"
                            style="height: 24px;"
                            :style="item.errors?.ip ? 'border-color: #dc3545 !important;' : ''"
                            placeholder="0.0.0.0" 
                            @keyup.enter="saveTag(index)"
                            @keyup.esc="cancelEdit(index)"
                            @blur="validateItem(index)"
                          />
                          <span v-else class="text-[10px] font-mono text-slate-700 dark:text-slate-300">{{ item.ip }}</span>
                        </div>
                        <div style="width: 40%;" class="px-2">
                           <input 
                            v-if="item.isEditing"
                            v-model="item.tag" 
                            type="text" 
                            class="form-control ui-input w-100 rounded text-[10px] py-0 px-2"
                            style="height: 24px;"
                            :style="item.errors?.tag ? 'border-color: #dc3545 !important;' : ''"
                            placeholder="Tag Name" 
                            @keyup.enter="saveTag(index)"
                            @keyup.esc="cancelEdit(index)"
                            @blur="validateItem(index)"
                          />
                          <span v-else class="text-[10px] text-slate-700 dark:text-slate-300">{{ item.tag }}</span>
                        </div>
                        <div style="width: 10%;" class="d-flex align-items-center justify-content-center gap-1">
                            <template v-if="item.isEditing">
                                <button 
                                    @click="saveTag(index)" 
                                    class="ui-button-icon text-green-500 hover:text-green-600"
                                    title="Save"
                                >
                                    <i class="bi bi-check-lg text-xs"></i>
                                </button>
                                <button 
                                    @click="cancelEdit(index)" 
                                    class="ui-button-icon text-slate-400 hover:text-slate-500"
                                    title="Cancel"
                                >
                                    <i class="bi bi-x-lg text-xs"></i>
                                </button>
                            </template>
                             <button 
                                v-else
                                @click="editTag(index)" 
                                class="ui-button-icon"
                                title="Edit"
                            >
                                <i class="bi bi-pencil text-xs"></i>
                            </button>

                            <button 
                                @click="deleteTag(index)" 
                                class="ui-button-icon text-red-500 hover:text-red-600"
                                title="Delete"
                            >
                                <i class="bi bi-trash text-xs"></i>
                            </button>
                        </div>
                      </div>
                    </div>
                     <!-- Empty State -->
                    <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
                      <p class="text-[10px] ui-text-secondary m-0">No tags defined.</p>
                    </div>
                  </div>
              </div>

          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue'
import { loadConfig, saveGeneralSettings } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { toast } from '../utils/toast'

// Constants
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// Reactive State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))


// Config Options
const styleOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'auto' }
]

const updateIntervals = [
  { label: '24h', value: 1440 },
  { label: '12h', value: 720 },
  { label: '1h', value: 60 },
  { label: '15min', value: 15 },
  { label: 'Never', value: 0 },
  { label: 'Manual', value: -1 }
]

// Computed Properties for Mapping
const rejectAddress = computed({
  get: () => `${config.reject.host}:${config.reject.port}`,
  set: (val) => {
    const parts = val.split(':')
    config.reject.host = parts[0] || '127.0.0.1'
    config.reject.port = parseInt(parts[1]) || 65535
  }
})

// IP Tags Logic
const localIpTags = ref([])

// Helper to sort tags by IP
const sortTags = (tags) => {
    return tags.sort((a, b) => {
        // Simple numeric sort for IPv4
        const numA = a.ip.split('.').map(n => parseInt(n) || 0).reduce((acc, n) => acc * 256 + n, 0)
        const numB = b.ip.split('.').map(n => parseInt(n) || 0).reduce((acc, n) => acc * 256 + n, 0)
        return numA - numB
    })
}

// Sync config to local state
const syncToLocal = () => {
    if (!config.ipTags) return
    const tags = Object.entries(config.ipTags).map(([ip, tag]) => ({ 
        ip, 
        tag,
        isEditing: false,
        originalIp: ip, // Track original IP for renaming
        errors: { ip: false, tag: false }
    }))
    localIpTags.value = sortTags(tags)
}

// Watch for external config changes
watch(config, (newVal) => {
    saveGeneralSettings(newVal)
    // We do NOT sync to local here to avoid overwriting ongoing edits.
    // Local state is the source of truth for UI, Config is source of truth for Storage.
    // When we Save, we update Config.
}, { deep: true })

// Initialize
onMounted(async () => {
    const loaded = await loadConfig()
    Object.assign(config, loaded)
    syncToLocal()
})

const addTag = () => {
    // Add to top
    localIpTags.value.unshift({
        ip: '',
        tag: '',
        isEditing: true,
        originalIp: null,
        errors: { ip: false, tag: false }
    })
}

const editTag = (index) => {
    localIpTags.value[index].isEditing = true
    localIpTags.value[index].originalIp = localIpTags.value[index].ip
    localIpTags.value[index].errors = { ip: false, tag: false }
}

const cancelEdit = (index) => {
    const item = localIpTags.value[index]
    if (!item.originalIp && !item.ip) {
        // Was a new item, just remove it
        localIpTags.value.splice(index, 1)
        return
    }
    // Revert
    item.ip = item.originalIp
    item.isEditing = false
    item.errors = { ip: false, tag: false }
    // No need to syncToLocal, just reverting this item is enough
}

const validateItem = (index) => {
    const item = localIpTags.value[index]
    let isValid = true
    const errors = { ip: false, tag: false }

    // Validate IP
    if (!item.ip || !IPV4_REGEX.test(item.ip)) {
        errors.ip = true
        isValid = false
    }

    // Validate Tag
    if (!item.tag) {
        errors.tag = true
        isValid = false
    }

    // Check duplicates (Tag Name uniqueness check as per user request)
    // "tagname needs to be confirmed not empty, and different from other tagnames"
    const duplicateTag = Object.values(config.ipTags || {}).find(t => t === item.tag && item.originalIp && config.ipTags[item.originalIp] !== t)
    // Note: Checking duplicates against config is tricky if we are editing.
    // We need to check against OTHER items.
    // More robust approach: Check against localIpTags (excluding self)
    const duplicateTagLocal = localIpTags.value.some((t, i) => i !== index && t.tag === item.tag)
    
    if (duplicateTagLocal) {
        errors.tag = true
        isValid = false
    }
    
    // Check Duplicate IP (if changed)
    const duplicateIpLocal = localIpTags.value.some((t, i) => i !== index && t.ip === item.ip)
    if (duplicateIpLocal) {
        errors.ip = true
        isValid = false
    }

    item.errors = errors
    return isValid
}

const saveTag = (index) => {
    const item = localIpTags.value[index]
    
    if (!validateItem(index)) {
        return // Validation failed, errors set in validateItem
    }

    // Update Config
    // Ensure object exists
    if (!config.ipTags) config.ipTags = {}
    
    const newTags = { ...config.ipTags }
    
    // If we are renaming, delete old key
    if (item.originalIp && item.originalIp !== item.ip) {
        delete newTags[item.originalIp]
    }
    newTags[item.ip] = item.tag
    
    config.ipTags = newTags // This triggers the watch -> saveGeneralSettings
    
    // Update local state
    item.isEditing = false
    item.originalIp = item.ip
    item.errors = { ip: false, tag: false }
    
    // Re-sort local list to match new IP order
    localIpTags.value = sortTags(localIpTags.value)
    toast.success('IP Tag saved')
}

const deleteTag = (index) => {
    const item = localIpTags.value[index]
    if (item.originalIp) {
        if (!config.ipTags) config.ipTags = {}
        const newTags = { ...config.ipTags }
        delete newTags[item.originalIp]
        config.ipTags = newTags
        toast.success('IP Tag deleted')
    }
    localIpTags.value.splice(index, 1)
}


</script>
