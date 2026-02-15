<template>
  <BaseModal 
    :visible="visible" 
    :title="$t('rscmTitle')" 
    maxWidth="720px"
    @close="emit('close')"
  >
    <div class="d-flex flex-column gap-4 h-100" style="min-height: 480px;">
        <!-- URL Row -->
        <div v-if="url">
            <label class="d-flex flex-column gap-2 w-100 mb-0">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('rscmLabelUrl') }}</span>
            <div class="px-3 py-2 rounded-lg border ui-input text-xs ui-text-secondary break-all font-monospace" style="min-height: 28px;">
                {{ url }}
            </div>
            </label>
        </div>

        <!-- Last Updated Row -->
        <div v-if="lastUpdated">
            <label class="d-flex flex-column gap-2 w-100 mb-0">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('rscmLabelLastUpdated') }}</span>
            <div class="px-3 py-2 rounded-lg border ui-input text-xs ui-text-secondary" style="min-height: 28px;">
                {{ formattedTime }}
            </div>
            </label>
        </div>
        
        <!-- Content Display -->
        <label class="d-flex flex-column gap-2 w-100 mb-0 flex-1 overflow-hidden">
            <div class="d-flex justify-content-between align-items-center">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('rscmLabelContent') }}</span>
            <button 
                v-if="url"
                @click="handleUpdate"
                :disabled="updating"
                class="px-2 py-1.5 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-subtle transition-colors d-flex align-items-center gap-1 border border-subtle "
                :class="{ 'opacity-50 cursor-not-allowed': updating }"
            >
                <i class="bi bi-arrow-clockwise" :class="{ 'animate-spin': updating }"></i>
                {{ updating ? $t('rscmBtnUpdating') : $t('rscmBtnUpdate') }}
            </button>
            </div>
            <textarea 
            :value="content"
            readonly
            class="w-100 h-100 rounded-lg border ui-input px-3 py-2 text-xs font-monospace custom-scrollbar ui-text-secondary"
            style="resize: none; min-height: 320px;"
            :placeholder="$t('rscmMsgNoContent')"
            ></textarea>
        </label>
    </div>

    <template #footer>
        <button 
        @click="emit('close')"
        class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary hover-bg-subtle transition-colors"
        >
        {{ $t('btnClose') }}
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../../common/i18n'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close', 'update'])

const visible = ref(props.show)
const updating = ref(false)

const formattedTime = computed(() => {
  if (!props.lastUpdated) return t('rscmMsgNever')
  const date = new Date(props.lastUpdated)
  return date.toLocaleString()
})

const handleUpdate = async () => {
  updating.value = true
  try {
    await emit('update')
  } finally {
    // Reset after a delay to allow the update to complete
    setTimeout(() => {
      updating.value = false
    }, 500)
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    visible.value = true
    updating.value = false
  } else {
    // BaseModal prop takes care of visibility, but we sync local state 
    // to allow v-model like behavior if needed, or simply pass through
    visible.value = false
  }
})
</script>
