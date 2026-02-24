<template>
  <BaseDetailView :title="proxyGroup.name || $t('unnamedGroup')">
    <template #header-start>
      <input
        type="color"
        v-model="proxyGroup.color"
        class="border-0 p-0 rounded-lg overflow-hidden transition-transform shadow-sm"
        style="width: 24px; height: 24px; background: none; cursor: pointer"
        :title="$t('lblChooseColor')"
      />
    </template>

    <template #actions>
      <button
        @click="resetChanges"
        :disabled="!isDirty"
        class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all d-flex align-items-center gap-2"
      >
        <i class="bi bi-reply-fill"></i>
        <span>{{ $t('btnReset') }}</span>
      </button>

      <button
        @click="saveChanges"
        :disabled="!isDirty"
        class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg transition-colors d-flex align-items-center gap-2"
      >
        <i class="bi bi-floppy-fill"></i>
        <span>{{ $t('btnSave') }}</span>
      </button>

      <!-- Action Menu -->
      <div class="dropdown">
        <button
          class="ui-button-icon d-flex align-items-center justify-content-center"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-three-dots-vertical text-lg"></i>
        </button>

        <!-- Dropdown Menu -->
        <ul
          class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1"
          style="min-width: 140px"
        >
          <li>
            <button
              @click="openRenameModal"
              class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}
            </button>
          </li>
          <li><hr class="dropdown-divider my-1 border-subtle" /></li>
          <li>
            <button
              @click="openDeleteModal"
              class="dropdown-item w-100 text-left px-3 py-2 text-xs text-danger rounded-md transition-colors d-flex align-items-center gap-2"
            >
              <i class="bi bi-trash"></i> {{ $t('btnDelete') }}
            </button>
          </li>
        </ul>
      </div>
    </template>

    <!-- Proxy Host List -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('pgHeaderFallback') }}</span>
        <button @click="addProxy" class="ui-button-icon sm" :title="$t('pgTitleAddProxy')">
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>

      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="ui-card-header">
          <div style="width: 4%" class="text-center"></div>
          <div style="width: 8%">{{ $t('pgHeaderOrder') }}</div>
          <div style="width: 32%">{{ $t('pgHeaderProxyName') }}</div>
          <div style="width: 48%">{{ $t('pgHeaderAddress') }}</div>
          <div style="width: 8%" class="text-center">{{ $t('pgHeaderAction') }}</div>
        </div>

        <!-- List -->
        <div v-if="proxyGroup.proxies && proxyGroup.proxies.length > 0">
          <div v-for="(proxyId, index) in proxyGroup.proxies" :key="index">
            <!-- Normal Drag Row -->
            <div
              v-if="proxyId"
              :class="[
                'd-flex align-items-center gap-1 p-2 transition-colors',
                dragOverIndex === index
                  ? 'border-top border-2 border-primary bg-primary-subtle'
                  : 'hover-bg-subtle'
              ]"
              @dragover.prevent="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragenter.prevent
            >
              <div style="width: 4%" class="d-flex justify-content-center">
                <i
                  class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm"
                  style="cursor: grab"
                  draggable="true"
                  @dragstart="handleDragStart($event, index)"
                  @dragend="handleDragEnd"
                ></i>
              </div>
              <div style="width: 8%" class="text-xs ui-text-secondary font-monospace">
                {{ index + 1 }}
              </div>
              <div style="width: 32%" class="d-flex align-items-center gap-2">
                <div
                  class="rounded-circle"
                  :style="{ backgroundColor: getProxyColor(proxyId), width: '8px', height: '8px' }"
                ></div>
                <span class="text-xs fw-medium ui-text-primary text-truncate">{{
                  getProxyName(proxyId)
                }}</span>
              </div>
              <div
                style="width: 48%"
                class="text-xs ui-text-secondary font-monospace text-truncate"
              >
                {{ getProxyAddress(proxyId) }}
              </div>
              <div style="width: 8%" class="d-flex align-items-center justify-content-center">
                <button
                  @click="removeProxy(index)"
                  class="ui-button-icon p-0.5"
                  :title="$t('btnRemove')"
                >
                  <i class="bi bi-trash ui-icon-sm"></i>
                </button>
              </div>
            </div>

            <!-- Editing/New Row -->
            <div
              v-else
              class="d-flex align-items-center gap-1 p-2 bg-subtle border-bottom border-light"
            >
              <div style="width: 4%" class="d-flex justify-content-center">
                <i class="bi bi-grip-vertical ui-text-tertiary opacity-50 ui-icon-sm"></i>
              </div>
              <div style="width: 8%" class="text-xs ui-text-secondary font-monospace">
                {{ index + 1 }}
              </div>
              <div class="flex-fill px-2">
                <ProxySelect
                  :modelValue="''"
                  :proxies="availableProxies"
                  :proxyGroups="availableProxyGroups"
                  :includeDirect="false"
                  @update:modelValue="(val) => updateProxyAt(index, val)"
                  class="w-100 rounded-lg border py-0 px-3"
                  style="min-width: 180px; max-width: 180px !important; width: 180px !important"
                />
              </div>
              <div style="width: 8%" class="d-flex align-items-center justify-content-center">
                <button
                  @click="removeProxy(index)"
                  class="ui-button-icon p-0.5 text-danger"
                  :title="$t('btnCancel')"
                >
                  <i class="bi bi-x-lg ui-icon-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="p-4 d-flex flex-column align-items-center justify-content-center gap-2"
          style="min-height: 100px"
        >
          <i class="bi bi-layers fs-3 ui-text-tertiary"></i>
          <p class="text-xs ui-text-secondary m-0">{{ $t('pgMsgNoProxies') }}</p>
        </div>
      </div>
    </section>

    <!-- Termination Strategy -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('pgHeaderStrategy') }}</span>
      </div>
      <div class="ui-card rounded-xl border shadow-sm p-4">
        <div class="d-flex align-items-center justify-content-between gap-4">
          <div class="d-flex flex-column">
            <span class="ui-text-primary text-sm fw-medium mb-1">{{
              $t('pgLabelFinalFallback')
            }}</span>
            <p class="text-xs ui-text-secondary m-0">
              {{ $t('pgDescFinalFallback') }}
            </p>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div
              style="width: 120px"
              :class="{ 'opacity-50 pointer-events-none': !fallbackEnabled }"
            >
              <select
                v-model="proxyGroup.fallback.type"
                class="form-select ui-input rounded-lg border py-0 px-3 w-100"
                :disabled="!fallbackEnabled"
              >
                <option value="direct">{{ $t('directConnect') }}</option>
                <option value="reject">{{ $t('prioReject') }}</option>
              </select>
            </div>
            <div class="form-check form-switch m-0 d-flex align-items-center">
              <input
                class="form-check-input align-self-start"
                style="cursor: pointer"
                type="checkbox"
                role="switch"
                v-model="fallbackEnabled"
                :title="$t('pgTitleEnableFallback')"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <ProxyRenameModal
      :visible="showRenameModal"
      :title="$t('prmTitle')"
      :currentName="proxyGroup.name || ''"
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="proxyGroup.name || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete"
    />
  </BaseDetailView>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { saveProxyGroups } from '../../common/storage'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import { useProxyGroup } from '../../composables/useProxyGroup'

import ProxyRenameModal from '../../components/proxy/ProxyRenameModal.vue'
import ProxyDeleteModal from '../../components/proxy/ProxyDeleteModal.vue'
import ProxySelect from '../../components/proxy/ProxySelect.vue'
import BaseDetailView from '../../components/base/BaseDetailView.vue'

const route = useRoute()
const router = useRouter()

const {
  proxyGroup,
  config,
  dragOverIndex,
  fallbackEnabled,
  isDirty,
  availableProxies,
  availableProxyGroups,
  loadGroupData,
  saveChanges,
  addProxy,
  removeProxy,
  updateProxyAt,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  getProxyName,
  getProxyAddress,
  getProxyColor
} = useProxyGroup(route, router)

const showRenameModal = ref(false)
const showDeleteModal = ref(false)

const resetChanges = () => loadGroupData()

// Actions
const openRenameModal = () => {
  if (isDirty.value) return toast.warning(t('pgMsgSaveFirst'))
  showRenameModal.value = true
}

const openDeleteModal = () => {
  // Check usage?
  // TODO: logic to check if group is used in policies
  showDeleteModal.value = true
}

const handleRename = async (newName) => {
  proxyGroup.value.name = newName
  await saveChanges()
  showRenameModal.value = false
}

const handleDelete = async () => {
  delete config.value.proxyGroups[proxyGroup.value.id]
  await saveProxyGroups(config.value.proxyGroups)
  toast.success(t('pgMsgDeleted'))
  router.push('/settings')
  showDeleteModal.value = false
}

onMounted(loadGroupData)

onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(t('pacMsgUnsaved'))
      return true
    }
    return false
  })
})

onBeforeUnmount(unregisterUnsavedChangesChecker)

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) loadGroupData()
  }
)
</script>
```
