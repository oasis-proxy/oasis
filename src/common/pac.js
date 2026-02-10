import { parseAutoProxyRules, convertAutoProxyToInternalRules } from './autoproxy.js'

// generatePacScript and generateProxyStrings have been removed as they relied on outdated config structure.
// Use generatePacScriptFromPolicy for individual policies.

/**
 * Generates PAC script from a single policy object (new structure)
 * @param {Object} policy - Policy object with rules and rejectRules
 * @param {Object} proxies - Proxies configuration object
 * @returns {string} The generated PAC script
 */
export function generatePacScriptFromPolicy(policy, proxies, rejectConfig = null, tempRules = [], rulePriority = ['reject', 'temp', 'normal']) {
  const policyName = policy.name || 'Auto Policy'
  const rules = policy.rules || []
  const rejectRules = policy.rejectRules || []
  
  // Helper to convert proxy ID to PAC string
  const getProxyString = (proxyId) => {
    if (proxyId === 'direct') return 'DIRECT'
    if (proxyId === 'reject') {
        if (rejectConfig && rejectConfig.host && rejectConfig.port) {
            // User requested explicit HTTPS return string for reject
            return `HTTPS ${rejectConfig.host}:${rejectConfig.port}`
        }
        // User requested override of classic PROXY 127.0.0.1:1
        return 'HTTPS 127.0.0.1:443' 
    }
    
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
    } else {
        typeStr = 'HTTP' // Default to HTTP for 'http' and other unknown schemes
    }
    
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
    if (!rule.pattern) return null
    switch (rule.ruleType) {
      case 'wildcard': {
        const pattern = rule.pattern
        if (pattern.startsWith('**.')) {
            const domain = pattern.substring(3)
            return `dnsDomainIs(host, ".${domain}") && host !== "${domain}"`
        } else if (pattern.startsWith('*.')) {
            const domain = pattern.substring(2)
            // Strict wildcard: matches .example.com subdomains AND example.com root
            return `(dnsDomainIs(host, ".${domain}") || host === "${domain}")`
        } else if (pattern.startsWith('.')) {
            const domain = pattern.substring(1)
            // Strict wildcard: matches .example.com subdomains AND example.com root
            return `(dnsDomainIs(host, ".${domain}") || host === "${domain}")`
        }
        return `shExpMatch(host, "${pattern}")`
      }
      case 'regex': {
        const pattern = rule.pattern
        
        // Smart detection for URL matching vs Host matching
        // If it starts with ^http, it is definitely a URL regex
        const isUrlRegex = pattern.startsWith('^http')
             
        // Safely escape forward slashes that are NOT already escaped
        // We use a safe replacement pattern compatible with older browsers (no lookbehind)
        const escapedPattern = pattern.replace(/(\\)?\//g, ($0, $1) => $1 ? $0 : '\\/')
        
        if (isUrlRegex) {
            return `/${escapedPattern}/.test(url)`
        }
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

  // --- Rule category generators ---
  const generateRejectBlock = () => {
    if (rejectRules.length === 0) return ''
    let block = `  // Reject Rules\n`
    const rejectStr = getProxyString('reject')
    rejectRules.forEach(rule => {
      if (rule.type === 'divider') return
      if (rule.valid === false) return
      const condition = generateRuleCondition(rule)
      if (condition) {
        block += `  if (${condition}) return "${rejectStr}";\n`
      }
    })
    block += `\n`
    return block
  }

  const generateTempBlock = () => {
    if (!tempRules || tempRules.length === 0) return ''
    let block = `  // Temporary Rules\n`
    tempRules.forEach(rule => {
      if (rule.valid === false) return
      const condition = generateRuleCondition(rule)
      const proxyStr = getProxyString(rule.proxyId)
      if (condition) {
        block += `  if (${condition}) return "${proxyStr}";\n`
      }
    })
    block += `\n`
    return block
  }

  const generateNormalBlock = () => {
    if (rules.length === 0) return ''
    let block = `  // Normal Rules\n`
    rules.forEach(rule => {
      if (rule.type === 'divider') return
      if (rule.valid === false) return
      
      // Handle RuleSet - expand into multiple rules
      if (rule.ruleType === 'ruleset') {
        const ruleSetContent = rule.ruleSet?.content || ''
        if (ruleSetContent) {
          try {
            const parsedRules = parseAutoProxyRules(ruleSetContent)
            const internalRules = convertAutoProxyToInternalRules(parsedRules)
            const proxyStr = getProxyString(rule.proxyId)
            
            // Prioritize whitelist rules (DIRECT)
            internalRules.filter(r => r.isWhitelist).forEach(expandedRule => {
                 const condition = generateRuleCondition(expandedRule)
                 if (condition) {
                   block += `  if (${condition}) return "DIRECT";\n`
                 }
            })

            // Then standard rules
            internalRules.filter(r => !r.isWhitelist).forEach(expandedRule => {
              const condition = generateRuleCondition(expandedRule)
              if (condition) {
                block += `  if (${condition}) return "${proxyStr}";\n`
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
        block += `  if (${condition}) return "${proxyStr}";\n`
      }
    })
    block += `\n`
    return block
  }

  // --- Category map ---
  const categoryGenerators = {
    reject: generateRejectBlock,
    temp: generateTempBlock,
    normal: generateNormalBlock
  }
  
  let pacContent = `// PAC Script generated from Oasis Policy: ${policyName}\n`
  pacContent += `// Generated on: ${new Date().toISOString()}\n\n`
  pacContent += `function FindProxyForURL(url, host) {\n`
  
  // Generate rule blocks in configured priority order
  for (const category of rulePriority) {
    const generator = categoryGenerators[category]
    if (generator) {
      pacContent += generator()
    }
  }
  
  // Default
  const defaultAction = getProxyString(policy.defaultProfileId || 'direct')
  pacContent += `  // Default: ${defaultAction}\n`
  pacContent += `  return "${defaultAction}";\n`
  pacContent += `}\n`
  
  return pacContent
}
