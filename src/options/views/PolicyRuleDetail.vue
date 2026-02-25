<template>
  <BaseDetailView :title="policy.name || $t('lblAutoPolicy')" maxWidth="6xl">
    <template #header-start>
      <input
        type="color"
        v-model="policy.color"
        class="p-0 border-0 rounded-lg overflow-hidden shadow-sm transition-transform"
        style="width: 24px; height: 24px; min-width: 24px; cursor: pointer"
        :title="$t('lblChooseColor')"
      />
    </template>

    <template #actions>
      <div
        class="form-check form-switch m-0 d-flex align-items-center gap-2"
        :title="$t('phTitleShowPopup')"
      >
        <input
          class="form-check-input align-self-start"
          style="cursor: pointer"
          type="checkbox"
          role="switch"
          id="showInPopup"
          v-model="policy.showInPopup"
        />
        <label
          class="form-check-label text-xs fw-medium ui-text-secondary"
          style="cursor: pointer"
          for="showInPopup"
          >{{ $t('phLabelShowPopup') }}</label
        >
      </div>
      <button
        @click="resetChanges"
        :disabled="!isDirty"
        class="px-3 py-2 text-xs fw-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
      >
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
      </button>

      <button
        @click="saveChanges"
        :disabled="!isDirty"
        class="px-3 py-2 text-xs fw-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
      >
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
      </button>

      <div class="dropdown">
        <button
          class="ui-button-icon d-flex align-items-center justify-content-center"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-three-dots-vertical text-lg"></i>
        </button>
        <ul
          class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1"
          style="min-width: 140px"
        >
          <li>
            <button
              @click="showRenameModal = true"
              class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}
            </button>
          </li>
          <li>
            <button
              @click="showCloneModal = true"
              class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-files ui-text-tertiary"></i> {{ $t('btnClone') }}
            </button>
          </li>
          <li>
            <button
              @click="showPolicyMergeModal = true"
              class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-diagram-3-fill ui-text-tertiary"></i> {{ $t('lblMergePolicy') }}
            </button>
          </li>
          <li>
            <button
              @click="handleExportPAC"
              class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-download ui-text-tertiary"></i> {{ $t('lblExportPAC') }}
            </button>
          </li>
          <li><hr class="dropdown-divider my-1 border-subtle" /></li>
          <li>
            <button
              @click="showDeleteModal = true"
              class="dropdown-item w-100 text-start px-3 py-2 text-xs text-danger rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-trash"></i> {{ $t('btnDelete') }}
            </button>
          </li>
        </ul>
      </div>
    </template>

    <!-- Normal Rules Section -->
    <PolicyRuleList
      v-model="policy.rules"
      :title="$t('phHeaderNormalRules')"
      :config="config"
      :policyId="policy.id"
      :showDefaultStrategy="true"
      v-model:defaultProfileId="policy.defaultProfileId"
      @batch-replace="showBatchReplaceModal = true"
    />

    <!-- Reject Rules Section -->
    <PolicyRuleList
      v-model="policy.rejectRules"
      :title="$t('phHeaderRejectRules')"
      :config="config"
      :policyId="policy.id"
      :isReject="true"
    />

    <!-- Modals -->
    <ProxyRenameModal
      :visible="showRenameModal"
      :currentName="policy.name || ''"
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyCloneModal
      :visible="showCloneModal"
      :currentName="policy.name || ''"
      @close="showCloneModal = false"
      @clone="handleClone"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="policy.name || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete"
    />
    <RuleSetContentModal
      :show="showRuleSetModal"
      :content="selectedRuleSetContent"
      :url="selectedRuleSetUrl"
      :lastUpdated="selectedRuleSetLastUpdated"
      @close="showRuleSetModal = false"
      @update="handleRuleSetUpdate"
    />
    <BatchProxyReplaceModal
      :visible="showBatchReplaceModal"
      :proxies="config?.proxies"
      :proxyGroups="config?.proxyGroups"
      @close="showBatchReplaceModal = false"
      @replace="handleBatchReplace"
    />
    <PolicyMergeModal
      :visible="showPolicyMergeModal"
      :currentPolicyId="policy.id"
      :policies="config?.policies || {}"
      @close="showPolicyMergeModal = false"
      @merge="handlePolicyMerge"
    />
  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, savePolicies } from '../../common/storage'
import { decodeRuleSetContent, updateRuleSetContent } from '../../common/ruleset'
import { generatePacScriptFromPolicy } from '../../common/pac'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import { usePolicyRules } from '../../composables/usePolicyRules'

// Components
import ProxyRenameModal from '../../components/proxy/ProxyRenameModal.vue'
import ProxyCloneModal from '../../components/proxy/ProxyCloneModal.vue'
import ProxyDeleteModal from '../../components/proxy/ProxyDeleteModal.vue'
import BatchProxyReplaceModal from '../../components/proxy/BatchProxyReplaceModal.vue'
import PolicyMergeModal from '../../components/policy/PolicyMergeModal.vue'
import PolicyRuleList from '../../components/policy/PolicyRuleList.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'

const route = useRoute()
const router = useRouter()
const config = ref(null)
const policy = ref({ rules: [], rejectRules: [] })
const originalPolicy = ref({})

// UI States
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)
const showBatchReplaceModal = ref(false)
const showPolicyMergeModal = ref(false)

// Load Data
const loadPolicyData = async () => {
  config.value = await loadConfig()
  const id = route.params.id
  if (config.value?.policies?.[id]) {
    policy.value = JSON.parse(JSON.stringify(config.value.policies[id]))
    if (!Array.isArray(policy.value.rules)) policy.value.rules = []
    if (!Array.isArray(policy.value.rejectRules)) policy.value.rejectRules = []
    if (policy.value.showInPopup === undefined) policy.value.showInPopup = true
    originalPolicy.value = JSON.parse(JSON.stringify(policy.value))
  } else router.push('/settings')
}

const isDirty = computed(
  () => JSON.stringify(policy.value) !== JSON.stringify(originalPolicy.value)
)

onMounted(() => {
  loadPolicyData()
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(t('phMsgUnsaved'))
      return true
    }
    return false
  })
})
onBeforeUnmount(() => unregisterUnsavedChangesChecker())
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) loadPolicyData()
  }
)

// Actions
const resetChanges = () => loadPolicyData()
const saveChanges = async () => {
  if (!config.value || !policy.value) return
  policy.value.rejectRules.forEach(r => {
    if (r.type === 'rule') r.proxyId = 'reject'
  })
  config.value.policies[policy.value.id] = JSON.parse(JSON.stringify(policy.value))
  await savePolicies(config.value.policies)
  toast.success(t('msgPolicySaved'))
  await loadPolicyData()
}

const handleRename = async (name) => {
  policy.value.name = name
  await saveChanges()
  showRenameModal.value = false
  toast.success(t('phMsgRenamed'))
}
const handleClone = async (name) => {
  const id = `policy_${Date.now()}`
  const p = JSON.parse(JSON.stringify(policy.value))
  p.id = id
  p.name = name
  config.value.policies[id] = p
  await savePolicies(config.value.policies)
  toast.success(t('phMsgCloned'))
  router.push(`/policy/${id}`)
  showCloneModal.value = false
}
const handleDelete = async () => {
  delete config.value.policies[policy.value.id]
  await savePolicies(config.value.policies)
  toast.success(t('phMsgDeleted'))
  router.push('/settings')
  showDeleteModal.value = false
}

const handleBatchReplace = (fromId, toId) => {
  let count = 0
  policy.value.rules.forEach((r) => {
    if (r.type !== 'divider' && r.proxyId === fromId) {
      r.proxyId = toId
      count++
    }
  })
  if (count > 0) {
    toast.success(t('bpmMsgReplaced', [count]))
    showBatchReplaceModal.value = false
  } else toast.info(t('bpmMsgNoMatch'))
}
const handlePolicyMerge = ({ sourceId, conflictMode, importNormal, importReject }) => {
  const s = config.value.policies[sourceId]
  if (!s) return

  let mergedCount = 0

  // Helper for merging a rule list
  const mergeCheck = (targetList, sourceList, mode) => {
    const sourceRules = JSON.parse(JSON.stringify(sourceList))
    const newRules = []
    const indicesToRemove = new Set()

    sourceRules.forEach((sr) => {
      if (sr.type === 'divider') return // Skip dividers for now? Or import them? Usually skip in simple merge. Let's skip.

      // Check conflict
      const existingIndex = targetList.findIndex(
        (tr) => tr.type !== 'divider' && tr.ruleType === sr.ruleType && tr.pattern === sr.pattern
      )

      if (existingIndex !== -1) {
        if (mode === 'overwrite') {
          indicesToRemove.add(existingIndex)
          // Re-generate ID to be safe
          sr.id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          newRules.push(sr)
        }
        // ignore: do nothing
      } else {
        sr.id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        newRules.push(sr)
      }
    })

    if (indicesToRemove.size > 0) {
      // Filter in place? No, can't assign to prop if passed by ref.
      // But here we are passing array by ref from the caller scope?
      // We need to modify policy.value.rules directly.
      // This helper is tricky. Let's inline logic or return changes.
      return { newRules, indicesToRemove }
    }
    return { newRules, indicesToRemove }
  }

  if (importNormal && s.rules) {
    const { newRules, indicesToRemove } = mergeCheck(policy.value.rules, s.rules, conflictMode)
    if (indicesToRemove.size > 0) {
      policy.value.rules = policy.value.rules.filter((_, i) => !indicesToRemove.has(i))
    }
    if (newRules.length > 0) {
      policy.value.rules = [...policy.value.rules, ...newRules]
      mergedCount += newRules.length
    }
  }

  if (importReject && s.rejectRules) {
    const { newRules, indicesToRemove } = mergeCheck(
      policy.value.rejectRules,
      s.rejectRules,
      conflictMode
    )
    if (indicesToRemove.size > 0) {
      policy.value.rejectRules = policy.value.rejectRules.filter((_, i) => !indicesToRemove.has(i))
    }
    if (newRules.length > 0) {
      policy.value.rejectRules = [...policy.value.rejectRules, ...newRules]
      mergedCount += newRules.length
    }
  }

  if (mergedCount > 0) toast.success(t('msgPolicyMerged'))
  else toast.info(t('bpmMsgNoMatch')) // Or "No new rules merged"

  showPolicyMergeModal.value = false
}
const handleExportPAC = () => {
  const pac = generatePacScriptFromPolicy(
    policy.value,
    config.value.proxies,
    config.value.reject,
    [],
    config.value.rulePriority,
    config.value.proxyGroups
  )
  const blob = new Blob([pac], { type: 'application/x-ns-proxy-autoconfig' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${policy.value.name || 'proxy'}.pac`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
