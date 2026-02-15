<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('pocmTitle')" 
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
                class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs placeholder:text-slate-400 transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                :placeholder="$t('pocmPlaceholderName')" 
                type="text"
                maxlength="40"
                @keydown.enter="handleConfirm"
            />
            </div>
            <p class="text-xs text-slate-500 m-0">{{ $t('pocmDescName') }}</p>
        </label>

        <!-- Type Selector -->
        <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
            
            <!-- Auto Policy Option -->
            <label 
            class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="type === 'policy' ? 'border-primary bg-blue-50/50' : 'ui-card hover:border-default'"
            >
            <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="policy"/>
            <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                <span class="block text-xs font-medium mb-1" :class="type === 'policy' ? 'text-primary' : 'ui-text-primary'">{{ $t('autoPolicy') }}</span>
                <span class="mt-1 d-flex align-items-center text-xs text-slate-500">{{ $t('pocmDescAuto') }}</span>
                </span>
            </span>
            <i v-if="type === 'policy'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
            </label>

            <!-- PAC Script Option -->
            <label 
            class="relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="type === 'pac' ? 'border-primary bg-blue-50/50' : 'ui-card hover:border-default'"
            >
            <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="pac"/>
            <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                <span class="block text-xs font-medium mb-1" :class="type === 'pac' ? 'text-primary' : 'ui-text-primary'">{{ $t('pacScript') }}</span>
                <span class="mt-1 d-flex align-items-center text-xs text-slate-500">{{ $t('pocmDescPac') }}</span>
                </span>
            </span>
            <i v-if="type === 'pac'" class="bi bi-check-circle-fill text-primary text-lg absolute top-1/2 right-3 -translate-y-1/2"></i>
            </label>

        </div>
    </div>

    <template #footer>
        <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs font-medium ui-button-secondary hover-bg-hover  transition-colors"
        >
        {{ $t('btnCancel') }}
        </button>
        <button 
        @click="handleConfirm"
        :disabled="!name.trim()"
        class="px-3 py-2 rounded-lg text-xs font-bold ui-button-primary shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {{ $t('btnConfirm') }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'create'])

const name = ref('')
const type = ref('policy')
const nameInput = ref(null)

// Reset form when opening
watch(() => props.visible, (newVal) => {
  if (newVal) {
    name.value = ''
    type.value = 'policy'
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
    emit('create', { name: name.value.trim(), type: type.value })
    emit('close')
}
</script>
