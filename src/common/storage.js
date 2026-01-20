import { DEFAULT_CONFIG } from './config'

/**
 * Load configuration from storage.
 * @returns {Promise<typeof DEFAULT_CONFIG>}
 */
export async function loadConfig() {
  const result = await chrome.storage.local.get('proxyConfig')
  if (result.proxyConfig) {
    // Merge with default to ensure new fields exist if we update schema later
    return { ...DEFAULT_CONFIG, ...result.proxyConfig }
  }
  return DEFAULT_CONFIG
}

/**
 * Save configuration to storage.
 * @param {typeof DEFAULT_CONFIG} config 
 */
export async function saveConfig(config) {
  await chrome.storage.local.set({ proxyConfig: config })
}
