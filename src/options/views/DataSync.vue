<template>
  <BaseDetailView v-if="config" :title="$t('lblDataSync')" maxWidth="5xl">
    <template #default>
      <!-- Maintenance Operations -->
      <section class="mb-5">
        <div class="ui-card-label"><span class="label-text">{{ $t('lblMaintenanceOps') }}</span></div>
        <div class="ui-card rounded-xl border shadow-sm transition-colors">
          <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
            <div class="d-flex items-start">
              <div>
                <p class="text-sm fw-medium ui-text-primary m-0">{{ $t('lblAutoSync') }}</p>
                <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descAutoSync') }}</p>
              </div>
            </div>
            <div class="form-check form-switch">
              <input :checked="config.sync.enabled" @change="toggleAutoSync($event.target.checked)" class="form-check-input align-self-start" type="checkbox" role="switch" id="autoSyncSwitch">
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-between px-4 pt-3 pb-4 hover-bg-subtle transition-colors">
            <div class="d-flex items-start">
              <div>
                <p class="text-sm fw-medium ui-text-primary m-0">{{ $t('lblMaintenance') }}</p>
                <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descMaintenance') }}</p>
              </div>
            </div>
            <div class="d-flex gap-2">
              <input type="file" ref="fileInput" accept=".json" @change="onImportFile" style="display: none;" />
              <button @click="fileInput.click()" class="fw-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-upload text-sm"></i> {{ $t('btnImport') }}
              </button>
              <button @click="onExport" class="fw-medium ui-button-secondary border rounded-lg transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-download text-sm"></i> {{ $t('btnExport') }}
              </button>
              <button @click="onClearLocal" class="fw-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-trash text-sm"></i> {{ $t('btnClearLocal') }}
              </button>
              <button @click="onClearCloud" class="fw-medium ui-button-danger border rounded-lg transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-cloud-slash text-sm"></i> {{ $t('btnClearSync') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Sync Status Section -->
      <div class="d-flex flex-column gap-4">
        <div class="d-flex align-items-stretch justify-content-center gap-4">
          <SyncVersionCard :title="$t('lblLocalVersion')" :data="config" :softwareVersion="softwareVersion" />
          <SyncVersionCard :title="$t('lblCloudVersion')" :data="cloudConfig" />
        </div>
        <div class="d-flex justify-content-center gap-4">
          <div class="flex-1 d-flex justify-content-center">
            <button @click="handleSyncToCloud" class="d-flex align-items-center gap-2 px-4 py-2 ui-button-secondary rounded-lg border transition-all">
              <i class="bi bi-cloud-upload" style="font-size: 12px;"></i>
              <span class="text-xs fw-semibold">{{ $t('btnPushToCloud') }}</span>
            </button>
          </div>
          <div class="flex-1 d-flex justify-content-center">
            <button @click="handleSyncFromCloud" class="d-flex align-items-center gap-2 px-4 py-2 ui-button-secondary rounded-lg border transition-all">
              <i class="bi bi-cloud-download" style="font-size: 12px;"></i>
              <span class="text-xs fw-semibold">{{ $t('btnPullFromCloud') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Conflict Modal -->
      <SyncConflictModal v-if="showConflictModal" :localConfig="config" :cloudConfig="cloudConfig" @cancel="cancelAutoSync" @sync-local="resolveConflictLocal" @sync-cloud="resolveConflictCloud" />
    </template>
  </BaseDetailView>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { exportConfig, importConfig, clearLocalConfig, clearCloudConfig, saveGeneralSettings } from '../../common/storage'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import SyncConflictModal from '../../components/sync/SyncConflictModal.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'
import SyncVersionCard from '../../components/sync/SyncVersionCard.vue'
import { useDataSync } from '../../composables/useDataSync'

const fileInput = ref(null)
const { 
  config, cloudConfig, showConflictModal, softwareVersion, loadLocalData, loadCloudData, 
  handleSyncToCloud, handleSyncFromCloud, toggleAutoSync, resolveConflictCloud, resolveConflictLocal, cancelAutoSync 
} = useDataSync()

onMounted(async () => {
  await loadLocalData()
  await loadCloudData()
})

// Maintenance Handlers
const onImportFile = async (e) => {
  const file = e.target.files[0]; if (!file) return
  const reader = new FileReader(); reader.onload = async (ev) => {
    try {
      if (await importConfig(ev.target.result)) { 
        toast.success(t('msgConfigImported')); 
        // Trigger immediate update of external resources (RuleSets, PACs)
        chrome.runtime.sendMessage({ type: 'TRIGGER_UPDATE' });
        await loadLocalData(); 
        await loadCloudData() 
      }
      else toast.error(t('msgConfigImportFailed'))
    } catch (err) { toast.error(t('msgInvalidConfig')) }
    e.target.value = ''
  }
  reader.readAsText(file)
}
const onExport = async () => {
  try {
    const json = await exportConfig(); const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `oasis_config_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    toast.success(t('msgConfigExported'))
  } catch (e) { toast.error(t('msgConfigExportFailed')) }
}
const onClearLocal = async () => { if (confirm(t('confirmClearLocal'))) { await clearLocalConfig(); toast.success(t('msgLocalCleared')); await loadLocalData() } }
const onClearCloud = async () => { if (confirm(t('confirmClearCloud'))) { 
  try { await clearCloudConfig(); config.sync.enabled = false; await saveGeneralSettings(config, true, true); toast.success(t('msgCloudCleared')); await loadCloudData() }
  catch (e) { toast.error(t('msgClearCloudFailed')) }
} }
</script>
