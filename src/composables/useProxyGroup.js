import { ref, computed } from 'vue'
import { loadConfig, saveProxyGroups } from '../common/storage'
import { t } from '../common/i18n'
import { toast } from '../options/utils/toast'
import { useDragDrop } from '../common/dragDrop'

export function useProxyGroup(route, router) {
  const config = ref(null)
  const proxyGroup = ref({
    id: '',
    name: '',
    type: 'group',
    proxies: [],
    fallback: { type: 'direct' },
    color: '#6366f1'
  })
  const originalGroup = ref(null)

  const fallbackEnabled = computed({
    get: () => proxyGroup.value.fallbackEnabled !== false,
    set: (val) => {
      proxyGroup.value.fallbackEnabled = val
    }
  })

  const proxiesRef = computed({
    get: () => proxyGroup.value.proxies,
    set: (val) => {
      proxyGroup.value.proxies = val
    }
  })

  const { dragOverIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragDrop(proxiesRef)

  const getProxyName = (id) => {
    if (!config.value?.proxies?.[id]) return t('pgOptionUnknownProxy')
    const p = config.value.proxies[id]
    return p.label || p.host
  }

  const getProxyAddress = (id) => {
    if (!config.value?.proxies?.[id]) return ''
    const p = config.value.proxies[id]
    return `${p.scheme}://${p.host}:${p.port}`
  }

  const getProxyColor = (id) => {
    if (!config.value?.proxies?.[id]) return '#94a3b8'
    return config.value.proxies[id].color
  }

  const availableProxies = computed(() => {
    if (!config.value?.proxies) return []
    const currentSet = new Set(proxyGroup.value.proxies)
    return Object.values(config.value.proxies).filter((p) => !currentSet.has(p.id))
  })

  const availableProxyGroups = computed(() => {
    if (!config.value?.proxyGroups) return []
    const currentSet = new Set(proxyGroup.value.proxies)
    return Object.values(config.value.proxyGroups).filter(
      (g) => g.id !== proxyGroup.value.id && !currentSet.has(g.id)
    )
  })

  const loadGroupData = async () => {
    config.value = await loadConfig()
    const id = route.params.id
    if (config.value?.proxyGroups?.[id]) {
      proxyGroup.value = JSON.parse(JSON.stringify(config.value.proxyGroups[id]))
      proxyGroup.value.proxies ??= []
      proxyGroup.value.fallback ??= { type: 'direct' }
      proxyGroup.value.fallbackEnabled ??= true
      proxyGroup.value.color ??= '#6366f1'
      originalGroup.value = JSON.parse(JSON.stringify(proxyGroup.value))
    } else {
      router.push('/settings')
    }
  }

  const isDirty = computed(() => {
    if (!proxyGroup.value || !originalGroup.value) return false
    return JSON.stringify(proxyGroup.value) !== JSON.stringify(originalGroup.value)
  })

  const saveChanges = async () => {
    if (!config.value || !proxyGroup.value) return
    config.value.proxyGroups[proxyGroup.value.id] = JSON.parse(JSON.stringify(proxyGroup.value))
    await saveProxyGroups(config.value.proxyGroups)
    toast.success(t('pgMsgSaved'))
    await loadGroupData()
  }

  const addProxy = () => {
    const totalProxies = Object.keys(config.value?.proxies || {}).length
    if (proxyGroup.value.proxies.length >= totalProxies) {
      toast.warning(t('pgMsgNoMoreProxies'))
      return
    }
    proxyGroup.value.proxies.push('')
  }

  const removeProxy = (index) => proxyGroup.value.proxies.splice(index, 1)

  const updateProxyAt = (index, id) => {
    if (id) proxyGroup.value.proxies[index] = id
  }

  return {
    proxyGroup,
    config,
    dragOverIndex,
    fallbackEnabled,
    isDirty,
    availableProxies,
    availableProxyGroups,
    loadGroupData,
    saveChanges,
    addProxy,
    removeProxy,
    updateProxyAt,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    getProxyName,
    getProxyAddress,
    getProxyColor
  }
}
