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
          <h3 class="text-sm font-semibold ui-label mb-4 d-flex align-items-center gap-2 m-0">
            <i class="bi bi-sliders text-primary text-[20px]"></i>
            Basic Configuration
          </h3>
          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-slate-700 shadow-sm transition-colors">
            
            <!-- Theme Style -->
            <div class="d-flex align-items-center justify-content-between px-4 pt-4 pb-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-blue d-flex align-items-center justify-content-center">
                  <i class="bi bi-palette text-[22px]"></i>
                </div>
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
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-indigo d-flex align-items-center justify-content-center">
                  <i class="bi bi-arrow-repeat text-[22px]"></i>
                </div>
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
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-green d-flex align-items-center justify-content-center">
                  <i class="bi bi-arrow-clockwise text-[22px]"></i>
                </div>
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
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-purple d-flex align-items-center justify-content-center">
                  <i class="bi bi-cloud-arrow-down text-[22px]"></i>
                </div>
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
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-orange d-flex align-items-center justify-content-center">
                  <i class="bi bi-tools text-[22px]"></i>
                </div>
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
          <h3 class="text-sm font-semibold ui-label mb-4 d-flex align-items-center gap-2 m-0">
             <i class="bi bi-terminal text-primary text-[20px]"></i>
            Advanced Configuration
          </h3>
          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-slate-700 shadow-sm">
            
            <!-- Reject Address -->
            <div class="d-flex align-items-center justify-content-between px-4 pt-4 pb-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-red d-flex align-items-center justify-content-center">
                  <i class="bi bi-slash-circle text-[22px]"></i>
                </div>
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Reject Address</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Connections to this address will be dropped immediately.</p>
                </div>
              </div>
              <input v-model.lazy="rejectAddress" type="text" placeholder="ip:port" class="form-control ui-input block w-48 rounded-lg border text-xs focus:border-primary focus:ring-primary placeholder:text-slate-400" />
            </div>

             <!-- Connection Monitoring -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-teal d-flex align-items-center justify-content-center">
                  <i class="bi bi-activity text-[22px]"></i>
                </div>
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
              <div class="d-flex items-start gap-4">
                <div class="p-2 rounded-lg ui-icon-pink d-flex align-items-center justify-content-center">
                  <i class="bi bi-menu-button-wide text-[22px]"></i>
                </div>
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">Context Menu</p>
                  <p class="text-xs ui-text-secondary mt-0.5 m-0">Show proxy options in the browser right-click menu.</p>
                </div>
              </div>
               <div class="form-check form-switch">
                <input v-model="config.ui.showContextMenu" class="form-check-input" type="checkbox" role="switch" id="contextMenuSwitch">
              </div>
            </div>

            <!-- IP Tags -->
             <div class="px-4 pt-3 pb-4 hover:bg-slate-50/50 transition-colors">
                 <div class="d-flex align-items-center justify-content-between mb-4">
                    <div class="d-flex items-start gap-4">
                        <div class="p-2 rounded-lg ui-icon-gray d-flex align-items-center justify-content-center">
                            <i class="bi bi-tag text-[22px]"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium ui-text-primary m-0">IP Tags</p>
                            <p class="text-xs ui-text-secondary mt-0.5 m-0">Assign friendly names to IP addresses.</p>
                        </div>
                    </div>
                 </div>
                  <div class="overflow-hidden rounded-lg border border-slate-200 d-flex flex-column">
                     <!-- Selected Actions Bar -->
                     <div class="bg-blue-50/50 dark:bg-primary/20 px-4 py-2 border-b border-slate-200 dark:border-divider-dark d-flex align-items-center justify-content-between">
                         <div class="d-flex align-items-center gap-2">
                             <div class="h-4 w-4 d-flex align-items-center justify-content-center rounded bg-primary text-white text-[8px] font-bold">{{ selectedTags.length }}</div>
                             <span class="text-xs font-medium ui-text-secondary">Selected</span>
                         </div>
                         <div class="d-flex align-items-center gap-2">
                            <button class="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-50 border border-transparent rounded transition-all d-flex align-items-center gap-1">
                                <i class="bi bi-download text-[14px]"></i> Export
                            </button>
                             <button @click="deleteSelectedTags" class="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border border-transparent rounded transition-all d-flex align-items-center gap-1">
                                <i class="bi bi-trash text-[14px]"></i> Delete
                            </button>
                         </div>
                     </div>

                     <table class="min-w-full divide-y divide-slate-200">
                        <thead class="ui-table-header">
                            <tr>
                                <th class="px-4 py-2 w-10 text-center">
                                    <input 
                                      type="checkbox" 
                                      class="form-check-input h-4 w-4"
                                      :checked="selectedTags.length === ipTagsList.length && ipTagsList.length > 0"
                                      @change="toggleAllTags"
                                    />
                                </th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-slate-500 tracking-wider">IP Address</th>
                                <th class="px-4 py-2 text-left text-xs font-medium text-slate-500 tracking-wider w-100">Tag Name</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-slate-500 tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody class="ui-card divide-y divide-slate-100 dark:divide-divider-dark">
                              <tr 
                                v-for="(item, index) in ipTagsList" 
                                :key="index"
                                :class="{'bg-blue-50/50 dark:bg-primary/10': selectedTags.includes(item.ip)}"
                              >
                                <td class="px-4 py-2 text-center">
                                    <input 
                                      type="checkbox" 
                                      class="form-check-input h-4 w-4" 
                                      :value="item.ip" 
                                      v-model="selectedTags"
                                    />
                                </td>
                                <td class="px-4 py-2 text-xs text-slate-700 font-mono">
                                  <input v-model.lazy="item.ip" @change="updateTag()" type="text" class="bg-transparent border-0 w-100 p-0 text-xs focus:ring-0 font-mono text-slate-900 dark:text-white" placeholder="0.0.0.0" />
                                </td>
                                <td class="px-4 py-2 text-xs text-slate-700">
                                  <input v-model.lazy="item.tag" @change="updateTag()" type="text" class="bg-transparent border-0 w-100 p-0 text-xs focus:ring-0 text-slate-700 dark:text-white" placeholder="Tag Name" />
                                </td>
                                <td class="px-4 py-2 text-right">
                                    <button @click="deleteTag(item.ip)" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full bg-transparent hover:bg-transparent border-0">
                                        <i class="bi bi-trash text-[16px]"></i>
                                    </button>
                                </td>
                            </tr>
                         </tbody>
                     </table>
                     <div class="settings-table-header px-4 py-2 border-t border-slate-200 dark:border-divider-dark">
                         <button @click="addTag" class="w-100 py-2 text-xs font-medium settings-button-dashed border border-dashed rounded transition-all d-flex align-items-center justify-content-center gap-2">
                             <i class="bi bi-plus text-[14px]"></i> Add New Tag
                         </button>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { loadConfig, saveGeneralSettings } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'

// Reactive State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
const selectedTags = ref([]) // For table selection

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

// IP Tags Mapping: Array for UI <-> Object for Config
const ipTagsList = computed({
    get: () => Object.entries(config.ipTags || {}).map(([ip, tag]) => ({ ip, tag })),
    set: (val) => {
        const newTags = {}
        val.forEach(item => { if (item.ip) newTags[item.ip] = item.tag })
        config.ipTags = newTags
    }
})

// Load Config
onMounted(async () => {
    const loaded = await loadConfig()
    // Update reactive state
    // We iterate keys to preserve reactivity of the 'config' root object
    // or we could just use Object.assign
    Object.assign(config, loaded)
    console.log('Config loaded:', config)
})

// Auto-Save Watcher
watch(config, (newVal) => {
    saveGeneralSettings(newVal)
    console.log('Config saved (General Only):', newVal)
}, { deep: true })

// Tag Management Logic
const addTag = () => {
    // We modify the computed property which updates the config
    const currentList = [...ipTagsList.value]
    currentList.push({ ip: '', tag: '' })
    ipTagsList.value = currentList
}

const deleteTag = (ip) => {
    if (!ip) return
    const newTags = { ...config.ipTags }
    delete newTags[ip]
    config.ipTags = newTags
    selectedTags.value = selectedTags.value.filter(t => t !== ip)
}

const updateTag = () => {
    // When editing inline, we rebuild the whole object to handle key changes (IP change)
    // This is a bit heavy but ensures consistency.
    // Ideally we would track "original IP" to delete old key.
    // For now, we trust the computed setter to rebuild from ipTagsList.
    
    // Trigger reset via assigning ipTagsList
    // eslint-disable-next-line no-self-assign
    ipTagsList.value = ipTagsList.value
}

const toggleAllTags = (e) => {
    if (e.target.checked) {
        selectedTags.value = ipTagsList.value.map(i => i.ip).filter(ip => ip)
    } else {
        selectedTags.value = []
    }
}

const deleteSelectedTags = () => {
    const newTags = { ...config.ipTags }
    selectedTags.value.forEach(ip => {
        delete newTags[ip]
    })
    config.ipTags = newTags
    selectedTags.value = []
}
</script>
