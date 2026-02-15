<template>
  <BaseModal 
    :visible="true" 
    :title="$t('titleSyncConflict')"
    titleClass="d-flex align-items-center gap-2"
    maxWidth="800px"
    @close="emit('cancel')"
  >
    <div class="d-flex flex-column gap-3">
        <p class="text-sm ui-text-secondary  mb-4 text-center">
        {{ $t('msgSyncConflict') }}
        </p>

        <div class="row g-4">
            <!-- Local Version Card -->
            <div class="col-6">
                <div class="ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                    <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                    <h3 class="text-sm fw-semibold ui-text-primary m-0">{{ $t('lblLocalVersion') }}</h3>
                            </div>
                            <p class="text-xs ui-text-secondary m-0">{{ $t('lblThisDevice') }}</p>
                        </div>
                    </div>
                    
                    <div class="d-flex flex-column gap-3 position-relative z-10">
                        <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblLastModified') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">
                                {{ localLastModified }}
                            </p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblConfigVer') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ configVersion }}</p>
                        </div>

                        <div class="pt-3 border-top border-subtle  d-flex flex-column gap-3">
                                <!-- Proxy Hosts -->
                            <div class="d-flex justify-content-between align-items-start">
                                    <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0 mt-0.5" style="letter-spacing: 0.05em;">{{ $t('lblProxyHosts') }}</p>
                                    <span class="text-xs font-monospace ui-text-primary">{{ proxyCount }}</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex justify-content-between align-items-start">
                                    <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0 mt-0.5" style="letter-spacing: 0.05em;">{{ $t('lblPolicies') }}</p>
                                    <span class="text-xs font-monospace ui-text-primary">{{ policyCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cloud Version Card -->
            <div class="col-6">
                <div class="ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                    <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                <h3 class="text-sm fw-semibold ui-text-primary m-0">{{ $t('lblCloudVersion') }}</h3>
                            </div>
                            <p class="text-xs ui-text-secondary m-0">{{ $t('lblRemoteRepo') }}</p>
                        </div>
                    </div>

                    <div class="d-flex flex-column gap-3 position-relative z-10">
                            <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblLastModified') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ cloudLastModified }}</p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0" style="letter-spacing: 0.05em;">{{ $t('lblConfigVer') }}</p>
                            <p class="text-xs font-monospace ui-text-primary m-0 text-end">{{ cloudConfigVersion }}</p>
                        </div>

                        <div class="pt-3 border-top border-subtle  d-flex flex-column gap-3">
                                <!-- Proxy Hosts -->
                                <div class="d-flex justify-content-between align-items-start">
                                <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0 mt-0.5" style="letter-spacing: 0.05em;">{{ $t('lblProxyHosts') }}</p>
                                <span class="text-xs font-monospace ui-text-primary">{{ cloudProxyCount }}</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex justify-content-between align-items-start">
                                <p class="text-xs fw-medium ui-text-secondary text-uppercase m-0 mt-0.5" style="letter-spacing: 0.05em;">{{ $t('lblPolicies') }}</p>
                                <span class="text-xs font-monospace ui-text-primary">{{ cloudPolicyCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <template #footer>
        <button type="button" class="btn ui-button-secondary h-8 px-3 text-xs fw-medium rounded-lg d-flex align-items-center" @click="emit('cancel')">
            {{ $t('btnCancel') }}
        </button>
        <button type="button" class="btn ui-button-danger h-8 px-3 text-xs fw-medium rounded-lg d-flex align-items-center" @click="emit('sync-cloud')">
            {{ $t('btnOverwriteCloud') }}
        </button>
        
        <button type="button" class="btn ui-button-danger h-8 px-3 text-xs fw-medium rounded-lg d-flex align-items-center" @click="emit('sync-local')">
            {{ $t('btnSyncFromCloud') }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../../common/i18n'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  localConfig: { type: Object, required: true },
  cloudConfig: { type: Object, default: null }
})

const emit = defineEmits(['cancel', 'sync-local', 'sync-cloud'])

// Local Computed
const configVersion = computed(() => props.localConfig.version ? `v${props.localConfig.version}` : 'v1')
const localLastModified = computed(() => {
    if (!props.localConfig.updatedAt) return t('lblUnknown')
    return new Date(props.localConfig.updatedAt).toLocaleString()
})
const proxyCount = computed(() => Object.keys(props.localConfig.proxies || {}).length)
const policyCount = computed(() => Object.keys(props.localConfig.policies || {}).length)


// Cloud Computed
const cloudConfigVersion = computed(() => props.cloudConfig?.version ? `v${props.cloudConfig.version}` : '-')
const cloudLastModified = computed(() => {
    if (!props.cloudConfig?.timestamp) return t('lblUnknown')
    return new Date(props.cloudConfig.timestamp).toLocaleString()
})
const cloudProxyCount = computed(() => Object.keys(props.cloudConfig?.proxies || {}).length || 0)
const cloudPolicyCount = computed(() => Object.keys(props.cloudConfig?.policies || {}).length || 0)

</script>
