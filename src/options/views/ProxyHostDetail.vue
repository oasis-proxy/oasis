
<template>
  <div class="h-100 d-flex flex-column bg-white dark:bg-background-dark relative transition-colors">
    
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-slate-700 transition-colors">
      <!-- Header / Actions -->
      <div class="d-flex align-items-center justify-content-between w-100">
        <div class="d-flex align-items-center gap-3">
           <input 
             type="color" 
             v-model="proxy.color"
             class="border-0 p-0 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-110 shadow-sm"
             style="width: 24px; height: 24px; background: none;"
             title="Choose color"
           />
           <h1 class="text-[22px] font-bold ui-text-primary tracking-tight m-0">{{ proxy.label || proxy.host || 'Unnamed Proxy' }}</h1>
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
                  <li><hr class="dropdown-divider my-1 border-slate-200 dark:border-divider-dark"></li>
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
      <div class="max-w-3xl mx-auto d-flex flex-column gap-4 pb-5">
        
        <!-- Default Configuration -->
        <section>
          <h3 class="text-sm font-semibold ui-text-primary mb-3">Default Configuration</h3>
          
          <div class="d-flex flex-column gap-3">
            <!-- Connection Details Card -->
            <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
              <div class="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-divider-dark">
                <h3 class="text-sm font-medium ui-text-primary d-flex align-items-center gap-2 mb-1">
                  Connection Details
                </h3>
                <p class="text-xs ui-text-secondary m-0">Define the core parameters for the proxy connection.</p>
              </div>
              
              <div class="px-4 pt-3 pb-4 d-flex flex-column gap-3">
                <!-- Inputs Grid -->
                <div class="grid grid-cols-12 gap-3">
                  <!-- Protocol -->
                  <div class="col-span-3">
                    <label class="block text-xs font-medium ui-text-secondary mb-1.5">Proxy Protocol</label>
                    <select 
                      v-model="proxy.scheme"
                      class="form-select ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks4">SOCKS4</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>
                  
                  <!-- Host -->
                  <div class="col-span-7">
                    <label class="block text-xs font-medium ui-text-secondary mb-1.5">Host Address</label>
                    <input 
                      v-model="proxy.host"
                      type="text" 

                      class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400"
                    />
                  </div>
                  
                  <!-- Port -->
                  <div class="col-span-2">
                    <label class="block text-xs font-medium ui-text-secondary mb-1.5">Port</label>
                    <input 
                      v-model="proxy.port"
                      type="number" 

                      class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3"
                      min="1"
                      max="65535"
                      @blur="validatePort(proxy, 'port')"
                    />
                  </div>
                </div>
              </div>

              <!-- Authentication -->
              <div class="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-divider-dark">
                <h4 class="text-sm font-medium ui-text-primary mb-4 d-flex align-items-center justify-content-between">
                  Authentication (Optional)
                  <span class="text-xs ui-text-secondary font-normal">Leave blank if not required</span>
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium ui-text-secondary mb-1.5">Username</label>
                    <input 
                      v-model="authUsername"
                      type="text" 
                     
                      class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium ui-text-secondary mb-1.5">Password</label>
                    <input 
                      v-model="authPassword"
                      type="password" 

                      class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Bypass Rules -->
            <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm p-4">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="block text-sm font-medium ui-text-primary d-flex align-items-center gap-2">
                  Bypass Rules
                </label>
              </div>
              <p class="text-xs ui-text-secondary mb-4">
                Requests to these domains or IPs will bypass the proxy. Supports wildcards (e.g. *.google.com).
              </p>
              <textarea 
                v-model="bypassList"
                rows="4"

                class="form-control ui-input w-100 rounded-lg border text-xs font-mono leading-relaxed py-2 px-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
              ></textarea>
            </div>

          </div>
        </section>

        <!-- Advanced Protocol Overrides -->
        <section>
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h3 class="text-sm font-semibold ui-text-primary">
                  Advanced Protocol Overrides
                </h3>
              </div>
              
              <div class="d-flex flex-column gap-3">
                <!-- HTTP Override -->
                <div class="ui-card rounded-xl border border-slate-200 dark:border-divider-dark shadow-sm overflow-hidden group divide-y divide-slate-100 dark:divide-divider-dark">
                  <div class="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-divider-dark">
                    <h3 class="text-sm font-medium ui-text-primary d-flex align-items-center gap-2 mb-1">
                      HTTP
                    </h3>
                    <p class="text-xs ui-text-secondary m-0">Plain web traffic</p>
                  </div>

                  <div class="px-4 pt-3 pb-4">
                    <div class="grid grid-cols-12 gap-4">
                      <div class="col-span-3">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Protocol</label>
                        <select v-model="httpOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3">
                          <option value="default">Default</option>
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      
                      <div class="col-span-7">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Host Address</label>
                        <input v-model="proxy.overrides.http.host" type="text" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                      <div class="col-span-2">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Port</label>
                        <input v-model="proxy.overrides.http.port" type="number" min="1" max="65535" :disabled="httpOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.http, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <!-- HTTP Auth -->
                  <div class="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-divider-dark transition-opacity duration-200" :class="{ 'opacity-50 pointer-events-none': httpOverrideScheme === 'default' }">
                      <h4 class="text-xs font-medium ui-text-primary mb-3 tracking-wide d-flex align-items-center justify-content-between">
                          Authentication (Optional)
                          <span class="text-xs ui-text-secondary font-normal normal-case">Leave blank if not required</span>
                      </h4>
                      <div class="grid grid-cols-2 gap-3">
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Username</label>
                              <input v-model="proxy.overrides.http.authUsername" type="text" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Password</label>
                              <input v-model="proxy.overrides.http.authPassword" type="password" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                      </div>
                  </div>
                </div>
                <!-- HTTPS Override -->
                <div class="ui-card rounded-xl border border-slate-200 dark:border-divider-dark shadow-sm overflow-hidden group divide-y divide-slate-100 dark:divide-divider-dark">
                  <div class="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-divider-dark">
                    <h3 class="text-sm font-medium ui-text-primary d-flex align-items-center gap-2 mb-1">
                      HTTPS
                    </h3>
                    <p class="text-xs ui-text-secondary m-0">Secure web traffic</p>
                  </div>

                  <div class="px-4 pt-3 pb-4">
                    <div class="grid grid-cols-12 gap-4">
                      <div class="col-span-3">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Protocol</label>
                        <select v-model="httpsOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3">
                          <option value="default">Default</option>
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      
                      <div class="col-span-7">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Host Address</label>
                        <input v-model="proxy.overrides.https.host" type="text" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                      <div class="col-span-2">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Port</label>
                        <input v-model="proxy.overrides.https.port" type="number" min="1" max="65535" :disabled="httpsOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.https, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <!-- HTTPS Auth -->
                  <div class="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-divider-dark transition-opacity duration-200" :class="{ 'opacity-50 pointer-events-none': httpsOverrideScheme === 'default' }">
                      <h4 class="text-xs font-medium ui-text-primary mb-3 tracking-wide d-flex align-items-center justify-content-between">
                          Authentication (Optional)
                          <span class="text-xs ui-text-secondary font-normal normal-case">Leave blank if not required</span>
                      </h4>
                      <div class="grid grid-cols-2 gap-3">
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Username</label>
                              <input v-model="proxy.overrides.https.authUsername" type="text" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Password</label>
                              <input v-model="proxy.overrides.https.authPassword" type="password" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                      </div>
                  </div>
                </div>

                <!-- FTP Override -->
                <div class="ui-card rounded-xl border border-slate-200 dark:border-divider-dark shadow-sm overflow-hidden group divide-y divide-slate-100 dark:divide-divider-dark">
                  <div class="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-divider-dark">
                    <h3 class="text-sm font-medium ui-text-primary d-flex align-items-center gap-2 mb-1">
                      FTP
                    </h3>
                    <p class="text-xs ui-text-secondary m-0">File transfer traffic</p>
                  </div>

                  <div class="px-4 pt-3 pb-4">
                    <div class="grid grid-cols-12 gap-3">
                      <div class="col-span-3">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Protocol</label>
                        <select v-model="ftpOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3">
                          <option value="default">Default</option>
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      
                      <div class="col-span-7">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Host Address</label>
                        <input v-model="proxy.overrides.ftp.host" type="text" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                      <div class="col-span-2">
                        <label class="block text-xs font-medium ui-text-secondary mb-1.5 tracking-wide">Port</label>
                        <input v-model="proxy.overrides.ftp.port" type="number" min="1" max="65535" :disabled="ftpOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.ftp, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <!-- FTP Auth -->
                  <div class="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-divider-dark transition-opacity duration-200" :class="{ 'opacity-50 pointer-events-none': ftpOverrideScheme === 'default' }">
                      <h4 class="text-xs font-medium ui-text-primary mb-3 tracking-wide d-flex align-items-center justify-content-between">
                          Authentication (Optional)
                          <span class="text-xs ui-text-secondary font-normal normal-case">Leave blank if not required</span>
                      </h4>
                      <div class="grid grid-cols-2 gap-3">
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Username</label>
                              <input v-model="proxy.overrides.ftp.authUsername" type="text" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                              <label class="block text-xs font-medium ui-text-secondary mb-1.5">Password</label>
                              <input v-model="proxy.overrides.ftp.authPassword" type="password" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border text-xs focus:border-primary focus:ring-primary h-8 py-0 px-3 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
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
      :currentName="proxy.label || ''" 
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyCloneModal
      :visible="showCloneModal" 
      :currentName="proxy.label || ''"
      @close="showCloneModal = false"
      @clone="handleClone"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="proxy.label || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, saveProxies } from '../../common/storage'
import { toast } from '../utils/toast'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const config = ref(null)
const proxy = ref(null) // Changed to null, will be populated by loadProxyData
const originalProxy = ref(null) // For dirty state tracking
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)

// Authentication Computed Properties
const authUsername = computed({
  get: () => proxy.value?.auth?.username || '',
  set: (val) => {
    if (!proxy.value.auth) proxy.value.auth = {}
    proxy.value.auth.username = val
  }
})

const authPassword = computed({
  get: () => proxy.value?.auth?.password || '',
  set: (val) => {
    if (!proxy.value.auth) proxy.value.auth = {}
    proxy.value.auth.password = val
  }
})

// Bypass List Computed Property (Array <-> String)
const bypassList = computed({
  get: () => Array.isArray(proxy.value?.bypassList) ? proxy.value.bypassList.join('\n') : '',
  set: (val) => {
    if (proxy.value) {
      proxy.value.bypassList = val.split('\n').map(s => s.trim()).filter(Boolean)
    }
  }
})

const validatePort = (obj, key) => {
  let val = parseInt(obj[key])
  if (isNaN(val)) {
    obj[key] = null
    return
  }
  if (val < 1) obj[key] = 1
  else if (val > 65535) obj[key] = 65535
  else obj[key] = val // Ensure integer
}

// Overrides Computed Properties
const httpOverrideScheme = computed({
  get: () => proxy.value?.overrides?.http?.scheme || 'default',
  set: (val) => {
    if (!proxy.value.overrides) proxy.value.overrides = {}
    if (!proxy.value.overrides.http) {
       // Initialize if missing, even for default
       proxy.value.overrides.http = { scheme: val, host: '', port: null, authUsername: '', authPassword: '' }
    } else {
       proxy.value.overrides.http.scheme = val
    }
  }
})

const httpsOverrideScheme = computed({
  get: () => proxy.value?.overrides?.https?.scheme || 'default',
  set: (val) => {
    if (!proxy.value.overrides) proxy.value.overrides = {}
    if (!proxy.value.overrides.https) {
       proxy.value.overrides.https = { scheme: val, host: '', port: null, authUsername: '', authPassword: '' }
    } else {
       proxy.value.overrides.https.scheme = val
    }
  }
})



const ftpOverrideScheme = computed({
  get: () => proxy.value?.overrides?.ftp?.scheme || 'default',
  set: (val) => {
    if (!proxy.value.overrides) proxy.value.overrides = {}
    if (!proxy.value.overrides.ftp) {
       proxy.value.overrides.ftp = { scheme: val, host: '', port: null, authUsername: '', authPassword: '' }
    } else {
       proxy.value.overrides.ftp.scheme = val
    }
  }
})



// Load logic
const loadProxyData = async () => {
  config.value = await loadConfig()
  const id = route.params.id
  if (config.value?.proxies?.[id]) {
    // Deep copy
    proxy.value = JSON.parse(JSON.stringify(config.value.proxies[id]))
    // Ensure exist and is array
    if (!Array.isArray(proxy.value.bypassList)) proxy.value.bypassList = []
    if (!proxy.value.overrides) proxy.value.overrides = {}
    
    // Ensure override objects exist for UI binding
    if (!proxy.value.overrides.http) proxy.value.overrides.http = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    if (!proxy.value.overrides.https) proxy.value.overrides.https = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    if (!proxy.value.overrides.ftp) proxy.value.overrides.ftp = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    // Ensure default color
    if (!proxy.value.color) proxy.value.color = '#137fec' // Default Primary Blue

    // Store original state for dirty checking
    originalProxy.value = JSON.parse(JSON.stringify(proxy.value))
  } else {
    // Handle case where proxy ID is not found, e.g., navigate away or show error
    router.push('/settings') // Redirect to settings if proxy not found
  }
}

// Dirty State Computation
const isDirty = computed(() => {
  if (!proxy.value || !originalProxy.value) return false
  return JSON.stringify(proxy.value) !== JSON.stringify(originalProxy.value)
})

onMounted(() => {
  loadProxyData()
  chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
             // Handled by manual reset for now, or could auto-reload
        }
    })
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    loadProxyData()
  }
})

// Register unsaved changes checker
onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning('You have unsaved changes. Please save or reset before leaving.')
      return true  // Has unsaved changes
    }
    return false  // No unsaved changes
  })
})

// Unregister on unmount
onBeforeUnmount(() => {
  unregisterUnsavedChangesChecker()
})


const resetChanges = () => {
  loadProxyData()
}
const saveChanges = async () => {
  if (!config.value || !proxy.value) return 
  
  // Clone proxy data to avoid breaking UI reactivity
  const payload = JSON.parse(JSON.stringify(proxy.value))

  // Clean up auth if empty
  if (payload.auth && !payload.auth.username && !payload.auth.password) {
    payload.auth = null
  }

  // Clean up default overrides
  if (payload.overrides) {
    if (payload.overrides.http?.scheme === 'default') delete payload.overrides.http
    if (payload.overrides.https?.scheme === 'default') delete payload.overrides.https
    if (payload.overrides.ftp?.scheme === 'default') delete payload.overrides.ftp
  }

  // Update local config object
  config.value.proxies[payload.id] = payload
  
  // Save Proxies only
  await saveProxies(config.value.proxies)
  
  toast.success('Proxy saved successfully')
  
  // Reload
  await loadProxyData()
}

// --- Action Handlers ---

const openRenameModal = () => {
  if (isDirty.value) {
    toast.warning('Please save or reset your changes before renaming')
    return
  }
  showRenameModal.value = true
}

const openCloneModal = () => {
  if (isDirty.value) {
    toast.warning('Please save or reset your changes before cloning')
    return
  }
  showCloneModal.value = true
}

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const handleRename = async (newName) => {
  if (!proxy.value || !config.value) return
  
  // Update label
  config.value.proxies[proxy.value.id].label = newName
  
  // Save
  await saveProxies(config.value.proxies)
  toast.success('Proxy renamed successfully')
  await loadProxyData()
  showRenameModal.value = false
}

const handleClone = async (newName) => {
  if (!proxy.value || !config.value) return
  
  // Create deep copy
  const newId = `proxy_${Date.now()}`
  const newProxy = JSON.parse(JSON.stringify(config.value.proxies[proxy.value.id]))
  
  newProxy.id = newId
  newProxy.label = newName
  
  // Add to config
  config.value.proxies[newId] = newProxy
  
  // Save
  await saveProxies(config.value.proxies)
  
  toast.success('Proxy cloned successfully')
  
  // Navigate to new proxy
  router.push(`/host/${newId}`)
  showCloneModal.value = false
}

const handleDelete = async () => {
  if (!proxy.value || !config.value) return
  
  // Remove from config
  delete config.value.proxies[proxy.value.id]
  
  // Save
  await saveProxies(config.value.proxies)
  
  toast.success('Proxy deleted successfully')
  
  // Navigate away
  router.push('/settings')
  showDeleteModal.value = false
}
</script>

<style scoped>
/* Scoped styles removed as they are now handled by main.css (ui-* classes) */
</style>

