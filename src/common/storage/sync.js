import { DEFAULT_CONFIG } from '../config'
import { fetchRuleSetContent } from '../ruleset'
import { loadConfig, saveConfig } from './core'

/**
 * Optimize config payload by stripping cached content.
 */
export function optimizePayload(config) {
  if (config.policies) {
    Object.values(config.policies).forEach((policy) => {
      if (policy.rules && Array.isArray(policy.rules)) {
        policy.rules.forEach((rule) => {
          if (rule.ruleType === 'ruleset' && rule.ruleSet) {
            delete rule.ruleSet.content
          }
        })
      }
    })
  }
  if (config.pacs) {
    Object.values(config.pacs).forEach((pac) => {
      if (pac.mode === 'remote') {
        delete pac.script
      }
    })
  }
}

/**
 * Hydrate remote resources into the config.
 */
export async function hydrateConfig(config) {
  const localConfig = await loadConfig().catch(() => null)
  const promises = []
  if (config.policies) {
    Object.values(config.policies).forEach((policy) => {
      // Find matching local policy to use as fallback
      const localPolicy = localConfig?.policies?.[policy.id]
      if (policy.rules && Array.isArray(policy.rules)) {
        policy.rules.forEach((rule) => {
          if (
            rule.ruleType === 'ruleset' &&
            rule.pattern &&
            rule.pattern.trim() &&
            (!rule.ruleSet || !rule.ruleSet.content)
          ) {
            const url = rule.pattern.trim()
            if (!rule.ruleSet) rule.ruleSet = {}
            promises.push(
              fetchRuleSetContent(url).then((result) => {
                if (!result.fetchError) {
                  rule.ruleSet.content = result.content
                  rule.ruleSet.fetchError = null
                  rule.ruleSet.lastUpdated = result.lastUpdated
                } else {
                  // Fallback to local cache if download fails
                  rule.ruleSet.fetchError = result.fetchError
                  // Try to find ANY matching ruleset cache locally by URL
                  let foundCache = null
                  if (localConfig?.policies) {
                    for (const p of Object.values(localConfig.policies)) {
                      const match = p.rules?.find(
                        (r) => r.ruleType === 'ruleset' && r.pattern === url && r.ruleSet?.content
                      )
                      if (match) {
                        foundCache = match.ruleSet
                        break
                      }
                    }
                  }
                  if (foundCache) {
                    rule.ruleSet.content = foundCache.content
                    rule.ruleSet.lastUpdated = foundCache.lastUpdated
                  }
                }
                rule.ruleSet.url = url
                rule.ruleSet.lastFetched = result.lastFetched
              })
            )
          }
        })
      }
    })
  }
  if (config.pacs) {
    Object.values(config.pacs).forEach((pac) => {
      if (pac.mode === 'remote' && pac.url && !pac.script) {
        promises.push(
          fetch(pac.url)
            .then((res) => res.text())
            .then((text) => {
              pac.script = text
            })
            .catch(() => {})
        )
      }
    })
  }
  if (promises.length > 0) await Promise.allSettled(promises)
}

/**
 * Trigger Auto Sync if enabled.
 */
export async function triggerAutoSync(config) {
  if (config.sync && config.sync.enabled) {
    // Load the latest local config to get updated version and timestamp
    const latestConfig = await loadConfig()
    try {
      await syncToCloud(latestConfig)
    } catch (e) {
      if (e.message === 'SYNC_CONFLICT') {
        console.warn(
          'Auto Sync aborted due to conflict. Disabling auto-sync to prevent data overwrite.'
        )
        config.sync.enabled = false
        // Save the disabled state immediately without triggering another sync
        await saveConfig(config, true, true)

        // Notify the user via Chrome Notifications
        try {
          chrome.notifications.create('oasis-sync-conflict', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/128.png'),
            title: chrome.i18n.getMessage('titleSyncConflict') || 'Sync Conflict Detected',
            message:
              chrome.i18n.getMessage('msgSyncConflictStatus') ||
              'Automatic sync was disabled to prevent overwriting cloud data. Please resolve the conflict in settings.'
          })
        } catch (notifErr) {
          console.error('Failed to show notification', notifErr)
        }
      } else {
        console.error('Auto sync failed:', e)
      }
    }
  }
}

/**
 * Sync Local Config to Cloud.
 */
export async function syncToCloud(config, force = false) {
  const payload = JSON.parse(JSON.stringify(config))
  const currentVersion = payload.version || 1

  if (payload.sync) delete payload.sync
  if (payload.activeProfileId) delete payload.activeProfileId

  optimizePayload(payload)

  const jsonString = JSON.stringify(payload)
  const CHUNK_SIZE = 7000
  const totalChunks = Math.ceil(jsonString.length / CHUNK_SIZE)

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
    const allKeys = await chrome.storage.sync.get(null)

    if (!force && allKeys.sync_meta) {
      const cloudVersion = allKeys.sync_meta.version || 0
      const localState = await chrome.storage.local.get('sync_state')
      let lastSyncedVersion = localState.sync_state?.lastSyncedVersion ?? -1

      // Migration edge case: local device has data, cloud has data, but local never recorded lastSyncedVersion.
      // If local version is at least the cloud version, assume local is the valid master and sync_state was simply introduced late.
      if (lastSyncedVersion === -1) {
        if (currentVersion >= cloudVersion || cloudVersion === 0) {
          lastSyncedVersion = cloudVersion
        } else {
          lastSyncedVersion = 0 // Fallback to 0 if cloud is strictly newer and local is unaware
        }
      }

      // If cloud version is greater than the version this device last synced/pulled, we have a conflict
      if (cloudVersion > lastSyncedVersion) {
        throw new Error('SYNC_CONFLICT')
      }
    }

    const keysToRemove = Object.keys(allKeys).filter(
      (k) => k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview'
    )
    if (keysToRemove.length > 0) await chrome.storage.sync.remove(keysToRemove)
    await chrome.storage.sync.set(storageData)

    // Update local last synced version
    await chrome.storage.local.set({ sync_state: { lastSyncedVersion: currentVersion } })
  } catch (e) {
    if (e.message !== 'SYNC_CONFLICT') {
      console.error('Failed to sync to cloud:', e)
    }
    throw e
  }
}

/**
 * Sync Cloud Config to Local.
 */
export async function syncFromCloud(force = false) {
  try {
    const local = await loadConfig()
    if (!force && (!local.sync || !local.sync.enabled)) return false

    const keys = await chrome.storage.sync.get(null)
    let cloudConfig = null
    let uniqueVersion = 0

    if (keys.sync_meta) {
      const count = keys.sync_meta.count
      uniqueVersion = keys.sync_meta.version
      let combinedJson = ''
      for (let i = 0; i < count; i++) {
        if (keys[`sync_chunk_${i}`]) combinedJson += keys[`sync_chunk_${i}`]
        else return false
      }
      try {
        cloudConfig = JSON.parse(combinedJson)
      } catch (e) {
        return false
      }
    } else if (keys.config) {
      cloudConfig = keys.config
      uniqueVersion = cloudConfig.version || 0
    }

    if (!cloudConfig) return false

    const localVer = local.version || 1
    if (force || uniqueVersion > localVer) {
      const syncEnabled = local.sync.enabled
      const newConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
      Object.assign(newConfig, cloudConfig)
      if (!newConfig.sync) newConfig.sync = {}
      newConfig.sync.enabled = syncEnabled

      await hydrateConfig(newConfig)
      await saveConfig(newConfig, true)

      // Update local last synced version to match the newly pulled cloud version
      await chrome.storage.local.set({ sync_state: { lastSyncedVersion: uniqueVersion } })

      return true
    }
    return false
  } catch (e) {
    console.error('Failed to sync from cloud:', e)
    return false
  }
}

/**
 * Clear Cloud Configuration.
 */
export async function clearCloudConfig() {
  try {
    const allKeys = await chrome.storage.sync.get(null)
    const keysToRemove = Object.keys(allKeys).filter(
      (k) =>
        k === 'sync_meta' || k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview'
    )
    if (keysToRemove.length > 0) await chrome.storage.sync.remove(keysToRemove)
  } catch (e) {
    console.error('Failed to clear cloud config:', e)
    throw e
  }
}
