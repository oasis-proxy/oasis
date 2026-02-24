import { ref, computed, watch } from 'vue'
import { t } from '../common/i18n'

export function useRuleMerge(props, emit) {
  const targetPolicyId = ref('')
  const conflictMode = ref('ignore')
  const mergedRules = ref([])

  const proxyList = computed(() => {
    const groups = []
    if (props.proxies) {
      const proxies = Object.values(props.proxies)
        .map((p) => ({ id: p.id, label: p.label || p.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
      if (proxies.length > 0) groups.push({ label: t('lblProxyHosts'), options: proxies })
    }
    if (props.proxyGroups) {
      const proxyGroups = Object.values(props.proxyGroups)
        .map((g) => ({ id: g.id, label: g.name }))
        .sort((a, b) => a.label.localeCompare(b.label))
      if (proxyGroups.length > 0) groups.push({ label: t('lblProxyGroups'), options: proxyGroups })
    }
    return groups
  })

  const availablePolicies = computed(() => {
    return Object.values(props.policies || {})
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((p) => ({ id: p.id, name: p.name || t('unnamedPolicy') }))
  })

  const isValid = computed(() => targetPolicyId.value !== '' && mergedRules.value.length > 0)

  const getRegisteredDomain = (hostname) => {
    if (!hostname || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return hostname
    const h = hostname.startsWith('.') ? hostname.substring(1) : hostname
    const parts = h.split('.')
    if (parts.length <= 2) return h
    const twoPartTlds = new Set([
      'co.uk',
      'org.uk',
      'ac.uk',
      'gov.uk',
      'com.au',
      'net.au',
      'org.au',
      'com.cn',
      'net.cn',
      'org.cn',
      'co.jp',
      'or.jp',
      'ne.jp',
      'co.kr',
      'or.kr',
      'com.br',
      'org.br',
      'co.nz',
      'org.nz',
      'com.tw',
      'org.tw',
      'com.hk',
      'org.hk',
      'com.sg',
      'org.sg',
      'co.in',
      'org.in',
      'net.in',
      'com.mx',
      'org.mx',
      'co.za',
      'org.za'
    ])
    const lastTwo = parts.slice(-2).join('.')
    if (twoPartTlds.has(lastTwo) && parts.length >= 3) return parts.slice(-3).join('.')
    return parts.slice(-2).join('.')
  }

  const optimizeRules = (rules) => {
    let optimized = JSON.parse(JSON.stringify(rules))
    if (props.domainOptimize) {
      optimized = optimized.map((r) => {
        if (r.ruleType === 'wildcard' && r.pattern) {
          return { ...r, pattern: '.' + getRegisteredDomain(r.pattern) }
        }
        return r
      })
    }
    const byProxy = {}
    optimized.forEach((r) => {
      const key = r.proxyId || 'direct'
      if (!byProxy[key]) byProxy[key] = []
      byProxy[key].push(r)
    })
    const finalRules = []
    Object.keys(byProxy).forEach((proxyId) => {
      const group = byProxy[proxyId]
      const wildcards = group.filter((r) => r.ruleType === 'wildcard')
      const others = group.filter((r) => r.ruleType !== 'wildcard')
      wildcards.sort((a, b) => a.pattern.length - b.pattern.length)
      const keptWildcards = []
      wildcards.forEach((r) => {
        const normalize = (p) => (p.startsWith('.') ? p.substring(1) : p)
        const rDomain = normalize(r.pattern)
        const isRedundant = keptWildcards.some((k) => {
          const kDomain = normalize(k.pattern)
          return rDomain === kDomain || rDomain.endsWith('.' + kDomain)
        })
        if (!isRedundant) keptWildcards.push(r)
      })
      finalRules.push(...others, ...keptWildcards)
    })
    return finalRules
  }

  const handleConfirm = () => {
    if (isValid.value) {
      emit('merge', {
        targetId: targetPolicyId.value,
        conflictMode: conflictMode.value,
        rules: mergedRules.value
      })
      emit('close')
    }
  }

  const reset = () => {
    targetPolicyId.value = props.forcedTargetId || availablePolicies.value[0]?.id || ''
    conflictMode.value = 'ignore'
    mergedRules.value = optimizeRules(props.sourceRules)
  }

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) reset()
    }
  )

  return {
    targetPolicyId,
    conflictMode,
    mergedRules,
    proxyList,
    availablePolicies,
    isValid,
    handleConfirm,
    removeMergedRule: (index) => mergedRules.value.splice(index, 1)
  }
}
