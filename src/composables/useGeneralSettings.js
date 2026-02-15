import { reactive, ref, onMounted, watch } from 'vue'
import { loadConfig, saveGeneralSettings } from '../common/storage'
import { DEFAULT_CONFIG } from '../common/config'

export function useGeneralSettings() {
  const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
  const isInitializing = ref(true)
  const localRulePriority = ref(['reject', 'temp', 'normal'])

  const loadData = async () => {
    isInitializing.value = true
    const loaded = await loadConfig()
    Object.assign(config, loaded)
    
    if (config.rulePriority && Array.isArray(config.rulePriority)) {
      localRulePriority.value = [...config.rulePriority]
    }
    
    // Tiny delay to ensure Object.assign doesn't trigger immediate watch/save
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }

  watch(config, (newVal) => {
    if (!isInitializing.value) {
      saveGeneralSettings(JSON.parse(JSON.stringify(newVal)))
    }
  }, { deep: true })

  const updateRulePriority = (newPriority) => {
    localRulePriority.value = [...newPriority]
    config.rulePriority = [...newPriority]
  }

  return {
    config,
    localRulePriority,
    isInitializing,
    loadData,
    updateRulePriority
  }
}
