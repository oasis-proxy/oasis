import { DEFAULT_CONFIG } from '../common/config'
import { loadConfig, saveConfig } from '../common/storage'
import { createProxyConfig, collectProxyCredentials } from '../common/proxy_config'

// Domain-specific modules
import { updateMonitoringState } from './monitoring'
import { initRequestMonitor } from './requestMonitor'
import { updateContextMenus } from './contextMenu'
import { setupUpdateAlarm, checkUpdates } from './updater'

// Store proxy authentication credentials
// Map structure: "host:port" -> { username, password }
let proxyAuthMap = {}

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  const config = await loadConfig()

  const stored = await chrome.storage.local.get('config')
  if (!stored.config) {
    await saveConfig(DEFAULT_CONFIG)
    console.log('Oasis: Initialized default configuration.')
  }

  // Apply settings immediately
  await applyProxySettings(config)
  await updateContextMenus(config)
  await updateMonitoringState()

  // Determine language for changelog redirect
  let lang = config?.ui?.language || 'auto'
  if (lang === 'auto') {
    lang = chrome.i18n.getUILanguage()
  }

  // Open changelog on install or update
  const CHANGELOG_URL_EN = 'https://github.com/oasis-proxy/oasis/wiki/Changelog'
  const CHANGELOG_URL_ZH = 'https://github.com/oasis-proxy/oasis/wiki/ZH-Changelog'

  const targetUrl = lang.startsWith('zh') ? CHANGELOG_URL_ZH : CHANGELOG_URL_EN

  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.create({ url: targetUrl })
  }
})

// Listen for startup
chrome.runtime.onStartup.addListener(async () => {
  const config = await loadConfig()
  await applyProxySettings(config)
  await updateContextMenus(config)
  await updateContextMenus(config)
  await updateMonitoringState()

  // Ensure update alarm is scheduled
  if (config.update && config.update.interval !== undefined) {
    setupUpdateAlarm(config.update.interval)
  }
})

// Listen for configuration changes
chrome.storage.onChanged.addListener(async (changes, area) => {
  const meaningfulKeys = ['config', 'proxies', 'pacs', 'policies', 'system', 'direct', 'reject']
  const hasChange = meaningfulKeys.some((key) => changes[key])

  if (area === 'local' && hasChange) {
    console.log('Oasis: Config changed, re-applying settings...')
    const config = await loadConfig()

    // 0. Update Alarms only if interval changed
    if (changes.config && changes.config.newValue && changes.config.oldValue) {
      const newInterval = changes.config.newValue.update?.interval
      const oldInterval = changes.config.oldValue.update?.interval
      if (newInterval !== oldInterval && newInterval !== undefined) {
        setupUpdateAlarm(newInterval)
      }
    } else if (changes.config && changes.config.newValue && !changes.config.oldValue) {
      // First time config load or something weird, safe to set up
      const newInterval = changes.config.newValue.update?.interval
      if (newInterval !== undefined) setupUpdateAlarm(newInterval)
    }

    // 1. Re-apply Proxy Settings
    await applyProxySettings(config)

    // 2. Clear temporary rules on profile switch
    if (changes.config && changes.config.newValue && changes.config.oldValue) {
      if (changes.config.newValue.activeProfileId !== changes.config.oldValue.activeProfileId) {
        await chrome.storage.session.remove('tempRules')
        console.log('Oasis: Active profile changed, cleared temporary rules.')
      }
    }

    // 3. Update Monitoring State
    await updateMonitoringState()

    // 4. Update Context Menus
    await updateContextMenus(config)
  }

  if (area === 'session' && changes.tempRules) {
    console.log('Oasis: Temp rules changed, re-applying settings...')
    const config = await loadConfig()
    await applyProxySettings(config)
  }
})

/**
 * Apply proxy settings based on configuration.
 */
async function applyProxySettings(config) {
  const activeId = config.activeProfileId
  let profile = null

  // 1. Check Singletons
  if (activeId === 'system') profile = config.system
  else if (activeId === 'direct') profile = config.direct
  else if (activeId === 'reject') profile = config.reject

  // 2. Check Maps (Proxies, PACs, Policies)
  if (!profile && config.proxies) {
    profile = config.proxies[activeId]
  }
  if (!profile && config.pacs) {
    profile = config.pacs[activeId]
  }
  if (!profile && config.policies) {
    profile = config.policies[activeId]
  }

  if (!profile) {
    console.warn(`Oasis: Active profile '${activeId}' not found. Falling back to system.`)
    await chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' })
    return
  }

  // Checking if it's an Auto Policy
  if (profile.rules || profile.defaultProfileId) {
    try {
      const sessionData = await chrome.storage.session.get('tempRules')
      if (sessionData && sessionData.tempRules) {
        profile.tempRules = sessionData.tempRules
        console.log(`Oasis: Injected ${profile.tempRules.length} temporary rules into policy.`)
      }
    } catch (e) {
      console.warn('Oasis: Failed to load temporary rules:', e)
    }
  }

  const proxyConfig = createProxyConfig(profile, config)
  console.log(`Oasis: Applying profile '${activeId}'`)

  try {
    if (!proxyConfig) {
      console.warn('Oasis: Generated proxy config is invalid. Falling back to system.')
      await chrome.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' })
      return
    }

    // Store authentication credentials
    proxyAuthMap = collectProxyCredentials(profile, config)

    const credCount = Object.keys(proxyAuthMap).length
    if (credCount > 0) {
      console.log(`Oasis: Configured authentication for ${credCount} proxy server(s)`)
    }

    // Apply to Chrome
    await chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' })
    console.log('Oasis: Proxy settings applied successfully.', proxyConfig)

    // Update Extension Badge
    const name = profile.name || profile.label || profile.id
    const shortName = name.length > 3 ? name.substring(0, 3) + '..' : name
    const color = profile.color || '#4b5563'

    await chrome.action.setBadgeText({ text: shortName })
    await chrome.action.setBadgeBackgroundColor({ color: color })
  } catch (err) {
    console.error('Oasis: Failed to apply proxy settings:', err)
  }
}

// Proxy authentication handler
chrome.webRequest.onAuthRequired.addListener(
  (details) => {
    if (!details.isProxy) return {}

    const challenger = details.challenger
    if (challenger && challenger.host && challenger.port) {
      const key = `${challenger.host}:${challenger.port}`
      const credentials = proxyAuthMap[key]

      if (credentials) {
        console.log(`Oasis: Providing auth for proxy ${key}`)
        return { authCredentials: credentials }
      }
    }
    return {}
  },
  { urls: ['<all_urls>'] },
  ['blocking']
)

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_URL') {
    fetch(request.url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.text()
      })
      .then((text) => sendResponse({ success: true, text }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }
  if (request.type === 'FETCH_RULESET') {
    fetch(request.url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.text()
      })
      .then((content) => sendResponse({ success: true, content }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }
  if (request.type === 'TRIGGER_UPDATE') {
    checkUpdates()
      .then((changed) => {
        sendResponse({ success: true, changed })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
})

// Initialize Forward-only Request Monitor
initRequestMonitor()
