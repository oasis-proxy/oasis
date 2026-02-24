<template>
  <BaseDetailView :title="$t('tempTitle')" maxWidth="6xl">
    <template #actions>
      <button
        @click="loadData"
        class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
      >
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
      </button>

      <button
        @click="saveChanges"
        :disabled="!isDirty"
        class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
      >
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
      </button>
    </template>

    <template #default>
      <!-- Rules Section -->
      <section v-if="isTemporaryRulesActive">
        <div class="ui-card-label">
          <span class="label-text">{{ $t('tempTitle') }}</span>
          <div class="d-flex align-items-center gap-2">
            <button @click="addRule" class="ui-button-icon sm" :title="$t('btnAddRule')">
              <i class="bi bi-plus-lg text-sm"></i>
            </button>
            <button
              @click="openSmartMerge"
              :disabled="rules.length === 0"
              class="ui-button-icon sm"
              :title="$t('tempBtnMerge')"
            >
              <i class="bi bi-diagram-3-fill" style="font-size: 12px"></i>
            </button>
            <button
              @click="acceptAll"
              :disabled="rules.length === 0"
              class="ui-button-icon sm"
              :title="$t('tempBtnAcceptAll')"
            >
              <i class="bi bi-check-all" style="font-size: 16px"></i>
            </button>
            <button
              @click="clearAll"
              :disabled="rules.length === 0"
              class="ui-button-icon sm"
              :title="$t('tempBtnClearAll')"
            >
              <i class="bi bi-trash ui-icon-sm"></i>
            </button>
          </div>
        </div>

        <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
          <!-- Table Header -->
          <div class="ui-card-header">
            <div style="width: 8%" class="text-center">{{ $t('lblValid') }}</div>
            <div style="width: 16%">{{ $t('lblType') }}</div>
            <div style="width: 48%">{{ $t('lblPattern') }}</div>
            <div style="width: 20%">{{ $t('lblProxy') }}</div>
            <div style="width: 8%" class="text-center">{{ $t('lblAction') }}</div>
          </div>

          <!-- Rules -->
          <div v-if="rules && rules.length > 0">
            <div v-for="(rule, index) in rules" :key="rule.id || index">
              <!-- Rule Row -->
              <div
                :class="[
                  'd-flex align-items-center gap-1 p-2 transition-colors',
                  'hover:bg-hover',
                  !rule.valid ? 'opacity-50' : ''
                ]"
              >
                <div style="width: 8%" class="d-flex justify-content-center">
                  <div
                    class="form-check form-switch m-0 d-flex align-items-center justify-content-center"
                  >
                    <input
                      class="form-check-input align-self-start"
                      style="cursor: pointer"
                      type="checkbox"
                      v-model="rule.valid"
                    />
                  </div>
                </div>
                <div style="width: 16%">
                  <select
                    v-model="rule.ruleType"
                    class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5"
                    style="max-width: none"
                    @change="validateRule(index, rule)"
                  >
                    <option value="wildcard">{{ $t('optWildcard') }}</option>
                    <option value="regex">{{ $t('optRegex') }}</option>
                    <option value="ip">{{ $t('optIP') }}</option>
                    <option value="ruleset">{{ $t('optRuleSet') }}</option>
                  </select>
                </div>
                <div style="width: 48%">
                  <input
                    v-model="rule.pattern"
                    type="text"
                    :placeholder="getPlaceholder(rule.ruleType)"
                    class="form-control ui-input ui-input-sm w-100 mw-100 rounded border py-0 px-2 font-mono"
                    :style="`${validationErrors[index] ? ' border-color: var(--ui-danger) !important;' : ''}`"
                    @blur="validateRule(index, rule)"
                  />
                </div>
                <div style="width: 20%">
                  <ProxySelect
                    v-model="rule.proxyId"
                    :proxies="config?.proxies"
                    :proxyGroups="config?.proxyGroups"
                    size="sm"
                    class="w-100 py-0 px-1.5"
                    style="max-width: none"
                  />
                </div>
                <div style="width: 8%" class="d-flex align-items-center justify-content-around">
                  <button
                    @click="acceptRule(index)"
                    class="ui-button-icon text-success hover:text-success"
                    :title="$t('tooltipAcceptMove')"
                  >
                    <i class="bi bi-check-lg ui-icon-sm"></i>
                  </button>
                  <button
                    @click="deleteRule(index)"
                    class="ui-button-icon p-0.5"
                    :title="$t('btnDelete')"
                  >
                    <i class="bi bi-trash ui-icon-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="p-2 d-flex flex-column align-items-center justify-content-center text-center"
          >
            <p class="text-sm font-medium ui-text-primary m-0">{{ $t('tempMsgNoRules') }}</p>
            <p class="text-xs ui-text-secondary mt-1 max-w-xs m-0">
              {{ $t('tempMsgNoRulesDesc') }}
            </p>
          </div>
        </div>
      </section>

      <section v-else class="text-center py-10">
        <h3 class="text-lg font-semibold ui-text-primary mb-2">{{ $t('tempTitleUnavailable') }}</h3>
        <p class="text-sm ui-text-secondary">
          {{ $t('tempMsgUnavailable') }}
        </p>
      </section>

      <!-- Modals -->
      <AcceptRulesModal
        :visible="showAcceptModal"
        :policies="config?.policies || {}"
        :ruleCount="selectedRulesForMerge.length"
        :forcedTargetId="activeAutoPolicyId"
        @close="showAcceptModal = false"
        @confirm="handleAcceptConfirm"
      />

      <SmartRulesMergeModal
        :visible="showSmartMergeModal"
        :policies="config?.policies || {}"
        :sourceRules="smartMergeRules"
        :proxies="config?.proxies || {}"
        :proxyGroups="config?.proxyGroups || {}"
        :forcedTargetId="activeAutoPolicyId"
        :domainOptimize="true"
        @close="showSmartMergeModal = false"
        @merge="handleSmartMergeConfirm"
      />
    </template>
  </BaseDetailView>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import { useTempRules } from '../../composables/useTempRules'
import AcceptRulesModal from '../../components/policy/AcceptRulesModal.vue'
import SmartRulesMergeModal from '../../components/rule/SmartRulesMergeModal.vue'
import ProxySelect from '../../components/proxy/ProxySelect.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'

const {
  rules,
  config,
  validationErrors,
  isDirty,
  activeAutoPolicyId,
  isTemporaryRulesActive,
  showAcceptModal,
  showSmartMergeModal,
  selectedRulesForMerge,
  smartMergeRules,
  loadData,
  validateRule,
  saveChanges,
  addRule,
  deleteRule,
  clearAll,
  executeMerge,
  mergeSourceIndices
} = useTempRules()

// "Accept" actions
const acceptRule = (index) => {
  mergeSourceIndices.value = [index]
  showAcceptModal.value = true
}

const acceptAll = () => {
  mergeSourceIndices.value = [] // Empty implies all
  showAcceptModal.value = true
}

const openSmartMerge = () => {
  // Only select valid wildcard rules for smart merge
  // This ensures only these rules are removed after merge, preserving other rules (IP, Ruleset, etc.)
  mergeSourceIndices.value = rules.value
    .map((r, i) => ({ ...r, index: i }))
    .filter((r) => r.ruleType === 'wildcard' && r.pattern && r.pattern.trim())
    .map((r) => r.index)

  showSmartMergeModal.value = true
}

const handleAcceptConfirm = async ({ targetId, conflictMode }) => {
  await executeMerge(
    targetId,
    conflictMode,
    JSON.parse(JSON.stringify(selectedRulesForMerge.value))
  )
}

const handleSmartMergeConfirm = async ({ targetId, conflictMode, rules: optimizedRules }) => {
  await executeMerge(targetId, conflictMode, optimizedRules)
}

onMounted(loadData)

// Register unsaved changes checker
onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(t('pacMsgUnsaved'))
      return true
    }
    return false
  })
})

onBeforeUnmount(unregisterUnsavedChangesChecker)

const getPlaceholder = (type) => {
  switch (type) {
    case 'wildcard':
      return t('phWildcard')
    case 'regex':
      return t('phRegex')
    case 'ip':
      return t('phIP')
    case 'ruleset':
      return t('phRuleSet')
    default:
      return t('phDefaultPattern')
  }
}
</script>
