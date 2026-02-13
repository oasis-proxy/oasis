<template>
  <BaseModal
    :visible="visible"
    :title="title"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
      
      <!-- Original Name (Readonly) -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('prmLabelOriginal') }}</span>
        <div class="px-3 py-2 rounded-lg bg-subtle  border border-subtle  text-xs text-slate-500">
          {{ currentName }}
        </div>
      </label>

      <!-- New Name Input -->
      <label class="d-flex flex-column gap-2 w-100">
        <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('prmLabelNew') }}</span>
        <div class="relative group w-100">
          <input 
            v-model="newName"
            ref="nameInput"
            autofocus 
            class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
            style="min-width: 100%; width: 100%; max-width: 100% !important;" 
            :placeholder="$t('prmPlaceholder')" 
            type="text"
            maxlength="30"
            @keydown.enter="handleConfirm"
          />
        </div>
      </label>

    </div>

    <template #footer>
      <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors focus:outline-none"
      >
        {{ $t('btnCancel') }}
      </button>
      <button 
        @click="handleConfirm"
        :disabled="!isValid"
        class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('btnSave') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  visible: Boolean,
  currentName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: () => chrome.i18n.getMessage('prmTitle')
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
