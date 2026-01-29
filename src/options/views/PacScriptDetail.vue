<template>
  <div class="h-100 d-flex flex-column bg-white dark:bg-background-dark relative transition-colors">
    
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-divider-dark transition-colors">
      <!-- Header / Actions -->
      <div class="d-flex align-items-center justify-content-between w-100">
        <div class="d-flex align-items-center gap-3">
           <h1 class="text-[22px] font-bold ui-text-primary tracking-tight m-0">{{ pac.name || pac.url || 'Unnamed PAC' }}</h1>
        </div>
        <div class="d-flex align-items-center gap-3">
           
           <button 
             @click="resetChanges"
             :disabled="!isDirty"
             class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all"
           >
             Reset
           </button>

           <button 
             @click="saveChanges"
             :disabled="!isDirty"
             class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg shadow-primary/30 transition-colors d-flex align-items-center gap-2"
           >
             <i class="bi bi-check-lg text-lg"></i>
             <span>Save Changes</span>
           </button>

           <!-- Action Menu -->
           <div class="dropdown">
              <button 
                   class="ui-button-icon d-flex align-items-center justify-content-center"
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
              >
                  <i class="bi bi-three-dots-vertical text-lg"></i>
              </button>
              
              <!-- Dropdown Menu -->
              <ul class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1" style="min-width: 140px;">
                  <li>
                    <button @click="openRenameModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                        <i class="bi bi-pencil text-slate-400"></i> Rename
                    </button>
                  </li>
                  <li>
                    <button @click="openCloneModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                        <i class="bi bi-files text-slate-400"></i> Clone
                    </button>
                  </li>
                  <li><hr class="dropdown-divider my-1 border-slate-100 dark:border-divider-dark"></li>
                  <li>
                    <button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 rounded-md transition-colors d-flex align-items-center gap-2">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                  </li>
              </ul>
           </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5 scroll-smooth">
      <div v-if="pac" class="max-w-3xl mx-auto d-flex flex-column gap-4 pb-5">
        
        <!-- Source Settings -->
        <section>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="text-sm font-semibold ui-text-primary m-0">Source Settings</h3>
          </div>
          
          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
             <!-- Header -->
             <div class="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-divider-dark">
                <h3 class="text-sm font-medium ui-text-primary d-flex align-items-center gap-2 mb-1">
                  <i class="bi bi-globe text-primary"></i>
                  <span>PAC Source</span>
                </h3>
                <p class="text-xs ui-text-secondary m-0">Choose how the PAC script is sourced and updated.</p>
             </div>

             <!-- Body -->
             <div class="px-4 pt-3 pb-4 d-flex flex-column gap-4">
                
                <!-- Source Method Radio -->
                <div>
                   <label class="block text-xs font-medium ui-text-secondary mb-2">Source Method</label>
                   <div class="d-flex align-items-center gap-4">
                      <label class="d-flex align-items-center gap-2 cursor-pointer group">
                         <input type="radio" value="remote" v-model="pac.mode" class="form-check-input mt-0" />
                         <span class="text-xs ui-text-primary group-hover:text-primary transition-colors">Remote URL</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer group">
                         <input type="radio" value="manual" v-model="pac.mode" class="form-check-input mt-0" />
                         <span class="text-xs ui-text-primary group-hover:text-primary transition-colors">Manual Script</span>
                      </label>
                   </div>
                </div>

                <hr class="border-slate-100 dark:border-divider-dark m-0"/>

                <!-- Remote URL Input -->
                <!-- Remote URL Input -->
                <div v-if="pac.mode === 'remote'" class="grid grid-cols-12 gap-4">
                    <!-- URL Input (7) -->
                    <div class="col-span-7">
                       <label class="block text-xs font-medium ui-text-secondary mb-1.5">PAC URL</label>
                       <div class="position-relative">
                           <input 
                             type="text" 
                             v-model="pac.url"
                             @blur="fetchPacContent"
                             placeholder="https://example.com/proxy.pac"
                             class="form-control ui-input w-100 mw-100 rounded-lg border text-xs h-8 py-0 px-3 placeholder:text-slate-400"
                           />
                       </div>
                    </div>

                    <!-- Refresh Button (2) -->
                    <div class="col-span-2 d-flex flex-column justify-content-end">
                       <button @click="fetchPacContent" class="w-100 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors d-flex align-items-center justify-content-center gap-1 text-xs font-medium h-8">
                           <i class="bi bi-arrow-clockwise"></i> Refresh
                       </button>
                    </div>

                    <!-- Update Frequency (3) -->
                    <div class="col-span-3">
                       <label class="block text-xs font-medium ui-text-secondary mb-1.5">Update Frequency</label>
                       <select v-model="pac.updateInterval" class="form-select ui-input w-100 mw-100 rounded-lg border text-xs h-8 py-0 px-3">
                          <option :value="60">Every 1 hour</option>
                          <option :value="360">Every 6 hours</option>
                          <option :value="720">Every 12 hours</option>
                          <option :value="1440">Every 24 hours</option>
                          <option :value="0">Never</option>
                       </select>
                    </div>
                </div>

                <!-- Manual Mode Hint -->
                <div v-else class="text-xs ui-text-secondary">
                    <i class="bi bi-info-circle me-1"></i> You can edit the script content directly below.
                </div>

             </div>
          </div>
        </section>

        <!-- Script Content -->
        <section class="d-flex flex-column" style="height: 600px;">
            <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden d-flex flex-column h-100 w-100 flex-1">
                <div class="px-4 py-3 border-b border-slate-100 dark:border-divider-dark d-flex align-items-center justify-content-between bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h3 class="text-sm font-semibold ui-text-primary d-flex align-items-center gap-2 m-0">
                            <i class="bi bi-file-earmark-code text-primary"></i>
                            Script Content
                        </h3>
                    </div>
                    <div>
                    <div>
                        <span v-if="pac.mode === 'remote'" class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">Read Only</span>
                        <span v-else class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">Editable</span>
                    </div>
                    </div>
                </div>
                <div class="flex-1 position-relative">
                    <textarea 
                        v-model="pac.script"
                        :readonly="pac.mode === 'remote'"
                        class="form-control w-100 h-100 p-4 font-mono text-xs leading-relaxed bg-white dark:bg-background-dark ui-text-primary border-0 focus:ring-0 resize-none rounded-0"
                        spellcheck="false"
                        placeholder="function FindProxyForURL(url, host) { ... }"
                    ></textarea>
                </div>
            </div>
        </section>

      </div>
    </div>

    <!-- Modals -->
    <ProxyRenameModal 
      :visible="showRenameModal" 
      :currentName="pac.name || ''" 
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyCloneModal
      :visible="showCloneModal" 
      :currentName="pac.name || ''"
      @close="showCloneModal = false"
      @clone="handleClone"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="pac.name || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete" 
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadConfig, savePacs } from '../../common/storage'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const config = ref(null)
const pac = ref({}) // Initialize as empty object to avoid v-if flicker
const originalPac = ref({}) 
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)

// Load Logic
const loadPacData = async () => {
    config.value = await loadConfig()
    const id = route.params.id
    if (config.value?.pacs?.[id]) {
        pac.value = JSON.parse(JSON.stringify(config.value.pacs[id]))
        
        // Ensure defaults
        if (!pac.value.mode) pac.value.mode = 'remote'
        if (!pac.value.updateInterval) pac.value.updateInterval = 720
        if (!pac.value.url) pac.value.url = ''
        if (!pac.value.script) pac.value.script = ''

        originalPac.value = JSON.parse(JSON.stringify(pac.value))
    } else {
        router.push('/settings')
    }
}

// Dirty State
const isDirty = computed(() => {
    if (!pac.value || !originalPac.value) return false
    return JSON.stringify(pac.value) !== JSON.stringify(originalPac.value)
})

onMounted(() => {
    loadPacData()
})

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) loadPacData()
})

// Actions
const resetChanges = () => {
    loadPacData()
}

const saveChanges = async () => {
    if (!config.value || !pac.value) return
    
    // Save locally
    config.value.pacs[pac.value.id] = JSON.parse(JSON.stringify(pac.value))
    
    // Persist
    await savePacs(config.value.pacs)
    
    // Refresh
    await loadPacData()
}

// Modal Handlers
const openRenameModal = () => showRenameModal.value = true
const openCloneModal = () => showCloneModal.value = true
const openDeleteModal = () => showDeleteModal.value = true

const handleRename = async (newName) => {
    if (!pac.value || !config.value) return
    config.value.pacs[pac.value.id].name = newName
    await savePacs(config.value.pacs)
    await loadPacData()
    showRenameModal.value = false
}

const handleClone = async (newName) => {
    if (!pac.value || !config.value) return
    const newId = `pac_${Date.now()}`
    const newPac = JSON.parse(JSON.stringify(config.value.pacs[pac.value.id]))
    newPac.id = newId
    newPac.name = newName
    config.value.pacs[newId] = newPac
    await savePacs(config.value.pacs)
    router.push(`/pac/${newId}`)
    showCloneModal.value = false
}

const handleDelete = async () => {
    if (!pac.value || !config.value) return
    delete config.value.pacs[pac.value.id]
    await savePacs(config.value.pacs)
    router.push('/settings')
    showDeleteModal.value = false
}

const fetchPacContent = async () => {
    if (!pac.value.url) return
    
    // Use background relay to bypass CORS
    chrome.runtime.sendMessage({ 
        type: 'FETCH_URL', 
        url: pac.value.url 
    }, (response) => {
        if (response && response.success) {
            pac.value.script = response.text
        } else {
            console.error('Failed to fetch PAC script via background relay:', response?.error)
        }
    })
}
</script>
