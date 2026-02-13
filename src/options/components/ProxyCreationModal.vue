<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('pcmTitle')" 
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
        <!-- Name Input -->
        <label class="d-flex flex-column gap-2 w-100">
            <span class="ui-text-primary text-xs font-medium leading-none">{{ $t('lblName') }}</span>
            <div class="relative group w-100">
            <input 
                v-model="name"
                ref="nameInput"
                autofocus 
                class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                :placeholder="$t('pcmPlaceholderName')" 
                type="text"
                maxlength="30"
                @keydown.enter="handleConfirm"
            />
            </div>
            <p class="text-xs text-slate-500 m-0">{{ $t('pcmDescName') }}</p>
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
        {{ $t('btnConfirm') }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const name = ref('')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    name.value = ''
    nextTick(() => {
       if (nameInput.value) {
           nameInput.value.focus()
       }
    })
  }
})

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
