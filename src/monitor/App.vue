<template>
  <div class="d-flex flex-column h-100">
    <!-- Global Notifications -->
    <div v-if="showNotification" class="ui-toast-container">
        <div :class="['ui-toast-simple-badge animate-fade-in', notificationType]">
            <i class="bi bi-check2 me-1"></i> {{ notificationText }}
        </div>
    </div>

    <MonitorHeader 
      :isDark="isDark"
      :darkIconUrl="darkIconUrl"
      :lightIconUrl="lightIconUrl"
      :darkBrandUrl="darkBrandUrl"
      :lightBrandUrl="lightBrandUrl"
      v-model:historyLimit="historyLimit"
      v-model:searchQuery="searchQuery"
    />

    <main class="flex-1 d-flex overflow-hidden">
      <MonitorSidebar 
        :tabs="sortedTabs"
        :selectedTabId="selectedTabId"
        :totalRequestCount="totalRequestCount"
        :getRequestCountForTab="getTabRequestCount"
        :getHostname="getHostname"
        @select="selectTab"
      />

      <section class="flex-1 d-flex flex-column overflow-hidden" style="background: var(--bs-body-bg);">
        <div class="d-flex align-items-center justify-content-between px-4 py-2 border-bottom" style="background: var(--ui-bg-card);">
          <div class="d-flex align-items-center gap-3">
            <h2 class="m-0 text-sm font-bold ui-text-primary">
              {{ selectedTabId ? getSelectedTabTitle() : $t('lblAllRequests') }}
            </h2>
            <span class="text-xs ui-text-tertiary">{{ filteredRequests.length }} {{ $t('lblRequestsSuffix') }}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button v-if="selectedTabId" @click="openQuickAdd" class="ui-button-icon d-flex align-items-center gap-1" :disabled="filteredRequests.length === 0" :title="$t('btnAddTabDomains')">
              <i class="bi bi-plus-circle text-sm"></i>
            </button>
            <button @click="clearCurrentRequests" class="ui-button-icon d-flex align-items-center gap-1" :title="selectedTabId ? $t('btnClearTab') : $t('btnClearAll')">
              <i class="bi bi-trash text-sm"></i>
            </button>
          </div>
        </div>

        <MonitorRequestTable 
          :requests="filteredRequests"
          :ipTags="ipTags"
          @copy="copyText"
        />

        <div class="d-flex align-items-center justify-content-between px-4 py-2 border-top text-xs ui-text-tertiary" style="background: var(--ui-bg-subtle);">
          <span>{{ $t('lblShowing') }} {{ filteredRequests.length }} {{ $t('lblOf') }} {{ totalRequestCount }} {{ $t('lblRequestsSuffix') }}</span>
          <span>{{ $t('lblMaxHistory') }} {{ historyLimit }}</span>
        </div>
      </section>
    </main>

    <SmartRulesMergeModal
      :visible="showQuickAddModal"
      :policies="configPolicies"
      :sourceRules="quickAddSourceRules"
      :proxies="configProxies"
      :proxyGroups="configProxyGroups"
      :forcedTargetId="activeProfileId"
      :domainOptimize="true"
      @close="showQuickAddModal = false"
      @merge="handleQuickAddMerge"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { t } from '../common/i18n'
import { loadConfig, savePolicies } from '../common/storage'

// Composables
import { useMonitorTheme } from '../composables/useMonitorTheme'
import { useMonitorMatcher } from '../composables/useMonitorMatcher'
import { useMonitorData } from '../composables/useMonitorData'

// Components
import MonitorHeader from '../components/monitor/MonitorHeader.vue'
import MonitorSidebar from '../components/monitor/MonitorSidebar.vue'
import MonitorRequestTable from '../components/monitor/MonitorRequestTable.vue'
import SmartRulesMergeModal from '../components/rule/SmartRulesMergeModal.vue'

// State
const historyLimit = ref(1000)
const searchQuery = ref('')
const selectedTabId = ref(null)
const showQuickAddModal = ref(false)
const quickAddSourceRules = ref([])
const configPolicies = ref({})
const configProxies = ref({})
const configProxyGroups = ref({})
const activeProfileId = ref('')

// Toast state
const showNotification = ref(false)
const notificationText = ref('')
const notificationType = ref('')
let notificationTimer = null

// Initialize Composables
const { isDark, applyTheme, darkIconUrl, lightIconUrl, darkBrandUrl, lightBrandUrl } = useMonitorTheme()
const { ipTags, loadMatcherConfig, matchRule } = useMonitorMatcher()
const { requests, tabs, handleMessage, clearRequests, getHostname } = useMonitorData(historyLimit, matchRule)

// Computed
const sortedTabs = computed(() => Object.values(tabs.value).filter(tab => tab.requestCount > 0).sort((a, b) => b.lastActivity - a.lastActivity))
const totalRequestCount = computed(() => requests.value.length)
const filteredRequests = computed(() => {
  let filtered = [...requests.value]
  if (selectedTabId.value !== null) filtered = filtered.filter(r => r.tabId === selectedTabId.value)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => r.url.toLowerCase().includes(query) || r.method.toLowerCase().includes(query))
  }
  return filtered.sort((a, b) => b.startTime - a.startTime)
})

// Methods
const selectTab = (tabId) => { selectedTabId.value = tabId }
const getSelectedTabTitle = () => selectedTabId.value && tabs.value[selectedTabId.value] ? (tabs.value[selectedTabId.value].title || 'Untitled') : 'All Requests'
const getTabRequestCount = (tabId) => requests.value.filter(r => r.tabId === tabId).length
const clearCurrentRequests = () => { clearRequests(selectedTabId.value); if (selectedTabId.value !== null) selectedTabId.value = null }

const copyText = (text) => {
  if (!text || text === '-') return
  navigator.clipboard.writeText(text).then(() => showToast(t('msgCopiedGeneric'), 'success'))
}

const showToast = (text, type = '', duration = 2000) => {
    notificationText.value = text
    notificationType.value = type
    showNotification.value = true
    if (notificationTimer) clearTimeout(notificationTimer)
    notificationTimer = setTimeout(() => { showNotification.value = false }, duration)
}

const openQuickAdd = async () => {
  const domains = new Set(); filteredRequests.value.forEach(r => { if (r.domain) domains.add(r.domain) })
  quickAddSourceRules.value = Array.from(domains).sort().map(domain => ({ ruleType: 'wildcard', pattern: domain, proxyId: 'direct' }))
  const config = await loadConfig()
  configPolicies.value = config.policies || {}; configProxies.value = config.proxies || {}; configProxyGroups.value = config.proxyGroups || {}; activeProfileId.value = config.activeProfileId || ''
  showQuickAddModal.value = true
}

const handleQuickAddMerge = async ({ targetId, conflictMode, rules: mergedRules }) => {
  const config = await loadConfig(); const targetPolicy = config.policies?.[targetId]; if (!targetPolicy) return
  if (!targetPolicy.rules) targetPolicy.rules = []
  const newRulesToAdd = []
  mergedRules.forEach(rule => {
    const existingIndex = targetPolicy.rules.findIndex(r => r.type !== 'divider' && r.ruleType === rule.ruleType && r.pattern === rule.pattern)
    if (existingIndex !== -1) {
      if (conflictMode === 'overwrite') { targetPolicy.rules[existingIndex].proxyId = rule.proxyId; targetPolicy.rules[existingIndex].valid = rule.valid !== false }
    } else {
      newRulesToAdd.push({ ...rule, id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, type: 'rule', valid: true })
    }
  })
  if (newRulesToAdd.length > 0) targetPolicy.rules.unshift(...newRulesToAdd)
  config.policies[targetId] = targetPolicy; await savePolicies(config.policies); showQuickAddModal.value = false
}

// Lifecycle Hooks
onMounted(async () => {
  const config = await loadConfig(); applyTheme(config.ui?.theme || 'light'); await loadMatcherConfig()
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const themeListener = () => loadConfig().then(c => { if (c.ui?.theme === 'auto') applyTheme('auto') })
  mql.addEventListener('change', themeListener)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.config) { applyTheme(changes.config.newValue?.ui?.theme); loadMatcherConfig() }
  })
  chrome.runtime.onMessage.addListener(handleMessage)
})

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(handleMessage)
})
</script>