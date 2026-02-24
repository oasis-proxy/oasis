<template>
  <div
    class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors"
  >
    <div class="d-flex items-start">
      <div>
        <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRulePriority') }}</p>
        <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descRulePriority') }}</p>
      </div>
    </div>

    <div class="d-flex align-items-center gap-1">
      <template v-for="(cat, idx) in modelValue" :key="cat">
        <span v-if="idx > 0" class="ui-text-tertiary" style="font-size: 10px">
          <i class="bi bi-chevron-right"></i>
        </span>
        <div
          class="ui-tag cursor-move d-flex align-items-center gap-1"
          :class="priorityTagClass(cat)"
          draggable="true"
          @dragstart="onDragStart($event, idx)"
          @dragover.prevent="onDragOver($event, idx)"
          @drop.prevent="onDrop($event, idx)"
          @dragend="onDragEnd"
          :style="dragOverIdx === idx ? 'opacity: 0.4;' : ''"
          style="padding: 3px 8px; font-size: 11px; cursor: grab"
        >
          <i class="bi bi-grip-vertical" style="font-size: 10px"></i>
          {{ priorityLabel(cat) }}
        </div>
      </template>
      <button
        class="ui-button-icon ms-1"
        :title="$t('btnReset')"
        @click="resetPriority"
        :disabled="isDefault"
      >
        <i class="bi bi-arrow-counterclockwise ui-icon-sm"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue'])

const dragIdx = ref(null)
const dragOverIdx = ref(null)
const DEFAULT_PRIORITY = ['reject', 'temp', 'normal']

const isDefault = computed(
  () => JSON.stringify(props.modelValue) === JSON.stringify(DEFAULT_PRIORITY)
)

function priorityLabel(cat) {
  const labels = { reject: 'Reject', normal: 'Normal', temp: 'Temporary' }
  // Labels should ideally be translated in the parent or via $t if available globally
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function priorityTagClass(cat) {
  const classes = { reject: 'ui-tag-danger', normal: 'ui-tag-primary', temp: 'ui-tag-warning' }
  return classes[cat] || 'ui-tag-default'
}

function onDragStart(e, idx) {
  dragIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e, idx) {
  dragOverIdx.value = idx
}

function onDrop(e, targetIdx) {
  const sourceIdx = dragIdx.value
  if (sourceIdx === null || sourceIdx === targetIdx) return
  const arr = [...props.modelValue]
  const [moved] = arr.splice(sourceIdx, 1)
  arr.splice(targetIdx, 0, moved)
  emit('update:modelValue', arr)
  resetDragState()
}

function onDragEnd() {
  resetDragState()
}

function resetDragState() {
  dragIdx.value = null
  dragOverIdx.value = null
}

function resetPriority() {
  emit('update:modelValue', [...DEFAULT_PRIORITY])
}
</script>
