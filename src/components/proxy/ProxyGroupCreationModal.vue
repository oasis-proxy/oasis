<template>
  <BaseModal :visible="visible" :title="$t('pgcmTitle')" @close="emit('close')">
    <div class="d-flex flex-column gap-3">
      <!-- Name Input -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblName') }}</span>
        <div class="relative group w-100">
          <input
            v-model="name"
            ref="nameInput"
            autofocus
            class="w-100 rounded-lg border ui-input px-3 text-xs transition-all shadow-sm"
            style="min-width: 100%; width: 100%; max-width: 100% !important"
            :placeholder="$t('pgcmPlaceholderName')"
            type="text"
            maxlength="30"
            @keydown.enter="handleConfirm"
          />
        </div>
        <p class="text-xs ui-text-secondary m-0">{{ $t('pgcmDescName') }}</p>
      </label>
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
import { ref, computed, nextTick, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const name = ref('')
const nameInput = ref(null)

// Reset form when opening
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      name.value = ''
      nextTick(() => {
        if (nameInput.value) {
          nameInput.value.focus()
        }
      })
    }
  }
)

const isValid = computed(() => {
  return name.value.trim() !== ''
})

const handleConfirm = () => {
  if (!isValid.value) return
  emit('create', {
    name: name.value.trim()
  })
  emit('close')
}
</script>
