import { parseAutoProxyRules, convertAutoProxyToInternalRules } from './autoproxy.js'

// generatePacScript and generateProxyStrings have been removed as they relied on outdated config structure.
// Use generatePacScriptFromPolicy for individual policies.

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
    
    // Correctly map scheme to PAC return string
    const scheme = (proxy.scheme || 'http').toLowerCase()
    let typeStr = 'PROXY'
    
    if (scheme === 'socks' || scheme === 'socks4') {
        typeStr = 'SOCKS'
    } else if (scheme === 'socks5') {
        typeStr = 'SOCKS5'
    } else if (scheme === 'https') {
        typeStr = 'HTTPS'
    }
    // http defaults to PROXY
    
    return `${typeStr} ${proxy.host}:${proxy.port}`
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
        // Only escape forward slashes (regex delimiters)
        // Do NOT escape backslashes as they are part of the regex pattern (e.g. \. for literal dot)
        const escapedPattern = rule.pattern
            .replace(/\//g, '\\/')
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
