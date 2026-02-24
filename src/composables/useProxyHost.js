import { ref, computed } from 'vue'
import { loadConfig, saveProxies } from '../common/storage'
import { t } from '../common/i18n'
import { toast } from '../options/utils/toast'

export function useProxyHost(id, router) {
  const proxy = ref(null)
  const originalProxy = ref(null)
  const config = ref(null)

  // Reactive ID
  const currentId = ref(id)

  const loadProxyData = async (newId = null) => {
    if (newId) currentId.value = newId

    config.value = await loadConfig()
    const targetProxy = config.value?.proxies?.[currentId.value]

    if (targetProxy) {
      // Deep copy to local state
      proxy.value = JSON.parse(JSON.stringify(targetProxy))

      // Data Normalization
      if (!proxy.value.bypassList) {
        proxy.value.bypassList = ['127.0.0.1', '::1', '<localhost>']
      }
      if (!proxy.value.overrides) proxy.value.overrides = {}
      if (!proxy.value.overrides.http)
        proxy.value.overrides.http = {
          scheme: 'default',
          host: '',
          port: null,
          authUsername: '',
          authPassword: ''
        }
      if (!proxy.value.overrides.https)
        proxy.value.overrides.https = {
          scheme: 'default',
          host: '',
          port: null,
          authUsername: '',
          authPassword: ''
        }
      if (!proxy.value.overrides.ftp)
        proxy.value.overrides.ftp = {
          scheme: 'default',
          host: '',
          port: null,
          authUsername: '',
          authPassword: ''
        }

      if (!proxy.value.color) proxy.value.color = '#137fec'
      if (proxy.value.showInPopup === undefined) proxy.value.showInPopup = true

      originalProxy.value = JSON.parse(JSON.stringify(proxy.value))
    } else {
      router.push('/settings')
    }
  }

  const isDirty = computed(() => {
    if (!proxy.value || !originalProxy.value) return false
    return JSON.stringify(proxy.value) !== JSON.stringify(originalProxy.value)
  })

  const saveChanges = async () => {
    if (!config.value || !proxy.value) return

    const payload = JSON.parse(JSON.stringify(proxy.value))

    // Apply default ports
    if (!payload.port) {
      if (payload.scheme === 'http') payload.port = 8080
      else if (payload.scheme === 'https') payload.port = 443
      else if (['socks4', 'socks5'].includes(payload.scheme)) payload.port = 1080
    }

    // Clean up empty auth
    if (payload.auth && !payload.auth.username && !payload.auth.password) {
      payload.auth = null
    }

    // Clean up overrides
    if (payload.overrides) {
      ;['http', 'https', 'ftp'].forEach((key) => {
        const o = payload.overrides[key]
        if (o && o.scheme !== 'default' && !o.port) {
          const defaultPort = o.scheme === 'http' ? 8080 : o.scheme === 'https' ? 443 : 1080
          o.port = defaultPort
        }
      })
      if (payload.overrides.http?.scheme === 'default') delete payload.overrides.http
      if (payload.overrides.https?.scheme === 'default') delete payload.overrides.https
      if (payload.overrides.ftp?.scheme === 'default') delete payload.overrides.ftp
    }

    config.value.proxies[payload.id] = payload
    await saveProxies(config.value.proxies)
    toast.success(t('phMsgSaved'))
    await loadProxyData()
  }

  const handleRename = async (newName) => {
    if (!proxy.value || !config.value) return
    config.value.proxies[proxy.value.id].label = newName
    await saveProxies(config.value.proxies)
    toast.success(t('phMsgRenamed'))
    await loadProxyData()
  }

  const handleClone = async (newName) => {
    if (!proxy.value || !config.value) return
    const newId = `proxy_${Date.now()}`
    const newProxy = JSON.parse(JSON.stringify(config.value.proxies[proxy.value.id]))
    newProxy.id = newId
    newProxy.label = newName
    config.value.proxies[newId] = newProxy
    await saveProxies(config.value.proxies)
    toast.success(t('phMsgCloned'))
    router.push(`/host/${newId}`)
  }

  const handleDelete = async () => {
    if (!proxy.value || !config.value) return
    delete config.value.proxies[proxy.value.id]
    await saveProxies(config.value.proxies)
    toast.success(t('phMsgDeleted'))
    router.push('/settings')
  }

  return {
    proxy,
    isDirty,
    config,
    loadProxyData,
    saveChanges,
    handleRename,
    handleClone,
    handleDelete,
    resetChanges: loadProxyData
  }
}
