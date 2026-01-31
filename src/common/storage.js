import { DEFAULT_CONFIG } from './config'

/**
 * Load configuration from storage.
 * Assembles the multiple top-level storage keys into a single Runtime Config Object.
 * @returns {Promise<typeof DEFAULT_CONFIG>}
 */
export async function loadConfig() {
  const keys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
  const result = await chrome.storage.local.get(keys)

  // Start with default structure
  const runtimeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))

  // 1. Merge 'config' (General Settings)
  if (result.config) {
      // Deep merge logic for config object (ui, behavior, etc.)
      const deepMerge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (source[key] instanceof Object && key in target && target[key] instanceof Object && !Array.isArray(target[key])) {
             deepMerge(target[key], source[key])
          } else {
             target[key] = source[key]
          }
        }
      }
      deepMerge(runtimeConfig, result.config)
  }

  // 2. Load Profiles (Arrays) - Overwrite defaults if present in storage
  if (result.proxies) runtimeConfig.proxies = result.proxies
  if (result.pacs) runtimeConfig.pacs = result.pacs
  if (result.policies) {
    runtimeConfig.policies = result.policies
    
    // Self-healing: Fix corrupted arrays (Vue Proxy serialization issue)
    Object.values(runtimeConfig.policies).forEach(policy => {
      if (policy.rules && typeof policy.rules === 'object' && !Array.isArray(policy.rules)) {
        policy.rules = Object.values(policy.rules)
      }
      if (policy.rejectRules && typeof policy.rejectRules === 'object' && !Array.isArray(policy.rejectRules)) {
        policy.rejectRules = Object.values(policy.rejectRules)
      }
    })
  }

  // 3. Load Singletons - Overwrite defaults if present
  if (result.system) runtimeConfig.system = result.system
  if (result.direct) runtimeConfig.direct = result.direct
  if (result.reject) runtimeConfig.reject = result.reject
  
  // 4. Load Session Rules (Temp Rules)
  // These belong to the active policy if it's an auto policy? 
  // Or we just attach them to a special property 'tempRules'?
  // For now, let's attach to the runtime config root for easy access, 
  // though physically they might apply to the active auto policy.
  try {
    const sessionResult = await chrome.storage.session.get('tempRules')
    if (sessionResult.tempRules) {
        runtimeConfig.tempRules = sessionResult.tempRules
    }
  } catch (e) {
      // console.warn('Failed to load session rules', e)
  }

  return runtimeConfig
}

/**
 * Save configuration to storage.
 * Splits the Runtime Config Object into top-level storage keys.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function saveConfig(config) {
  // Extract keys to save to their respective storage locations
  
  // 1. Config (General Settings) - Strip out profiles
  const configData = {
      activeProfileId: config.activeProfileId,
      ui: config.ui,
      update: config.update,
      behavior: config.behavior,
      sync: config.sync,
      ipTags: config.ipTags
  }

  const storageData = {
      config: configData,
      proxies: JSON.parse(JSON.stringify(config.proxies || {})),
      pacs: JSON.parse(JSON.stringify(config.pacs || {})),
      policies: JSON.parse(JSON.stringify(config.policies || {})),
      system: config.system,
      direct: config.direct,
      reject: config.reject
  }
  console.log('saveConfig storageData', storageData)
  await chrome.storage.local.set(storageData)
}

/**
 * Save ONLY General Settings and Singletons.
 * Used by GeneralSettings.vue to avoid overwriting profiles with stale data.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function saveGeneralSettings(config) {
  const configData = {
      activeProfileId: config.activeProfileId,
      ui: config.ui,
      update: config.update,
      behavior: config.behavior,
      sync: config.sync,
      ipTags: config.ipTags
  }
  
  const storageData = {
      config: configData,
      system: config.system,
      direct: config.direct,
      reject: config.reject
  }

  await chrome.storage.local.set(storageData)
}

/**
 * Add a temporary rule to session storage.
 * @param {object} rule 
 */
export async function addSessionRule(rule) {
    const result = await chrome.storage.session.get('tempRules')
    const currentRules = result.tempRules || []
    const newRules = [...currentRules, rule]
    await chrome.storage.session.set({ tempRules: newRules })
}

/**
 * Clear all temporary rules.
 */
export async function clearSessionRules() {
    await chrome.storage.session.remove('tempRules')
}

/**
 * Save Proxies Map ONLY.
 * @param {object} proxies 
 */
export async function saveProxies(proxies) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(proxies || {}))
  await chrome.storage.local.set({ proxies: raw })
}

/**
 * Save Policies Map ONLY.
 * @param {object} policies 
 */
export async function savePolicies(policies) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(policies || {}))
  await chrome.storage.local.set({ policies: raw })
}

/**
 * Save PACs Map ONLY.
 * @param {object} pacs 
 */
export async function savePacs(pacs) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(pacs || {}))
  await chrome.storage.local.set({ pacs: raw })
}

/**
 * Clear all configuration and reset to defaults.
 */
export async function clearConfig() {
    const keys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
    await chrome.storage.local.remove(keys)
    await clearSessionRules()
}
