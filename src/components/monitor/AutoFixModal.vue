<template>
  <BaseModal
    :visible="visible"
    :title="$t('afmTitle')"
    maxWidth="580px"
    :noBackdropClose="phase === 'running' && props.autoFix.status.value === 'running'"
    @close="handleClose"
  >
    <!-- ── CONFIG PHASE ── -->
    <div v-if="phase === 'config'" class="d-flex flex-column gap-3">

      <!-- Proxy Selector -->
      <div class="d-flex flex-column gap-2">
        <label class="text-xs fw-bold ui-text-primary text-uppercase m-0">
          {{ $t('afmLabelProxy') }}
        </label>
        <select
          v-model="localProxyId"
          class="form-select ui-input w-100 rounded-lg border text-xs shadow-sm"
          style="height: 2rem; padding-left: 0.75rem"
        >
          <option value="" disabled selected>{{ $t('afmPlaceholderProxy') }}</option>
          <option value="direct">{{ $t('directConnect') }}</option>
          <optgroup v-for="group in proxyOptions" :key="group.label" :label="group.label">
            <option v-for="p in group.options" :key="p.id" :value="p.id">{{ p.label }}</option>
          </optgroup>
        </select>
        <p class="text-xs ui-text-secondary m-0">{{ $t('afmDescProxy') }}</p>
      </div>

      <!-- Max Retries Slider -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between">
          <label class="text-xs fw-bold ui-text-primary text-uppercase m-0">
            {{ $t('afmLabelMaxRetries') }}
          </label>
          <span class="ui-tag font-mono text-xs fw-bold" style="min-width: 2rem; text-align: center">{{ localMaxRetries }}</span>
        </div>
        <input
          v-model.number="localMaxRetries"
          type="range" min="1" max="15"
          class="w-100"
          style="accent-color: var(--ui-primary)"
        />
        <div class="d-flex justify-content-between text-xs ui-text-tertiary">
          <span>1</span><span>8</span><span>15</span>
        </div>
      </div>

      <!-- Wait Window Slider -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between">
          <label class="text-xs fw-bold ui-text-primary text-uppercase m-0">
            {{ $t('afmLabelWaitWindow') }}
          </label>
          <span class="ui-tag font-mono text-xs fw-bold" style="min-width: 2.5rem; text-align: center">{{ localWaitWindow }}s</span>
        </div>
        <input
          v-model.number="localWaitWindow"
          type="range" min="5" max="60" step="5"
          class="w-100"
          style="accent-color: var(--ui-primary)"
        />
        <div class="d-flex justify-content-between text-xs ui-text-tertiary">
          <span>5s</span><span>30s</span><span>60s</span>
        </div>
      </div>

      <!-- Info box -->
      <div class="d-flex align-items-start gap-2 rounded-lg px-3 py-2 text-xs ui-text-secondary"
           style="background: var(--ui-bg-subtle); border: 1px solid var(--ui-border-subtle)">
        <i class="bi bi-info-circle flex-shrink-0 mt-1 text-primary"></i>
        <span>{{ $t('afmDescInfo') }}</span>
      </div>
    </div>

    <!-- ── RUNNING PHASE ── -->
    <div v-else class="d-flex flex-column gap-3">

      <!-- Target URL -->
      <div v-if="autoFix.targetUrl.value" class="d-flex flex-column gap-1">
        <span class="text-xs fw-bold ui-text-primary text-uppercase m-0">
          {{ $t('afmLabelTargetUrl') }}
        </span>
        <div class="rounded-lg px-3 py-2"
             style="background: var(--ui-bg-subtle); border: 1px solid var(--ui-border-subtle); overflow: hidden">
          <span class="font-mono text-xs text-primary fw-medium text-truncate d-block">{{ autoFix.targetUrl.value }}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between">
          <span v-if="autoFix.status.value === 'running'" class="d-flex align-items-center gap-2 text-xs fw-semibold text-primary">
            <span class="pa-spinner"></span>
            {{ $t('afmStatusRunning', [autoFix.currentRound.value, localMaxRetries]) }}
          </span>
          <span v-else-if="autoFix.status.value === 'done'" class="d-flex align-items-center gap-2 text-xs fw-semibold text-success">
            <i class="bi bi-check-circle-fill"></i>{{ $t('afmStatusDone') }}
          </span>
          <span v-else-if="autoFix.status.value === 'failed'" class="d-flex align-items-center gap-2 text-xs fw-semibold text-danger">
            <i class="bi bi-x-circle-fill"></i>{{ $t('afmStatusFailed', [localMaxRetries]) }}
          </span>
          <span v-else-if="autoFix.status.value === 'stopped'" class="d-flex align-items-center gap-2 text-xs fw-semibold ui-text-secondary">
            <i class="bi bi-stop-circle"></i>{{ $t('afmStatusStopped') }}
          </span>
          <span class="text-xs ui-text-tertiary font-mono">
            {{ progressPercent }}%
          </span>
        </div>
        <!-- Progress bar track -->
        <div class="w-100 rounded-pill overflow-hidden" style="height: 5px; background: var(--ui-border-subtle)">
          <div
            class="h-100 rounded-pill bg-primary"
            :style="{ width: progressPercent + '%', transition: 'width 0.6s ease' }"
          ></div>
        </div>
      </div>

      <!-- Processing Timeline -->
      <div class="d-flex flex-column gap-1">
        <span class="text-xs fw-bold ui-text-primary text-uppercase m-0">
          {{ $t('afmLabelRoundHistory') }}
        </span>
        <div class="rounded-lg overflow-hidden" style="border: 1px solid var(--ui-border-subtle)">
          <!-- Empty/waiting: only before the first round starts (currentRound still 0) -->
          <div v-if="autoFix.currentRound.value === 0 && autoFix.status.value === 'running'"
               class="d-flex align-items-center justify-content-center gap-2 text-xs ui-text-tertiary py-4"
               style="background: var(--ui-bg-subtle)">
            <span class="pa-spinner"></span>
            {{ $t('afmMsgWaiting') }}
          </div>

          <div class="overflow-y-auto custom-scrollbar" style="max-height: 260px">
            <!-- Virtual current-round row -->
            <div v-if="autoFix.status.value === 'running' && autoFix.currentRound.value > autoFix.roundHistory.value.length"
                 class="d-flex align-items-center justify-content-between px-3 py-2"
                 :style="autoFix.roundHistory.value.length > 0 ? 'background: var(--ui-bg-card); border-bottom: 1px solid var(--ui-border-subtle)' : 'background: var(--ui-bg-card)'">
              <span class="d-flex align-items-center gap-2 text-xs fw-semibold text-primary">
                <span class="pa-spinner-sm"></span>
                {{ $t('afmRoundBadge', [autoFix.currentRound.value]) }}
              </span>
              <span class="text-xs ui-text-tertiary">{{ $t('afmMsgWaiting') }}</span>
            </div>

            <!-- Committed history (newest first) -->
            <div
              v-for="entry in [...autoFix.roundHistory.value].reverse()"
              :key="entry.round"
            >
              <!-- Round header -->
              <div
                class="d-flex align-items-center justify-content-between px-3 py-2"
                style="border-bottom: 1px solid var(--ui-border-subtle); background: var(--ui-bg-subtle)"
              >
                <span class="text-xs fw-semibold ui-text-primary">
                  {{ $t('afmRoundBadge', [entry.round]) }}
                </span>
                <span class="text-xs ui-text-tertiary font-mono">
                  {{ entry.capturedDomains.length }} errors · {{ entry.newDomains.length }} routed
                </span>
              </div>
              <!-- Domain rows: no border on last row in each round -->
              <div style="background: var(--ui-bg-card)">
                <div
                  v-for="(d, dIdx) in entry.rawDomains"
                  :key="d"
                  class="d-flex align-items-center justify-content-between px-3 py-1"
                  :style="dIdx < entry.rawDomains.length - 1 ? 'border-bottom: 1px solid var(--ui-border-light)' : ''"
                >
                  <span class="font-mono text-xs ui-text-primary text-truncate">{{ d }}</span>
                  <span class="d-flex align-items-center gap-1 ms-2 flex-shrink-0">
                    <span v-if="entry.newRawDomains.includes(d)" class="text-xs ui-text-tertiary">→</span>
                    <span class="text-xs fw-bold font-mono text-danger">ERR</span>
                  </span>
                </div>
                <div v-if="entry.rawDomains.length === 0"
                     class="px-3 py-2 text-xs text-success d-flex align-items-center gap-1">
                  <i class="bi bi-check-circle-fill"></i>
                  {{ $t('afmStatusDone') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed/routed domains -->
      <div v-if="autoFix.fixedDomains.value.length > 0" class="d-flex flex-column gap-1">
        <div class="d-flex align-items-center justify-content-between">
          <span class="text-xs fw-bold ui-text-primary text-uppercase m-0">
            {{ $t('afmLabelFixedWithRound') }}
          </span>
          <span class="ui-tag text-xs fw-bold">{{ autoFix.fixedDomains.value.length }}</span>
        </div>
        <div class="rounded-lg overflow-y-auto custom-scrollbar"
             style="max-height: 110px; border: 1px solid var(--ui-border-subtle)">
          <div
            v-for="(entry, eIdx) in autoFix.fixedDomains.value"
            :key="entry.domain"
            class="d-flex align-items-center gap-2 px-3 py-1"
            :style="eIdx < autoFix.fixedDomains.value.length - 1 ? 'border-bottom: 1px solid var(--ui-border-light); background: var(--ui-bg-card)' : 'background: var(--ui-bg-card)'"
          >
            <span class="d-inline-block rounded-circle flex-shrink-0"
                  style="width:6px;height:6px;background: var(--bs-success, #198754)"></span>
            <span class="font-mono text-xs ui-text-secondary text-truncate flex-1">{{ entry.domain }}</span>
            <span class="font-mono text-xs fw-bold flex-shrink-0 ui-tag" style="min-width: 1.8rem; text-align: center">
              R{{ entry.round }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── FOOTER ── -->
    <template #footer>
      <template v-if="phase === 'config'">
        <button @click="handleClose" class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary transition-colors">
          {{ $t('btnCancel') }}
        </button>
        <button
          @click="handleStart"
          :disabled="!localProxyId"
          class="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary border-0 shadow-sm transition-colors disabled:opacity-50"
        >
          {{ $t('afmBtnStart') }}
          <i class="bi bi-play-fill"></i>
        </button>
      </template>
      <template v-else>
        <!-- Running: only Stop button -->
        <button
          v-if="autoFix.status.value === 'running'"
          @click="handleStop"
          class="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-xs fw-medium ui-button-danger border-0 transition-colors"
        >
          <i class="bi bi-stop-circle"></i>
          {{ $t('afmBtnStop') }}
        </button>
        <!-- Finished: Close + View Temp Rules -->
        <template v-else>
          <button
            @click="handleClose"
            class="px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary transition-colors"
          >{{ $t('btnClose') }}</button>
          <button
            @click="handleRetry"
            class="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-xs fw-medium ui-button-secondary transition-colors"
          >
            <i class="bi bi-arrow-repeat"></i>
            {{ $t('afmBtnRetry') }}
          </button>
          <button
            v-if="autoFix.fixedDomains.value.length > 0"
            @click="handleViewTempRules"
            class="d-flex align-items-center gap-2 px-3 py-2 rounded-lg text-xs fw-bold ui-button-primary border-0 shadow-sm transition-colors"
          >
            <i class="bi bi-list-check"></i>
            {{ $t('afmBtnViewRules') }}
          </button>
        </template>
      </template>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../../common/i18n'
import BaseModal from '../base/BaseModal.vue'

const props = defineProps({
  visible: Boolean,
  tabId: Number,
  proxies: Object,
  proxyGroups: Object,
  autoFix: Object
})

const emit = defineEmits(['close'])

const localProxyId = ref('')
const localMaxRetries = ref(8)   // default to 8; slider max is 15
const localWaitWindow = ref(15)

const proxyOptions = computed(() => {
  const groups = []
  if (props.proxies) {
    const p = Object.values(props.proxies)
      .map((p) => ({ id: p.id, label: p.label || p.name || p.host || p.id }))
      .sort((a, b) => a.label.localeCompare(b.label))
    if (p.length > 0) groups.push({ label: t('lblProxies'), options: p })
  }
  if (props.proxyGroups) {
    const g = Object.values(props.proxyGroups)
      .map((g) => ({ id: g.id, label: g.name || g.id }))
      .sort((a, b) => a.label.localeCompare(b.label))
    if (g.length > 0) groups.push({ label: t('lblProxyGroups'), options: g })
  }
  return groups
})

const phase = ref('config')

// Progress percent: 100% when done, otherwise based on currentRound
const progressPercent = computed(() => {
  if (props.autoFix.status.value === 'done') return 100
  return Math.round(Math.min((props.autoFix.currentRound.value / localMaxRetries.value) * 100, 100))
})

watch(() => props.visible, (v) => {
  if (v) {
    phase.value = 'config'
    localProxyId.value = ''
    props.autoFix.reset()
  }
})

const handleStart = async () => {
  if (!props.tabId || !localProxyId.value) return
  phase.value = 'running'
  await props.autoFix.start({
    tabId: props.tabId,
    proxyId: localProxyId.value,
    maxRetriesParam: localMaxRetries.value,
    waitWindow: localWaitWindow.value
  })
}

const handleStop = () => props.autoFix.stop()

// Re-run with the same proxy, maxRetries, waitWindow already set
const handleRetry = async () => {
  props.autoFix.reset()
  phase.value = 'running'
  await props.autoFix.start({
    tabId: props.tabId,
    proxyId: localProxyId.value,
    maxRetriesParam: localMaxRetries.value,
    waitWindow: localWaitWindow.value
  })
}

const handleClose = () => {
  if (props.autoFix.status.value === 'running') props.autoFix.stop()
  emit('close')
}

// Open options page at the Temporary Rules section
const handleViewTempRules = () => {
  const optionsUrl = chrome.runtime.getURL('src/options/index.html')
  chrome.tabs.create({ url: `${optionsUrl}#/temp-rules` })
}
</script>

<script>
export default { name: 'AutoFixModal' }
</script>
