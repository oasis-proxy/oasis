<template>
  <div class="h-100 d-flex flex-column">
    <!-- Header -->
    <header
      class="h-24 px-5 d-flex align-items-center justify-content-between border-light transition-colors"
    >
      <div>
        <h2 class="fs-4 font-bold text-slate-900 m-0">General Settings</h2>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5">
      <div class="max-w-3xl mx-auto d-flex flex-column gap-5">
        <!-- Basic Configuration -->
        <section>
          <div class="ui-card-label">
            <span class="label-text">Basic Configuration</span>
          </div>
          <div class="ui-card rounded-xl border shadow-sm transition-colors">
            <!-- Theme Style -->
            <div
              class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium text-slate-900 m-0">Theme</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">Choose your preferred visual theme.</p>
                </div>
              </div>
              <select
                v-model="config.ui.theme"
                class="form-select ui-input block rounded-lg border text-xs h-8 py-0 ps-2 pe-4"
                style="width: 8rem"
              >
                <option v-for="option in styleOptions" :key="option.value" :value="option.value">
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
                  <p class="text-sm font-medium text-slate-900 m-0">External Policy Update Cycle</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">
                    Frequency of checking for policy updates.
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

            <!-- Refresh On Switch -->
            <div
              class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium text-slate-900 m-0">Refresh On Switch</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">
                    Automatically refresh tab when switch proxy.
                  </p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="config.behavior.refreshOnSwitch"
                  class="form-check-input"
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
            <span class="label-text">Advanced Configuration</span>
          </div>
          <div class="ui-card rounded-xl border shadow-sm">
            <!-- Reject Address -->
            <div
              class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium text-slate-900 m-0">Reject Address</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">
                    Connections to this address will be dropped immediately.
                  </p>
                </div>
              </div>
              <input
                v-model.lazy="rejectAddress"
                type="text"
                placeholder="ip:port"
                class="form-control ui-input block rounded-lg border text-xs"
                style="width: 12rem"
              />
            </div>

            <!-- Request Monitoring -->
            <div
              class="d-flex align-items-center justify-content-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium text-slate-900 m-0">Request Monitoring</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">
                    Monitor requests and their matching proxy rules.
                  </p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="config.behavior.connectionMonitoring"
                  class="form-check-input"
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
                  <p class="text-sm font-medium text-slate-900 m-0">Context Menu</p>
                  <p class="text-xs text-slate-500 mt-1 m-0">
                    Show proxy options in the browser right-click menu.
                  </p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="config.ui.showContextMenu"
                  class="form-check-input"
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
                    <p class="text-sm font-medium text-slate-900 m-0">IP Tags</p>
                    <p class="text-xs text-slate-500 mt-1 m-0">
                      Assign friendly names to IP addresses.
                    </p>
                  </div>
                </div>
                <button @click="addTag" class="ui-button-icon" title="Add Tag">
                  <i class="bi bi-plus-lg text-xs"></i>
                </button>
              </div>

              <div
                class="ui-card rounded-xl border divide-y divide-slate-100 shadow-sm overflow-hidden"
              >
                <!-- Header -->
                <div class="ui-card-header">
                  <div style="width: 50%" class="px-2">IP Address</div>
                  <div style="width: 40%" class="px-2">Tag Name</div>
                  <div style="width: 10%" class="text-center">Action</div>
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
                        class="form-control ui-input w-100 rounded text-xs py-0 px-2 font-mono"
                        style="height: 24px"
                        :style="item.errors?.ip ? 'border-color: #dc3545 !important;' : ''"
                        placeholder="0.0.0.0"
                        @keyup.enter="saveTag(index)"
                        @keyup.esc="cancelEdit(index)"
                        @blur="validateItem(index)"
                      />
                      <span v-else class="text-xs font-mono text-slate-900">{{ item.ip }}</span>
                    </div>
                    <div style="width: 40%" class="px-2">
                      <input
                        v-if="item.isEditing"
                        v-model="item.tag"
                        type="text"
                        class="form-control ui-input w-100 rounded text-xs py-0 px-2"
                        style="height: 24px"
                        :style="item.errors?.tag ? 'border-color: #dc3545 !important;' : ''"
                        placeholder="Tag Name"
                        @keyup.enter="saveTag(index)"
                        @keyup.esc="cancelEdit(index)"
                        @blur="validateItem(index)"
                      />
                      <span v-else class="text-xs text-slate-900">{{ item.tag }}</span>
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
                          <i class="bi bi-floppy-fill text-xs"></i>
                        </button>
                        <button
                          @click="cancelEdit(index)"
                          class="ui-button-icon"
                          title="Cancel"
                        >
                          <i class="bi bi-x-lg text-xs"></i>
                        </button>
                      </template>
                      <button v-else @click="editTag(index)" class="ui-button-icon" title="Edit">
                        <i class="bi bi-pencil text-xs"></i>
                      </button>

                      <button
                        @click="deleteTag(index)"
                        class="ui-button-icon"
                        title="Delete"
                      >
                        <i class="bi bi-trash text-xs"></i>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue'
import { loadConfig, saveGeneralSettings } from '../../common/storage'
import { DEFAULT_CONFIG } from '../../common/config'
import { toast } from '../utils/toast'

// Constants
const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// Reactive State
const config = reactive(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))

// Config Options
const styleOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'auto' }
]

const updateIntervals = [
  { label: '24h', value: 1440 },
  { label: '12h', value: 720 },
  { label: '1h', value: 60 },
  { label: '15min', value: 15 },
  ...(import.meta.env.MODE === 'development' ? [{ label: '2min', value: 2 }] : []),
  { label: 'Manual', value: -1 }
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
  toast.success('IP Tag saved')
}

const deleteTag = (index) => {
  const item = localIpTags.value[index]
  if (item.originalIp) {
    if (!config.ipTags) config.ipTags = {}
    const newTags = { ...config.ipTags }
    delete newTags[item.originalIp]
    config.ipTags = newTags
    toast.success('IP Tag deleted')
  }
  localIpTags.value.splice(index, 1)
}
</script>
