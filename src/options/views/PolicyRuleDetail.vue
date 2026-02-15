<template>
  <BaseDetailView :title="policy.name || $t('lblAutoPolicy')" maxWidth="6xl">
    <template #header-start>
      <input type="color" v-model="policy.color" class="p-0 border-0 rounded-lg overflow-hidden shadow-sm transition-transform" style="width: 24px; height: 24px; min-width: 24px; cursor: pointer;" :title="$t('lblChooseColor')"/>
    </template>

    <template #actions>
      <div class="form-check form-switch m-0 d-flex align-items-center gap-2" :title="$t('phTitleShowPopup')">
          <input class="form-check-input align-self-start" style="cursor: pointer;" type="checkbox" role="switch" id="showInPopup" v-model="policy.showInPopup">
          <label class="form-check-label text-xs fw-medium ui-text-secondary" style="cursor: pointer;" for="showInPopup">{{ $t('phLabelShowPopup') }}</label>
      </div>
      <button @click="resetChanges" :disabled="!isDirty" class="px-3 py-2 text-xs fw-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2">
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
      </button>

      <button @click="saveChanges" :disabled="!isDirty" class="px-3 py-2 text-xs fw-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2">
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
      </button>

      <div class="dropdown">
         <button class="ui-button-icon d-flex align-items-center justify-content-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
             <i class="bi bi-three-dots-vertical text-lg"></i>
         </button>
         <ul class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1" style="min-width: 140px;">
             <li><button @click="showRenameModal = true" class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"><i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}</button></li>
             <li><button @click="showCloneModal = true" class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"><i class="bi bi-files ui-text-tertiary"></i> {{ $t('btnClone') }}</button></li>
             <li><button @click="showPolicyMergeModal = true" class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"><i class="bi bi-diagram-3-fill ui-text-tertiary"></i> {{ $t('lblMergePolicy') }}</button></li>
             <li><button @click="handleExportPAC" class="dropdown-item w-100 text-start px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"><i class="bi bi-download ui-text-tertiary"></i> {{ $t('lblExportPAC') }}</button></li>
             <li><hr class="dropdown-divider my-1 border-subtle "></li>
             <li><button @click="showDeleteModal = true" class="dropdown-item w-100 text-start px-3 py-2 text-xs text-danger  rounded-md transition-colors d-flex align-items-center gap-2"><i class="bi bi-trash"></i> {{ $t('btnDelete') }}</button></li>
         </ul>
      </div>
    </template>

    <!-- Normal Rules Section -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('phHeaderNormalRules') }}</span>
        <div class="d-flex align-items-center gap-2">
          <button @click="showBatchReplaceModal = true" class="ui-button-icon sm" :title="$t('btnBatchReplace')"><i class="bi bi-list-check ui-icon-md"></i></button>
          <button @click="addRule()" class="ui-button-icon sm" :title="$t('btnAddRule')"><i class="bi bi-plus-lg text-sm"></i></button>
        </div>
      </div>

      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <div class="ui-card-header">
          <div style="width: 4%;"></div>
          <div style="width: 8%;" class="text-center">{{ $t('lblValid') }}</div>
          <div style="width: 16%;">{{ $t('lblType') }}</div>
          <div style="width: 44%;">{{ $t('lblPattern') }}</div>
          <div style="width: 20%;">{{ $t('lblProxy') }}</div>
          <div style="width: 8%;" class="text-center">{{ $t('lblAction') }}</div>
        </div>

        <div v-if="policy.rules && policy.rules.length > 0">
          <template v-for="(rule, index) in policy.rules" :key="rule.id || index">
            <PolicyDividerRow 
              v-if="rule.type === 'divider'"
              :rule="rule"
              :dragOver="dragOverIndex === index"
              :isEditing="editingDividerIndex === index"
              v-model:editingLabel="editingDividerLabel"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              @edit="startEditDivider(index, rule.label)"
              @save="saveDividerLabel(index)"
              @cancel="editingDividerIndex = null"
              @add-rule-below="insertRuleBelow(index)"
              @add-divider-below="insertDividerBelow(index)"
              @delete="deleteRule(index)"
            />
            <PolicyRuleRow 
              v-else
              v-model:rule="policy.rules[index]"
              :dragOver="dragOverIndex === index"
              :isDuplicate="duplicateIndices.has(index)"
              :hasError="!!validationErrors[index]"
              :isFetching="fetchingRuleSetIndex === index"
              :proxies="config?.proxies"
              :proxyGroups="config?.proxyGroups"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              @type-change="handleRuleTypeChange(index, rule)"
              @open-ruleset="openRuleSetModal(rule, index)"
              @focus="focusedIndex = index"
              @blur="focusedIndex = null; validateRule(index, rule); rule.ruleType === 'ruleset' && fetchRuleSetContent(index, rule.pattern)"
              @add-below="insertRuleBelow(index)"
              @add-divider-below="insertDividerBelow(index)"
              @delete="deleteRule(index)"
            >
              <template #proxy-select>
                <ProxySelect v-model="rule.proxyId" :proxies="config?.proxies" :proxyGroups="config?.proxyGroups" size="sm" class="w-100 py-0 px-1.5"/>
              </template>
            </PolicyRuleRow>
          </template>
        </div>
        <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
          <p class="text-xs ui-text-secondary m-0">No rules defined. Click "+" to get started.</p>
        </div>
        <div class="ui-card-footer">
          <div style="width: 28%;"></div>
          <div style="width: 44%;" class="d-flex align-items-center justify-content-end px-2 gap-2">
            <i class="bi bi-arrow-return-right"></i> {{ $t('lblDefaultStrategy') }}
          </div>
          <div style="width: 20%;">
            <ProxySelect v-model="policy.defaultProfileId" :proxies="config?.proxies" :proxyGroups="config?.proxyGroups" size="sm" class="w-100 py-0 px-1.5"/>
          </div>
          <div style="width: 8%;"></div>
        </div>
      </div>
    </section>

    <!-- Reject Rules Section -->
    <section class="mt-4">
      <div class="ui-card-label">
        <span class="label-text">{{ $t('phHeaderRejectRules') }}</span>
        <button @click="addRejectRule()" class="ui-button-icon sm" :title="$t('btnAddRejectRule')"><i class="bi bi-plus-lg text-sm"></i></button>
      </div>

      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <div class="ui-card-header">
          <div style="width: 4%;"></div>
          <div style="width: 8%;" class="text-center">{{ $t('lblValid') }}</div>
          <div style="width: 16%;">{{ $t('lblType') }}</div>
          <div style="width: 44%;">{{ $t('lblPattern') }}</div>
          <div style="width: 20%;">{{ $t('lblProxy') }}</div>
          <div style="width: 8%;" class="text-center">{{ $t('lblAction') }}</div>
        </div>

        <div v-if="policy.rejectRules && policy.rejectRules.length > 0">
          <template v-for="(rule, index) in policy.rejectRules" :key="rule.id || index">
             <PolicyDividerRow 
              v-if="rule.type === 'divider'"
              :rule="rule"
              :dragOver="dragOverRejectIndex === index"
              :isEditing="editingRejectDividerIndex === index"
              v-model:editingLabel="editingRejectDividerLabel"
              @dragstart="handleRejectDragStart($event, index)"
              @dragover="handleRejectDragOver($event, index)"
              @drop="handleRejectDrop($event, index)"
              @dragend="handleRejectDragEnd"
              @edit="startEditRejectDivider(index, rule.label)"
              @save="saveRejectDividerLabel(index)"
              @cancel="editingRejectDividerIndex = null"
              @add-rule-below="insertRejectRuleBelow(index)"
              @add-divider-below="insertRejectDividerBelow(index)"
              @delete="deleteRejectRule(index)"
            />
            <PolicyRuleRow 
              v-else
              v-model:rule="policy.rejectRules[index]"
              :dragOver="dragOverRejectIndex === index"
              :hasError="!!rejectValidationErrors[index]"
              @dragstart="handleRejectDragStart($event, index)"
              @dragover="handleRejectDragOver($event, index)"
              @drop="handleRejectDrop($event, index)"
              @dragend="handleRejectDragEnd"
              @type-change="validateRejectRule(index, rule)"
              @blur="validateRejectRule(index, rule)"
              @add-below="insertRejectRuleBelow(index)"
              @add-divider-below="insertRejectDividerBelow(index)"
              @delete="deleteRejectRule(index)"
            >
              <template #proxy-select>
                <div class="w-100 rounded border border-subtle ui-input ui-input-sm ui-bg-subtle ui-text-secondary text-xs px-2 d-flex align-items-center cursor-not-allowed">{{ $t('lblReject') }}</div>
              </template>
            </PolicyRuleRow>
          </template>
        </div>
        <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
          <p class="text-xs ui-text-secondary m-0">{{ $t('msgNoRejectRules') }}</p>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <ProxyRenameModal :visible="showRenameModal" :currentName="policy.name || ''" @close="showRenameModal = false" @save="handleRename"/>
    <ProxyCloneModal :visible="showCloneModal" :currentName="policy.name || ''" @close="showCloneModal = false" @clone="handleClone"/>
    <ProxyDeleteModal :visible="showDeleteModal" :proxyName="policy.name || ''" @close="showDeleteModal = false" @delete="handleDelete"/>
    <RuleSetContentModal :show="showRuleSetModal" :content="selectedRuleSetContent" :url="selectedRuleSetUrl" :lastUpdated="selectedRuleSetLastUpdated" @close="showRuleSetModal = false" @update="handleRuleSetUpdate"/>
    <BatchProxyReplaceModal :visible="showBatchReplaceModal" :proxies="config?.proxies" :proxyGroups="config?.proxyGroups" @close="showBatchReplaceModal = false" @replace="handleBatchReplace"/>
    <PolicyMergeModal :visible="showPolicyMergeModal" :currentPolicyId="policy.id" :policies="config?.policies || {}" @close="showPolicyMergeModal = false" @merge="handlePolicyMerge" />
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
import RuleSetContentModal from '../../components/rule/RuleSetContentModal.vue'
import BatchProxyReplaceModal from '../../components/proxy/BatchProxyReplaceModal.vue'
import PolicyMergeModal from '../../components/policy/PolicyMergeModal.vue'
import ProxySelect from '../../components/proxy/ProxySelect.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'
import PolicyRuleRow from '../../components/policy/PolicyRuleRow.vue'
import PolicyDividerRow from '../../components/policy/PolicyDividerRow.vue'

const route = useRoute()
const router = useRouter()
const config = ref(null)
const policy = ref({ rules: [], rejectRules: [] })
const originalPolicy = ref({})

// Rule Lists Logic
const rulesRef = computed({ get: () => policy.value.rules, set: (v) => { policy.value.rules = v } })
const rejectRulesRef = computed({ get: () => policy.value.rejectRules, set: (v) => { policy.value.rejectRules = v } })

const { 
  validationErrors, focusedIndex, fetchingRuleSetIndex, duplicateIndices, 
  validateRule, revalidateAll: revalidateAllRules, addRule, insertRuleBelow, insertDividerBelow, deleteRule, 
  fetchRuleSetContent, dragOverIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd 
} = usePolicyRules(rulesRef)

const {
  validationErrors: rejectValidationErrors, validateRule: validateRejectRule, revalidateAll: revalidateAllRejectRules,
  addRule: addRejectRule, insertRuleBelow: insertRejectRuleBelow, insertDividerBelow: insertRejectDividerBelow, deleteRule: deleteRejectRule,
  dragOverIndex: dragOverRejectIndex, handleDragStart: handleRejectDragStart, handleDragOver: handleRejectDragOver, handleDrop: handleRejectDrop, handleDragEnd: handleRejectDragEnd
} = usePolicyRules(rejectRulesRef)

// UI States
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)
const showRuleSetModal = ref(false)
const showBatchReplaceModal = ref(false)
const showPolicyMergeModal = ref(false)
const selectedRuleSetContent = ref('')
const selectedRuleSetUrl = ref('')
const selectedRuleSetLastUpdated = ref(null)
const selectedRuleSetIndex = ref(null)
const editingDividerIndex = ref(null)
const editingDividerLabel = ref('')
const editingRejectDividerIndex = ref(null)
const editingRejectDividerLabel = ref('')

// Load Data
const loadPolicyData = async () => {
    config.value = await loadConfig()
    const id = route.params.id
    if (config.value?.policies?.[id]) {
        policy.value = JSON.parse(JSON.stringify(config.value.policies[id]))
        if (!Array.isArray(policy.value.rules)) policy.value.rules = []
        if (!Array.isArray(policy.value.rejectRules)) policy.value.rejectRules = []
        originalPolicy.value = JSON.parse(JSON.stringify(policy.value))
        nextTick(() => { revalidateAllRules(); revalidateAllRejectRules() })
    } else router.push('/settings')
}

const isDirty = computed(() => JSON.stringify(policy.value) !== JSON.stringify(originalPolicy.value))

onMounted(() => {
    loadPolicyData()
    registerUnsavedChangesChecker(() => {
        if (isDirty.value) { toast.warning(t('phMsgUnsaved')); return true }
        return false
    })
})
onBeforeUnmount(() => unregisterUnsavedChangesChecker())
watch(() => route.params.id, (newId, oldId) => { if (newId !== oldId) loadPolicyData() })

// Actions
const resetChanges = () => loadPolicyData()
const saveChanges = async () => {
    if (!config.value || !policy.value) return
    config.value.policies[policy.value.id] = JSON.parse(JSON.stringify(policy.value))
    await savePolicies(config.value.policies)
    toast.success(t('msgPolicySaved'))
    await loadPolicyData()
}

const handleRuleTypeChange = (index, rule) => {
  validateRule(index, rule)
  if (rule.ruleType === 'ruleset' && rule.pattern?.trim()) fetchRuleSetContent(index, rule.pattern)
}

const openRuleSetModal = (rule, index) => {
    if (!rule.ruleSet?.content) {
        toast.warning('No content available for this RuleSet yet.')
        fetchRuleSetContent(index, rule.pattern)
        return
    }
    selectedRuleSetContent.value = decodeRuleSetContent(rule.ruleSet.content)
    selectedRuleSetUrl.value = rule.ruleSet.sourceUrl || rule.pattern
    selectedRuleSetLastUpdated.value = rule.ruleSet.lastUpdated
    selectedRuleSetIndex.value = index
    showRuleSetModal.value = true
}

const handleRuleSetUpdate = (newContent) => {
    if (selectedRuleSetIndex.value !== null) {
        const rule = policy.value.rules[selectedRuleSetIndex.value]
        rule.ruleSet.content = updateRuleSetContent(newContent)
        rule.ruleSet.lastUpdated = Date.now()
        showRuleSetModal.value = false
        toast.success('RuleSet updated in memory. Remember to Save Policy.')
    }
}

const handleRename = async (name) => { policy.value.name = name; await saveChanges(); showRenameModal.value = false; toast.success(t('phMsgRenamed')) }
const handleClone = async (name) => {
    const id = `policy_${Date.now()}`; const p = JSON.parse(JSON.stringify(policy.value)); p.id = id; p.name = name
    config.value.policies[id] = p; await savePolicies(config.value.policies); toast.success(t('phMsgCloned')); router.push(`/policy/${id}`); showCloneModal.value = false
}
const handleDelete = async () => { delete config.value.policies[policy.value.id]; await savePolicies(config.value.policies); toast.success(t('phMsgDeleted')); router.push('/settings'); showDeleteModal.value = false }

const startEditDivider = (index, label) => { editingDividerIndex.value = index; editingDividerLabel.value = label || t('lblNewSection') }
const saveDividerLabel = (index) => { if (editingDividerIndex.value === index) { policy.value.rules[index].label = editingDividerLabel.value; editingDividerIndex.value = null } }
const startEditRejectDivider = (index, label) => { editingRejectDividerIndex.value = index; editingRejectDividerLabel.value = label || t('lblNewSection') }
const saveRejectDividerLabel = (index) => { if (editingRejectDividerIndex.value === index) { policy.value.rejectRules[index].label = editingRejectDividerLabel.value; editingRejectDividerIndex.value = null } }

const handleBatchReplace = (fromId, toId) => {
    let count = 0; policy.value.rules.forEach(r => { if (r.type !== 'divider' && r.proxyId === fromId) { r.proxyId = toId; count++ } })
    if (count > 0) { toast.success(t('bpmMsgReplaced', [count])); showBatchReplaceModal.value = false } else toast.info(t('bpmMsgNoMatch'))
}
const handlePolicyMerge = (sourceId) => {
    const s = config.value.policies[sourceId]; if (s) { policy.value.rules = [...policy.value.rules, ...JSON.parse(JSON.stringify(s.rules))]; toast.success(t('msgPolicyMerged')); showPolicyMergeModal.value = false }
}
const handleExportPAC = () => {
    const pac = generatePacScriptFromPolicy(policy.value, config.value.proxies, config.value.proxyGroups)
    const blob = new Blob([pac], { type: 'application/x-ns-proxy-autoconfig' }); const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `${policy.value.name || 'proxy'}.pac`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}
</script>
