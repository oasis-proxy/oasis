<template>
  <BaseModal :visible="visible" :title="$t('smmmTitle')" maxWidth="800px" @close="emit('close')">
    <div class="d-flex flex-column gap-4 h-100" style="max-height: 70vh">
      <!-- Section 1: Target Policy -->
      <section>
        <h4
          class="text-xs fw-bold ui-text-secondary text-uppercase mb-2"
          style="letter-spacing: 0.1em"
        >
          {{ $t('smmmSectionTarget') }}
        </h4>
        <select
          v-model="targetPolicyId"
          :disabled="!!forcedTargetId"
          :class="{ 'bg-subtle ui-text-secondary cursor-not-allowed': !!forcedTargetId }"
          class="form-select ui-input w-100 rounded-lg border px-3 text-xs shadow-sm"
        >
          <option value="">{{ $t('armPlaceholderTarget') }}</option>
          <option v-for="p in availablePolicies" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </section>

      <!-- Section 2: Source Rules (Read-only) -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h4
            class="text-xs fw-bold ui-text-secondary text-uppercase m-0"
            style="letter-spacing: 0.1em"
          >
            {{ $t('smmmSectionSource') }}
          </h4>
          <span class="text-xs ui-button-secondary px-2 py-1 rounded-pill"
            >{{ sourceRules.length }} rules</span
          >
        </div>
        <div class="rounded-lg border border-subtle overflow-hidden shadow-sm">
          <div class="ui-card-header">
            <div style="width: 30%">{{ $t('lblType') }}</div>
            <div style="width: 50%">{{ $t('lblPattern') }}</div>
            <div style="width: 20%">{{ $t('lblProxy') }}</div>
          </div>
          <div class="overflow-y-auto custom-scrollbar ui-bg-card" style="max-height: 12rem">
            <div
              v-for="(rule, idx) in sourceRules"
              :key="idx"
              class="d-flex align-items-center gap-1 px-2 py-2 opacity-70"
            >
              <div style="width: 30%">
                <input
                  type="text"
                  class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 bg-subtle"
                  :value="
                    $t('opt' + (rule.ruleType.charAt(0).toUpperCase() + rule.ruleType.slice(1)))
                  "
                  readonly
                />
              </div>
              <div style="width: 50%">
                <input
                  type="text"
                  class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 font-monospace bg-subtle"
                  :value="rule.pattern"
                  readonly
                />
              </div>
              <div style="width: 20%">
                <input
                  type="text"
                  class="form-control ui-input ui-input-sm w-100 rounded border py-0 px-2 text-muted bg-subtle"
                  :value="getProxyLabel(rule.proxyId)"
                  readonly
                />
              </div>
            </div>
            <div v-if="sourceRules.length === 0" class="p-4 text-center text-xs ui-text-secondary">
              {{ $t('smmmMsgNoSource') }}
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Merged Preview -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h4
            class="text-xs fw-bold ui-text-secondary text-uppercase m-0"
            style="letter-spacing: 0.1em"
          >
            {{ $t('smmmSectionPreview') }}
          </h4>
          <div class="d-flex align-items-center gap-2">
            <span
              class="text-xs ui-text-secondary"
              v-if="mergedRules.length < sourceRules.length"
              >{{ $t('smmmMsgOptimized', [sourceRules.length - mergedRules.length]) }}</span
            >
            <span class="text-xs ui-button-secondary px-2 py-1 rounded-pill"
              >{{ mergedRules.length }} rules</span
            >
          </div>
        </div>
        <div class="rounded-lg border border-subtle overflow-hidden shadow-sm">
          <div class="ui-card-header">
            <div style="width: 30%">{{ $t('lblType') }}</div>
            <div style="width: 42%">{{ $t('lblPattern') }}</div>
            <div style="width: 20%">{{ $t('lblProxy') }}</div>
            <div style="width: 8%" class="text-center">{{ $t('lblAction').toUpperCase() }}</div>
          </div>
          <div class="overflow-y-auto custom-scrollbar ui-bg-card" style="max-height: 16rem">
            <RulePreviewRow
              v-for="(rule, idx) in mergedRules"
              :key="idx"
              :rule="rule"
              :proxyList="proxyList"
              :lockedProxy="lockedProxy"
              :allowReject="lockedProxy === 'reject'"
              @remove="removeMergedRule(idx)"
            />
            <div v-if="mergedRules.length === 0" class="p-4 text-center text-xs ui-text-secondary">
              {{ $t('smmmMsgNoMerge') }}
            </div>
          </div>
        </div>
        <p class="text-xs ui-text-secondary mt-2 mb-0">{{ $t('smmmDescOptimization') }}</p>
      </section>

      <!-- Section 4: Conflict Resolution -->
      <section v-if="!hideConflict">
        <h4
          class="text-xs fw-bold ui-text-secondary text-uppercase mb-2"
          style="letter-spacing: 0.1em"
        >
          {{ $t('armLabelConflict') }}
        </h4>
        <ConflictModeSelector v-model="conflictMode" />
      </section>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary transition-colors"
      >
        {{ $t('btnCancel') }}
      </button>
      <button
        @click="handleConfirm"
        :disabled="!isValid"
        class="px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary shadow-lg transition-colors disabled:opacity-50"
      >
        {{ $t('smmmBtnMerge', [mergedRules.length]) }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { t } from '../../common/i18n'
import BaseModal from '../base/BaseModal.vue'
import ConflictModeSelector from '../common/ConflictModeSelector.vue'
import RulePreviewRow from './RulePreviewRow.vue'
import { useRuleMerge } from '../../composables/useRuleMerge'

const props = defineProps({
  visible: Boolean,
  policies: Object,
  sourceRules: Array,
  forcedTargetId: String,
  proxies: Object,
  proxyGroups: Object,
  domainOptimize: Boolean,
  lockedProxy: String,
  hideConflict: Boolean
})

const emit = defineEmits(['close', 'merge'])

const {
  targetPolicyId,
  conflictMode,
  mergedRules,
  proxyList,
  availablePolicies,
  isValid,
  handleConfirm,
  removeMergedRule
} = useRuleMerge(props, emit)

const getProxyLabel = (id) => {
  if (id === 'direct') return t('directConnect')
  if (id === 'reject') return t('lblReject')
  const p = props.proxies && props.proxies[id]
  if (p) return p.label || p.name || id
  const g = props.proxyGroups && props.proxyGroups[id]
  if (g) return g.name || id
  return id
}
</script>
