<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="h-24 px-8 flex items-center justify-between border-b border-slate-100">
      <div>
        <h2 class="text-[20px] font-bold text-slate-900 m-0">General Settings</h2>
        <p class="text-[10px] text-slate-500 mt-1 m-0">Configure global behavior for the extension.</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div class="max-w-3xl mx-auto space-y-8">
        
        <!-- Basic Configuration -->
        <section>
          <h3 class="text-[10px] font-semibold text-slate-900 mb-4 flex items-center gap-2 m-0">
            <i class="bi bi-sliders text-primary text-[18px]"></i>
            Basic Configuration
          </h3>
          <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            
            <!-- Interface Style -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i class="bi bi-palette text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Interface Style</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Choose your preferred visual theme.</p>
                </div>
              </div>
              <div class="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  v-for="option in styleOptions" 
                  :key="option.value"
                  @click="config.ui.theme = option.value"
                  class="px-3 py-1 text-[10px] font-medium rounded-md transition-all border-0 focus:outline-none"
                  :class="config.ui.theme === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- Update Cycle -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i class="bi bi-arrow-repeat text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">External Policy Update Cycle</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Frequency of checking for policy updates.</p>
                </div>
              </div>
              <select v-model="config.update.interval" class="form-select block w-32 rounded-lg border-slate-300 bg-slate-50 text-[10px] focus:border-primary focus:ring-primary h-8 py-0 ps-2 pe-4">
                <option v-for="interval in updateIntervals" :key="interval.value" :value="interval.value">{{ interval.label }}</option>
              </select>
            </div>

            <!-- Auto Refresh -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <i class="bi bi-arrow-clockwise text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Auto Refresh</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Automatically refresh connections when idle.</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.autoRefresh" class="form-check-input" type="checkbox" role="switch" id="autoRefreshSwitch">
              </div>
            </div>

            <!-- Auto Sync -->
             <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <i class="bi bi-cloud-arrow-down text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Auto Sync</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Synchronize settings across devices automatically.</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.sync.enabled" class="form-check-input" type="checkbox" role="switch" id="autoSyncSwitch">
              </div>
            </div>

            <!-- Maintenance -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i class="bi bi-tools text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Maintenance</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Manage configuration data.</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-2 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
                  <i class="bi bi-upload text-[14px]"></i> Import
                </button>
                <button class="px-3 py-2 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
                  <i class="bi bi-download text-[14px]"></i> Export
                </button>
                 <button class="px-3 py-2 text-[10px] font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                  <i class="bi bi-trash text-[14px]"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Advanced Configuration -->
        <section>
          <h3 class="text-[10px] font-semibold text-slate-900 mb-4 flex items-center gap-2 m-0">
             <i class="bi bi-terminal text-primary text-[18px]"></i>
            Advanced Configuration
          </h3>
          <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            
            <!-- Reject Address -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <i class="bi bi-slash-circle text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Reject Address</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Connections to this address will be dropped immediately.</p>
                </div>
              </div>
              <input v-model.lazy="rejectAddress" type="text" placeholder="ip:port" class="form-control block w-48 rounded-lg border-slate-300 bg-slate-50 text-[10px] focus:border-primary focus:ring-primary placeholder:text-slate-400" />
            </div>

             <!-- Connection Monitoring -->
            <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <i class="bi bi-activity text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Connection Monitoring</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Monitor and log connection attempts.</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.connectionMonitoring" class="form-check-input" type="checkbox" role="switch" id="connectionMonitoringSwitch">
              </div>
            </div>

            <!-- Context Menu -->
             <div class="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <i class="bi bi-menu-button-wide text-[22px]"></i>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-900 m-0">Context Menu</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 m-0">Show proxy options in the browser right-click menu.</p>
                </div>
              </div>
               <div class="form-check form-switch">
                <input v-model="config.ui.showContextMenu" class="form-check-input" type="checkbox" role="switch" id="contextMenuSwitch">
              </div>
            </div>

            <!-- IP Tags -->
             <div class="p-5 hover:bg-slate-50/50 transition-colors">
                 <div class="flex items-center justify-between mb-4">
                    <div class="flex items-start gap-4">
                        <div class="p-2 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
                            <i class="bi bi-tag text-[22px]"></i>
                        </div>
                        <div>
                            <p class="text-xs font-medium text-slate-900 m-0">IP Tags</p>
                            <p class="text-[10px] text-slate-500 mt-0.5 m-0">Assign friendly names to IP addresses.</p>
                        </div>
                    </div>
                 </div>
                  <div class="overflow-hidden rounded-lg border border-slate-200 flex flex-col">
                     <!-- Selected Actions Bar -->
                     <div class="bg-blue-50/50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                         <div class="flex items-center gap-2">
                             <div class="h-4 w-4 flex items-center justify-center rounded bg-primary text-white text-[8px] font-bold">{{ selectedTags.length }}</div>
                             <span class="text-[10px] font-medium text-slate-700">Selected</span>
                         </div>
                         <div class="flex items-center gap-2">
                            <button class="px-2 py-1 text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all flex items-center gap-1">
                                <i class="bi bi-download text-[14px]"></i> Export
                            </button>
                             <button @click="deleteSelectedTags" class="px-2 py-1 text-[10px] font-medium text-red-600 hover:text-red-700 bg-transparent hover:bg-white border border-transparent hover:border-red-100 rounded transition-all flex items-center gap-1">
                                <i class="bi bi-trash text-[14px]"></i> Delete
                            </button>
                         </div>
                     </div>

                     <table class="min-w-full divide-y divide-slate-200">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-2 w-10 text-center">
                                    <input 
                                      type="checkbox" 
                                      class="form-check-input h-4 w-4"
                                      :checked="selectedTags.length === ipTagsList.length && ipTagsList.length > 0"
                                      @change="toggleAllTags"
                                    />
                                </th>
                                <th class="px-4 py-2 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
                                <th class="px-4 py-2 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider w-full">Tag Name</th>
                                <th class="px-4 py-2 text-right text-[10px] font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody class="bg-white divide-y divide-slate-100">
                              <tr 
                                v-for="(item, index) in ipTagsList" 
                                :key="index"
                                :class="{'bg-blue-50/50': selectedTags.includes(item.ip)}"
                              >
                                <td class="px-4 py-2 text-center">
                                    <input 
                                      type="checkbox" 
                                      class="form-check-input h-4 w-4" 
                                      :value="item.ip" 
                                      v-model="selectedTags"
                                    />
                                </td>
                                <td class="px-4 py-2 text-[10px] text-slate-700 font-mono">
                                  <input v-model.lazy="item.ip" @change="updateTag()" type="text" class="bg-transparent border-0 w-full p-0 text-[10px] focus:ring-0 font-mono text-slate-900" placeholder="0.0.0.0" />
                                </td>
                                <td class="px-4 py-2 text-[10px] text-slate-700">
                                  <input v-model.lazy="item.tag" @change="updateTag()" type="text" class="bg-transparent border-0 w-full p-0 text-[10px] focus:ring-0 text-slate-700" placeholder="Tag Name" />
                                </td>
                                <td class="px-4 py-2 text-right">
                                    <button @click="deleteTag(item.ip)" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100 border-0">
                                        <i class="bi bi-trash text-[16px]"></i>
                                    </button>
                                </td>
                            </tr>
                         </tbody>
                     </table>
                     <div class="bg-slate-50 px-4 py-2 border-t border-slate-200">
                         <button @click="addTag" class="w-full py-2 text-[10px] font-medium text-primary hover:text-primary/80 hover:bg-white border border-dashed border-primary/30 hover:border-primary/60 rounded transition-all flex items-center justify-center gap-2">
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
import { loadConfig, saveConfig } from '../../common/storage'
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
    saveConfig(newVal)
    console.log('Config saved:', newVal)
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
