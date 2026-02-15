<template>
  <BaseDetailView :title="proxy.label || proxy.host || 'Unnamed Proxy'">
    <template #header-start>
      <input 
        type="color" 
        v-model="proxy.color"
        class="border-0 p-0 rounded-lg overflow-hidden transition-transform shadow-sm"
        style="width: 24px; height: 24px; background: none; cursor: pointer;"
        title="Choose color"
      />
    </template>
    <template #actions>
      <!-- Show in Popup Switch -->
      <div class="form-check form-switch m-0 d-flex align-items-center gap-2" :title="$t('phTitleShowPopup')">
        <input class="form-check-input align-self-start" style="cursor: pointer;" type="checkbox" role="switch" id="showInPopup" v-model="proxy.showInPopup">
        <label class="form-check-label text-xs font-medium ui-text-secondary" style="cursor: pointer;" for="showInPopup">{{ $t('phLabelShowPopup') }}</label>
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
              <button @click="openRenameModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                  <i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}
              </button>
            </li>
            <li>
              <button @click="openCloneModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                  <i class="bi bi-files ui-text-tertiary"></i> {{ $t('btnClone') }}
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

    <!-- Connection Details -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('phHeaderConn') }}</span>
      </div>
      

        <!-- Connection Details Card -->
        <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
          <!-- Internal header removed -->
          
          <div class="px-4 pt-4 pb-4 d-flex flex-column gap-3">
            <!-- Inputs Grid -->
            <div class="row g-3">
              <!-- Protocol -->
              <div class="col-3">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelProxyProtocol') }}</span>
                  <select 
                    v-model="proxy.scheme"
                    class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3"
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="socks4">SOCKS4</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </label>
              </div>
              
              <!-- Host -->
              <div class="col-7">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelHost') }}</span>
                  <input 
                    v-model="proxy.host"
                    type="text" 
                    :placeholder="$t('phPlaceholderHost')"
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3"
                  />
                </label>
              </div>
              
              <!-- Port -->
              <div class="col-2">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
                  <input 
                    v-model="proxy.port"
                    type="number" 
                    :placeholder="getPortPlaceholder(proxy.scheme)"
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3"
                    min="1"
                    max="65535"
                    @blur="validatePort(proxy, 'port')"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Authentication -->
          <div class="px-4 pt-3 pb-4 border-top border-light ">
            <h4 class="text-sm font-medium ui-text-primary mb-4 d-flex align-items-center justify-content-between">
              {{ $t('phHeaderAuth') }}
              <span class="text-xs ui-text-secondary font-normal">{{ $t('phDescAuth') }}</span>
            </h4>
            <div class="row g-3">
              <div class="col-6">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblUsername') }}</span>
                  <input 
                    v-model="authUsername"
                    type="text" 
                    :placeholder="$t('phPlaceholderOptional')"
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3"
                  />
                </label>
              </div>
              <div class="col-6">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                  <input 
                    v-model="authPassword"
                    type="password" 
                    :placeholder="$t('phPlaceholderOptional')"
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Bypass Rules -->
    </section>

    <section>
        <div class="ui-card-label">
            <span class="label-text">{{ $t('phHeaderBypass') }}</span>
        </div>
        <div class="ui-card rounded-xl border shadow-sm p-4">
           <label class="ui-form-group">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelRules') }}</span>
            <textarea 
              v-model="bypassList"
              rows="4"
              placeholder="::1&#10;127.0.0.1&#10;<local>"
              class="form-control ui-input w-100 rounded-lg border text-xs font-mono py-2 px-3"
            ></textarea>
            <p class="text-xs ui-text-secondary m-0">{{ $t('phDescBypass') }}</p>
           </label>
        </div>


    </section>

    <!-- Advanced Protocol Overrides -->
    <section>
          <div class="ui-card-label">
            <span class="label-text">
              {{ $t('phHeaderAdvanced') }}
            </span>
          </div>
          
          <div class="d-flex flex-column gap-3">
            <!-- HTTP Override -->
            <div class="ui-card rounded-xl border border-subtle  shadow-sm overflow-hidden">
              <div class="ui-card-header" style="padding-left: 1.5rem !important;">
                HTTP
              </div>

              <div class="px-4 pt-3 pb-4">
                <div class="row g-3">
                  <div class="col-3">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblProtocol') }}</span>
                      <select v-model="httpOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3">
                        <option value="default">{{ $t('phDefault') }}</option>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks4">SOCKS4</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </label>
                  </div>
                  
                  <div class="col-7">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelHost') }}</span>
                      <input v-model="proxy.overrides.http.host" type="text" :placeholder="httpOverrideScheme === 'default' ? '' : 'example.com'" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                  <div class="col-2">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
                      <input v-model="proxy.overrides.http.port" type="number" min="1" max="65535" :placeholder="httpOverrideScheme === 'default' ? '' : getPortPlaceholder(httpOverrideScheme)" :disabled="httpOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.http, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- HTTP Auth -->
              <div class="px-4 pt-3 pb-4 border-top border-light  transition-opacity duration-200" :class="{ 'pointer-events-none': httpOverrideScheme === 'default' }">
                  <h4 class="text-sm fw-medium ui-text-primary mb-3 ls-wide d-flex align-items-center justify-content-between">
                      {{ $t('phHeaderAuth') }}
                      <span class="text-xs ui-text-secondary font-normal normal-case">{{ $t('phDescAuth') }}</span>
                  </h4>
                  <div class="row g-3">
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblUsername') }}</span>
                            <input v-model="proxy.overrides.http.authUsername" type="text" :placeholder="httpOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                            <input v-model="proxy.overrides.http.authPassword" type="password" :placeholder="httpOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="httpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                  </div>
              </div>
            </div>
            <!-- HTTPS Override -->
            <div class="ui-card rounded-xl border border-subtle  shadow-sm overflow-hidden">
              <div class="ui-card-header" style="padding-left: 1.5rem !important;">
                HTTPS
              </div>

              <div class="px-4 pt-3 pb-4">
                <div class="row g-3">
                  <div class="col-3">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblProtocol') }}</span>
                      <select v-model="httpsOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3">
                        <option value="default">{{ $t('phDefault') }}</option>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks4">SOCKS4</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </label>
                  </div>
                  
                  <div class="col-7">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelHost') }}</span>
                      <input v-model="proxy.overrides.https.host" type="text" :placeholder="httpsOverrideScheme === 'default' ? '' : 'example.com'" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                  <div class="col-2">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
                      <input v-model="proxy.overrides.https.port" type="number" min="1" max="65535" :placeholder="httpsOverrideScheme === 'default' ? '' : getPortPlaceholder(httpsOverrideScheme)" :disabled="httpsOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.https, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- HTTPS Auth -->
              <div class="px-4 pt-3 pb-4 border-top border-light  transition-opacity duration-200" :class="{ 'pointer-events-none': httpsOverrideScheme === 'default' }">
                  <h4 class="text-sm fw-medium ui-text-primary mb-3 ls-wide d-flex align-items-center justify-content-between">
                      {{ $t('phHeaderAuth') }}
                      <span class="text-xs ui-text-secondary font-normal normal-case">{{ $t('phDescAuth') }}</span>
                  </h4>
                  <div class="row g-3">
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblUsername') }}</span>
                            <input v-model="proxy.overrides.https.authUsername" type="text" :placeholder="httpsOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                            <input v-model="proxy.overrides.https.authPassword" type="password" :placeholder="httpsOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="httpsOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                  </div>
              </div>
            </div>

            <!-- FTP Override -->
            <div class="ui-card rounded-xl border border-subtle  shadow-sm overflow-hidden">
              <div class="ui-card-header" style="padding-left: 1.5rem !important;">
                FTP
              </div>

              <div class="px-4 pt-3 pb-4">
                <div class="row g-3">
                  <div class="col-3">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblProtocol') }}</span>
                      <select v-model="ftpOverrideScheme" class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3">
                        <option value="default">{{ $t('phDefault') }}</option>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks4">SOCKS4</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </label>
                  </div>
                  
                  <div class="col-7">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelHost') }}</span>
                      <input v-model="proxy.overrides.ftp.host" type="text" :placeholder="ftpOverrideScheme === 'default' ? '' : 'example.com'" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                  <div class="col-2">
                    <label class="ui-form-group">
                      <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
                      <input v-model="proxy.overrides.ftp.port" type="number" min="1" max="65535" :placeholder="ftpOverrideScheme === 'default' ? '' : getPortPlaceholder(ftpOverrideScheme)" :disabled="ftpOverrideScheme === 'default'" @blur="validatePort(proxy.overrides.ftp, 'port')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- FTP Auth -->
              <div class="px-4 pt-3 pb-4 border-top border-light  transition-opacity duration-200" :class="{ 'pointer-events-none': ftpOverrideScheme === 'default' }">
                  <h4 class="text-sm fw-medium ui-text-primary mb-3 ls-wide d-flex align-items-center justify-content-between">
                      {{ $t('phHeaderAuth') }}
                      <span class="text-xs ui-text-secondary font-normal normal-case">{{ $t('phDescAuth') }}</span>
                  </h4>
                  <div class="row g-3">
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblUsername') }}</span>
                            <input v-model="proxy.overrides.ftp.authUsername" type="text" :placeholder="ftpOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                      <div class="col-6">
                          <label class="ui-form-group">
                            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                            <input v-model="proxy.overrides.ftp.authPassword" type="password" :placeholder="ftpOverrideScheme === 'default' ? '' : $t('phPlaceholderOptional')" :disabled="ftpOverrideScheme === 'default'" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
                          </label>
                      </div>
                  </div>
              </div>
            </div>

          </div>
        </section>

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
  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, saveProxies } from '../../common/storage'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'
import BaseDetailView from '../components/BaseDetailView.vue'

// Safe default state factory
const getEmptyProxyState = () => ({
  id: '',
  label: '',
  showInPopup: true,
  scheme: 'http',
  host: '',
  port: null,
  color: '#137fec',
  auth: { username: '', password: '' },
  bypassList: [],
  overrides: {
    http: { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' },
    https: { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' },
    ftp: { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
  }
})

const route = useRoute()
const router = useRouter()
const config = ref(null)
const proxy = ref(getEmptyProxyState()) // Initialize with safe default
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

const getPortPlaceholder = (scheme) => {
  if (scheme === 'http') return '8080'
  if (scheme === 'https') return '443'
  if (['socks4', 'socks5'].includes(scheme)) return '1080'
  return '8080'
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
    if (!proxy.value.bypassList) {
            proxy.value.bypassList = [
                '127.0.0.1',
                '::1',
                '<localhost>'
            ] // Standard localhost bypass
        }
    if (!proxy.value.overrides) proxy.value.overrides = {}
    
    // Ensure override objects exist for UI binding
    if (!proxy.value.overrides.http) proxy.value.overrides.http = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    if (!proxy.value.overrides.https) proxy.value.overrides.https = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    if (!proxy.value.overrides.ftp) proxy.value.overrides.ftp = { scheme: 'default', host: '', port: null, authUsername: '', authPassword: '' }
    // Ensure default color
    if (!proxy.value.color) proxy.value.color = '#137fec' // Default Primary Blue
    // Ensure showInPopup default
    if (proxy.value.showInPopup === undefined) proxy.value.showInPopup = true

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
      toast.warning(t('phMsgUnsaved'))
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

  // Apply default port if missing
  if (!payload.port) {
      const scheme = payload.scheme
      if (scheme === 'http') payload.port = 8080
      else if (scheme === 'https') payload.port = 443
      else if (['socks4', 'socks5'].includes(scheme)) payload.port = 1080
  }

  // Clean up auth if empty
  if (payload.auth && !payload.auth.username && !payload.auth.password) {
    payload.auth = null
  }

  // Clean up and apply defaults for overrides
  if (payload.overrides) {
    // Apply default port if missing
    ['http', 'https', 'ftp'].forEach(key => {
        const override = payload.overrides[key]
        if (override && override.scheme !== 'default' && !override.port) {
             const defaultPort = getPortPlaceholder(override.scheme)
             if (defaultPort) override.port = parseInt(defaultPort, 10)
        }
    })

    if (payload.overrides.http?.scheme === 'default') delete payload.overrides.http
    if (payload.overrides.https?.scheme === 'default') delete payload.overrides.https
    if (payload.overrides.ftp?.scheme === 'default') delete payload.overrides.ftp
  }

  // Update local config object
  config.value.proxies[payload.id] = payload
  
  // Save Proxies only
  await saveProxies(config.value.proxies)
  
  toast.success(t('phMsgSaved'))
  
  // Reload
  await loadProxyData()
}



// --- Action Handlers ---

const openRenameModal = () => {
  if (isDirty.value) {
    toast.warning(t('phMsgRenameDirty'))
    return
  }
  showRenameModal.value = true
}

const openCloneModal = () => {
  if (isDirty.value) {
    toast.warning(t('phMsgCloneDirty'))
    return
  }
  showCloneModal.value = true
}

const openDeleteModal = () => {
  if (!proxy.value || !config.value) return

  const proxyId = proxy.value.id
  const usedInPolicies = []

  // Check usage in policies
  if (config.value.policies) {
    Object.values(config.value.policies).forEach(policy => {
      let isUsed = false
      
      // Check default profile
      if (policy.defaultProfileId === proxyId) {
        isUsed = true
      }
      
      // Check rules
      if (!isUsed && policy.rules) {
        const found = policy.rules.some(rule => rule.proxyId === proxyId)
        if (found) isUsed = true
      }

      if (isUsed) {
        usedInPolicies.push(policy.name || 'Unnamed Policy')
      }
    })
  }

  if (usedInPolicies.length > 0) {
    toast.warning(`${t('phMsgDeleteUsed')} ${usedInPolicies.join(', ')}`)
    return
  }

  showDeleteModal.value = true
}

const handleRename = async (newName) => {
  if (!proxy.value || !config.value) return
  
  // Update label
  config.value.proxies[proxy.value.id].label = newName
  
  // Save
  await saveProxies(config.value.proxies)
  toast.success(t('phMsgRenamed'))
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
  
  toast.success(t('phMsgCloned'))
  
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
  
  toast.success(t('phMsgDeleted'))
  
  // Navigate away
  router.push('/settings')
  showDeleteModal.value = false
}
</script>
