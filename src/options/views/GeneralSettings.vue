<template>
  <BaseDetailView v-if="config" :title="$t('navGeneral')">
    <template #default>
      <div class="d-flex flex-column gap-5">
        <!-- Basic Configuration -->
        <section>
          <div class="ui-card-label"><span class="label-text">{{ $t('sectionBasic') }}</span></div>
          <div class="ui-card rounded-xl border shadow-sm transition-colors">
            <!-- Theme Style -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblTheme') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descTheme') }}</p>
                </div>
              </div>
              <select v-model="config.ui.theme" class="form-select ui-input block rounded-lg border py-0 ps-2 pe-4" style="width: 8rem">
                <option v-for="opt in styleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <!-- Language -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblLanguage') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descLanguage') }}</p>
                </div>
              </div>
              <select v-model="config.ui.language" class="form-select ui-input block rounded-lg border py-0 ps-2 pe-4" style="width: 8rem">
                <option v-for="opt in langOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <!-- Update Cycle -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblUpdateCycle') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descUpdateCycle') }}</p>
                </div>
              </div>
              <select v-model="config.update.interval" class="form-select ui-input block rounded-lg border py-0 ps-2 pe-4" style="width: 8rem">
                <option v-for="inv in updateIntervals" :key="inv.value" :value="inv.value">{{ inv.label }}</option>
              </select>
            </div>

            <!-- Rule Priority -->
            <RulePrioritySettings v-model="localRulePriority" @update:modelValue="updateRulePriority" />

            <!-- Refresh On Switch -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRefreshSwitch') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descRefreshSwitch') }}</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.refreshOnSwitch" class="form-check-input align-self-start" type="checkbox" role="switch" id="refreshOnSwitchSwitch" />
              </div>
            </div>
          </div>
        </section>

        <!-- Advanced Configuration -->
        <section>
          <div class="ui-card-label"><span class="label-text">{{ $t('sectionAdvanced') }}</span></div>
          <div class="ui-card rounded-xl border shadow-sm">
            <!-- Reject Address -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRejectAddr') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descRejectAddr') }}</p>
                </div>
              </div>
              <input v-model.lazy="rejectAddress" type="text" placeholder="127.0.0.1:65535" class="form-control ui-input block rounded-lg border py-0 px-3 w-100" style="width: 240px !important" />
            </div>

            <!-- Request Monitoring -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblReqMonitor') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descReqMonitor') }}</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.behavior.connectionMonitoring" class="form-check-input align-self-start" type="checkbox" role="switch" id="connectionMonitoringSwitch" />
              </div>
            </div>

            <!-- Context Menu -->
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblContextMenu') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descContextMenu') }}</p>
                </div>
              </div>
              <div class="form-check form-switch">
                <input v-model="config.ui.showContextMenu" class="form-check-input align-self-start" type="checkbox" role="switch" id="contextMenuSwitch" />
              </div>
            </div>

            <!-- IP Tags -->
            <IpTagManager v-model="config.ipTags" />
          </div>
        </section>

        <!-- Extension Info -->
        <section>
          <div class="ui-card-label"><span class="label-text">{{ $t('sectionInfo') }}</span></div>
          <div class="ui-card rounded-xl border shadow-sm">
            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblVersion') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descVersion') }}</p>
                </div>
              </div>
              <div class="text-sm ui-text-secondary font-monospace bg-subtle px-2 py-1 rounded">v{{ extensionVersion }}</div>
            </div>

            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblRepo') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descRepo') }}</p>
                </div>
              </div>
              <a href="https://github.com/oasis-proxy/oasis" target="_blank" class="d-flex align-items-center gap-2 text-xs no-underline ui-text-secondary transition-colors hover:text-body">
                <i class="bi bi-github"></i> GitHub <i class="bi bi-box-arrow-up-right text-[10px] opacity-50"></i>
              </a>
            </div>

            <div class="d-flex align-items-center justify-content-between px-4 py-3 hover-bg-subtle transition-colors">
              <div class="d-flex items-start">
                <div>
                  <p class="text-sm font-medium ui-text-primary m-0">{{ $t('lblWiki') }}</p>
                  <p class="text-xs ui-text-secondary mt-1 m-0">{{ $t('descWiki') }}</p>
                </div>
              </div>
              <a href="https://github.com/oasis-proxy/oasis/wiki" target="_blank" class="d-flex align-items-center gap-2 text-xs no-underline ui-text-secondary transition-colors hover:text-body">
                <i class="bi bi-book"></i> Wiki <i class="bi bi-box-arrow-up-right text-[10px] opacity-50"></i>
              </a>
            </div>
          </div>
        </section>
      </div>
    </template>
  </BaseDetailView>
</template>

<script setup>
import { computed, onMounted, inject } from 'vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'
import IpTagManager from '../../components/common/IpTagManager.vue'
import RulePrioritySettings from '../../components/rule/RulePrioritySettings.vue'
import { useGeneralSettings } from '../../composables/useGeneralSettings'

const { t } = inject('i18n')
const { config, localRulePriority, loadData, updateRulePriority } = useGeneralSettings()
const extensionVersion = chrome.runtime.getManifest().version

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
const updateIntervals = [
  { label: '24h', value: 1440 }, { label: '12h', value: 720 }, { label: '1h', value: 60 }, { label: '15min', value: 15 },
  ...(import.meta.env.MODE === 'development' ? [{ label: '2min', value: 2 }] : []),
  { label: t('themeManual'), value: -1 }
]

const rejectAddress = computed({
  get: () => `${config.reject.host}:${config.reject.port}`,
  set: (val) => {
    const parts = val.split(':')
    config.reject.host = parts[0] || '127.0.0.1'
    config.reject.port = parseInt(parts[1]) || 65535
  }
})

onMounted(loadData)
</script>
