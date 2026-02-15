<template>
  <BaseModal
    :visible="visible"
    :title="title || $t('prmTitle')"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
      
      <!-- Original Name (Readonly) -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('prmLabelOriginal') }}</span>
        <div class="ui-input px-3 rounded-lg border text-xs ui-text-secondary d-flex align-items-center overflow-hidden" :title="currentName">
          <span class="text-truncate flex-grow-1">{{ currentName }}</span>
        </div>
      </label>

      <!-- New Name Input -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('prmLabelNew') }}</span>
        <div class="relative group w-100">
          <input 
            v-model="newName"
            ref="nameInput"
            autofocus 
            class="w-100 rounded-lg border ui-input px-3 text-xs transition-all shadow-sm"
            style="min-width: 100%; width: 100%; max-width: 100% !important;" 
            :placeholder="$t('prmPlaceholder')" 
            type="text"
            maxlength="40"
            @keydown.enter="handleConfirm"
          />
        </div>
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
        {{ $t('btnSave') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  visible: Boolean,
  currentName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const newName = ref('')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    newName.value = props.currentName
    nextTick(() => {
       if (nameInput.value) {
           nameInput.value.focus()
           nameInput.value.select()
       }
    })
  }
})

const isValid = computed(() => {
  return newName.value.trim() !== '' && newName.value.trim() !== props.currentName
})

const handleConfirm = () => {
    if (!isValid.value) return
    emit('save', newName.value.trim())
    emit('close')
}
</script>
