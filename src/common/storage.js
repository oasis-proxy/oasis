/* global chrome */
import { DEFAULT_CONFIG } from './config'

/**
 * Load configuration from storage.
 * @returns {Promise<typeof DEFAULT_CONFIG>}
 */
export async function loadConfig() {
  // Load persistent config
  const localResult = await chrome.storage.local.get('proxyConfig')
  let config = DEFAULT_CONFIG
  
  if (localResult.proxyConfig) {
    config = { ...DEFAULT_CONFIG, ...localResult.proxyConfig }
  }

  // Load session rules if available
  try {
    const sessionResult = await chrome.storage.session.get('tempRules')
    if (sessionResult.tempRules) {
        // Ensure auto exists and merge tempRules
        config.auto = {
            ...config.auto,
            tempRules: sessionResult.tempRules
        }
    }
  } catch (e) {
      // Session storage might not be available or fail
      console.warn('Failed to load session rules', e)
  }

  return config
}

/**
 * Save configuration to storage.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function saveConfig(config) {
  // We don't save tempRules to local storage, strip them out?
  // Ideally we keep the object clean, but if config includes tempRules 
  // we should be careful not to persist them if we just dump the whole object.
  // For now, we assume the caller handles this or we save the whole object 
  // but note that 'tempRules' in local storage will be ignored/overwritten by session on load ideally.
  // A cleaner approach is to separate them.
  
  // Clone to avoid mutating
  const configToSave = JSON.parse(JSON.stringify(config))
  // Clear tempRules before saving to local
  if (configToSave.auto && configToSave.auto.tempRules) {
      configToSave.auto.tempRules = []
  }

  await chrome.storage.local.set({ proxyConfig: configToSave })
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
 * Export the current configuration as a JSON object.
 * @returns {Promise<object>} The configuration object.
 */
export async function exportConfig() {
    const result = await chrome.storage.local.get('proxyConfig')
    // Return existing config or default if null
    // We export exactly what is in storage (persistent config)
    return result.proxyConfig || DEFAULT_CONFIG
}

/**
 * Import configuration.
 * @param {object} configData - The configuration object to import.
 */
export async function importConfig(configData) {
    if (!configData || typeof configData !== 'object') {
        throw new Error('Invalid configuration data')
    }
    // Basic structural validation could go here
    // For now we assume if it's an object, it's valid enough to save
    // Ideally we should valid against DEFAULT_CONFIG schema

    await chrome.storage.local.set({ proxyConfig: configData })
}

/**
 * Clear all configuration and reset to defaults.
 */
export async function clearConfig() {
    await chrome.storage.local.remove('proxyConfig')
    await clearSessionRules()
}

