import { ref } from 'vue'
import { loadConfig } from '../common/storage'
import { parseAutoProxyRules, convertAutoProxyToInternalRules } from '../common/autoproxy'
import { normalizeIp } from '../common/validation'
import * as ipaddr from 'ipaddr.js'

export function useMonitorMatcher() {
  const currentPolicy = ref(null)
  const tempRules = ref([])
  const proxies = ref({})
  const proxyGroups = ref({})
  const ipTags = ref({})
  const expandedRules = ref([])

  async function loadMatcherConfig() {
    try {
      const config = await loadConfig()
      const activeId = config.activeProfileId

      if (config.policies?.[activeId]) {
        currentPolicy.value = config.policies[activeId]
        proxies.value = config.proxies || {}
        proxyGroups.value = config.proxyGroups || {}
        ipTags.value = config.ipTags || {}

        const sessionData = await chrome.storage.session.get('tempRules')
        tempRules.value = sessionData?.tempRules || []

        expandedRules.value = []
        if (currentPolicy.value.rules) {
          for (const rule of currentPolicy.value.rules) {
            if (rule.type === 'divider' || rule.valid === false) continue

            if (rule.ruleType === 'ruleset' && rule.ruleSet?.content) {
              try {
                const parsed = parseAutoProxyRules(rule.ruleSet.content)
                const internal = convertAutoProxyToInternalRules(parsed).map((r) => ({
                  ...r,
                  proxyId: rule.proxyId,
                  fromRuleset:
                    rule.ruleSet.sourceUrl || rule.ruleSet.name || rule.pattern || 'Ruleset'
                }))
                expandedRules.value.push(...internal)
              } catch (e) {
                console.error('Failed to parse ruleset:', e)
              }
            } else {
              expandedRules.value.push(rule)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load matcher config:', e)
    }
  }

  function testRuleMatch(rule, url, host) {
    if (!rule.pattern) return false

    switch (rule.ruleType) {
      case 'wildcard': {
        const pattern = rule.pattern
        if (pattern.startsWith('**.')) {
          const domain = pattern.substring(3)
          return host.endsWith('.' + domain) && host !== domain
        } else if (pattern.startsWith('*.') || pattern.startsWith('.')) {
          const domain = pattern.startsWith('*.') ? pattern.substring(2) : pattern.substring(1)
          return host.endsWith('.' + domain) || host === domain
        } else if (pattern.includes('*')) {
          const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
          return new RegExp(regexStr).test(host)
        }
        return host === pattern
      }
      case 'regex': {
        try {
          const isUrlRegex = rule.pattern.startsWith('^http') || rule.pattern.includes('/')
          const regex = new RegExp(rule.pattern)
          return isUrlRegex ? regex.test(url) : regex.test(host)
        } catch {
          return false
        }
      }
      case 'ip': {
        try {
          const hostIpStr = host.replace(/^\[|\]$/g, '')
          if (!ipaddr.isValid(hostIpStr)) {
            // Not an IP address (e.g. domain name). IP rules shouldn't match domains in the monitor.
            // Fallback: exact match if not CIDR
            if (!rule.pattern.includes('/')) {
              return host === rule.pattern
            }
            return false
          }

          const hostIp = ipaddr.parse(hostIpStr)

          if (rule.pattern.includes('/')) {
            const parsedCidr = ipaddr.parseCIDR(rule.pattern)
            return hostIp.match(parsedCidr)
          } else {
            return normalizeIp(hostIpStr) === normalizeIp(rule.pattern)
          }
        } catch (e) {
          // Fallback legacy behavior
          if (rule.pattern.includes('/')) {
            return host.startsWith(rule.pattern.split('/')[0])
          }
          return host === rule.pattern
        }
      }
      default:
        return false
    }
  }

  function getProxyName(proxyId) {
    if (!proxyId || proxyId === 'direct') return 'Direct'
    if (proxyId === 'reject') return 'Reject'

    // Check individual proxies
    if (proxies.value[proxyId]) {
      const proxy = proxies.value[proxyId]
      const name = proxy.label || proxy.name || proxy.host || proxyId
      return name.length > 20 ? name.substring(0, 20) + '...' : name
    }

    // Check proxy groups
    if (proxyGroups.value[proxyId]) {
      const group = proxyGroups.value[proxyId]
      const name = group.name || proxyId
      return name.length > 20 ? name.substring(0, 20) + '...' : name
    }

    return proxyId.length > 20 ? proxyId.substring(0, 20) + '...' : proxyId
  }

  function matchRule(url) {
    if (!currentPolicy.value) return { rule: null, proxy: null, ruleSource: null }

    try {
      const urlObj = new URL(url)
      const host = urlObj.hostname

      for (const rule of tempRules.value) {
        if (rule.valid === false) continue
        if (testRuleMatch(rule, url, host)) {
          return { rule: rule.pattern, proxy: getProxyName(rule.proxyId), ruleSource: null }
        }
      }

      for (const rule of currentPolicy.value.rejectRules || []) {
        if (rule.type === 'divider' || rule.valid === false) continue
        if (testRuleMatch(rule, url, host)) {
          return { rule: rule.pattern, proxy: 'Reject', ruleSource: null }
        }
      }

      for (const rule of expandedRules.value) {
        if (testRuleMatch(rule, url, host)) {
          return {
            rule: rule.pattern,
            proxy: getProxyName(rule.proxyId),
            ruleSource: rule.fromRuleset
          }
        }
      }

      return {
        rule: 'Default',
        proxy: getProxyName(currentPolicy.value.defaultProfileId),
        ruleSource: null
      }
    } catch (e) {
      return { rule: null, proxy: null, ruleSource: null }
    }
  }

  return {
    currentPolicy,
    proxies,
    ipTags,
    loadMatcherConfig,
    matchRule
  }
}
