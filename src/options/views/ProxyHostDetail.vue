<template>
  <div class="h-full flex flex-col bg-white dark:bg-slate-900 relative">
    
    <!-- Header -->
    <header class="h-24 px-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          {{ proxy.label || 'Unnamed Proxy' }}
          <span v-if="isActive" class="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Active</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">Configure connection details for this proxy server.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="resetChanges"
          class="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
        >
          Reset
        </button>
        <button 
          @click="saveChanges"
          class="px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <i class="bi bi-save"></i>
          Save Changes
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-8 scroll-smooth">
      <div class="max-w-3xl mx-auto space-y-8 pb-10">
        
        <!-- Default Configuration -->
        <section>
          <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Default Configuration</h3>
          
          <div class="space-y-6">
            <!-- Connection Details Card -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div class="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <i class="bi bi-router text-primary text-lg"></i>
                  Connection Details
                </h3>
                <p class="text-xs text-slate-500">Define the core parameters for the proxy connection.</p>
              </div>
              
              <div class="p-6 space-y-6">
                <!-- Inputs Grid -->
                <div class="grid grid-cols-12 gap-6">
                  <!-- Protocol -->
                  <div class="col-span-12 sm:col-span-4">
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Proxy Protocol</label>
                    <select 
                      v-model="proxy.scheme"
                      class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-2 px-3 border"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks4">SOCKS4</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>
                  
                  <!-- Host -->
                  <div class="col-span-12 sm:col-span-5">
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Host Address</label>
                    <input 
                      v-model="proxy.host"
                      type="text" 
                      placeholder="e.g. 192.168.1.1"
                      class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-2 px-3 border"
                    />
                  </div>
                  
                  <!-- Port -->
                  <div class="col-span-12 sm:col-span-3">
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Port</label>
                    <input 
                      v-model="proxy.port"
                      type="number" 
                      placeholder="e.g. 8080"
                      class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-2 px-3 border"
                    />
                  </div>
                </div>
              </div>

              <!-- Authentication -->
              <div class="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-100 dark:border-slate-700/50">
                <h4 class="text-xs font-medium text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                  Authentication (Optional)
                  <span class="text-[10px] text-slate-500 font-normal">Leave blank if not required</span>
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                    <input 
                      v-model="authUsername"
                      type="text" 
                      placeholder="Username"
                      class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-2 px-3 border"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <input 
                      v-model="authPassword"
                      type="password" 
                      placeholder="••••••••"
                      class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-2 px-3 border"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Bypass Rules -->
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <i class="bi bi-sign-turn-right text-primary text-lg"></i>
                  Bypass Rules
                </label>
              </div>
              <p class="text-xs text-slate-500 mb-4">
                Requests to these domains or IPs will bypass the proxy. Supports wildcards (e.g. *.google.com).
              </p>
              <textarea 
                v-model="bypassList"
                rows="4"
                placeholder="localhost&#10;127.0.0.1&#10;::1&#10;*.local"
                class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs font-mono leading-relaxed py-2 px-3 border"
              ></textarea>
            </div>

            <!-- Advanced Protocol Overrides -->
            <section class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold text-slate-900 dark:text-white">
                  Advanced Protocol Overrides
                  <span class="text-xs font-normal text-slate-500 ml-2">(高级协议覆盖)</span>
                </h3>
              </div>
              
              <div class="space-y-4">
                <!-- HTTPS Override -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group">
                  <div class="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div class="flex items-center gap-4 flex-1">
                      <span class="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                        <i class="bi bi-lock-fill text-xl"></i>
                      </span>
                      <div>
                        <h4 class="font-semibold text-sm text-slate-900 dark:text-white">HTTPS</h4>
                        <p class="text-[10px] text-slate-500 mt-0.5">Secure web traffic</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-medium text-slate-500 uppercase">Enable Override</span>
                        <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input 
                            type="checkbox" 
                            name="toggle-https" 
                            id="toggle-https"
                            v-model="httpsOverrideEnabled"
                            class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 checked:right-0 checked:border-primary transition-all duration-300 top-0.5 left-0.5"
                          />
                          <label for="toggle-https" class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- HTTPS Details (Conditional) -->
                  <div v-if="httpsOverrideEnabled" class="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20 p-6">
                    <div class="grid grid-cols-12 gap-6">
                      <div class="col-span-12 sm:col-span-4">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Protocol</label>
                        <select v-model="proxy.overrides.https.scheme" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border">
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      <div class="col-span-12 sm:col-span-5">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Host Address</label>
                        <input v-model="proxy.overrides.https.host" type="text" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border" />
                      </div>
                      <div class="col-span-12 sm:col-span-3">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Port</label>
                        <input v-model="proxy.overrides.https.port" type="number" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- FTP Override -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group">
                  <div class="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div class="flex items-center gap-4 flex-1">
                      <span class="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                        <i class="bi bi-folder-fill text-xl"></i>
                      </span>
                      <div>
                        <h4 class="font-semibold text-sm text-slate-900 dark:text-white">FTP</h4>
                        <p class="text-[10px] text-slate-500 mt-0.5">File transfer traffic</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-medium text-slate-500 uppercase">Enable Override</span>
                        <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input 
                            type="checkbox" 
                            name="toggle-ftp" 
                            id="toggle-ftp"
                            v-model="ftpOverrideEnabled"
                            class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 checked:right-0 checked:border-primary transition-all duration-300 top-0.5 left-0.5"
                          />
                          <label for="toggle-ftp" class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- FTP Details (Conditional) -->
                  <div v-if="ftpOverrideEnabled" class="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20 p-6">
                    <div class="grid grid-cols-12 gap-6">
                      <div class="col-span-12 sm:col-span-4">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Protocol</label>
                        <select v-model="proxy.overrides.ftp.scheme" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border">
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      <div class="col-span-12 sm:col-span-5">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Host Address</label>
                        <input v-model="proxy.overrides.ftp.host" type="text" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border" />
                      </div>
                      <div class="col-span-12 sm:col-span-3">
                        <label class="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Port</label>
                        <input v-model="proxy.overrides.ftp.port" type="number" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5 px-2 border" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div class="mt-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 flex gap-3 text-xs text-orange-800 dark:text-orange-300">
                <i class="bi bi-exclamation-triangle-fill shrink-0 text-[18px]"></i>
                <p>Configured overrides will take precedence over the default configuration for their respective protocols when enabled.</p>
              </div>
            </section>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadConfig, saveConfig } from '../../common/storage'

const route = useRoute()
const config = ref(null)
const proxy = ref({
  id: '',
  label: '',
  scheme: 'http',
  host: '',
  port: null,
  auth: null,
  bypassList: [],
  overrides: {}
})

// Authentication Computed Properties
const authUsername = computed({
  get: () => proxy.value.auth?.username || '',
  set: (val) => {
    if (!proxy.value.auth) proxy.value.auth = {}
    proxy.value.auth.username = val
  }
})

const authPassword = computed({
  get: () => proxy.value.auth?.password || '',
  set: (val) => {
    if (!proxy.value.auth) proxy.value.auth = {}
    proxy.value.auth.password = val
  }
})

// Bypass List Computed Property (Array <-> String)
const bypassList = computed({
  get: () => proxy.value.bypassList ? proxy.value.bypassList.join('\n') : '',
  set: (val) => {
    proxy.value.bypassList = val.split('\n').map(s => s.trim()).filter(Boolean)
  }
})

// Overrides Computed Properties
const httpsOverrideEnabled = computed({
  get: () => !!proxy.value.overrides?.https,
  set: (val) => {
    if (!proxy.value.overrides) proxy.value.overrides = {}
    if (val) {
      if (!proxy.value.overrides.https) proxy.value.overrides.https = { scheme: 'http', host: '', port: null }
    } else {
      delete proxy.value.overrides.https
    }
  }
})



const ftpOverrideEnabled = computed({
  get: () => !!proxy.value.overrides?.ftp,
  set: (val) => {
    if (!proxy.value.overrides) proxy.value.overrides = {}
    if (val) {
      if (!proxy.value.overrides.ftp) proxy.value.overrides.ftp = { scheme: 'http', host: '', port: null }
    } else {
      delete proxy.value.overrides.ftp
    }
  }
})

const isActive = computed(() => {
  return config.value?.activeProfileId === proxy.value.id
})

// Load logic
const loadProxyData = async () => {
  config.value = await loadConfig()
  const id = route.params.id
  if (config.value?.proxies?.[id]) {
    // Deep copy
    proxy.value = JSON.parse(JSON.stringify(config.value.proxies[id]))
    // Ensure exist
    if (!proxy.value.bypassList) proxy.value.bypassList = []
    if (!proxy.value.overrides) proxy.value.overrides = {}
  }
}

onMounted(() => {
  loadProxyData()
  chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
             // Handled by manual reset for now, or could auto-reload
        }
    })
})

watch(() => route.params.id, () => {
  loadProxyData()
})

const resetChanges = () => {
  loadProxyData()
}

const saveChanges = async () => {
  if (!config.value) return 
  
  // Clean up auth if empty
  if (proxy.value.auth && !proxy.value.auth.username && !proxy.value.auth.password) {
    proxy.value.auth = null
  }

  // Update local config object
  config.value.proxies[proxy.value.id] = JSON.parse(JSON.stringify(proxy.value))
  
  // Save to storage
  await saveConfig(config.value)
  
  // Reload
  await loadProxyData()
}
</script>

<style scoped>
/* Scoped styles to match Tailwind utilities if needed, mostly using Bootstrap-like classes now */
.ui-text-primary {
    color: #1e293b; 
}
.dark .ui-text-primary {
    color: #f8fafc;
}
.ui-text-secondary {
    color: #64748b;
}
</style>
