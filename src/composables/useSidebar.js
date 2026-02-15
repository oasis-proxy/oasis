import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadConfig, saveProxies, savePolicies, savePacs, saveProxyGroups } from '../common/storage'
import { hasUnsavedChanges } from '../options/router'
import { t } from '../common/i18n'
import { toast } from '../options/utils/toast'

export function useSidebar() {
    const router = useRouter()
    const config = ref(null)
    const showPolicyModal = ref(false)
    const showProxyModal = ref(false)
    const showGroupModal = ref(false)

    const refreshConfig = async () => {
        config.value = await loadConfig()
    }

    onMounted(() => {
        refreshConfig()
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local') refreshConfig()
        })
    })

    const proxyHosts = computed(() => {
        if (!config.value?.proxies) return []
        return Object.values(config.value.proxies).map(p => ({
            id: p.id,
            name: p.label || p.host,
            icon: 'bi-pc-display',
            color: p.color
        }))
    })

    const proxyGroupsList = computed(() => {
        if (!config.value?.proxyGroups) return []
        return Object.values(config.value.proxyGroups).map(g => ({
            id: g.id,
            name: g.name || t('unnamedGroup'),
            color: g.color
        }))
    })

    const policyRules = computed(() => {
        if (!config.value) return []
        const rules = []
        if (config.value.pacs) {
            Object.values(config.value.pacs).forEach(pac => {
                rules.push({
                    id: pac.id,
                    name: pac.name || pac.url || t('unnamedPAC'),
                    icon: 'bi-file-earmark-code',
                    color: pac.color,
                    type: 'pac'
                })
            })
        }
        if (config.value.policies) {
            Object.values(config.value.policies).forEach(policy => {
                rules.push({
                    id: policy.id,
                    name: policy.name || policy.id,
                    icon: 'bi-signpost-split-fill',
                    color: policy.color,
                    type: 'policy'
                })
            })
        }
        return rules
    })

    const handleCreateProxy = async ({ name }) => {
        if (hasUnsavedChanges()) return
        const latestConfig = await loadConfig()
        const id = `proxy_${Date.now()}`
        if (!latestConfig.proxies) latestConfig.proxies = {}
        latestConfig.proxies[id] = {
            id, type: 'server', label: name, scheme: 'http', host: '', port: null, auth: null,
            bypassList: ['127.0.0.1', '::1', '<localhost>'], color: '#137fec'
        }
        await saveProxies(latestConfig.proxies)
        toast.success(t('msgProxyCreated'))
        showProxyModal.value = false
        router.push(`/host/${id}`)
    }

    const handleCreatePolicy = async ({ name, type }) => {
        if (hasUnsavedChanges()) return
        const latestConfig = await loadConfig()
        const id = `${type}_${Date.now()}`
        if (type === 'pac') {
            if (!latestConfig.pacs) latestConfig.pacs = {}
            latestConfig.pacs[id] = { id, name, url: '', color: '#8b5cf6' }
            await savePacs(latestConfig.pacs)
        } else {
            if (!latestConfig.policies) latestConfig.policies = {}
            latestConfig.policies[id] = { id, name, defaultProfileId: 'direct', rules: [], color: '#10b981' }
            await savePolicies(latestConfig.policies)
        }
        toast.success(type === 'pac' ? t('msgPACCreated') : t('msgPolicyCreated'))
        showPolicyModal.value = false
        router.push(type === 'pac' ? `/pac/${id}` : `/policy/${id}`)
    }

    const handleCreateProxyGroup = async ({ name }) => {
        if (hasUnsavedChanges()) return
        const latestConfig = await loadConfig()
        const id = `group_${Date.now()}`
        if (!latestConfig.proxyGroups) latestConfig.proxyGroups = {}
        latestConfig.proxyGroups[id] = { id, type: 'group', name, proxies: [], fallback: { type: 'direct' } }
        await saveProxyGroups(latestConfig.proxyGroups)
        toast.success(t('msgGroupCreated'))
        showGroupModal.value = false
        router.push(`/group/${id}`)
    }

    const shouldShowMonitor = computed(() => {
        if (!config.value?.behavior?.connectionMonitoring) return false
        const activeId = config.value.activeProfileId
        const policy = config.value.policies?.[activeId]
        return !!(policy && (policy.rules || policy.defaultProfileId))
    })

    const shouldShowTempRules = computed(() => {
        if (!config.value) return false
        const activeId = config.value.activeProfileId
        return !!(config.value.policies && config.value.policies[activeId])
    })

    return {
        config, showPolicyModal, showProxyModal, showGroupModal,
        proxyHosts, proxyGroupsList, policyRules,
        shouldShowMonitor, shouldShowTempRules,
        handleCreateProxy, handleCreatePolicy, handleCreateProxyGroup,
        openMonitor: () => chrome.tabs.create({ url: chrome.runtime.getURL('src/monitor/index.html') })
    }
}
