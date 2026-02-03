<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" style="background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);">
    <div class="modal-dialog modal-dialog-centered" style="min-width: 680px; max-width: 800px">
      <div class="modal-content ui-card border shadow-lg rounded-2xl overflow-hidden">
        <!-- Header -->
        <div class="modal-header p-4 border-0">
          <h5 class="ui-modal-title ui-text-primary tracking-tight m-0 d-flex align-items-center gap-2">
            Sync Conflict Detected
          </h5>
          <button 
            type="button"
            class="p-2 bg-transparent hover:bg-transparent ui-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0"
            aria-label="Close"
            @click="$emit('cancel')"
          >
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body px-4 pb-4">
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">
            The version in the cloud is newer than your local version. Please choose which version to keep.
          </p>

          <div class="row g-4">
             <!-- Local Version Card -->
             <div class="col-6">
                 <div class="ui-card rounded-xl border shadow-sm p-4 relative overflow-hidden group h-100">
                    <div class="d-flex align-items-center gap-3 mb-4 position-relative z-10">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                    <h3 class="text-sm font-semibold ui-text-primary m-0">Local Version</h3>
                            </div>
                            <p class="text-xs ui-text-secondary m-0">This device</p>
                        </div>
                    </div>
                    
                    <div class="d-flex flex-column gap-3 position-relative z-10">
                        <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Last Modified</p>
                            <p class="text-xs font-mono ui-text-primary m-0 text-end">
                                {{ localLastModified }}
                            </p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Config Ver.</p>
                            <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ configVersion }}</p>
                        </div>

                        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 d-flex flex-column gap-3">
                             <!-- Proxy Hosts -->
                            <div class="d-flex justify-content-between align-items-start">
                                    <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Proxy Hosts</p>
                                    <span class="text-xs font-mono ui-text-primary">{{ proxyCount }}</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex justify-content-between align-items-start">
                                    <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Policies</p>
                                    <span class="text-xs font-mono ui-text-primary">{{ policyCount }}</span>
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
                                <h3 class="text-sm font-semibold ui-text-primary m-0">Cloud Version</h3>
                            </div>
                            <p class="text-xs ui-text-secondary m-0">Remote repository</p>
                        </div>
                    </div>

                    <div class="d-flex flex-column gap-3 position-relative z-10">
                            <!-- Last Modified -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Last Modified</p>
                            <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ cloudLastModified }}</p>
                        </div>
                        
                        <!-- Config Version -->
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0">Config Ver.</p>
                            <p class="text-xs font-mono ui-text-primary m-0 text-end">{{ cloudConfigVersion }}</p>
                        </div>

                        <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 d-flex flex-column gap-3">
                             <!-- Proxy Hosts -->
                             <div class="d-flex justify-content-between align-items-start">
                                <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Proxy Hosts</p>
                                <span class="text-xs font-mono ui-text-primary">{{ cloudProxyCount }}</span>
                            </div>

                            <!-- Policies -->
                            <div class="d-flex justify-content-between align-items-start">
                                <p class="text-xs font-medium ui-text-secondary uppercase tracking-wider m-0 mt-0.5">Policies</p>
                                <span class="text-xs font-mono ui-text-primary">{{ cloudPolicyCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer p-4 d-flex justify-content-end gap-3 border-0">
            <button type="button" class="btn ui-button-secondary h-8 px-3 text-xs font-medium rounded-lg d-flex align-items-center" @click="$emit('cancel')">
                Cancel
            </button>
            <button type="button" class="btn ui-button-danger h-8 px-3 text-xs font-medium rounded-lg d-flex align-items-center" @click="$emit('sync-cloud')">
                Overwrite Cloud
            </button>
            
            <button type="button" class="btn ui-button-danger h-8 px-3 text-xs font-medium rounded-lg d-flex align-items-center" @click="$emit('sync-local')">
                Sync from Cloud
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  localConfig: { type: Object, required: true },
  cloudConfig: { type: Object, default: null }
})

defineEmits(['cancel', 'sync-local', 'sync-cloud'])

// Local Computed
const configVersion = computed(() => props.localConfig.version ? `v${props.localConfig.version}` : 'v1')
const localLastModified = computed(() => {
    if (!props.localConfig.updatedAt) return 'Unknown'
    return new Date(props.localConfig.updatedAt).toLocaleString()
})
const proxyCount = computed(() => Object.keys(props.localConfig.proxies || {}).length)
const policyCount = computed(() => Object.keys(props.localConfig.policies || {}).length)


// Cloud Computed
const cloudConfigVersion = computed(() => props.cloudConfig?.version ? `v${props.cloudConfig.version}` : '-')
const cloudLastModified = computed(() => {
    if (!props.cloudConfig?.timestamp) return 'Unknown'
    return new Date(props.cloudConfig.timestamp).toLocaleString()
})
const cloudProxyCount = computed(() => Object.keys(props.cloudConfig?.proxies || {}).length || 0)
const cloudPolicyCount = computed(() => Object.keys(props.cloudConfig?.policies || {}).length || 0)

</script>

<style scoped>
/* Ensure modal overlay is on top */
.modal {
  z-index: 1050;
}
</style>
