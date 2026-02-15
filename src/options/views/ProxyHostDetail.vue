<template>
  <BaseDetailView v-if="proxy" :title="proxy.label || proxy.host || 'Unnamed Proxy'">
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
      <div class="form-check form-switch m-0 d-flex align-items-center gap-2" :title="$t('phTitleShowPopup')">
        <input class="form-check-input align-self-start" style="cursor: pointer;" type="checkbox" role="switch" id="showInPopup" v-model="proxy.showInPopup">
        <label class="form-check-label text-xs font-medium ui-text-secondary" style="cursor: pointer;" for="showInPopup">{{ $t('phLabelShowPopup') }}</label>
      </div>
      
      <button @click="resetChanges" :disabled="!isDirty" class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2">
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
      </button>

      <button @click="saveChanges" :disabled="!isDirty" class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2">
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
      </button>

      <div class="dropdown">
        <button class="ui-button-icon d-flex align-items-center justify-content-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical text-lg"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1" style="min-width: 140px;">
            <li><button @click="showRenameModal = true" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}
            </button></li>
            <li><button @click="showCloneModal = true" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-files ui-text-tertiary"></i> {{ $t('btnClone') }}
            </button></li>
            <li><hr class="dropdown-divider my-1 border-subtle "></li>
            <li><button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-danger rounded-md transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-trash"></i> {{ $t('btnDelete') }}
            </button></li>
        </ul>
      </div>
    </template>

    <!-- Connection Details -->
    <section>
      <div class="ui-card-label"><span class="label-text">{{ $t('phHeaderConn') }}</span></div>
      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <div class="px-4 pt-4 pb-4 d-flex flex-column gap-3">
          <div class="row g-3">
            <div class="col-3">
              <label class="ui-form-group">
                <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelProxyProtocol') }}</span>
                <select v-model="proxy.scheme" class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3">
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
                <input v-model="proxy.host" type="text" :placeholder="$t('phPlaceholderHost')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
              </label>
            </div>
            <div class="col-2">
              <label class="ui-form-group">
                <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
                <input v-model="proxy.port" type="number" :placeholder="getPortPlaceholder(proxy.scheme)" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" min="1" max="65535" @blur="validatePort(proxy, 'port')" />
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
                <input v-model="authUsername" type="text" :placeholder="$t('phPlaceholderOptional')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
              </label>
            </div>
            <div class="col-6">
              <label class="ui-form-group">
                <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                <input v-model="authPassword" type="password" :placeholder="$t('phPlaceholderOptional')" class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bypass Rules -->
    <section>
        <div class="ui-card-label"><span class="label-text">{{ $t('phHeaderBypass') }}</span></div>
        <div class="ui-card rounded-xl border shadow-sm p-4">
           <label class="ui-form-group">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelRules') }}</span>
            <textarea v-model="bypassList" rows="4" placeholder="::1&#10;127.0.0.1&#10;<local>" class="form-control ui-input w-100 rounded-lg border text-xs font-mono py-2 px-3"></textarea>
            <p class="text-xs ui-text-secondary m-0">{{ $t('phDescBypass') }}</p>
           </label>
        </div>
    </section>

    <!-- Advanced Overrides -->
    <section>
          <div class="ui-card-label"><span class="label-text">{{ $t('phHeaderAdvanced') }}</span></div>
          <div class="d-flex flex-column gap-3">
            <ProxyOverrideCard label="HTTP" v-model="proxy.overrides.http" />
            <ProxyOverrideCard label="HTTPS" v-model="proxy.overrides.https" />
            <ProxyOverrideCard label="FTP" v-model="proxy.overrides.ftp" />
          </div>
    </section>

    <!-- Modals -->
    <ProxyRenameModal :visible="showRenameModal" :currentName="proxy.label || ''" @close="showRenameModal = false" @save="handleRename" />
    <ProxyCloneModal :visible="showCloneModal" :currentName="proxy.label || ''" @close="showCloneModal = false" @clone="handleClone" />
    <ProxyDeleteModal :visible="showDeleteModal" :proxyName="proxy.label || ''" @close="showDeleteModal = false" @delete="handleDelete" />
  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import { useProxyHost } from '../../composables/useProxyHost'

// Components
import ProxyRenameModal from '../../components/proxy/ProxyRenameModal.vue'
import ProxyCloneModal from '../../components/proxy/ProxyCloneModal.vue'
import ProxyDeleteModal from '../../components/proxy/ProxyDeleteModal.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'
import ProxyOverrideCard from '../../components/proxy/ProxyOverrideCard.vue'

const route = useRoute()
const router = useRouter()
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)

const { proxy, config, isDirty, loadProxyData, saveChanges, handleRename, handleClone, handleDelete, resetChanges } = useProxyHost(route.params.id, router)

// Helper computed properties
const authUsername = computed({ get: () => proxy.value?.auth?.username || '', set: (val) => { if (!proxy.value.auth) proxy.value.auth = {}; proxy.value.auth.username = val } })
const authPassword = computed({ get: () => proxy.value?.auth?.password || '', set: (val) => { if (!proxy.value.auth) proxy.value.auth = {}; proxy.value.auth.password = val } })
const bypassList = computed({
  get: () => Array.isArray(proxy.value?.bypassList) ? proxy.value.bypassList.join('\n') : '',
  set: (val) => { if (proxy.value) proxy.value.bypassList = val.split('\n').map(s => s.trim()).filter(Boolean) }
})

const validatePort = (obj, key) => {
  let val = parseInt(obj[key]); if (isNaN(val)) { obj[key] = null; return };
  if (val < 1) obj[key] = 1; else if (val > 65535) obj[key] = 65535; else obj[key] = val
}
const getPortPlaceholder = (scheme) => scheme === 'https' ? '443' : (['socks4', 'socks5'].includes(scheme) ? '1080' : '8080')

const openDeleteModal = () => {
    const proxyId = proxy.value.id; const usedInPolicies = []
    if (config.value?.policies) {
        Object.values(config.value.policies).forEach(policy => {
            if (policy.defaultProfileId === proxyId || (policy.rules && policy.rules.some(rule => rule.proxyId === proxyId)))
                usedInPolicies.push(policy.name || 'Unnamed Policy')
        })
    }
    if (usedInPolicies.length > 0) return toast.warning(`${t('phMsgDeleteUsed')} ${usedInPolicies.join(', ')}`)
    showDeleteModal.value = true
}

onMounted(() => {
    loadProxyData()
    registerUnsavedChangesChecker(() => {
        if (isDirty.value) { toast.warning(t('phMsgUnsaved')); return true }
        return false
    })
})
onBeforeUnmount(() => unregisterUnsavedChangesChecker())
watch(() => route.params.id, () => loadProxyData())
</script>
