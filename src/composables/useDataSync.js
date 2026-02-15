import { ref, reactive, computed } from 'vue'
import { 
  loadConfig, saveGeneralSettings, syncToCloud, syncFromCloud, 
  exportConfig, importConfig, clearLocalConfig, clearCloudConfig 
} from '../common/storage'
import { DEFAULT_CONFIG } from '../common/config'
import { t } from '../common/i18n'
import { toast } from '../options/utils/toast'

export function useDataSync() {
  const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
  const cloudConfig = ref(null)
  const showConflictModal = ref(false)
  const softwareVersion = ref('Unknown')
  const cloudNewer = ref(false)

  const loadLocalData = async () => {
    try {
      const manifest = chrome.runtime.getManifest()
      softwareVersion.value = manifest.version || 'Unknown'
    } catch (e) {
      softwareVersion.value = 'Dev Build'
    }
    const loaded = await loadConfig()
    Object.assign(config, loaded)
    compareVersions()
  }

  const loadCloudData = async () => {
    try {
      const result = await chrome.storage.sync.get(null)
      if (result.sync_meta) {
        const count = result.sync_meta.count
        let combinedJson = ''
        try {
          for (let i = 0; i < count; i++) {
            if (result[`sync_chunk_${i}`]) combinedJson += result[`sync_chunk_${i}`]
            else throw new Error(`Missing chunk ${i}`)
          }
          cloudConfig.value = JSON.parse(combinedJson)
          if (!cloudConfig.value.timestamp) cloudConfig.value.timestamp = result.sync_meta.timestamp
        } catch (err) {
          console.error('[DataSync] Reassembly failed:', err)
          cloudConfig.value = null
        }
      } else if (result.config) {
        cloudConfig.value = result.config
      } else {
        cloudConfig.value = null
      }
      compareVersions()
    } catch (e) {
      console.error('Failed to load cloud data', e)
    }
  }

  const compareVersions = () => {
    const localVer = config.version || 1
    const cloudVer = cloudConfig.value?.version || 0
    cloudNewer.value = cloudVer > localVer
  }

  const handleSyncToCloud = async () => {
    await syncToCloud(config)
    toast.success(t('msgSyncedToCloud'))
    showConflictModal.value = false
    await loadLocalData()
    await loadCloudData()
  }

  const handleSyncFromCloud = async () => {
    const success = await syncFromCloud(true)
    if (success) {
      toast.success(t('msgSyncedFromCloud'))
      showConflictModal.value = false
      await loadLocalData()
      await loadCloudData()
    } else {
      toast.error(t('msgSyncFromCloudFailed'))
    }
  }

  const toggleAutoSync = async (enabled) => {
    config.sync.enabled = enabled
    if (enabled) {
      await loadCloudData()
      if (cloudNewer.value) {
        showConflictModal.value = true
      } else {
        await saveGeneralSettings(config, false, true)
        toast.success(t('msgAutoSyncEnabled'))
      }
    } else {
      await saveGeneralSettings(config, true, true)
    }
  }

  const resolveConflictCloud = async () => {
    await handleSyncToCloud()
    config.sync.enabled = true
    await saveGeneralSettings(config, false, true)
    toast.success(t('msgLocalPushedAutoSync'))
  }

  const resolveConflictLocal = async () => {
    const success = await syncFromCloud(true)
    if (success) {
      await loadLocalData()
      config.sync.enabled = true
      await saveGeneralSettings(config, true, true)
      toast.success(t('msgSyncedFromCloudAutoSync'))
      showConflictModal.value = false
    }
  }

  return {
    config, cloudConfig, showConflictModal, softwareVersion, cloudNewer,
    loadLocalData, loadCloudData, handleSyncToCloud, handleSyncFromCloud,
    toggleAutoSync, resolveConflictCloud, resolveConflictLocal,
    cancelAutoSync: async () => {
      showConflictModal.value = false
      config.sync.enabled = false
      await saveGeneralSettings(config, true, true)
    }
  }
}
