import { DEFAULT_CONFIG } from './config'
import {
  loadConfig,
  saveConfig as coreSaveConfig,
  saveGeneralSettings as coreSaveGeneralSettings,
  touchConfig
} from './storage/core'
import {
  triggerAutoSync,
  syncToCloud,
  syncFromCloud,
  clearCloudConfig,
  hydrateConfig,
  optimizePayload
} from './storage/sync'

// Re-export core functions
export { loadConfig, touchConfig }
// Re-export sync functions
export { syncToCloud, syncFromCloud, clearCloudConfig, hydrateConfig, optimizePayload }

/**
 * Save configuration to storage and trigger auto-sync.
 */
export async function saveConfig(config, skipSync = false, skipTouch = false) {
  await coreSaveConfig(config, skipSync, skipTouch)
  if (!skipSync) {
    await triggerAutoSync(config)
  }
}

/**
 * Save ONLY General Settings and Singletons.
 */
export async function saveGeneralSettings(config, skipSync = false, skipTouch = false) {
  await coreSaveGeneralSettings(config, skipSync, skipTouch)
  if (!skipSync) {
    await triggerAutoSync(config)
  }
}

/**
 * Save Proxies Map ONLY.
 */
export async function saveProxies(proxies, skipSync = false) {
  const fullConfig = await loadConfig()
  fullConfig.proxies = JSON.parse(JSON.stringify(proxies || {}))
  touchConfig(fullConfig)
  await saveConfig(fullConfig, skipSync)
}

/**
 * Save Policies Map ONLY.
 */
export async function savePolicies(policies, skipSync = false, skipTouch = false) {
  const fullConfig = await loadConfig()
  fullConfig.policies = JSON.parse(JSON.stringify(policies || {}))
  if (!skipTouch) touchConfig(fullConfig)
  await saveConfig(fullConfig, skipSync)
}

/**
 * Save PACs Map ONLY.
 */
export async function savePacs(pacs, skipSync = false) {
  const fullConfig = await loadConfig()
  fullConfig.pacs = JSON.parse(JSON.stringify(pacs || {}))
  touchConfig(fullConfig)
  await saveConfig(fullConfig, skipSync)
}

/**
 * Save Proxy Groups Map ONLY.
 */
export async function saveProxyGroups(proxyGroups, skipSync = false) {
  const fullConfig = await loadConfig()
  fullConfig.proxyGroups = JSON.parse(JSON.stringify(proxyGroups || {}))
  touchConfig(fullConfig)
  await saveConfig(fullConfig, skipSync)
}

/**
 * Add a temporary rule to session storage.
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
 * Clear all local configuration and reset to defaults.
 */
export async function clearConfig() {
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
  await chrome.storage.local.remove(keys)
  await clearSessionRules()
}

/**
 * Export configuration as JSON.
 */
export async function exportConfig() {
  const config = await loadConfig()
  optimizePayload(config)
  return JSON.stringify(config, null, 2)
}

/**
 * Import configuration from JSON string.
 */
export async function importConfig(jsonString) {
  try {
    const newConfig = JSON.parse(jsonString)
    if (!newConfig.version) newConfig.version = 1
    await hydrateConfig(newConfig)
    await saveConfig(newConfig)
    return true
  } catch (e) {
    console.error('Failed to import config:', e)
    return false
  }
}

/**
 * Clear Local Configuration and DISABLES Auto Sync.
 */
export async function clearLocalConfig() {
  await clearConfig()
  const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
  if (defaultConfig.sync) defaultConfig.sync.enabled = false
  await saveConfig(defaultConfig, true)
}
