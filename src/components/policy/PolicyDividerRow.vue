<template>
  <div
    :class="[
      'd-flex align-items-center gap-1 transition-colors',
      dragOver ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover-bg-subtle'
    ]"
    style="padding: 0px 8px; min-height: 20px"
    @dragover.prevent="$emit('dragover', $event)"
    @drop="$emit('drop', $event)"
    @dragenter.prevent
  >
    <div style="width: 4%" class="d-flex justify-content-center">
      <i
        class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm"
        style="cursor: grab"
        draggable="true"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
      ></i>
    </div>
    <div class="flex-1 d-flex align-items-center gap-2">
      <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border)"></div>
      <span
        v-if="!isEditing"
        @dblclick="$emit('edit')"
        class="text-xs fw-semibold ui-text-secondary text-uppercase cursor-pointer transition-colors px-2 d-flex align-items-center gap-2"
        style="user-select: none; line-height: 1; letter-spacing: 0.1em"
        :title="$t('descEditSection')"
      >
        {{ rule.label || $t('lblNewSection') }}
        <i class="bi bi-pencil-square ui-icon-xs opacity-50"></i>
      </span>
      <input
        v-else
        ref="input"
        :value="editingLabel"
        @input="$emit('update:editingLabel', $event.target.value)"
        @blur="$emit('save')"
        @keyup.enter="$emit('save')"
        @keyup.esc="$emit('cancel')"
        class="form-control ui-input ui-input-sm fw-semibold text-uppercase text-center w-auto mx-auto"
        style="min-width: 150px; padding: 2px 8px; letter-spacing: 0.1em"
      />
      <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border)"></div>
    </div>
    <div style="width: 8%" class="d-flex align-items-center justify-content-around">
      <button
        @click="$emit('add-rule-below')"
        class="ui-button-icon"
        :title="$t('btnAddRuleBelow')"
      >
        <i class="bi bi-plus-lg text-xs"></i>
      </button>
      <button
        @click="$emit('add-divider-below')"
        class="ui-button-icon"
        :title="$t('btnAddDividerBelow')"
      >
        <i class="bi bi-inboxes-fill text-xs"></i>
      </button>
      <button @click="$emit('delete')" class="ui-button-icon" :title="$t('btnDelete')">
        <i class="bi bi-trash text-xs"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  rule: Object,
  dragOver: Boolean,
  isEditing: Boolean,
  editingLabel: String
})

defineEmits([
  'dragstart',
  'dragover',
  'drop',
  'dragend',
  'edit',
  'update:editingLabel',
  'save',
  'cancel',
  'add-rule-below',
  'add-divider-below',
  'delete'
])

const input = ref(null)

watch(
  () => props.isEditing,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        if (input.value) input.value.focus()
      })
    }
  }
)
</script>
