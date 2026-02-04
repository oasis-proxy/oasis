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
      if (result.config.updatedAt) runtimeConfig.updatedAt = result.config.updatedAt
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
 * @param {boolean} skipTouch - If true, do not update timestamp/version logic (handled by caller or ignored)
 */
export async function saveConfig(config, skipSync = false, skipTouch = false) {
  // Ensure we don't double-touch if called recursively, but usually safe
  // Ideally, caller calls touchConfig if they modified logic, but `saveConfig` is often the final commit.
  // HOWEVER, saveConfig is also used by storage logic itself (syncToCloud).
  //syncToCloud calls saveConfig to update version.
  
  // Let's assume saveConfig is the low-level commit, but for general usage we want to ensure updatedAt is set.
  if (!skipTouch && !config.updatedAt) {
      config.updatedAt = Date.now()
  }

  // Extract keys to save to their respective storage locations
  
  // 1. Config (General Settings) - Strip out profiles
  const configData = {
      version: config.version || 1,
      updatedAt: config.updatedAt,
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
 * @param {boolean} skipTouch - If true, do not increment version or update timestamp (for local-only overrides)
 */
export async function saveGeneralSettings(config, skipSync = false, skipTouch = false) {
  
  // We need to touch version/timestamp
  // BUT config passed here might be partial or stale proxies.
  // We must load full, merge, touch, save.
  
  const fullConfig = await loadConfig()
  
  // Merge updates
  fullConfig.version = config.version // Might have been touched by caller? No, usually UI just mutates props.
  fullConfig.activeProfileId = config.activeProfileId
  fullConfig.ui = config.ui
  fullConfig.update = config.update
  fullConfig.behavior = config.behavior
  fullConfig.sync = config.sync
  fullConfig.ipTags = config.ipTags
  fullConfig.system = config.system
  fullConfig.direct = config.direct
  fullConfig.reject = config.reject
  
  if (!skipTouch) {
      touchConfig(fullConfig)
  }
  
  await saveConfig(fullConfig, skipSync)
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
 * Helper: Touch config metadata (Version + Timestamp)
 * @param {object} config 
 */
function touchConfig(config) {
    config.version = (config.version || 1) + 1
    config.updatedAt = Date.now()
}

/**
 * Save Proxies Map ONLY.
 * @param {object} proxies 
 * @param {boolean} skipSync
 */
export async function saveProxies(proxies, skipSync = false) {
  // Load full config to update version/timestamp
  const fullConfig = await loadConfig()
  
  // Assign new proxies
  fullConfig.proxies = JSON.parse(JSON.stringify(proxies || {}))
  
  // Touch & Save
  touchConfig(fullConfig)
  
  await saveConfig(fullConfig, skipSync)
}

/**
 * Save Policies Map ONLY.
 * @param {object} policies 
 * @param {boolean} skipSync
 * @param {boolean} skipTouch - If true, do not increment version
 */
export async function savePolicies(policies, skipSync = false, skipTouch = false) {
  // Load full config to update version/timestamp
  const fullConfig = await loadConfig()
  
  // Assign new policies
  fullConfig.policies = JSON.parse(JSON.stringify(policies || {}))
  
  // Touch & Save
  if (!skipTouch) {
    touchConfig(fullConfig)
  }
  
  await saveConfig(fullConfig, skipSync)
}

/**
 * Save PACs Map ONLY.
 * @param {object} pacs 
 * @param {boolean} skipSync
 */
export async function savePacs(pacs, skipSync = false) {
  // Load full config to update version/timestamp
  const fullConfig = await loadConfig()
  
  // Assign new pacs
  fullConfig.pacs = JSON.parse(JSON.stringify(pacs || {}))
  
  // Touch & Save
  touchConfig(fullConfig)
  
  await saveConfig(fullConfig, skipSync)
}

/**
 * Clear all configuration and reset to defaults.
 */
export async function clearConfig() {
    const keys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
    await chrome.storage.local.remove(keys)
    await clearSessionRules()
}

// --- Optimization & Maintenance ---

/**
 * Optimize config payload by stripping cached content (for Sync/Export).
 * @param {object} config 
 */
function optimizePayload(config) {
    if (config.policies) {
        Object.values(config.policies).forEach(policy => {
            if (policy.rules && Array.isArray(policy.rules)) {
                policy.rules.forEach(rule => {
                    if (rule.ruleType === 'ruleset' && rule.ruleSet) {
                         delete rule.ruleSet.content // Strip content
                    }
                })
            }
        })
    }
    if (config.pacs) {
        Object.values(config.pacs).forEach(pac => {
            if (pac.mode === 'remote') {
                delete pac.script // Strip script
            }
        })
    }
}

/**
 * Export configuration as JSON.
 * Strips cached content but preserves settings.
 * @returns {Promise<string>}
 */
export async function exportConfig() {
    const config = await loadConfig()
    
    // Optimize (Strip cache)
    optimizePayload(config)
    
    // Remove session-specific or internal state if any?
    // We keep 'sync' settings? User request did not say to remove 'sync'.
    // We assume export is a full backup.
    
    return JSON.stringify(config, null, 2)
}

/**
 * Import configuration from JSON string.
 * Overwrites local configuration.
 * @param {string} jsonString 
 * @returns {Promise<boolean>}
 */
export async function importConfig(jsonString) {
    try {
        const newConfig = JSON.parse(jsonString)
        
        // Basic Validation
        if (!newConfig.version) newConfig.version = 1
        
        // Hydrate Remote Resources (Download caches)
        await hydrateConfig(newConfig)
        
        // Save to Local (enable auto-sync if present in file)
        await saveConfig(newConfig)
        return true
    } catch (e) {
        console.error('Failed to import config:', e)
        return false
    }
}

/**
 * Clear Local Configuration.
 * Resets to default and DISABLES Auto Sync.
 */
export async function clearLocalConfig() {
    await clearConfig() // Removes all keys
    
    // Set default config explicitly with sync disabled
    const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    if (defaultConfig.sync) defaultConfig.sync.enabled = false
    
    await saveConfig(defaultConfig, true) // skipSync=true
}

/**
 * Clear Cloud Configuration.
 * Removes all sync data (Meta + Chunks + Legacy).
 */
export async function clearCloudConfig() {
    try {
        const allKeys = await chrome.storage.sync.get(null)
        const keysToRemove = Object.keys(allKeys).filter(k => 
            k === 'sync_meta' || k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview'
        )
        if (keysToRemove.length > 0) {
            await chrome.storage.sync.remove(keysToRemove)
            console.log('Cloud config cleared.', keysToRemove)
        }
    } catch (e) {
        console.error('Failed to clear cloud config:', e)
        throw e
    }
}


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
 * 2. Optimize Payload (Strip Content/URLs).
 * 3. Chunk Payload (Bypass 8KB limit).
 * 4. Save to Cloud.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function syncToCloud(config) {
    // 1. Prepare payload
    const payload = JSON.parse(JSON.stringify(config))
    
    // Use current version (Do NOT increment on sync)
    // The version is only incremented on Local Updates (touchConfig).
    const currentVersion = payload.version || 1
    
    // 2. Strip Auto Sync setting (Keep local only)
    if (payload.sync) {
        delete payload.sync
    }
    // Strip activeProfileId (Local only)
    if (payload.activeProfileId) {
        delete payload.activeProfileId
    }

    // 3. Optimize Payload (Refactored)
    optimizePayload(payload)

    // 4. Chunking
    const jsonString = JSON.stringify(payload)
    const CHUNK_SIZE = 7000 // Safe margin below 8192
    const totalChunks = Math.ceil(jsonString.length / CHUNK_SIZE)
    
    // 5. Save to Cloud
    // We store ONLY metadata and chunks. No separate preview data.
    // The UI will reassemble chunks to show previews.
    const storageData = {
        sync_meta: {
            count: totalChunks,
            version: currentVersion,
            timestamp: payload.updatedAt || Date.now()
        }
    }

    for (let i = 0; i < totalChunks; i++) {
        storageData[`sync_chunk_${i}`] = jsonString.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    }

    try {
        // Clear old chunks first to avoid residue if new config is smaller
        // Actually, we should find ALL existing chunks and remove them before setting new ones?
        // simple way: we already remove 'config' and 'sync_preview'.
        // optimizing: list existing chunk keys and remove them.
        const allKeys = await chrome.storage.sync.get(null)
        const keysToRemove = Object.keys(allKeys).filter(k => k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview')
        if (keysToRemove.length > 0) await chrome.storage.sync.remove(keysToRemove)
        
        // Save using set (merges keys)
        await chrome.storage.sync.set(storageData)
        console.log(`Synced to cloud. Version: ${currentVersion}, Chunks: ${totalChunks}`)

        // No need to update local version
    } catch (e) {
        console.error('Failed to sync to cloud:', e)
    }
}

/**
 * Hydrate remote resources (Rulesets, PACs) into the config.
 * Fetches content for remote Rulesets and PACs if missing (e.g., after cloud sync).
 * @param {object} config 
 */
async function hydrateConfig(config) {
    const promises = []

    // 1. Hydrate Policies (Rulesets)
    if (config.policies) {
        Object.values(config.policies).forEach(policy => {
            if (policy.rules && Array.isArray(policy.rules)) {
                 policy.rules.forEach(rule => {
                    if (rule.ruleType === 'ruleset' && rule.ruleSet && rule.ruleSet.url && !rule.ruleSet.content) {
                        promises.push(
                            fetch(rule.ruleSet.url)
                                .then(res => res.text())
                                .then(text => { rule.ruleSet.content = text })
                                .catch(e => console.warn('Failed to hydrate ruleset', rule.ruleSet.url, e))
                        )
                    }
                })
            }
        })
    }

    // 2. Hydrate PACs
    if (config.pacs) {
        Object.values(config.pacs).forEach(pac => {
             if (pac.mode === 'remote' && pac.url && !pac.script) {
                 promises.push(
                    fetch(pac.url)
                        .then(res => res.text())
                        .then(text => { pac.script = text })
                        .catch(e => console.warn('Failed to hydrate PAC', pac.url, e))
                 )
             }
        })
    }

    if (promises.length > 0) {
        console.log(`Hydrating ${promises.length} resources...`)
        await Promise.allSettled(promises)
    }
}

/**
 * Sync Cloud Config to Local.
 * Checks version and Auto Sync status.
 * Handles both Chunked and Legacy formats.
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

        // Fetch Meta and Legacy Config
        const keys = await chrome.storage.sync.get(null) // Get everything to find chunks
        let cloudConfig = null
        let uniqueVersion = 0

        // Check for Chunked Data
        if (keys.sync_meta) {
            const count = keys.sync_meta.count
            uniqueVersion = keys.sync_meta.version
            
            let combinedJson = ''
            for (let i = 0; i < count; i++) {
                if (keys[`sync_chunk_${i}`]) {
                    combinedJson += keys[`sync_chunk_${i}`]
                } else {
                    console.error(`Missing chunk ${i}`)
                    return false
                }
            }
            try {
                cloudConfig = JSON.parse(combinedJson)
            } catch (e) {
                console.error('Failed to parse chunked config', e)
                return false
            }
        } 
        // Fallback to Legacy
        else if (keys.config) {
            cloudConfig = keys.config
            uniqueVersion = cloudConfig.version || 0
        }

        if (!cloudConfig) {
            console.log('No cloud config found.')
            return false
        }

        // Check Version: Cloud > Local (unless forced)
        const localVer = local.version || 1
        
        if (force || uniqueVersion > localVer) {
            if (force) console.log('Forcing sync from cloud...')
            else console.log(`Found newer cloud config (v${uniqueVersion} > v${localVer}). Syncing...`)
            
            // Restore Cloud Config to Local
            // Preserve Local Auto Sync Setting!
            const syncEnabled = local.sync.enabled
            
            // Merge cloud config into a new object based on DEFAULT structure
            const newConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
            Object.assign(newConfig, cloudConfig)
            
            // Restore local sync setting
            if (!newConfig.sync) newConfig.sync = {}
            newConfig.sync.enabled = syncEnabled
            
            // Hydrate Remote Resources (Download caches)
            // This operation should NOT increment version (it's just caching)
            await hydrateConfig(newConfig)

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
