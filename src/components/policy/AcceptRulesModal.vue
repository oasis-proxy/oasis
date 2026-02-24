<template>
  <BaseModal :visible="visible" :title="$t('armTitle')" maxWidth="480px" @close="emit('close')">
    <div class="d-flex flex-column gap-3">
      <p class="text-sm ui-text-secondary m-0">
        {{ $t('armDesc', [ruleCount]) }}
      </p>

      <!-- Target Policy -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('armLabelTarget') }}</span>
        <select
          v-model="targetPolicyId"
          :disabled="!!forcedTargetId"
          :class="{ 'bg-subtle  ui-text-secondary cursor-not-allowed': !!forcedTargetId }"
          class="form-select ui-input w-100 rounded-lg border px-3 text-xs transition-all shadow-sm"
          style="max-width: 100%"
        >
          <option value="">{{ $t('armPlaceholderTarget') }}</option>
          <option
            v-for="policyOption in availablePolicies"
            :key="policyOption.id"
            :value="policyOption.id"
          >
            {{ policyOption.name }}
          </option>
        </select>
      </label>

      <!-- Conflict Resolution -->
      <div class="d-flex flex-column gap-2">
        <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('armLabelConflict') }}</span>
        <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr">
          <!-- Ignore Option -->
          <label
            class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="
              conflictMode === 'ignore'
                ? 'border-primary bg-primary-subtle'
                : 'ui-card hover:border-default'
            "
          >
            <input
              v-model="conflictMode"
              v-show="false"
              class="sr-only"
              name="conflict-mode"
              type="radio"
              value="ignore"
            />
            <span class="d-flex flex-1">
              <span class="d-flex flex-column">
                <span
                  class="d-block text-xs fw-medium mb-1"
                  :class="conflictMode === 'ignore' ? 'text-primary' : 'ui-text-primary'"
                  >{{ $t('armOptIgnore') }}</span
                >
                <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{
                  $t('armDescIgnore')
                }}</span>
              </span>
            </span>
            <i
              v-if="conflictMode === 'ignore'"
              class="bi bi-check-circle-fill text-primary fs-5 position-absolute top-50 end-0 translate-middle-y me-3"
            ></i>
          </label>

          <!-- Overwrite Option -->
          <label
            class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="
              conflictMode === 'overwrite'
                ? 'border-primary bg-primary-subtle'
                : 'ui-card hover:border-default'
            "
          >
            <input
              v-model="conflictMode"
              v-show="false"
              class="sr-only"
              name="conflict-mode"
              type="radio"
              value="overwrite"
            />
            <span class="d-flex flex-1">
              <span class="d-flex flex-column">
                <span
                  class="d-block text-xs fw-medium mb-1"
                  :class="conflictMode === 'overwrite' ? 'text-primary' : 'ui-text-primary'"
                  >{{ $t('armOptOverwrite') }}</span
                >
                <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{
                  $t('armDescOverwrite')
                }}</span>
              </span>
            </span>
            <i
              v-if="conflictMode === 'overwrite'"
              class="bi bi-check-circle-fill text-primary fs-5 position-absolute top-50 end-0 translate-middle-y me-3"
            ></i>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-subtle transition-colors"
      >
        {{ $t('btnCancel') }}
      </button>
      <button
        @click="handleConfirm"
        :disabled="!isValid"
        class="px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('btnConfirm') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../../common/i18n'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  visible: Boolean,
  policies: {
    type: Object,
    default: () => ({})
  },
  ruleCount: {
    type: Number,
    default: 0
  },
  forcedTargetId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

const targetPolicyId = ref('')
const conflictMode = ref('ignore')

const availablePolicies = computed(() => {
  return Object.values(props.policies || {})
    .filter((p) => p.type !== 'pac') // Only auto policies? Or allow any?
    .map((p) => ({ id: p.id, name: p.name || t('unnamedPolicy') }))
})

const isValid = computed(() => {
  return !!targetPolicyId.value
})

const handleConfirm = () => {
  if (isValid.value) {
    emit('confirm', {
      targetId: targetPolicyId.value,
      conflictMode: conflictMode.value
    })
    reset()
  }
}

const reset = () => {
  targetPolicyId.value = ''
  conflictMode.value = 'ignore'
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      reset()
      if (props.forcedTargetId) {
        targetPolicyId.value = props.forcedTargetId
      } else if (availablePolicies.value.length > 0 && !targetPolicyId.value) {
        targetPolicyId.value = availablePolicies.value[0].id
      }
    } else {
      reset()
    }
  }
)
</script>
