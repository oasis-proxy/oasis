<template>
  <div class="h-100 d-flex flex-column bg-white  position-relative transition-colors">
    
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-light  transition-colors">
      <!-- Header / Actions -->
      <div class="d-flex align-items-center justify-content-between w-100">
        <div class="d-flex align-items-center gap-3">
           <input 
             type="color" 
             v-model="proxyGroup.color"
             class="border-0 p-0 rounded-lg overflow-hidden transition-transform shadow-sm"
             style="width: 24px; height: 24px; background: none; cursor: pointer;"
             title="Choose color"
           />
           <h1 class="fs-4 font-bold ui-text-primary tracking-tight m-0 text-truncate" style="max-width: 300px;" :title="proxyGroup.name || 'Unnamed Group'">{{ proxyGroup.name || 'Unnamed Group' }}</h1>
        </div>
        <div class="d-flex align-items-center gap-3">
           
           <button 
             @click="resetChanges"
             :disabled="!isDirty"
             class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
           >
             <i class="bi bi-reply-fill"></i>
             <span>Reset</span>
           </button>

           <button 
             @click="saveChanges"
             :disabled="!isDirty"
             class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
           >
             <i class="bi bi-floppy-fill"></i>
             <span>Save</span>
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
                        <i class="bi bi-pencil-square ui-text-tertiary"></i> Rename
                    </button>
                  </li>
                  <li><hr class="dropdown-divider my-1 border-subtle "></li>
                  <li>
                    <button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-danger  rounded-md transition-colors d-flex align-items-center gap-2">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                  </li>
              </ul>
           </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5">
      <div class="max-w-3xl mx-auto d-flex flex-column gap-4 pb-5">
        
        <!-- Proxy Host List -->
        <section>
          <div class="ui-card-label">
            <span class="label-text">Fallback Group</span>
            <button @click="addProxy" class="ui-button-icon sm" title="Add Proxy to Group">
              <i class="bi bi-plus-lg text-sm"></i>
            </button>
          </div>
          
          <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
             <!-- Table Header -->
             <div class="ui-card-header">
              <div style="width: 4%;" class="text-center"></div>
              <div style="width: 8%;">Order</div>
              <div style="width: 32%;">Proxy Name</div>
              <div style="width: 48%;">Address</div>
              <div style="width: 8%;" class="text-center">Action</div>
            </div>

            <!-- List -->
            <div v-if="proxyGroup.proxies && proxyGroup.proxies.length > 0">
                 <div v-for="(proxyId, index) in proxyGroup.proxies" :key="index">
                    <!-- Normal Drag Row -->
                    <div 
                        v-if="proxyId"
                        :class="[
                            'd-flex align-items-center gap-1 p-2 transition-colors',
                            dragOverIndex === index ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover:bg-slate-50'
                        ]"
                        @dragover.prevent="handleDragOver($event, index)"
                        @drop="handleDrop($event, index)"
                        @dragenter.prevent
                    >
                        <div style="width: 4%;" class="d-flex justify-content-center">
                            <i 
                              class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm" 
                              style="cursor: grab;"
                              draggable="true"
                              @dragstart="handleDragStart($event, index)" 
                              @dragend="handleDragEnd"
                            ></i>
                        </div>
                        <div style="width: 8%;" class="text-xs ui-text-secondary font-mono">
                            {{ index + 1 }}
                        </div>
                        <div style="width: 32%;" class="d-flex align-items-center gap-2">
                             <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: getProxyColor(proxyId) }"></div>
                             <span class="text-xs font-medium text-slate-700 text-truncate">{{ getProxyName(proxyId) }}</span>
                        </div>
                        <div style="width: 48%;" class="text-xs ui-text-secondary font-mono text-truncate">
                            {{ getProxyAddress(proxyId) }}
                        </div>
                        <div style="width: 8%;" class="d-flex align-items-center justify-content-center">
                            <button @click="removeProxy(index)" class="ui-button-icon p-0.5" title="Remove">
                                <i class="bi bi-trash ui-icon-sm"></i>
                            </button>
                        </div>
                    </div>

                     <!-- Editing/New Row -->
                     <div v-else class="d-flex align-items-center gap-1 p-2 bg-slate-50 border-bottom border-light">
                        <div style="width: 4%;" class="d-flex justify-content-center">
                             <i class="bi bi-grip-vertical ui-text-tertiary opacity-50 ui-icon-sm"></i>
                        </div>
                        <div style="width: 8%;" class="text-xs ui-text-secondary font-mono">
                            {{ index + 1 }}
                        </div>
                        <div class="flex-1 px-2">
                            <select 
                                style="min-width: 180px;max-width:180px !important;width:180px !important;"
                                class="form-select ui-input ui-input-sm w-100 rounded-lg border py-0 px-3"
                                @change="(e) => updateProxyAt(index, e.target.value)"
                            >
                                <option value="" disabled selected>Select a proxy...</option>
                                <option 
                                    v-for="p in availableProxies" 
                                    :key="p.id" 
                                    :value="p.id"
                                >
                                    {{ p.label || p.host }} ({{ p.scheme }}://{{ p.host }}:{{ p.port }})
                                </option>
                            </select>
                        </div>
                        <div style="width: 8%;" class="d-flex align-items-center justify-content-center">
                            <button @click="removeProxy(index)" class="ui-button-icon p-0.5 text-danger" title="Cancel">
                                <i class="bi bi-x-lg ui-icon-sm"></i>
                            </button>
                        </div>
                     </div>
                 </div>
            </div>
            
             <!-- Empty State -->
            <div v-else class="p-4 d-flex flex-column align-items-center justify-content-center gap-2" style="min-height: 100px;">
              <i class="bi bi-layers text-3xl text-slate-300"></i>
              <p class="text-xs text-slate-500 m-0">No proxies in this group. Add proxies to create a failover chain.</p>
            </div>
          </div>
        </section>

        <!-- Termination Strategy -->
        <section>
          <div class="ui-card-label">
            <span class="label-text">Termination Strategy</span>
          </div>
          <div class="ui-card rounded-xl border shadow-sm p-4">
               <div class="d-flex align-items-center justify-content-between gap-4">
                    <div class="d-flex flex-column">
                        <span class="ui-text-primary text-sm font-medium mb-1">Final Fallback</span>
                        <p class="text-xs text-slate-500 m-0">
                            Action to take when all proxies in the chain fail.
                        </p>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div style="width: 120px;" :class="{ 'opacity-50 pointer-events-none': !fallbackEnabled }">
                            <select 
                                v-model="proxyGroup.fallback.type"
                                class="form-select ui-input ui-input-sm rounded-lg border py-0 px-3 w-100"
                                :disabled="!fallbackEnabled"
                            >
                                <option value="direct">Direct</option>
                                <option value="reject">Reject</option>
                            </select>
                        </div>
                        <div class="form-check form-switch m-0 d-flex align-items-center">
                           <input 
                               class="form-check-input align-self-start" 
                               style="cursor: pointer;" 
                               type="checkbox" 
                               role="switch" 
                               v-model="fallbackEnabled"
                               title="Enable Fallback Strategy"
                           >
                        </div>
                    </div>
               </div>
          </div>
        </section>

      </div>
    </div>
    
    <!-- Modals -->
    <ProxyRenameModal 
      :visible="showRenameModal" 
      title="Rename Proxy Group"
      :currentName="proxyGroup.name || ''" 
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="proxyGroup.name || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete" 
    />
    
    <!-- Simple Add Proxy Modal (Inline or reuse existing?) -->
    <!-- I'll implement a simple one here for speed or use a generic selector modal if available. -->
    <!-- Creating a local modal for now -->
    


  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, saveProxyGroups } from '../../common/storage'
import { toast } from '../utils/toast'
import { useDragDrop } from '../../common/dragDrop'

import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'

// default state
const getEmptyGroup = () => ({
    id: '',
    name: '',
    type: 'group',
    proxies: [],
    fallback: { type: 'direct' },
    fallbackEnabled: true, // New field
    color: '#6366f1' // indigo
})

const route = useRoute()
const router = useRouter()
const config = ref(null)
const proxyGroup = ref(getEmptyGroup())
const originalGroup = ref(null)
const showRenameModal = ref(false)
const showDeleteModal = ref(false)



const fallbackEnabled = computed({
    get: () => proxyGroup.value.fallbackEnabled !== false,
    set: (val) => { proxyGroup.value.fallbackEnabled = val }
})

// Drag and Drop
const proxiesRef = computed({
    get: () => proxyGroup.value.proxies,
    set: (val) => { proxyGroup.value.proxies = val }
})
const { dragOverIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragDrop(proxiesRef)


// Helpers
const getProxyName = (id) => {
    if (!config.value?.proxies?.[id]) return 'Unknown Proxy'
    const p = config.value.proxies[id]
    return p.label || p.host
}

const getProxyAddress = (id) => {
    if (!config.value?.proxies?.[id]) return ''
    const p = config.value.proxies[id]
    return `${p.scheme}://${p.host}:${p.port}`
}

const getProxyColor = (id) => {
    if (!config.value?.proxies?.[id]) return '#94a3b8'
    return config.value.proxies[id].color
}

const availableProxies = computed(() => {
    if (!config.value?.proxies) return []
    const currentSet = new Set(proxyGroup.value.proxies)
    return Object.values(config.value.proxies).filter(p => !currentSet.has(p.id))
})

// Load
const loadGroupData = async () => {
    config.value = await loadConfig()
    const id = route.params.id
    if (config.value?.proxyGroups?.[id]) {
        proxyGroup.value = JSON.parse(JSON.stringify(config.value.proxyGroups[id]))
        
        // Defaults
        if (!proxyGroup.value.proxies) proxyGroup.value.proxies = []
        if (!proxyGroup.value.fallback) proxyGroup.value.fallback = { type: 'direct' }
        if (proxyGroup.value.fallbackEnabled === undefined) proxyGroup.value.fallbackEnabled = true
        if (!proxyGroup.value.color) proxyGroup.value.color = '#6366f1'

        originalGroup.value = JSON.parse(JSON.stringify(proxyGroup.value))
    } else {
        router.push('/settings')
    }
}

// Dirty Check
const isDirty = computed(() => {
    if (!proxyGroup.value || !originalGroup.value) return false
    return JSON.stringify(proxyGroup.value) !== JSON.stringify(originalGroup.value)
})

onMounted(() => {
    loadGroupData()
})

onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning('You have unsaved changes.')
      return true 
    }
    return false
  })
})

onBeforeUnmount(() => {
  unregisterUnsavedChangesChecker()
})

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) loadGroupData()
})

// Actions
const resetChanges = () => {
    loadGroupData()
}

const saveChanges = async () => {
    if (!config.value || !proxyGroup.value) return
    
    // Update local
    config.value.proxyGroups[proxyGroup.value.id] = JSON.parse(JSON.stringify(proxyGroup.value))
    
    // Persist
    await saveProxyGroups(config.value.proxyGroups)
    
    toast.success('Group saved successfully')
    await loadGroupData()
}

const addProxy = () => {
    const totalProxies = Object.keys(config.value?.proxies || {}).length
    if (proxyGroup.value.proxies.length >= totalProxies) {
        toast.warning('No more proxies available')
        return
    }
    proxyGroup.value.proxies.push('')
}

const removeProxy = (index) => {
    proxyGroup.value.proxies.splice(index, 1)
}

const updateProxyAt = (index, id) => {
    if (id) {
        proxyGroup.value.proxies[index] = id
    }
}


const openRenameModal = () => {
  if (isDirty.value) return toast.warning('Save changes first')
  showRenameModal.value = true
}

const openDeleteModal = () => {
    // Check usage?
    // TODO: logic to check if group is used in policies
    showDeleteModal.value = true
}

const handleRename = async (newName) => {
    proxyGroup.value.name = newName
    await saveChanges()
    showRenameModal.value = false
}

const handleDelete = async () => {
    delete config.value.proxyGroups[proxyGroup.value.id]
    await saveProxyGroups(config.value.proxyGroups)
    toast.success('Group deleted')
    router.push('/settings')
    showDeleteModal.value = false
}

</script>
