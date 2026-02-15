import { DEFAULT_CONFIG } from '../config'
import { fetchRuleSetContent } from '../ruleset'
import { loadConfig, saveConfig } from './core'

/**
 * Optimize config payload by stripping cached content.
 */
export function optimizePayload(config) {
    if (config.policies) {
        Object.values(config.policies).forEach(policy => {
            if (policy.rules && Array.isArray(policy.rules)) {
                policy.rules.forEach(rule => {
                    if (rule.ruleType === 'ruleset' && rule.ruleSet) {
                         delete rule.ruleSet.content
                    }
                })
            }
        })
    }
    if (config.pacs) {
        Object.values(config.pacs).forEach(pac => {
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
    const promises = []
    if (config.policies) {
        Object.values(config.policies).forEach(policy => {
            if (policy.rules && Array.isArray(policy.rules)) {
                 policy.rules.forEach(rule => {
                    if (rule.ruleType === 'ruleset' && rule.ruleSet && rule.ruleSet.url && !rule.ruleSet.content) {
                        promises.push(
                            fetchRuleSetContent(rule.ruleSet.url)
                                .then(result => {
                                    if (!result.fetchError) rule.ruleSet.content = result.content
                                })
                        )
                    }
                })
            }
        })
    }
    if (config.pacs) {
        Object.values(config.pacs).forEach(pac => {
             if (pac.mode === 'remote' && pac.url && !pac.script) {
                 promises.push(
                    fetch(pac.url)
                        .then(res => res.text())
                        .then(text => { pac.script = text })
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
        await syncToCloud(config)
    }
}

/**
 * Sync Local Config to Cloud.
 */
export async function syncToCloud(config) {
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
        const keysToRemove = Object.keys(allKeys).filter(k => k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview')
        if (keysToRemove.length > 0) await chrome.storage.sync.remove(keysToRemove)
        await chrome.storage.sync.set(storageData)
    } catch (e) {
        console.error('Failed to sync to cloud:', e)
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
            try { cloudConfig = JSON.parse(combinedJson) } catch (e) { return false }
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
        const keysToRemove = Object.keys(allKeys).filter(k => 
            k === 'sync_meta' || k.startsWith('sync_chunk_') || k === 'config' || k === 'sync_preview'
        )
        if (keysToRemove.length > 0) await chrome.storage.sync.remove(keysToRemove)
    } catch (e) {
        console.error('Failed to clear cloud config:', e)
        throw e
    }
}
