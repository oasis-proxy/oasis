import { DEFAULT_CONFIG } from '../config'

/**
 * Load configuration from storage.
 */
export async function loadConfig() {
  const keys = [
    'config',
    'proxies',
    'proxyGroups',
    'pacs',
    'policies',
    'system',
    'direct',
    'reject'
  ]
  const result = await chrome.storage.local.get(keys)

  const runtimeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))

  if (result.config) {
    const deepMerge = (target, source) => {
      for (const key of Object.keys(source)) {
        if (
          source[key] instanceof Object &&
          key in target &&
          target[key] instanceof Object &&
          !Array.isArray(target[key])
        ) {
          deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
    deepMerge(runtimeConfig, result.config)
    if (result.config.version) runtimeConfig.version = result.config.version
    if (result.config.updatedAt) runtimeConfig.updatedAt = result.config.updatedAt
  }

  if (result.proxies) runtimeConfig.proxies = result.proxies
  if (result.proxyGroups) runtimeConfig.proxyGroups = result.proxyGroups
  if (result.pacs) runtimeConfig.pacs = result.pacs
  if (result.policies) {
    runtimeConfig.policies = result.policies
    Object.values(runtimeConfig.policies).forEach((policy) => {
      if (policy.rules && typeof policy.rules === 'object' && !Array.isArray(policy.rules)) {
        policy.rules = Object.values(policy.rules)
      }
      if (
        policy.rejectRules &&
        typeof policy.rejectRules === 'object' &&
        !Array.isArray(policy.rejectRules)
      ) {
        policy.rejectRules = Object.values(policy.rejectRules)
      }
    })
  }

  if (result.system) runtimeConfig.system = result.system
  if (result.direct) runtimeConfig.direct = result.direct
  if (result.reject) runtimeConfig.reject = result.reject

  try {
    const sessionResult = await chrome.storage.session.get('tempRules')
    if (sessionResult.tempRules) {
      runtimeConfig.tempRules = sessionResult.tempRules
    }
  } catch (e) {
    console.error('Failed to load temporary rules:', e)
  }

  return runtimeConfig
}

/**
 * Save configuration to storage.
 */
export async function saveConfig(config, skipSync = false, skipTouch = false) {
  if (!skipTouch && !config.updatedAt) {
    config.updatedAt = Date.now()
  }

  const configData = JSON.parse(
    JSON.stringify({
      version: config.version || 1,
      updatedAt: config.updatedAt,
      activeProfileId: config.activeProfileId,
      ui: config.ui,
      update: config.update,
      behavior: config.behavior,
      sync: config.sync,
      rulePriority: config.rulePriority,
      ipTags: config.ipTags
    })
  )

  const storageData = {
    config: configData,
    proxies: JSON.parse(JSON.stringify(config.proxies || {})),
    proxyGroups: JSON.parse(JSON.stringify(config.proxyGroups || {})),
    pacs: JSON.parse(JSON.stringify(config.pacs || {})),
    policies: JSON.parse(JSON.stringify(config.policies || {})),
    system: JSON.parse(JSON.stringify(config.system)),
    direct: JSON.parse(JSON.stringify(config.direct)),
    reject: JSON.parse(JSON.stringify(config.reject))
  }

  await chrome.storage.local.set(storageData)

  // This logic should be here or in storage.js
  // Let's keep it here but import the trigger from sync.js later?
  // Circular dependency if saveConfig -> triggerAutoSync -> syncToCloud -> saveConfig.
  // Actually, saveConfig should NOT trigger sync directly to avoid loops.
  // The caller (storage.js) should trigger sync.
}

/**
 * Touch config metadata
 */
export function touchConfig(config) {
  config.version = (config.version || 1) + 1
  config.updatedAt = Date.now()
}

/**
 * Save ONLY General Settings and Singletons.
 */
export async function saveGeneralSettings(config, skipSync = false, skipTouch = false) {
  const fullConfig = await loadConfig()

  fullConfig.version = config.version
  fullConfig.activeProfileId = config.activeProfileId
  fullConfig.ui = config.ui
  fullConfig.update = config.update
  fullConfig.behavior = config.behavior
  fullConfig.sync = config.sync
  fullConfig.rulePriority = config.rulePriority
  fullConfig.ipTags = config.ipTags
  fullConfig.system = config.system
  fullConfig.direct = config.direct
  fullConfig.reject = config.reject

  if (!skipTouch) {
    touchConfig(fullConfig)
  }

  await saveConfig(fullConfig, skipSync)

  // Sync back versions to the referenced object for reactivity
  if (config) {
    config.version = fullConfig.version
    config.updatedAt = fullConfig.updatedAt
  }
}
