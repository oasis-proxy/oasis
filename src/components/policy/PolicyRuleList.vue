<template>
  <section class="mt-4">
    <div class="ui-card-label">
      <span class="label-text">{{ title }}</span>
      <div class="d-flex align-items-center gap-2">
        <button
          v-if="!isReject"
          @click="openSmartMerge"
          class="ui-button-icon sm"
          :title="$t('smmmTitle')"
        >
          <i class="bi bi-diagram-3 ui-icon-md"></i>
        </button>
        <button
          @click="showAutoProxyPreview = true"
          class="ui-button-icon sm"
          :title="$t('appmBtnPreview')"
        >
          <i class="bi bi-filetype-txt ui-icon-md"></i>
        </button>
        <button
          v-if="!isReject"
          @click="$emit('batch-replace')"
          class="ui-button-icon sm"
          :title="$t('btnBatchReplace')"
        >
          <i class="bi bi-list-check ui-icon-md"></i>
        </button>
        <button
          @click="addRule()"
          class="ui-button-icon sm"
          :title="isReject ? $t('btnAddRejectRule') : $t('btnAddRule')"
        >
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>
    </div>

    <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
      <div class="ui-card-header">
        <div style="width: 4%"></div>
        <div style="width: 8%" class="text-center">{{ $t('lblValid') }}</div>
        <div style="width: 16%">{{ $t('lblType') }}</div>
        <div style="width: 44%">{{ $t('lblPattern') }}</div>
        <div style="width: 20%">{{ $t('lblProxy') }}</div>
        <div style="width: 8%" class="text-center">{{ $t('lblAction') }}</div>
      </div>

      <div v-if="localRules && localRules.length > 0">
        <template v-for="(rule, index) in localRules" :key="rule.id || index">
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
            :rule="localRules[index]"
            :dragOver="dragOverIndex === index"
            :isDuplicate="duplicateIndices.has(index)"
            :hasError="!!validationErrors[index]"
            :isFetching="fetchingRuleSetIndex === index"
            :proxies="!isReject ? config?.proxies : undefined"
            :proxyGroups="!isReject ? config?.proxyGroups : undefined"
            @update:rule="localRules[index] = $event"
            @dragstart="handleDragStart($event, index)"
            @dragover="handleDragOver($event, index)"
            @drop="handleDrop($event, index)"
            @dragend="handleDragEnd"
            @type-change="handleRuleTypeChange(index, rule)"
            @open-ruleset="openRuleSetModal(rule, index)"
            @focus="focusedIndex = index"
            @blur="handleRuleBlur(index, rule)"
            @add-below="insertRuleBelow(index)"
            @add-divider-below="insertDividerBelow(index)"
            @delete="deleteRule(index)"
          >
            <template #proxy-select>
              <div
                v-if="isReject"
                class="w-100 rounded border border-subtle ui-input ui-input-sm ui-bg-subtle ui-text-secondary text-xs px-2 d-flex align-items-center cursor-not-allowed"
              >
                {{ $t('lblReject') || 'Reject' }}
              </div>
              <ProxySelect
                v-else
                v-model="rule.proxyId"
                :proxies="config?.proxies"
                :proxyGroups="config?.proxyGroups"
                size="sm"
                class="w-100 py-0 px-1.5"
              />
            </template>
          </PolicyRuleRow>
        </template>
      </div>
      <div
        v-else
        class="p-2 d-flex align-items-center justify-content-center"
        style="min-height: 44px"
      >
        <p class="text-xs ui-text-secondary m-0">
          {{ isReject ? $t('msgNoRejectRules') : $t('msgNoRulesDefined') }}
        </p>
      </div>

      <div v-if="!isReject && showDefaultStrategy" class="ui-card-footer">
        <div style="width: 28%"></div>
        <div style="width: 44%" class="d-flex align-items-center justify-content-end px-2 gap-2">
          <i class="bi bi-arrow-return-right"></i> {{ $t('lblDefaultStrategy') }}
        </div>
        <div style="width: 20%">
          <ProxySelect
            :modelValue="defaultProfileId"
            @update:modelValue="$emit('update:defaultProfileId', $event)"
            :proxies="config?.proxies"
            :proxyGroups="config?.proxyGroups"
            size="sm"
            class="w-100 py-0 px-1.5"
          />
        </div>
        <div style="width: 8%"></div>
      </div>
    </div>

    <!-- Modals -->
    <RuleSetContentModal
      :show="showRuleSetModal"
      :content="selectedRuleSetContent"
      :url="selectedRuleSetUrl"
      :lastUpdated="selectedRuleSetLastUpdated"
      @close="showRuleSetModal = false"
      @update="handleRuleSetUpdate"
    />
    <AutoProxyPreviewModal
      :visible="showAutoProxyPreview"
      :rules="localRules"
      :proxies="config?.proxies"
      :proxyGroups="config?.proxyGroups"
      :hideProxyFilter="isReject"
      @close="showAutoProxyPreview = false"
    />
    <SmartRulesMergeModal
      v-if="!isReject"
      :visible="showSmartMerge"
      :policies="config?.policies || {}"
      :sourceRules="smartMergeSourceRules"
      :proxies="config?.proxies"
      :proxyGroups="config?.proxyGroups"
      :forcedTargetId="policyId"
      :domainOptimize="true"
      @close="showSmartMerge = false"
      @merge="handleSmartMerge"
    />
  </section>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { t } from '../../common/i18n'
import { toast } from '../../options/utils/toast'
import { decodeRuleSetContent } from '../../common/ruleset'
import { usePolicyRules } from '../../composables/usePolicyRules'

// Components
import RuleSetContentModal from '../rule/RuleSetContentModal.vue'
import AutoProxyPreviewModal from './AutoProxyPreviewModal.vue'
import SmartRulesMergeModal from '../rule/SmartRulesMergeModal.vue'
import ProxySelect from '../proxy/ProxySelect.vue'
import PolicyRuleRow from './PolicyRuleRow.vue'
import PolicyDividerRow from './PolicyDividerRow.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  isReject: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    required: true
  },
  policyId: {
    type: String,
    required: true
  },
  showDefaultStrategy: {
    type: Boolean,
    default: false
  },
  defaultProfileId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:defaultProfileId', 'batch-replace'])

const localRules = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const {
  validationErrors,
  focusedIndex,
  fetchingRuleSetIndex,
  duplicateIndices,
  validateRule,
  revalidateAll: revalidateAllRules,
  addRule,
  insertRuleBelow,
  insertDividerBelow,
  deleteRule,
  fetchRuleSetContent,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd
} = usePolicyRules(localRules, {
  defaultProxyId: props.isReject ? 'reject' : 'direct'
})

const showAutoProxyPreview = ref(false)
const showSmartMerge = ref(false)
const showRuleSetModal = ref(false)

const smartMergeSourceRules = ref([])
const selectedRuleSetContent = ref('')
const selectedRuleSetUrl = ref('')
const selectedRuleSetLastUpdated = ref(null)
const selectedRuleSetIndex = ref(null)

const editingDividerIndex = ref(null)
const editingDividerLabel = ref('')

watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      revalidateAllRules()
    })
  },
  { deep: true, immediate: true }
)

const handleRuleTypeChange = (index, rule) => {
  validateRule(index, rule)
}

const handleRuleBlur = (index, rule) => {
  focusedIndex.value = null
  validateRule(index, rule)
}

const openRuleSetModal = (rule, index) => {
  if (!rule.ruleSet?.content) {
    toast.warning('No content available for this RuleSet yet.')
    fetchRuleSetContent(index, rule.pattern)
    return
  }
  selectedRuleSetContent.value = decodeRuleSetContent(rule.ruleSet.content)
  selectedRuleSetUrl.value = rule.ruleSet.url || rule.pattern
  selectedRuleSetLastUpdated.value = rule.ruleSet.lastUpdated
  selectedRuleSetIndex.value = index
  showRuleSetModal.value = true
}

const handleRuleSetUpdate = async () => {
  if (selectedRuleSetIndex.value !== null) {
    const index = selectedRuleSetIndex.value
    const rule = localRules.value[index]
    const url = rule.ruleSet?.url || rule.pattern
    if (!url) return

    await fetchRuleSetContent(index, url, true)

    const updated = localRules.value[index]
    if (updated.ruleSet?.content) {
      selectedRuleSetContent.value = decodeRuleSetContent(updated.ruleSet.content)
      selectedRuleSetLastUpdated.value = updated.ruleSet.lastUpdated
    }
  }
}

const startEditDivider = (index, label) => {
  editingDividerIndex.value = index
  editingDividerLabel.value = label || t('lblNewSection')
}

const saveDividerLabel = (index) => {
  if (editingDividerIndex.value === index) {
    localRules.value[index].label = editingDividerLabel.value
    editingDividerIndex.value = null
  }
}

const openSmartMerge = () => {
  if (props.isReject) return
  smartMergeSourceRules.value = localRules.value
    .filter(
      (r) =>
        r.type !== 'divider' &&
        r.ruleType === 'wildcard' &&
        r.pattern &&
        !r.pattern.includes('*') &&
        !r.pattern.startsWith('.')
    )
    .map((r) => ({ ruleType: r.ruleType, pattern: r.pattern, proxyId: r.proxyId || 'direct' }))
  showSmartMerge.value = true
}

const handleSmartMerge = ({ conflictMode, rules: mergedRules }) => {
  const sourcePatterns = new Set(smartMergeSourceRules.value.map((r) => r.pattern))
  let updatedRules = localRules.value.filter((r) => {
    if (r.type === 'divider') return true
    if (r.ruleType !== 'wildcard') return true
    if (!r.pattern || r.pattern.includes('*') || r.pattern.startsWith('.')) return true
    return !sourcePatterns.has(r.pattern)
  })

  const newRules = []
  const indicesToRemove = new Set()
  mergedRules.forEach((mr) => {
    const existingIndex = updatedRules.findIndex(
      (r) => r.type !== 'divider' && r.ruleType === mr.ruleType && r.pattern === mr.pattern
    )
    if (existingIndex !== -1) {
      if (conflictMode === 'overwrite') {
        indicesToRemove.add(existingIndex)
        newRules.push({
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'rule',
          ruleType: mr.ruleType,
          pattern: mr.pattern,
          proxyId: mr.proxyId,
          valid: true
        })
      }
    } else {
      newRules.push({
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'rule',
        ruleType: mr.ruleType,
        pattern: mr.pattern,
        proxyId: mr.proxyId,
        valid: true
      })
    }
  })
  if (indicesToRemove.size > 0) {
    updatedRules = updatedRules.filter((_, i) => !indicesToRemove.has(i))
  }
  if (newRules.length > 0) {
    updatedRules = [...newRules, ...updatedRules]
  }
  localRules.value = updatedRules
  showSmartMerge.value = false
  const diff = smartMergeSourceRules.value.length - mergedRules.length
  if (diff > 0) toast.success(t('smmmMsgOptimized', [diff]))
  else toast.success(t('msgPolicyMerged'))
}

// Expose internal revalidation if needed (optional)
defineExpose({
  revalidateAllRules
})
</script>
