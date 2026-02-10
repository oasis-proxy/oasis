import { parseAutoProxyRules, convertAutoProxyToInternalRules } from './autoproxy.js'

// generatePacScript and generateProxyStrings have been removed as they relied on outdated config structure.
// Use generatePacScriptFromPolicy for individual policies.

/**
 * Generates PAC script from a single policy object (new structure)
 * @param {Object} policy - Policy object with rules and rejectRules
 * @param {Object} proxies - Proxies configuration object
 * @returns {string} The generated PAC script
 */
export function generatePacScriptFromPolicy(policy, proxies, rejectConfig = null, tempRules = [], rulePriority = ['reject', 'temp', 'normal'], proxyGroups = {}) {
  const policyName = policy.name || 'Auto Policy'
  const rules = policy.rules || []
  const rejectRules = policy.rejectRules || []
  

  // Helper to convert proxy ID to PAC string (handling Groups/Failover)
  // Added `protocol` argument: 'http' | 'https' | 'ftp' | null (default)
  const generateProxyChain = (targetId, protocol = null) => {
    // 1. Handle Singletons
    if (targetId === 'direct') return 'DIRECT'
    if (targetId === 'reject') {
        if (rejectConfig && rejectConfig.host && rejectConfig.port) {
            return `HTTPS ${rejectConfig.host}:${rejectConfig.port}`
        }
        return 'HTTPS 127.0.0.1:443' 
    }

    // 2. Handle Groups (Failover Chain)
    if (proxyGroups && proxyGroups[targetId]) {
        const group = proxyGroups[targetId]
        const chain = []
        
        // Add all proxies in order
        if (group.proxies && Array.isArray(group.proxies)) {
            group.proxies.forEach(pid => {
                const pString = getSingleProxyString(pid, protocol)
                if (pString !== 'DIRECT') {
                    chain.push(pString)
                }
            })
        }
        
        // Add Fallback
        if (group.fallbackEnabled !== false) {
            const fallbackType = group.fallback ? group.fallback.type : 'direct'
            
            if (fallbackType === 'reject') {
                 if (rejectConfig && rejectConfig.host && rejectConfig.port) {
                    chain.push(`HTTPS ${rejectConfig.host}:${rejectConfig.port}`)
                } else {
                    chain.push('HTTPS 127.0.0.1:443')
                }
            } else if (fallbackType === 'wait') {
                 // 'wait' logic
            } else {
                 // 'direct' or unknown
                 chain.push('DIRECT')
            }
        }
        
        return chain.join('; ')
    }
    
    // 3. Handle Single Proxy
    return getSingleProxyString(targetId, protocol)
  }

  // Helper for single proxy object w/ Protocol Override support
  const getSingleProxyString = (proxyId, protocol = null) => {
    const proxy = proxies[proxyId]
    if (!proxy) return 'DIRECT'
    
    // Check for overrides first
    if (protocol && proxy.overrides && proxy.overrides[protocol] && proxy.overrides[protocol].scheme !== 'default') {
        const override = proxy.overrides[protocol]
        return formatProxyString(override.scheme, override.host, override.port)
    }

    // Fallback to default
    return formatProxyString(proxy.scheme, proxy.host, proxy.port)
  }

  const formatProxyString = (scheme, host, port) => {
      const s = (scheme || 'http').toLowerCase()
      let typeStr = 'PROXY'
      if (s === 'socks' || s === 'socks4') typeStr = 'SOCKS'
      else if (s === 'socks5') typeStr = 'SOCKS5'
      else if (s === 'https') typeStr = 'HTTPS'
      else typeStr = 'HTTP'
      return `${typeStr} ${host}:${port}`
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
        const isUrlRegex = pattern.startsWith('^http')
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
        return null
      default:
        return null
    }
  }

  // --- Wrapper for generating return statements (Overide Logic) ---
  const generateProtocolBasedReturn = (proxyId, indent = '  ') => {
      // 1. Check if we need complex logic
      // We need complex logic if:
      // - The proxyId refers to a Single Proxy that has overrides.
      // - The proxyId refers to a Group where member proxies might have overrides.
      // - To be safe and correct, we should check availability.
      
      // Optimization: If it's 'direct' or 'reject', simple return.
      if (proxyId === 'direct' || proxyId === 'reject') {
           return `${indent}return "${generateProxyChain(proxyId)}";\n`
      }

      // Check if there are ANY overrides in the chain? 
      // This is expensive to check recursively for groups.
      // Strategy: 
      // Always generate conditional logic? No, bloats PAC.
      // Check if top-level proxy has overrides?
      
      let useOverrides = false
      if (proxyGroups && proxyGroups[proxyId]) {
          // Group: Check if any member has overrides
          const group = proxyGroups[proxyId]
          if (group.proxies) {
               useOverrides = group.proxies.some(pid => {
                   const p = proxies[pid]
                   return p && p.overrides && Object.values(p.overrides).some(o => o.scheme !== 'default')
               })
          }
      } else {
          // Single Proxy
          const p = proxies[proxyId]
          if (p && p.overrides && Object.values(p.overrides).some(o => o.scheme !== 'default')) {
              useOverrides = true
          }
      }

      if (!useOverrides) {
           return `${indent}return "${generateProxyChain(proxyId)}";\n`
      }

      // Generate Protocol-Specific Blocks
      // Note: We use `url.substring(0, 5)` styled checks for performance in PAC
      let block = ''
      
      // HTTP
      const httpChain = generateProxyChain(proxyId, 'http')
      block += `${indent}if (url.substring(0, 5) === 'http:') return "${httpChain}";\n`
      
      // HTTPS
      const httpsChain = generateProxyChain(proxyId, 'https')
      block += `${indent}if (url.substring(0, 6) === 'https:') return "${httpsChain}";\n`
      
      // FTP
      const ftpChain = generateProxyChain(proxyId, 'ftp')
      block += `${indent}if (url.substring(0, 4) === 'ftp:') return "${ftpChain}";\n`
      
      // Default / Fallback
      const defaultChain = generateProxyChain(proxyId, null)
      block += `${indent}return "${defaultChain}";\n`
      
      return block
  }

  // --- Rule category generators ---
  const generateRejectBlock = () => {
    if (rejectRules.length === 0) return ''
    let block = `  // Reject Rules\n`
    const rejectStr = generateProxyChain('reject')
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
      if (condition) {
         block += `  if (${condition}) {\n`
         block += generateProtocolBasedReturn(rule.proxyId, '    ')
         block += `  }\n`
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
      
      // Handle RuleSet
      if (rule.ruleType === 'ruleset') {
        const ruleSetContent = rule.ruleSet?.content || ''
        if (ruleSetContent) {
          try {
            const parsedRules = parseAutoProxyRules(ruleSetContent)
            const internalRules = convertAutoProxyToInternalRules(parsedRules)
            
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
                 block += `  if (${condition}) {\n`
                 block += generateProtocolBasedReturn(rule.proxyId, '    ')
                 block += `  }\n`
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
      if (condition) {
         block += `  if (${condition}) {\n`
         block += generateProtocolBasedReturn(rule.proxyId, '    ')
         block += `  }\n`
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
  
  // Generate rule blocks
  for (const category of rulePriority) {
    const generator = categoryGenerators[category]
    if (generator) {
      pacContent += generator()
    }
  }
  
  // Default (Also needs Protocol Overrides!)
  const defaultActionId = policy.defaultProfileId || 'direct'
  pacContent += `  // Default Strategy\n`
  
  // We can't just return a string here if overrides are involved, we need the logic.
  // But generateProtocolBasedReturn adds indentation and newlines we might not want at the very end 
  // without a condition or wrapper.
  // Actually, we can just call it with 2-space indent
  pacContent += generateProtocolBasedReturn(defaultActionId, '  ')
  
  pacContent += `}\n`
  
  return pacContent
}

/**
 * Generates PAC script for a Proxy Group (Failover Chain Config).
 * @param {Object} group - Proxy Group object
 * @param {Object} proxies - Proxies configuration object
 * @param {Object} rejectConfig
 * @returns {string} The generated PAC script
 */
export function generatePacScriptForGroup(group, proxies, rejectConfig = null) {
     const formatProxyString = (scheme, host, port) => {
        const s = (scheme || 'http').toLowerCase()
        let typeStr = 'PROXY'
        if (s === 'socks' || s === 'socks4') typeStr = 'SOCKS'
        else if (s === 'socks5') typeStr = 'SOCKS5'
        else if (s === 'https') typeStr = 'HTTPS'
        else typeStr = 'HTTP'
        return `${typeStr} ${host}:${port}`
     }

     const getSingleProxyString = (proxyId, protocol = null) => {
        const proxy = proxies[proxyId]
        if (!proxy) return 'DIRECT'
        
        // Check for overrides
        if (protocol && proxy.overrides && proxy.overrides[protocol] && proxy.overrides[protocol].scheme !== 'default') {
            const override = proxy.overrides[protocol]
            return formatProxyString(override.scheme, override.host, override.port)
        }

        return formatProxyString(proxy.scheme, proxy.host, proxy.port)
     }

    const generateChain = (protocol) => {
        const chain = []
        if (group.proxies && Array.isArray(group.proxies)) {
            group.proxies.forEach(pid => {
                const pString = getSingleProxyString(pid, protocol)
                if (pString !== 'DIRECT') chain.push(pString)
            })
        }
        
        if (group.fallbackEnabled !== false) {
            const fallbackType = group.fallback ? group.fallback.type : 'direct'
            if (fallbackType === 'reject') {
                if (rejectConfig && rejectConfig.host && rejectConfig.port) {
                    chain.push(`HTTPS ${rejectConfig.host}:${rejectConfig.port}`)
                } else {
                    chain.push('HTTPS 127.0.0.1:443')
                }
            } else if (fallbackType !== 'wait') {
                 chain.push('DIRECT')
            }
        }
        return chain.join('; ')
    }

    // Check if any member has overrides
    const hasOverrides = group.proxies && group.proxies.some(pid => {
         const p = proxies[pid]
         return p && p.overrides && Object.values(p.overrides).some(o => o.scheme !== 'default')
    })
    
    let scriptBody = ''
    
    if (hasOverrides) {
        scriptBody += ` if (url.substring(0, 5) === 'http:') return "${generateChain('http')}";\n`
        scriptBody += ` if (url.substring(0, 6) === 'https:') return "${generateChain('https')}";\n`
        scriptBody += ` if (url.substring(0, 4) === 'ftp:') return "${generateChain('ftp')}";\n`
    }
    
    scriptBody += ` return "${generateChain(null)}";`
    
    return `function FindProxyForURL(url, host) { ${scriptBody} }`
}
