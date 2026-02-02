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
      // Ensure version is loaded
      if (result.config.version) runtimeConfig.version = result.config.version
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
 * @param {boolean} skipSync - If true, do not trigger auto-sync
 */
export async function saveConfig(config, skipSync = false) {
  // Extract keys to save to their respective storage locations
  
  // 1. Config (General Settings) - Strip out profiles
  const configData = {
      version: config.version || 1,
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
  
  await chrome.storage.local.set(storageData)

  if (!skipSync) {
      await triggerAutoSync(config)
  }
}

/**
 * Save ONLY General Settings and Singletons.
 * Used by GeneralSettings.vue to avoid overwriting profiles with stale data.
 * @param {typeof DEFAULT_CONFIG} config 
 * @param {boolean} skipSync
 */
export async function saveGeneralSettings(config, skipSync = false) {
  const configData = {
      version: config.version || 1,
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

  if (!skipSync) {
    // We need full config to sync, so load it first
    const fullConfig = await loadConfig()
    await triggerAutoSync(fullConfig)
  }
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
 * @param {boolean} skipSync
 */
export async function saveProxies(proxies, skipSync = false) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(proxies || {}))
  await chrome.storage.local.set({ proxies: raw })

  if (!skipSync) {
    const fullConfig = await loadConfig()
    await triggerAutoSync(fullConfig)
  }
}

/**
 * Save Policies Map ONLY.
 * @param {object} policies 
 * @param {boolean} skipSync
 */
export async function savePolicies(policies, skipSync = false) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(policies || {}))
  await chrome.storage.local.set({ policies: raw })

  if (!skipSync) {
    const fullConfig = await loadConfig()
    await triggerAutoSync(fullConfig)
  }
}

/**
 * Save PACs Map ONLY.
 * @param {object} pacs 
 * @param {boolean} skipSync
 */
export async function savePacs(pacs, skipSync = false) {
  // Strip reactivity
  const raw = JSON.parse(JSON.stringify(pacs || {}))
  await chrome.storage.local.set({ pacs: raw })

  if (!skipSync) {
    const fullConfig = await loadConfig()
    await triggerAutoSync(fullConfig)
  }
}

/**
 * Clear all configuration and reset to defaults.
 */
export async function clearConfig() {
    const keys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
    await chrome.storage.local.remove(keys)
    await clearSessionRules()
}

// --- Sync Logic ---

/**
 * Trigger Auto Sync if enabled.
 * @param {typeof DEFAULT_CONFIG} config 
 */
async function triggerAutoSync(config) {
    if (config.sync && config.sync.enabled) {
        console.log('Auto Sync triggered')
        await syncToCloud(config)
    }
}

/**
 * Sync Local Config to Cloud.
 * 1. Increment Version.
 * 2. Strip RuleSet contents.
 * 3. Strip Auto Sync setting (Local only).
 * 4. Save to Cloud.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function syncToCloud(config) {
    // 1. Prepare payload
    const payload = JSON.parse(JSON.stringify(config))
    
    // Increment Version
    const nextVersion = (payload.version || 1) + 1
    payload.version = nextVersion

    // 2. Strip Auto Sync setting (Keep local only)
    if (payload.sync) {
        delete payload.sync // Remove entire sync object or just enabled? User said "auto Sync set as local".
        // If we remove sync object, we should ensure other sync settings (if any) are handled. 
        // Currently sync only has enabled. So removing payload.sync is safest.
    }

    // 3. Clean RuleSets (URL only, no content)
    if (payload.policies) {
        Object.values(payload.policies).forEach(policy => {
            if (policy.rules && Array.isArray(policy.rules)) {
                policy.rules.forEach(rule => {
                    if (rule.type === 'ruleSet' && rule.url) {
                        delete rule.content // Don't save content for URL-based rulesets
                    }
                })
            }
        })
    }

    // 4. Save to Cloud
    try {
        await chrome.storage.sync.set({ config: payload })
        console.log(`Synced to cloud. Version: ${nextVersion}`)

        // 5. Update Local Version to match (IMPORTANT: Skip sync to avoid loop)
        config.version = nextVersion
        await saveConfig(config, true) 
    } catch (e) {
        console.error('Failed to sync to cloud:', e)
    }
}

/**
 * Sync Cloud Config to Local.
 * Checks version and Auto Sync status.
 * @param {boolean} force - Force pull regardless of version or auto-sync setting
 * @returns {Promise<boolean>} true if synced
 */
export async function syncFromCloud(force = false) {
    try {
        const local = await loadConfig()
        
        // Check if Auto Sync is enabled locally (unless forced)
        if (!force && (!local.sync || !local.sync.enabled)) {
            console.log('Auto Sync disabled locally. Skipping pull.')
            return false
        }

        const cloudResult = await chrome.storage.sync.get('config')
        const cloud = cloudResult.config

        if (!cloud) {
            console.log('No cloud config found.')
            return false
        }

        // Check Version: Cloud > Local (unless forced)
        const localVer = local.version || 1
        const cloudVer = cloud.version || 0

        if (force || cloudVer > localVer) {
            if (force) console.log('Forcing sync from cloud...')
            else console.log(`Found newer cloud config (v${cloudVer} > v${localVer}). Syncing...`)
            
            // Restore Cloud Config to Local
            // Preserve Local Auto Sync Setting!
            const syncEnabled = local.sync.enabled
            
            // Merge cloud config into a new object based on DEFAULT structure
            const newConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
            Object.assign(newConfig, cloud)
            
            // Restore local sync setting
            if (!newConfig.sync) newConfig.sync = {}
            newConfig.sync.enabled = syncEnabled
            
            // Save to Local (Skip sync loop)
            await saveConfig(newConfig, true)
            return true
        } else {
            console.log('Local version is up to date.')
            return false
        }
    } catch (e) {
        console.error('Failed to sync from cloud:', e)
        return false
    }
}
