<template>
  <div class="ui-card rounded-xl border border-subtle shadow-sm overflow-hidden">
    <div class="ui-card-header" style="padding-left: 1.5rem !important;">
      {{ label }}
    </div>

    <div class="px-4 pt-3 pb-4">
      <div class="row g-3">
        <div class="col-3">
          <label class="ui-form-group">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblProtocol') }}</span>
            <select 
              :value="modelValue.scheme || 'default'" 
              @change="updateField('scheme', $event.target.value)"
              class="form-select ui-input w-100 mw-100 rounded-lg border py-0 px-3"
            >
              <option value="default">{{ $t('phDefault') }}</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </label>
        </div>
        
        <div class="col-7">
          <label class="ui-form-group">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('phLabelHost') }}</span>
            <input 
              :value="modelValue.host" 
              @input="updateField('host', $event.target.value)"
              type="text" 
              :placeholder="isDefault ? '' : 'example.com'" 
              :disabled="isDefault" 
              class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" 
            />
          </label>
        </div>
        <div class="col-2">
          <label class="ui-form-group">
            <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPort') }}</span>
            <input 
              :value="modelValue.port" 
              @input="updateField('port', $event.target.value ? parseInt($event.target.value) : null)"
              @blur="validatePort"
              type="number" 
              min="1" 
              max="65535" 
              :placeholder="isDefault ? '' : getPortPlaceholder(modelValue.scheme)" 
              :disabled="isDefault" 
              class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" 
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Auth Section -->
    <div 
      class="px-4 pt-3 pb-4 border-top border-light transition-opacity duration-200" 
      :class="{ 'pointer-events-none opacity-50': isDefault }"
    >
        <h4 class="text-sm fw-medium ui-text-primary mb-3 ls-wide d-flex align-items-center justify-content-between">
            {{ $t('phHeaderAuth') }}
            <span class="text-xs ui-text-secondary font-normal normal-case">{{ $t('phDescAuth') }}</span>
        </h4>
        <div class="row g-3">
            <div class="col-6">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblUsername') }}</span>
                  <input 
                    :value="modelValue.authUsername" 
                    @input="updateField('authUsername', $event.target.value)"
                    type="text" 
                    :placeholder="isDefault ? '' : $t('phPlaceholderOptional')" 
                    :disabled="isDefault" 
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" 
                  />
                </label>
            </div>
            <div class="col-6">
                <label class="ui-form-group">
                  <span class="ui-text-primary text-xs fw-medium lh-1">{{ $t('lblPassword') }}</span>
                  <input 
                    :value="modelValue.authPassword" 
                    @input="updateField('authPassword', $event.target.value)"
                    type="password" 
                    :placeholder="isDefault ? '' : $t('phPlaceholderOptional')" 
                    :disabled="isDefault" 
                    class="form-control ui-input w-100 mw-100 rounded-lg border py-0 px-3" 
                  />
                </label>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

const isDefault = computed(() => props.modelValue.scheme === 'default' || !props.modelValue.scheme)

function updateField(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function validatePort() {
  let val = parseInt(props.modelValue.port)
  if (isNaN(val)) return
  if (val < 1) updateField('port', 1)
  else if (val > 65535) updateField('port', 65535)
}

function getPortPlaceholder(scheme) {
  if (scheme === 'http') return '8080'
  if (scheme === 'https') return '443'
  if (['socks4', 'socks5'].includes(scheme)) return '1080'
  return '8080'
}
</script>
