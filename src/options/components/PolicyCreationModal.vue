<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('pocmTitle')" 
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-3">
        <!-- Name Input -->
        <label class="d-flex flex-column gap-2 w-100">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblName') }}</span>
            <div class="position-relative w-100">
            <input 
                v-model="name"
                ref="nameInput"
                autofocus 
                class="w-100 rounded-lg border ui-input px-3 text-xs transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                :placeholder="$t('pocmPlaceholderName')" 
                type="text"
                maxlength="40"
                @keydown.enter="handleConfirm"
            />
            </div>
            <p class="text-xs ui-text-secondary m-0">{{ $t('pocmDescName') }}</p>
        </label>

        <!-- Type Selector -->
        <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr;">
            
            <!-- Auto Policy Option -->
            <label 
            class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="type === 'policy' ? 'border-primary bg-primary-subtle' : 'ui-card hover:border-default'"
            >
            <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="policy"/>
            <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                <span class="d-block text-xs fw-medium mb-1" :class="type === 'policy' ? 'text-primary' : 'ui-text-primary'">{{ $t('autoPolicy') }}</span>
                <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{ $t('pocmDescAuto') }}</span>
                </span>
            </span>
            <i v-if="type === 'policy'" class="bi bi-check-circle-fill text-primary fs-5 position-absolute top-50 end-0 translate-middle-y me-3"></i>
            </label>

            <!-- PAC Script Option -->
            <label 
            class="position-relative d-flex cursor-pointer rounded-lg border p-3 shadow-sm transition-all"
            :class="type === 'pac' ? 'border-primary bg-primary-subtle' : 'ui-card hover:border-default'"
            >
            <input v-model="type" v-show="false" class="sr-only" name="item-type" type="radio" value="pac"/>
            <span class="d-flex flex-1">
                <span class="d-flex flex-column">
                <span class="d-block text-xs fw-medium mb-1" :class="type === 'pac' ? 'text-primary' : 'ui-text-primary'">{{ $t('pacScript') }}</span>
                <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{ $t('pocmDescPac') }}</span>
                </span>
            </span>
            <i v-if="type === 'pac'" class="bi bi-check-circle-fill text-primary fs-5 position-absolute top-50 end-0 translate-middle-y me-3"></i>
            </label>

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
        :disabled="!name.trim()"
        class="px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
