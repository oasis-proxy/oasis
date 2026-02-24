import { generatePacScriptFromPolicy, generatePacScriptForGroup } from './pac'

/**
 * Generate Chrome Proxy Config object for a given profile.
 * @param {object} profile - The profile object (proxy, pac, or policy).
 * @param {object} config - The full configuration object (needed for resolving references).
 * @returns {object|null} - The proxy config object compatible with chrome.proxy.settings, or null if invalid.
 */
export function createProxyConfig(profile, config) {
  if (!profile) return null

  const proxyConfig = {}

  // Improve type detection
  let profileType = profile.type || 'unknown'
  if (profileType === 'unknown') {
    if (profile.url !== undefined && !profile.rules) {
      profileType = 'pac'
    } else if (profile.rules || profile.defaultProfileId) {
      profileType = 'policy'
    }
  }

  if (profile.type === 'system' || profile.type === 'direct') {
    proxyConfig.mode = profile.type
  } else if (profile.type === 'reject') {
    // Reject Mode -> Point to localhost:65535 or similar
    proxyConfig.mode = 'fixed_servers'
    proxyConfig.rules = {
      singleProxy: {
        host: profile.host || '127.0.0.1',
        port: profile.port || 65535,
        scheme: 'http'
      }
    }
  } else if (profile.type === 'server') {
    // Fixed Proxy
    proxyConfig.mode = 'fixed_servers'
    proxyConfig.rules = {
      singleProxy: {
        host: profile.host,
        port: profile.port,
        scheme: profile.scheme || 'http'
      }
    }
  } else if (profile.url !== undefined && !profile.rules) {
    // PAC Script
    proxyConfig.mode = 'pac_script'

    // Use cached script content for both manual and remote modes
    // If remote PAC hasn't been fetched yet, script might be empty -> Fallback to DIRECT
    const scriptContent =
      profile.script || 'function FindProxyForURL(url, host) { return "DIRECT"; }'

    proxyConfig.pacScript = {
      data: scriptContent
    }
  } else if (profile.rules || profile.defaultProfileId) {
    // Auto Policy
    // Generate PAC script from rules
    const pacScriptData = generatePacScriptFromPolicy(
      profile,
      config.proxies || {},
      config.reject,
      profile.tempRules,
      config.rulePriority,
      config.proxyGroups || {}
    )
    proxyConfig.mode = 'pac_script'
    proxyConfig.pacScript = {
      data: pacScriptData
    }
  } else if (profile.type === 'group') {
    // Proxy Group (Failover)
    const pacScriptData = generatePacScriptForGroup(profile, config.proxies || {}, config.reject)
    proxyConfig.mode = 'pac_script'
    proxyConfig.pacScript = {
      data: pacScriptData
    }
  } else {
    // Fallback
    proxyConfig.mode = 'system'
  }

  return proxyConfig
}

/**
 * Collect authentication credentials for a profile and its dependencies.
 * @param {object} profile - The profile object.
 * @param {object} config - The full configuration object.
 * @returns {object} - Map of "host:port" -> { username, password }
 */
export function collectProxyCredentials(profile, config) {
  const proxyAuthMap = {}
  if (!profile) return proxyAuthMap

  // Improve type detection (same as above, maybe export helper?)
  let profileType = profile.type || 'unknown'
  if (profileType === 'unknown') {
    if (profile.url !== undefined && !profile.rules) {
      profileType = 'pac'
    } else if (profile.rules || profile.defaultProfileId) {
      profileType = 'policy'
    }
  }

  if (profile.type === 'server' && profile.auth && profile.auth.username) {
    // Single proxy server
    const key = `${profile.host}:${profile.port}`
    proxyAuthMap[key] = {
      username: profile.auth.username,
      password: profile.auth.password || ''
    }
  } else if (profileType === 'policy') {
    // Auto policy - collect credentials from all referenced proxies

    // Add default proxy credentials
    if (
      profile.defaultProfileId &&
      config &&
      config.proxies &&
      config.proxies[profile.defaultProfileId]
    ) {
      const defaultProxy = config.proxies[profile.defaultProfileId]
      if (defaultProxy && defaultProxy.auth && defaultProxy.auth.username) {
        const key = `${defaultProxy.host}:${defaultProxy.port}`
        proxyAuthMap[key] = {
          username: defaultProxy.auth.username,
          password: defaultProxy.auth.password || ''
        }
      }
    }

    // Add credentials from proxies referenced in rules
    if (profile.rules && Array.isArray(profile.rules)) {
      profile.rules.forEach((rule) => {
        if (rule && rule.proxyId && config && config.proxies && config.proxies[rule.proxyId]) {
          const proxy = config.proxies[rule.proxyId]
          if (proxy && proxy.auth && proxy.auth.username) {
            const key = `${proxy.host}:${proxy.port}`
            proxyAuthMap[key] = {
              username: proxy.auth.username,
              password: proxy.auth.password || ''
            }
          }
        }
      })
    }
  } else if (profileType === 'group') {
    // Proxy Group - collect all proxies in group
    if (profile.proxies && Array.isArray(profile.proxies)) {
      profile.proxies.forEach((pid) => {
        if (config && config.proxies && config.proxies[pid]) {
          const proxy = config.proxies[pid]
          if (proxy && proxy.auth && proxy.auth.username) {
            const key = `${proxy.host}:${proxy.port}`
            proxyAuthMap[key] = {
              username: proxy.auth.username,
              password: proxy.auth.password || ''
            }
          }
        }
      })
    }
  }

  return proxyAuthMap
}
