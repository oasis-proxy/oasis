<template>
  <BaseDetailView :title="pac.name || pac.url || $t('unnamedPAC')">
    <template #header-start>
        <input 
             type="color" 
             v-model="pac.color"
             class="p-0 border-0 rounded-lg overflow-hidden shadow-sm transition-transform"
             style="width: 24px; height: 24px; min-width: 24px; cursor: pointer;"
             :title="$t('lblChooseColor')"
        />
    </template>
    
    <template #actions>
        <!-- Show in Popup Switch -->
       <div class="form-check form-switch m-0 d-flex align-items-center gap-2" :title="$t('phTitleShowPopup')">
           <input class="form-check-input align-self-start" style="cursor: pointer;" type="checkbox" role="switch" id="showInPopup" v-model="pac.showInPopup">
           <label class="form-check-label text-xs font-medium text-slate-500" style="cursor: pointer;" for="showInPopup">{{ $t('phLabelShowPopup') }}</label>
       </div>
       
       <button 
         @click="resetChanges"
         :disabled="!isDirty"
         class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
       >
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
       </button>

       <button 
         @click="saveChanges"
         :disabled="!isDirty"
         class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
       >
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
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
                <button @click="openRenameModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-slate-900 rounded-md transition-colors d-flex align-items-center gap-2">
                    <i class="bi bi-pencil-square text-slate-400"></i> {{ $t('btnRename') }}
                </button>
              </li>
              <li>
                <button @click="openCloneModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-slate-900 rounded-md transition-colors d-flex align-items-center gap-2">
                    <i class="bi bi-files text-slate-400"></i> {{ $t('btnClone') }}
                </button>
              </li>
              <li><hr class="dropdown-divider my-1 border-subtle "></li>
              <li>
                <button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-danger  rounded-md transition-colors d-flex align-items-center gap-2">
                    <i class="bi bi-trash"></i> {{ $t('btnDelete') }}
                </button>
              </li>
          </ul>
       </div>
    </template>

    <!-- Source Settings -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('pacHeaderSource') }}</span>
      </div>
      
      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
         <!-- Body -->
         <div class="px-4 pt-4 pb-4 d-flex flex-column gap-4">
            <!-- Source Method Radio -->
             <div class="ui-form-group">
                <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('pacLabelSourceMethod') }}</span>
                <div class="d-flex align-items-center gap-4">
                   <label class="d-flex align-items-center gap-2" style="cursor: pointer;">
                      <input type="radio" value="remote" v-model="pac.mode" class="form-check-input mt-0" />
                      <span class="text-xs text-slate-900 transition-colors">{{ $t('pacLabelRemoteUrl') }}</span>
                   </label>
                   <label class="d-flex align-items-center gap-2" style="cursor: pointer;">
                      <input type="radio" value="manual" v-model="pac.mode" class="form-check-input mt-0" />
                      <span class="text-xs text-slate-900 transition-colors">{{ $t('pacLabelManualScript') }}</span>
                   </label>
                </div>
             </div>
            <!-- Remote URL Input -->
            <div v-if="pac.mode === 'remote'" class="grid grid-cols-12 gap-4">
                 <!-- URL Input (7) -->
                 <div class="col-span-7">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('pacLabelRemoteUrl') }}</span>
                      <input 
                        type="text" 
                        v-model="pac.url"
                        @blur="fetchPacContent"
                        :placeholder="$t('pacPlaceholderUrl')"
                        class="form-control ui-input w-100 mw-100 rounded-lg border text-xs h-8 py-0 px-3"
                      />
                    </label>
                 </div>

                <!-- Refresh Button (2) -->
                <div class="col-span-2 d-flex flex-column justify-content-end align-items-start">
                   <button @click="fetchPacContent" class="px-3 py-1 rounded-lg text-xs font-medium ui-button-secondary transition-colors d-flex align-items-center justify-content-center gap-2">
                       <i class="bi bi-arrow-clockwise"></i> {{ $t('btnRefresh') }}
                   </button>
                </div>

            </div>

            <!-- Manual Mode Hint -->
            <div v-else class="text-xs text-slate-500">
                <i class="bi bi-info-circle me-1"></i> {{ $t('pacMsgEditable') }}
            </div>

         </div>
      </div>
    </section>

    <!-- Script Content -->
    <section class="d-flex flex-column" style="height: 600px;">
        <div class="ui-card-label">
            <span class="label-text">{{ $t('pacHeaderScript') }}</span>
        </div>
        <div class="ui-card rounded-xl border shadow-sm overflow-hidden d-flex flex-column h-100 w-100 flex-1">
            <div class="ui-card-header justify-content-end">
                <span v-if="pac.mode === 'remote'" class="px-2 py-1 rounded bg-hover  text-xs font-mono text-slate-600 ">{{ $t('pacMsgReadOnly') }}</span>
                <span v-else class="px-2 py-1 rounded bg-hover  text-xs font-mono text-slate-600 ">{{ $t('pacMsgEditable') }}</span>
            </div>
            <div class="flex-1 position-relative">
                <textarea 
                    v-model="pac.script"
                    :readonly="pac.mode === 'remote'"
                    class="form-control w-100 h-100 p-4 font-mono text-xs custom-scrollbar bg-white  text-slate-900 border-0 rounded-0"
                    style="resize: none;"
                    spellcheck="false"
                    :placeholder="$t('pacPlaceholderScript')"
                ></textarea>
            </div>
        </div>
    </section>

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

  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, savePacs } from '../../common/storage'
import { toast } from '../utils/toast'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'
import BaseDetailView from '../components/BaseDetailView.vue'

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
        // updateInterval removed - using global settings
        if (!pac.value.url) pac.value.url = ''
        if (!pac.value.script) pac.value.script = ''
        if (!pac.value.script) pac.value.script = ''
        if (!pac.value.color) pac.value.color = '#8b5cf6' // violet-500
        if (pac.value.showInPopup === undefined) pac.value.showInPopup = true

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

// Register unsaved changes checker
onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(chrome.i18n.getMessage('pacMsgUnsaved'))
      return true
    }
    return false
  })
})

onBeforeUnmount(() => {
  unregisterUnsavedChangesChecker()
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
    
    toast.success(chrome.i18n.getMessage('pacMsgSaved'))
    
    // Refresh
    await loadPacData()
}

// Modal Handlers
const openRenameModal = () => {
  if (isDirty.value) {
    toast.warning(chrome.i18n.getMessage('pacMsgSaveBeforeRenaming'))
    return
  }
  showRenameModal.value = true
}

const openCloneModal = () => {
  if (isDirty.value) {
    toast.warning(chrome.i18n.getMessage('pacMsgSaveBeforeCloning'))
    return
  }
  showCloneModal.value = true
}

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const handleRename = async (newName) => {
    if (!pac.value || !config.value) return
    config.value.pacs[pac.value.id].name = newName
    await savePacs(config.value.pacs)
    toast.success(chrome.i18n.getMessage('pacMsgRenamed'))
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
    toast.success(chrome.i18n.getMessage('pacMsgCloned'))
    router.push(`/pac/${newId}`)
    showCloneModal.value = false
}

const handleDelete = async () => {
    if (!pac.value || !config.value) return
    delete config.value.pacs[pac.value.id]
    await savePacs(config.value.pacs)
    toast.success(chrome.i18n.getMessage('pacMsgDeleted'))
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
