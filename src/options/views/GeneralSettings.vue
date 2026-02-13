<template>
  <BaseDetailView :title="$t('navGeneral')">
      <template #default>
        <div class="d-flex flex-column gap-5">
            <!-- Basic Configuration -->
            <section>
            <div class="ui-card-label">
                <span class="label-text">{{ $t('sectionBasic') }}</span>
            </div>
            <div class="ui-card rounded-xl border shadow-sm transition-colors">
                <!-- Theme Style -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblTheme') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descTheme') }}</p>
                    </div>
                </div>

                <select
                    v-model="config.ui.theme"
                    class="form-select ui-input ui-input-sm block rounded-lg border py-0 ps-2 pe-4"
                    style="width: 8rem"
                >
                    <option v-for="option in styleOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                    </option>
                </select>
                </div>

                <!-- Language -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblLanguage') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descLanguage') }}</p>
                    </div>
                </div>

                <select
                    v-model="config.ui.language"
                    class="form-select ui-input ui-input-sm block rounded-lg border py-0 ps-2 pe-4"
                    style="width: 8rem"
                >
                    <option v-for="option in langOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                    </option>
                </select>
                </div>

                <!-- Update Cycle -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblUpdateCycle') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descUpdateCycle') }}
                    </p>
                    </div>
                </div>

                <select
                    v-model="config.update.interval"
                    class="form-select ui-input block rounded-lg border text-xs h-8 py-0 ps-2 pe-4"
                    style="width: 8rem"
                >
                    <option
                    v-for="interval in updateIntervals"
                    :key="interval.value"
                    :value="interval.value"
                    >
                    {{ interval.label }}
                    </option>
                </select>
                </div>

                <!-- Rule Priority Order -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRulePriority') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descRulePriority') }}
                    </p>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-1">
                    <template v-for="(cat, idx) in localRulePriority" :key="cat">
                    <span v-if="idx > 0" class="text-slate-300" style="font-size: 10px;"><i class="bi bi-chevron-right"></i></span>
                    <div
                        class="ui-tag cursor-move d-flex align-items-center gap-1"
                        :class="priorityTagClass(cat)"
                        draggable="true"
                        @dragstart="onPriorityDragStart($event, idx)"
                        @dragover.prevent="onPriorityDragOver($event, idx)"
                        @drop.prevent="onPriorityDrop($event, idx)"
                        @dragend="onPriorityDragEnd"
                        :style="priorityDragOverIdx === idx ? 'opacity: 0.4;' : ''"
                        style="padding: 3px 8px; font-size: 11px; cursor: grab;"
                    >
                        <i class="bi bi-grip-vertical" style="font-size: 10px;"></i>
                        {{ priorityLabel(cat) }}
                    </div>
                    </template>
                    <button
                    class="ui-button-icon ms-1"
                    :title="$t('btnReset')"
                    @click="resetRulePriority"
                    :disabled="isDefaultPriority"
                    >
                    <i class="bi bi-arrow-counterclockwise ui-icon-sm"></i>
                    </button>
                </div>
                </div>

                <!-- Refresh On Switch -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                <div class="d-flex items-start">

                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRefreshSwitch') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descRefreshSwitch') }}
                    </p>
                    </div>
                </div>

                <div class="form-check form-switch">
                    <input
                    v-model="config.behavior.refreshOnSwitch"
                    class="form-check-input align-self-start"
                    type="checkbox"
                    role="switch"
                    id="refreshOnSwitchSwitch"
                    />
                </div>
                </div>
            </div>
            </section>

            <!-- Advanced Configuration -->
            <section>
            <div class="ui-card-label">
                <span class="label-text">{{ $t('sectionAdvanced') }}</span>
            </div>
            <div class="ui-card rounded-xl border shadow-sm">
                <!-- Reject Address -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRejectAddr') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descRejectAddr') }}
                    </p>
                    </div>
                </div>

                <input
                    v-model.lazy="rejectAddress"
                    type="text"
                    placeholder="127.0.0.1:65535"
                    class="form-control ui-input ui-input-sm block rounded-lg border"
                    style="width: 12rem"
                />
                </div>

                <!-- Request Monitoring -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblReqMonitor') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descReqMonitor') }}
                    </p>
                    </div>
                </div>

                <div class="form-check form-switch">
                    <input
                    v-model="config.behavior.connectionMonitoring"
                    class="form-check-input align-self-start"
                    type="checkbox"
                    role="switch"
                    id="connectionMonitoringSwitch"
                    />
                </div>
                </div>

                <!-- Context Menu -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblContextMenu') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descContextMenu') }}
                    </p>
                    </div>
                </div>
                <div class="form-check form-switch">
                    <input
                    v-model="config.ui.showContextMenu"
                    class="form-check-input align-self-start"
                    type="checkbox"
                    role="switch"
                    id="contextMenuSwitch"
                    />
                </div>
                </div>

                <div class="px-4 pt-3 pb-4 hover:bg-slate-50 transition-colors">


                <div class="d-flex align-items-center justify-content-between mb-4">
                    <div class="d-flex items-start">
                    <div>
                        <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblIpTags') }}</p>
                        <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descIpTags') }}
                        </p>
                    </div>
                    </div>
                    <button @click="addTag" class="ui-button-icon" :title="$t('btnAddTag')">
                    <i class="bi bi-plus-lg ui-icon-sm"></i>
                    </button>
                </div>

                <div
                    class="ui-card rounded-xl border divide-y divide-border shadow-sm overflow-hidden"
                >
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
                        class="d-flex align-items-center gap-1 p-2 hover:bg-slate-50 transition-colors"
                    >
                        <div style="width: 50%" class="px-2">
                        <input
                            v-if="item.isEditing"
                            v-model="item.ip"
                            type="text"
                            class="form-control ui-input ui-input-sm w-100 rounded py-0 px-2 font-mono"
                            style="height: 24px"
                            :style="item.errors?.ip ? 'border-color: var(--ui-danger) !important;' : ''"
                            placeholder="192.168.1.100"
                            @keyup.enter="saveTag(index)"
                            @keyup.esc="cancelEdit(index)"
                            @blur="validateItem(index)"
                        />
                        <span v-else class="text-xs font-mono ui-text-primary">{{ item.ip }}</span>
                        </div>
                        <div style="width: 40%" class="px-2">
                        <input
                            v-if="item.isEditing"
                            v-model="item.tag"
                            type="text"
                            class="form-control ui-input ui-input-sm w-100 rounded py-0 px-2"
                            style="height: 24px"
                            :style="item.errors?.tag ? 'border-color: var(--ui-danger) !important;' : ''"
                            placeholder="e.g. vps, US vps"
                            @keyup.enter="saveTag(index)"
                            @keyup.esc="cancelEdit(index)"
                            @blur="validateItem(index)"
                        />
                        <span v-else class="text-xs ui-text-primary">{{ item.tag }}</span>
                        </div>
                        <div
                        style="width: 10%"
                        class="d-flex align-items-center justify-content-center gap-1"
                        >
                        <template v-if="item.isEditing">
                            <button
                            @click="saveTag(index)"
                            class="ui-button-icon"
                            title="Save"
                            >
                            <i class="bi bi-floppy-fill ui-icon-sm"></i>
                            </button>

                        </template>


                        <button v-else @click="editTag(index)" class="ui-button-icon" title="Edit">
                            <i class="bi bi-pencil-square ui-icon-sm"></i>
                        </button>

                        <button
                            @click="deleteTag(index)"
                            class="ui-button-icon"
                            title="Delete"
                        >
                            <i class="bi bi-trash ui-icon-sm"></i>
                        </button>
                        </div>
                    </div>
                    </div>
                    <!-- Empty State -->
                    <div
                    v-else
                    class="p-2 d-flex align-items-center justify-content-center"
                    style="min-height: 44px"
                    >
                    <p class="text-xs text-slate-500 m-0">No tags defined.</p>
                    </div>
                </div>
                </div>
            </div>
            </section>
            <!-- Extension Information -->
            <section>
            <div class="ui-card-label">
                <span class="label-text">{{ $t('sectionInfo') }}</span>
            </div>
            <div class="ui-card rounded-xl border shadow-sm">
                <!-- Extension Version -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblVersion') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descVersion') }}
                    </p>
                    </div>
                </div>
                <div class="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                    v{{ extensionVersion }}
                </div>
                </div>

                <!-- Github Repository -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRepo') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descRepo') }}
                    </p>
                    </div>
                </div>
                <a
                    href="https://github.com/oasis-proxy/oasis"
                    target="_blank"
                    class="d-flex align-items-center gap-2 text-xs no-underline ui-text-secondary hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    <i class="bi bi-github"></i>
                    GitHub
                    <i class="bi bi-box-arrow-up-right text-[10px] opacity-50"></i>
                </a>
                </div>

                <!-- Wiki Address -->
                <div
                class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >

                <div class="d-flex items-start">
                    <div>
                    <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblWiki') }}</p>
                    <p class="text-xs ui-text-secondary mt-1 m-0">
                        {{ $t('descWiki') }}
                    </p>
                    </div>
                </div>
                <a
                    href="https://github.com/oasis-proxy/oasis/wiki"
                    target="_blank"
                    class="d-flex align-items-center gap-2 text-xs no-underline ui-text-secondary hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    <i class="bi bi-book"></i>
                    Wiki
                    <i class="bi bi-box-arrow-up-right text-[10px] opacity-50"></i>
                </a>
                </div>
            </div>
            </section>
        </div>
      </template>
  </BaseDetailView>
</template>

<script setup>
import { reactive, computed, watch, onMounted, ref, inject } from 'vue'
import { loadConfig, saveGeneralSettings } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { toast } from '../utils/toast'
import BaseDetailView from '../components/BaseDetailView.vue'

const extensionVersion = chrome.runtime.getManifest().version

// Constants
const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// Reactive State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))

const { t } = inject('i18n')

// Config Options (Computed for reactivity)
const styleOptions = computed(() => [
  { label: t('themeLight'), value: 'light' },
  { label: t('themeDark'), value: 'dark' },
  { label: t('themeSystem'), value: 'auto' }
])

const langOptions = computed(() => [
  { label: t('langAuto'), value: 'auto' },
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh_CN' }
])

// Rule Priority Order
const DEFAULT_PRIORITY = ['reject', 'temp', 'normal']
const localRulePriority = ref([...DEFAULT_PRIORITY])
const priorityDragIdx = ref(null)
const priorityDragOverIdx = ref(null)

const priorityLabel = (cat) => {
  const labels = { 
      reject: t('prioReject'), 
      normal: t('prioNormal'), 
      temp: t('prioTemp') 
  }
  return labels[cat] || cat
}

const priorityTagClass = (cat) => {
  const classes = { reject: 'ui-tag-danger', normal: 'ui-tag-primary', temp: 'ui-tag-warning' }
  return classes[cat] || 'ui-tag-default'
}

const isDefaultPriority = computed(() => {
  return JSON.stringify(localRulePriority.value) === JSON.stringify(DEFAULT_PRIORITY)
})

const onPriorityDragStart = (e, idx) => {
  priorityDragIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
}

const onPriorityDragOver = (e, idx) => {
  priorityDragOverIdx.value = idx
}

const onPriorityDrop = (e, targetIdx) => {
  const sourceIdx = priorityDragIdx.value
  if (sourceIdx === null || sourceIdx === targetIdx) return
  const arr = [...localRulePriority.value]
  const [moved] = arr.splice(sourceIdx, 1)
  arr.splice(targetIdx, 0, moved)
  localRulePriority.value = arr
  config.rulePriority = [...arr]
  priorityDragIdx.value = null
  priorityDragOverIdx.value = null
}

const onPriorityDragEnd = () => {
  priorityDragIdx.value = null
  priorityDragOverIdx.value = null
}

const resetRulePriority = () => {
  localRulePriority.value = [...DEFAULT_PRIORITY]
  config.rulePriority = [...DEFAULT_PRIORITY]
}

const updateIntervals = [
  { label: '24h', value: 1440 },
  { label: '12h', value: 720 },
  { label: '1h', value: 60 },
  { label: '15min', value: 15 },
  ...(import.meta.env.MODE === 'development' ? [{ label: '2min', value: 2 }] : []),
  { label: chrome.i18n.getMessage('themeManual'), value: -1 }
]

// Computed Properties for Mapping
const rejectAddress = computed({
  get: () => `${config.reject.host}:${config.reject.port}`,
  set: (val) => {
    const parts = val.split(':')
    config.reject.host = parts[0] || '127.0.0.1'
    config.reject.port = parseInt(parts[1]) || 65535
  }
})

// IP Tags Logic
const localIpTags = ref([])

// Helper to sort tags by IP
const sortTags = (tags) => {
  return tags.sort((a, b) => {
    // Simple numeric sort for IPv4
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

// Sync config to local state
const syncToLocal = () => {
  if (!config.ipTags) return
  const tags = Object.entries(config.ipTags).map(([ip, tag]) => ({
    ip,
    tag,
    isEditing: false,
    originalIp: ip, // Track original IP for renaming
    errors: { ip: false, tag: false }
  }))
  localIpTags.value = sortTags(tags)
}

// Initialize
const isInitializing = ref(true)

// Watch for external config changes
watch(
  config,
  (newVal) => {
    if (isInitializing.value) return
    saveGeneralSettings(newVal)
    // We do NOT sync to local here to avoid overwriting ongoing edits.
    // Local state is the source of truth for UI, Config is source of truth for Storage.
    // When we Save, we update Config.
  },
  { deep: true }
)

onMounted(async () => {
  const loaded = await loadConfig()
  Object.assign(config, loaded)
  syncToLocal()
  // Sync rule priority from loaded config
  if (config.rulePriority && Array.isArray(config.rulePriority)) {
    localRulePriority.value = [...config.rulePriority]
  }
  // Prevent immediate save triggered by Object.assign
  setTimeout(() => {
    isInitializing.value = false
  }, 100)
})

const addTag = () => {
  // Add to top
  localIpTags.value.unshift({
    ip: '',
    tag: '',
    isEditing: true,
    originalIp: null,
    errors: { ip: false, tag: false }
  })
}

const editTag = (index) => {
  localIpTags.value[index].isEditing = true
  localIpTags.value[index].originalIp = localIpTags.value[index].ip
  localIpTags.value[index].errors = { ip: false, tag: false }
}

const cancelEdit = (index) => {
  const item = localIpTags.value[index]
  if (!item.originalIp && !item.ip) {
    // Was a new item, just remove it
    localIpTags.value.splice(index, 1)
    return
  }
  // Revert
  item.ip = item.originalIp
  item.isEditing = false
  item.errors = { ip: false, tag: false }
  // No need to syncToLocal, just reverting this item is enough
}

const validateItem = (index) => {
  const item = localIpTags.value[index]
  let isValid = true
  const errors = { ip: false, tag: false }

  // Validate IP
  if (!item.ip || !IPV4_REGEX.test(item.ip)) {
    errors.ip = true
    isValid = false
  }

  // Validate Tag
  if (!item.tag) {
    errors.tag = true
    isValid = false
  }

  // Check duplicates (Tag Name uniqueness check as per user request)
  // "tagname needs to be confirmed not empty, and different from other tagnames"

  // Note: Checking duplicates against config is tricky if we are editing.
  // We need to check against OTHER items.
  // More robust approach: Check against localIpTags (excluding self)
  const duplicateTagLocal = localIpTags.value.some((t, i) => i !== index && t.tag === item.tag)

  if (duplicateTagLocal) {
    errors.tag = true
    isValid = false
  }

  // Check Duplicate IP (if changed)
  const duplicateIpLocal = localIpTags.value.some((t, i) => i !== index && t.ip === item.ip)
  if (duplicateIpLocal) {
    errors.ip = true
    isValid = false
  }

  item.errors = errors
  return isValid
}

const saveTag = (index) => {
  const item = localIpTags.value[index]

  if (!validateItem(index)) {
    return // Validation failed, errors set in validateItem
  }

  // Update Config
  // Ensure object exists
  if (!config.ipTags) config.ipTags = {}

  const newTags = { ...config.ipTags }

  // If we are renaming, delete old key
  if (item.originalIp && item.originalIp !== item.ip) {
    delete newTags[item.originalIp]
  }
  newTags[item.ip] = item.tag

  config.ipTags = newTags // This triggers the watch -> saveGeneralSettings

  // Update local state
  item.isEditing = false
  item.originalIp = item.ip
  item.errors = { ip: false, tag: false }

  // Re-sort local list to match new IP order
  localIpTags.value = sortTags(localIpTags.value)
  toast.success(chrome.i18n.getMessage('msgTagSaved'))
}

const deleteTag = (index) => {
  const item = localIpTags.value[index]
  if (item.originalIp) {
    if (!config.ipTags) config.ipTags = {}
    const newTags = { ...config.ipTags }
    delete newTags[item.originalIp]
    config.ipTags = newTags
    toast.success(chrome.i18n.getMessage('msgTagDeleted'))
  }
  localIpTags.value.splice(index, 1)
}
</script>
