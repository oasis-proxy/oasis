<template>
  <div class="px-4 pt-3 pb-4 hover-bg-subtle transition-colors">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex items-start">
        <div>
          <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblIpTags') }}</p>
          <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descIpTags') }}</p>
        </div>
      </div>
      <button @click="addTag" class="ui-button-icon" :title="$t('btnAddTag')">
        <i class="bi bi-plus-lg ui-icon-sm"></i>
      </button>
    </div>

    <div class="ui-card rounded-xl border divide-y divide-border shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="ui-card-header">
        <div style="width: 50%" class="px-2">{{ $t('colIp') }}</div>
        <div style="width: 40%" class="px-2">{{ $t('colTag') }}</div>
        <div style="width: 10%" class="text-center">{{ $t('colAction') }}</div>
      </div>

      <!-- List -->
      <div v-if="localIpTags.length > 0">
        <div
          v-for="(item, index) in localIpTags"
          :key="index"
          class="d-flex align-items-center gap-1 p-2 hover-bg-subtle transition-colors"
        >
          <div style="width: 50%" class="px-2">
            <input
              v-if="item.isEditing"
              v-model="item.ip"
              type="text"
              class="form-control ui-input ui-input-sm w-100 rounded py-0 px-2 font-monospace"
              :style="item.errors?.ip ? 'border-color: var(--ui-danger) !important;' : ''"
              placeholder="192.168.1.100"
              @keyup.enter="saveTag(index)"
              @keyup.esc="cancelEdit(index)"
              @blur="validateItem(index)"
            />
            <span v-else class="text-xs font-monospace ui-text-primary">{{ item.ip }}</span>
          </div>
          <div style="width: 40%" class="px-2">
            <input
              v-if="item.isEditing"
              v-model="item.tag"
              type="text"
              class="form-control ui-input ui-input-sm w-100 rounded py-0 px-2"
              :style="item.errors?.tag ? 'border-color: var(--ui-danger) !important;' : ''"
              placeholder="e.g. vps, US vps"
              @keyup.enter="saveTag(index)"
              @keyup.esc="cancelEdit(index)"
              @blur="validateItem(index)"
            />
            <span v-else class="text-xs ui-text-primary">{{ item.tag }}</span>
          </div>
          <div style="width: 10%" class="d-flex align-items-center justify-content-center gap-1">
            <template v-if="item.isEditing">
              <button @click="saveTag(index)" class="ui-button-icon" title="Save">
                <i class="bi bi-floppy-fill ui-icon-sm"></i>
              </button>
            </template>
            <button v-else @click="editTag(index)" class="ui-button-icon" title="Edit">
              <i class="bi bi-pencil-square ui-icon-sm"></i>
            </button>
            <button @click="deleteTag(index)" class="ui-button-icon" title="Delete">
              <i class="bi bi-trash ui-icon-sm"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- Empty State -->
      <div v-else class="text-center py-4">
        <p class="text-xs ui-text-secondary m-0">{{ $t('msgNoTagsDefined') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { normalizeIp, validateIp } from '../../common/validation'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const localIpTags = ref([])

const sortTags = (tags) => {
  return tags.sort((a, b) => {
    const isIPv6A = a.ip.includes(':')
    const isIPv6B = b.ip.includes(':')

    // Always put IPv4 before IPv6
    if (isIPv6A && !isIPv6B) return 1
    if (!isIPv6A && isIPv6B) return -1

    // For IPv6, fallback to simple string locale compare
    if (isIPv6A && isIPv6B) {
      return a.ip.localeCompare(b.ip)
    }

    // For IPv4, sort logically
    const numA = a.ip
      .split('.')
      .map((n) => parseInt(n) || 0)
      .reduce((acc, n) => acc * 256 + n, 0)
    const numB = b.ip
      .split('.')
      .map((n) => parseInt(n) || 0)
      .reduce((acc, n) => acc * 256 + n, 0)
    return numA - numB
  })
}

const syncToLocal = () => {
  const tags = Object.entries(props.modelValue || {}).map(([ip, tag]) => ({
    ip,
    tag,
    isEditing: false,
    originalIp: ip,
    errors: { ip: false, tag: false }
  }))
  localIpTags.value = sortTags(tags)
}

watch(() => props.modelValue, syncToLocal, { immediate: true, deep: true })

function addTag() {
  localIpTags.value.unshift({
    ip: '',
    tag: '',
    isEditing: true,
    originalIp: null,
    errors: { ip: false, tag: false }
  })
}

function editTag(index) {
  localIpTags.value[index].isEditing = true
  localIpTags.value[index].originalIp = localIpTags.value[index].ip
}

function cancelEdit(index) {
  const item = localIpTags.value[index]
  if (!item.originalIp) {
    localIpTags.value.splice(index, 1)
  } else {
    item.ip = item.originalIp
    item.isEditing = false
  }
}

function validateItem(index) {
  const item = localIpTags.value[index]
  const errors = { ip: !validateIp(item.ip).valid, tag: !item.tag }

  if (!errors.ip) {
    const itemNorm = normalizeIp(item.ip)
    const isDuplicateIp = localIpTags.value.some(
      (t, i) => i !== index && t.ip && normalizeIp(t.ip) === itemNorm
    )
    if (isDuplicateIp) errors.ip = true
  }

  if (!errors.tag) {
    const isDuplicateTag = localIpTags.value.some((t, i) => i !== index && t.tag === item.tag)
    if (isDuplicateTag) errors.tag = true
  }

  item.errors = errors
  return !errors.ip && !errors.tag
}

function saveTag(index) {
  if (!validateItem(index)) return

  const newTags = { ...props.modelValue }
  const item = localIpTags.value[index]

  const uniformIp = normalizeIp(item.ip)

  if (item.originalIp && item.originalIp !== uniformIp) {
    // If the original IP was a different normalized string, remove it
    delete newTags[item.originalIp]
  }
  newTags[uniformIp] = item.tag

  emit('update:modelValue', newTags)
  item.isEditing = false
  item.ip = uniformIp
  item.originalIp = uniformIp
}

function deleteTag(index) {
  const item = localIpTags.value[index]
  if (item.originalIp) {
    const newTags = { ...props.modelValue }
    delete newTags[item.originalIp]
    emit('update:modelValue', newTags)
  }
  localIpTags.value.splice(index, 1)
}
</script>
