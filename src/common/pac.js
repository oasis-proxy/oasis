import { RuleType, ProxyProtocol } from './config.js'
import { parseAutoProxyRules, convertAutoProxyToInternalRules } from './autoproxy.js'

/**
 * Generates a valid PAC script string from the provided configuration.
 * @param {import('./config').DEFAULT_CONFIG} config 
 * @returns {string} The generated PAC script
 */
export function generatePacScript(config) {
  const proxyStrings = generateProxyStrings(config.proxies)
  const defaultProfileId = config.auto.defaultProfileId
  
  // Helper functions to be embedded in the PAC script
  const helpers = `
    var w = "0123456789abcdef";
    function _cidr(ip, range) {
      // Basic CIDR implementation placeholder if needed
      // isInNet is available in PAC, often sufficient
      return isInNet(ip, range.split('/')[0], _mask(range.split('/')[1]));
    }
    function _mask(n) {
      if (n == 0) return "0.0.0.0";
      var x = 0xffffffff << (32 - n);
      return [(x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff].join(".");
    }
    function _wildcard(pattern, str) {
      return shExpMatch(str, pattern);
    }
    function _regex(pattern, str) {
      return new RegExp(pattern).test(str);
    }
  `

  // Compile Rules Function
  const compileRules = (rules, defaultProxyIdForSet) => {
      return rules.map(rule => {
          const proxyString = proxyStrings[rule.profileId || defaultProxyIdForSet] || 'DIRECT'
          
          switch (rule.type) {
            case RuleType.DOMAIN_SUFFIX:
              return `if (dnsDomainIs(host, "${rule.pattern}") || host === "${rule.pattern}") return "${proxyString}";`
              
            case RuleType.DOMAIN_KEYWORD:
              return `if (host.indexOf("${rule.pattern}") !== -1) return "${proxyString}";`
              
            case RuleType.IP_CIDR:
              return `if (_cidr(host, "${rule.pattern}")) return "${proxyString}";`
              
            case RuleType.WILDCARD:
              return `if (_wildcard("${rule.pattern}", host)) return "${proxyString}";`
              
            case RuleType.REGEX: {
              const escapedPattern = rule.pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
              return `if (_regex("${escapedPattern}", url)) return "${proxyString}";`
            }
              
            default:
              return ''
          }
      }).join('\n    ')
  }

  // Priority 0: Temporary Session Rules
  const tempChecks = compileRules(config.auto.tempRules || [])

  // Priority 1: Custom Reject Rules
  const customRejectChecks = compileRules(config.auto.rejectRules || [])

  // Priority 2: Subscribed Reject Sets
  const subscribedRejectChecks = (config.auto.rejectRuleSets || [])
      .filter(set => set.enabled && set.rules && set.rules.length > 0)
      .map(set => compileRules(set.rules, set.profileId || 'reject'))
      .join('\n    ')

  // Priority 3: Custom Proxy Rules
  const customProxyChecks = compileRules(config.auto.proxyRules || [])

  // Priority 4: Subscribed Proxy Sets
  const subscribedProxyChecks = (config.auto.proxyRuleSets || [])
      .filter(set => set.enabled && set.rules && set.rules.length > 0)
      .map(set => compileRules(set.rules, set.profileId || 'default'))
      .join('\n    ')

  const defaultProxy = proxyStrings[defaultProfileId] || 'DIRECT'

  return `
function FindProxyForURL(url, host) {
${helpers}

    // 0. Temporary Rules
    ${tempChecks}

    // 1. Custom Reject Rules
    ${customRejectChecks}

    // 2. Subscribed Reject Rules
    ${subscribedRejectChecks}

    // 3. Custom Proxy Rules
    ${customProxyChecks}

    // 4. Subscribed Proxy Rules
    ${subscribedProxyChecks}

    // Default
    return "${defaultProxy}";
}
`
}

/**
 * Converts internal proxy map to PAC return strings
 */
function generateProxyStrings(proxies) {
  const map = {}
  
  for (const [id, proxy] of Object.entries(proxies)) {
    if (proxy.type === 'direct' || proxy.type === 'system') {
      map[id] = 'DIRECT'
      // Note: 'System' logic in PAC usually just means trying DIRECT or returning specific string if supported
    } else if (proxy.type === 'reject') {
        // Use configured host/port or fallback to default blackhole
        const rHost = proxy.host || '127.0.0.1'
        const rPort = proxy.port || 65535
        map[id] = `PROXY ${rHost}:${rPort}`
    } else if (proxy.type === 'server') {
        let typeStr = 'PROXY'
        if (proxy.scheme === ProxyProtocol.SOCKS4 || proxy.scheme === ProxyProtocol.SOCKS5) {
            typeStr = 'SOCKS'
            // Some browsers support SOCKS5 specifically e.g. "SOCKS5 127.0.0.1:1080"
            if (proxy.scheme === ProxyProtocol.SOCKS5) {
                typeStr = 'SOCKS5'
            }
        } else if (proxy.scheme === ProxyProtocol.HTTPS) {
            typeStr = 'HTTPS'
        }
        
        map[id] = `${typeStr} ${proxy.host}:${proxy.port}`
    }
  }
  
  return map
}

/**
 * Generates PAC script from a single policy object (new structure)
 * @param {Object} policy - Policy object with rules and rejectRules
 * @param {Object} proxies - Proxies configuration object
 * @returns {string} The generated PAC script
 */
export function generatePacScriptFromPolicy(policy, proxies) {
  const policyName = policy.name || 'Auto Policy'
  const rules = policy.rules || []
  const rejectRules = policy.rejectRules || []
  
  // Helper to convert proxy ID to PAC string
  const getProxyString = (proxyId) => {
    if (proxyId === 'direct') return 'DIRECT'
    if (proxyId === 'reject') return 'PROXY 127.0.0.1:1'
    
    const proxy = proxies[proxyId]
    if (!proxy) return 'DIRECT'
    
    // Use protocol if available, otherwise default to 'http'
    const protocol = (proxy.protocol || 'http').toUpperCase()
    return `${protocol} ${proxy.host}:${proxy.port}`
  }
  
  // Helper to convert CIDR to netmask
  const cidrToNetmask = (cidr) => {
    const mask = parseInt(cidr)
    const octets = []
    for (let i = 0; i < 4; i++) {
      const bits = Math.max(0, Math.min(8, mask - i * 8))
      octets.push(256 - Math.pow(2, 8 - bits))
    }
    return octets.join('.')
  }
  
  // Generate condition from rule
  const generateRuleCondition = (rule) => {
    switch (rule.ruleType) {
      case 'wildcard':
        return `shExpMatch(host, "${rule.pattern}")`
      case 'regex': {
        const escapedPattern = rule.pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        return `/${escapedPattern}/.test(host)`
      }
      case 'ip':
        if (rule.pattern.includes('/')) {
          const [ip, cidr] = rule.pattern.split('/')
          return `isInNet(host, "${ip}", "${cidrToNetmask(cidr)}")`
        }
        return `host === "${rule.pattern}"`
      case 'ruleset':
        // RuleSet not directly supported in PAC
        return null
      default:
        return null
    }
  }
  
  let pacContent = `// PAC Script generated from Oasis Policy: ${policyName}\n`
  pacContent += `// Generated on: ${new Date().toISOString()}\n\n`
  pacContent += `function FindProxyForURL(url, host) {\n`
  
  // Add reject rules first
  if (rejectRules.length > 0) {
    pacContent += `  // Reject Rules\n`
    rejectRules.forEach(rule => {
      if (rule.type === 'divider') return
      const condition = generateRuleCondition(rule)
      if (condition) {
        pacContent += `  if (${condition}) return "PROXY 127.0.0.1:1";\n`
      }
    })
    pacContent += `\n`
  }
  
  // Add normal rules
  if (rules.length > 0) {
    pacContent += `  // Normal Rules\n`
    rules.forEach(rule => {
      if (rule.type === 'divider') return
      
      // Handle RuleSet - expand into multiple rules
      if (rule.ruleType === 'ruleset') {
        const ruleSetContent = rule.ruleSet?.content || rule.ruleSetContent || ''
        if (ruleSetContent) {
          try {
            const parsedRules = parseAutoProxyRules(ruleSetContent)
            const internalRules = convertAutoProxyToInternalRules(parsedRules)
            const proxyStr = getProxyString(rule.proxyId)
            
            internalRules.forEach(expandedRule => {
              const condition = generateRuleCondition(expandedRule)
              if (condition) {
                pacContent += `  if (${condition}) return "${proxyStr}";\n`
              }
            })
          } catch (e) {
            console.error('Error parsing RuleSet:', e)
          }
        }
        return
      }
      
      // Handle regular rules
      const condition = generateRuleCondition(rule)
      const proxyStr = getProxyString(rule.proxyId)
      if (condition) {
        pacContent += `  if (${condition}) return "${proxyStr}";\n`
      }
    })
    pacContent += `\n`
  }
  
  pacContent += `  // Default: DIRECT\n`
  pacContent += `  return "DIRECT";\n`
  pacContent += `}\n`
  
  return pacContent
}
