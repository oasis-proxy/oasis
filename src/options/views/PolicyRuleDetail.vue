<template>
  <BaseDetailView :title="policy.name || $t('lblAutoPolicy')" maxWidth="6xl">
    <template #header-start>
      <input 
          type="color" 
          v-model="policy.color"
          class="p-0 border-0 rounded-lg overflow-hidden shadow-sm transition-transform"
          style="width: 24px; height: 24px; min-width: 24px; cursor: pointer;"
          title="Choose color"
      />
    </template>

    <template #actions>
      <!-- Show in Popup Switch -->
      <div class="form-check form-switch m-0 d-flex align-items-center gap-2" :title="$t('phTitleShowPopup')">
          <input class="form-check-input align-self-start" style="cursor: pointer;" type="checkbox" role="switch" id="showInPopup" v-model="policy.showInPopup">
          <label class="form-check-label text-xs font-medium ui-text-secondary" style="cursor: pointer;" for="showInPopup">{{ $t('phLabelShowPopup') }}</label>
      </div>
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
         <ul class="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden mt-1 p-1" style="min-width: 140px;">
             <li>
               <button @click="openRenameModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                   <i class="bi bi-pencil-square ui-text-tertiary"></i> {{ $t('btnRename') }}
               </button>
             </li>
             <li>
               <button @click="openCloneModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                   <i class="bi bi-files ui-text-tertiary"></i> {{ $t('btnClone') }}
               </button>
             </li>
              <li>
                <button @click="showPolicyMergeModal = true" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-slate-900 rounded-md transition-colors d-flex align-items-center gap-2">
                    <i class="bi bi-diagram-3-fill text-slate-400"></i> {{ $t('lblMergePolicy') }}
                </button>
              </li>
              <li>
                <button @click="handleExportPAC" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-slate-900 rounded-md transition-colors d-flex align-items-center gap-2">
                    <i class="bi bi-download text-slate-400"></i> {{ $t('lblExportPAC') }}
                </button>
              </li>

             <li><hr class="dropdown-divider my-1 border-subtle "></li>
             <li>
               <button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-danger  rounded-md transition-colors d-flex align-items-center gap-2">
                   <i class="bi bi-trash"></i> {{ $t('btnDelete') }}
               </button>
             </li>
         </ul>
      </div>
    </template>

    <!-- Normal Rules Section -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('phHeaderNormalRules') }}</span>
        <div class="d-flex align-items-center gap-2">
          <button @click="showBatchReplaceModal = true" class="ui-button-icon sm" :title="$t('btnBatchReplace')">
            <i class="bi bi-list-check ui-icon-md"></i>
          </button>
          <button @click="addRule" class="ui-button-icon sm" :title="$t('btnAddRule')">
            <i class="bi bi-plus-lg text-sm"></i>
          </button>
        </div>
      </div>


      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="ui-card-header">
          <div style="width: 4%;" class="text-center"></div>
          <div style="width: 8%;" class="text-center">{{ $t('lblValid') }}</div>
          <div style="width: 16%;">{{ $t('lblType') }}</div>
          <div style="width: 44%;">{{ $t('lblPattern') }}</div>
          <div style="width: 20%;">{{ $t('lblProxy') }}</div>
          <div style="width: 8%;" class="text-center">{{ $t('lblAction') }}</div>
        </div>

        <!-- Rules -->
        <div v-if="policy.rules && policy.rules.length > 0">
          <div v-for="(rule, index) in policy.rules" :key="rule.id || index">
            <!-- Divider Row -->
            <div 
              v-if="rule.type === 'divider'" 
              :class="[
                'd-flex align-items-center gap-1 transition-colors',
                dragOverIndex === index ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover:bg-slate-50'
              ]"
              style="padding: 0px 8px; min-height: 20px;"
              @dragover.prevent="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragenter.prevent
            >
              <div style="width: 4%;" class="d-flex justify-content-center">
                <i 
                  class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm" 
                  style="cursor: grab;"
                  draggable="true"
                  @dragstart="handleDragStart($event, index)" 
                  @dragend="handleDragEnd"
                ></i>
              </div>
              <div class="flex-1 d-flex align-items-center gap-2">
                <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border);" class=""></div>
                <span 
                  v-if="editingDividerIndex !== index"
                  @dblclick="startEditDivider(index, rule.label)"
                  class="text-xs font-semibold ui-text-secondary uppercase tracking-widest cursor-pointer hover:text-primary transition-colors px-2 d-flex align-items-center gap-2"
                  style="user-select: none; line-height: 1;"
                  :title="$t('descEditSection')"
                >
                  {{ rule.label || $t('lblNewSection') }}
                  <i class="bi bi-pencil-square ui-icon-xs opacity-60"></i>
                </span>
                <input 
                  v-else
                  ref="dividerInput"
                  v-model="editingDividerLabel"
                  @blur="saveDividerLabel(index)"
                  @keyup.enter="saveDividerLabel(index)"
                  @keyup.esc="cancelEditDivider"
                  class="form-control ui-input ui-input-sm font-semibold uppercase tracking-widest text-center w-auto mx-auto"
                  style="min-width: 150px; padding: 2px 8px;"
                />
                <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border);" class=""></div>
              </div>
              <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                <button @click="insertRuleBelow(index)" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
                  <i class="bi bi-plus-lg text-xs"></i>
                </button>
                <button @click="insertDividerBelow(index)" class="ui-button-icon" :title="$t('btnAddDividerBelow')">
                  <i class="bi bi-inboxes-fill text-xs"></i>
                </button>
                <button @click="deleteRule(index)" class="ui-button-icon" :title="$t('btnDelete')">
                  <i class="bi bi-trash text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Normal Rule Row -->
            <div 
              v-else 
              :class="[
                'd-flex align-items-center gap-1 p-2 transition-colors',
                dragOverIndex === index ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover:bg-slate-50',
                !rule.valid ? 'opacity-50' : ''
              ]"
              @dragover.prevent="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragenter.prevent
            >
              <div style="width: 4%;" class="d-flex justify-content-center">
                <i 
                  class="bi bi-grip-vertical text-slate-400 transition-colors" 
                  style="font-size: 12px; cursor: grab;"
                  draggable="true"
                  @dragstart="handleDragStart($event, index)" 
                  @dragend="handleDragEnd"
                ></i>
              </div>
              <div style="width: 8%;" class="d-flex justify-content-center">
                <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                  <input 
                    class="form-check-input align-self-start" 
                    style="cursor: pointer;"
                    type="checkbox" 
                    v-model="rule.valid"
                  >
                </div>
              </div>
              <div style="width: 16%;">
                <select 
                  v-model="rule.ruleType" 
                  class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
                  @change="handleRuleTypeChange(index, rule)"
                >
                  <option value="wildcard">{{ $t('optWildcard') }}</option>
                  <option value="regex">{{ $t('optRegex') }}</option>
                  <option value="ip">{{ $t('optIP') }}</option>
                  <option value="ruleset">{{ $t('optRuleSet') }}</option>
                </select>
              </div>
              <div style="width: 44%;">
                <!-- RuleSet input -->
                <div v-if="rule.ruleType === 'ruleset'" class="position-relative w-100">
                  <input 
                    v-model="rule.pattern" 
                    type="text" 
                    placeholder="https://example.com/rules.txt" 
                    class="form-control ui-input w-100 mw-100 rounded text-xs py-0 font-mono"
                    :style="`height: 28px; padding-left: 8px; padding-right: 28px;${duplicateIndices.has(index) ? ' border-color: var(--bs-primary) !important;' : (validationErrors[index] ? ' border-color: var(--ui-danger) !important;' : '')}`"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = null; validateRule(index, rule); fetchRuleSetContent(index, rule.pattern)"
                  />
                  <button 
                    @click="openRuleSetModal(rule, index)"
                    :disabled="fetchingRuleSetIndex === index"
                    class="position-absolute bg-transparent border-0 p-0 ui-text-secondary hover:text-primary transition-colors"
                    :class="{ 'cursor-not-allowed': fetchingRuleSetIndex === index }"
                    title="View RuleSet Content"
                    style="right: 6px; top: 50%; transform: translateY(-50%);"
                  >
                    <i v-if="fetchingRuleSetIndex === index" class="bi bi-arrow-repeat" style="display: inline-block; animation: ruleset-spin 1s linear infinite;"></i>
                    <i v-else class="bi bi-eye"></i>
                  </button>
                </div>
                <!-- Other types input -->
                <input 
                  v-else
                  v-model="rule.pattern" 
                  type="text" 
                  :placeholder="getPlaceholder(rule.ruleType)" 
                  class="form-control ui-input ui-input-sm w-100 mw-100 rounded py-0 px-2 font-mono"
                  :style="`${duplicateIndices.has(index) ? ' border-color: var(--bs-primary) !important;' : (validationErrors[index] ? ' border-color: var(--ui-danger) !important;' : '')}`"
                  @focus="focusedIndex = index"
                  @blur="focusedIndex = null; validateRule(index, rule)"
                />
              </div>
              <div style="width: 20%;">
                <ProxySelect
                  v-model="rule.proxyId"
                  :proxies="config?.proxies"
                  :proxyGroups="config?.proxyGroups"
                  size="sm"
                  class="w-100 py-0 px-1.5"
                />
              </div>
              <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                <button @click="insertRuleBelow(index)" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
                  <i class="bi bi-plus-lg ui-icon-sm"></i>
                </button>
                <button @click="insertDividerBelow(index)" class="ui-button-icon p-0.5" :title="$t('btnAddDividerBelow')">
                  <i class="bi bi-inboxes-fill ui-icon-sm"></i>
                </button>
                <button @click="deleteRule(index)" class="ui-button-icon p-0.5" :title="$t('btnDelete')">
                  <i class="bi bi-trash ui-icon-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
          <p class="text-xs text-slate-500 m-0">No rules defined. Click "+" to get started.</p>
        </div>
        <!-- Default Strategy Footer -->
        <div class="ui-card-footer">
          <div style="width: 4%;"></div>
          <div style="width: 8%;"></div>
          <div style="width: 16%;"></div>
          <div style="width: 44%;" class="d-flex align-items-center justify-content-end px-2">
             <div class="d-flex align-items-center gap-2 whitespace-nowrap">
               <i class="bi bi-arrow-return-right"></i> {{ $t('lblDefaultStrategy') }}
            </div>
          </div>
          <div style="width: 20%;">
            <ProxySelect
                v-model="policy.defaultProfileId"
                :proxies="config?.proxies"
                :proxyGroups="config?.proxyGroups"
                size="sm"
                class="w-100 py-0 px-1.5"
            />
          </div>
          <div style="width: 8%;"></div>
        </div>
      </div>
    </section>

    <!-- Reject Rules Section -->
    <section>
      <div class="ui-card-label">
        <span class="label-text">{{ $t('phHeaderRejectRules') }}</span>
        <button @click="addRejectRule" class="ui-button-icon sm" :title="$t('btnAddRejectRule')">
          <i class="bi bi-plus-lg text-sm"></i>
        </button>
      </div>

      <div class="ui-card rounded-xl border shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="ui-card-header">
          <div style="width: 4%;" class="text-center"></div>
          <div style="width: 8%;" class="text-center">{{ $t('lblValid') }}</div>
          <div style="width: 16%;">{{ $t('lblType') }}</div>
          <div style="width: 44%;">{{ $t('lblPattern') }}</div>
          <div style="width: 20%;">{{ $t('lblProxy') }}</div>
          <div style="width: 8%;" class="text-center">{{ $t('lblAction') }}</div>
        </div>

        <!-- Reject Rules -->
        <div v-if="policy.rejectRules && policy.rejectRules.length > 0">
          <div v-for="(rule, index) in policy.rejectRules" :key="rule.id || index">
            <!-- Divider Row -->
            <div 
              v-if="rule.type === 'divider'" 
              :class="[
                'd-flex align-items-center gap-1 transition-colors',
                dragOverRejectIndex === index ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover:bg-hover' 
              ]"
              style="padding: 0px 8px; min-height: 20px;"
              @dragover.prevent="handleRejectDragOver($event, index)"
              @drop="handleRejectDrop($event, index)"
              @dragenter.prevent
            >
              <div style="width: 4%;" class="d-flex justify-content-center">
                <i 
                  class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm" 
                  style="cursor: grab;"
                  draggable="true"
                  @dragstart="handleRejectDragStart($event, index)" 
                  @dragend="handleRejectDragEnd"
                ></i>
              </div>
              <div class="flex-1 d-flex align-items-center gap-2">
                <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border);" class=""></div>
                <span 
                  v-if="editingRejectDividerIndex !== index"
                  @dblclick="startEditRejectDivider(index, rule.label)"
                  class="text-xs font-semibold ui-text-secondary uppercase tracking-widest cursor-pointer hover:text-primary transition-colors px-2 d-flex align-items-center gap-1"
                  style="user-select: none; line-height: 1;"
                  :title="$t('descEditSection')"
                >
                  {{ rule.label || $t('lblNewSection') }}
                  <i class="bi bi-pencil-square ui-icon-xs opacity-60"></i>
                </span>
                <input 
                  v-else
                  ref="rejectDividerInput"
                  v-model="editingRejectDividerLabel"
                  @blur="saveRejectDividerLabel(index)"
                  @keyup.enter="saveRejectDividerLabel(index)"
                  @keyup.esc="cancelEditRejectDivider"
                  class="form-control ui-input ui-input-sm font-semibold uppercase tracking-widest text-center w-auto mx-auto"
                  style="min-width: 150px; padding: 2px 8px;"
                />
                <div style="flex: 1; height: 1px; border-top: 1px solid var(--ui-border);" class=""></div>
              </div>
              <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                <button @click="insertRejectRuleBelow(index)" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
                  <i class="bi bi-plus-lg ui-icon-sm"></i>
                </button>
                <button @click="insertRejectDividerBelow(index)" class="ui-button-icon p-0.5" :title="$t('btnAddDividerBelow')">
                  <i class="bi bi-inboxes-fill ui-icon-sm"></i>
                </button>
                <button @click="deleteRejectRule(index)" class="ui-button-icon p-0.5" :title="$t('btnDelete')">
                  <i class="bi bi-trash ui-icon-sm"></i>
                </button>
              </div>
            </div>

            <!-- Normal Reject Rule Row -->
            <div 
              v-else
              :class="[
              'd-flex align-items-center gap-1 p-2 transition-colors',
              dragOverRejectIndex === index ? 'border-top border-2 border-primary bg-primary-subtle' : 'hover:bg-hover',
               !rule.valid ? 'opacity-50' : ''
            ]"
            @dragover.prevent="handleRejectDragOver($event, index)"
            @drop="handleRejectDrop($event, index)"
            @dragenter.prevent
          >
            <div style="width: 4%;" class="d-flex justify-content-center">
              <i 
                class="bi bi-grip-vertical ui-text-tertiary transition-colors ui-icon-sm" 
                style="cursor: grab;"
                draggable="true"
                @dragstart="handleRejectDragStart($event, index)"
                @dragend="handleRejectDragEnd"
              ></i>
            </div>
            <div style="width: 8%;" class="d-flex justify-content-center">
                <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                  <input 
                    class="form-check-input align-self-start" 
                    style="cursor: pointer;"
                    type="checkbox" 
                    v-model="rule.valid"
                  >
                </div>
              </div>
            <div style="width: 16%;">
              <select 
                v-model="rule.ruleType" 
                class="form-select ui-input ui-input-sm w-100 rounded border py-0 px-1.5" 
                @change="handleRejectRuleTypeChange(index, rule)"
              >
                <option value="wildcard">{{ $t('optWildcard') }}</option>
                <option value="regex">{{ $t('optRegex') }}</option>
                <option value="ip">{{ $t('optIP') }}</option>
                <option value="ruleset">{{ $t('optRuleSet') }}</option>
              </select>
            </div>
            <div style="width: 44%;" class="position-relative">
              <input 
                v-model="rule.pattern" 
                type="text" 
                :placeholder="getPlaceholder(rule.ruleType)" 
                class="form-control ui-input ui-input-sm w-100 mw-100 rounded border py-0 px-2 font-mono"
                :style="`${rejectValidationErrors[index] ? ' border-color: var(--ui-danger) !important;' : ''}`"
                @focus="focusedIndex = index"
                @blur="focusedIndex = null; validateRejectRule(index, rule)"
              />
            </div>
            <div style="width: 20%;">
               <div class="w-100 rounded border border-subtle ui-bg-subtle ui-text-secondary text-xs px-2 d-flex align-items-center gap-2 cursor-not-allowed" style="user-select: none; height: 28px;">
                <span class="w-1.5 h-1.5 rounded-full bg-danger"></span>
                {{ $t('lblReject') }}
              </div>
            </div>
              <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
               <button @click="insertRejectRuleBelow(index)" class="ui-button-icon" :title="$t('btnAddRuleBelow')">
                 <i class="bi bi-plus-lg ui-icon-sm"></i>
               </button>
               <button @click="insertRejectDividerBelow(index)" class="ui-button-icon p-0.5" :title="$t('btnAddDividerBelow')">
                 <i class="bi bi-inboxes-fill ui-icon-sm"></i>
               </button>
               <button @click="deleteRejectRule(index)" class="ui-button-icon p-0.5" :title="$t('btnDelete')">
                 <i class="bi bi-trash ui-icon-sm"></i>
               </button>
             </div>
          </div>
        </div>
      </div>
        <!-- Empty State -->
        <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
          <p class="text-xs text-slate-500 m-0">{{ $t('msgNoRejectRules') }}</p>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <ProxyRenameModal 
      :visible="showRenameModal" 
      :currentName="policy.name || ''" 
      @close="showRenameModal = false"
      @save="handleRename"
    />
    <ProxyCloneModal
      :visible="showCloneModal" 
      :currentName="policy.name || ''"
      @close="showCloneModal = false"
      @clone="handleClone"
    />
    <ProxyDeleteModal
      :visible="showDeleteModal"
      :proxyName="policy.name || ''"
      @close="showDeleteModal = false"
      @delete="handleDelete" 
    />
    <RuleSetContentModal 
      :show="showRuleSetModal" 
      :content="selectedRuleSetContent" 
      :url="selectedRuleSetUrl"
      :lastUpdated="selectedRuleSetLastUpdated"
      @close="showRuleSetModal = false" 
      @update="handleRuleSetUpdate"
    />
    <BatchProxyReplaceModal 
      :visible="showBatchReplaceModal" 
      :proxies="config?.proxies"
      :proxyGroups="config?.proxyGroups"
      @close="showBatchReplaceModal = false" 
      @replace="handleBatchReplace" 
    />
    <PolicyMergeModal 
      :visible="showPolicyMergeModal" 
      :currentPolicyId="policy.id" 
      :policies="config?.policies || {}" 
      @close="showPolicyMergeModal = false" 
      @merge="handlePolicyMerge" 
    />
  </BaseDetailView>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, savePolicies } from '../../common/storage'
import { decodeRuleSetContent, updateRuleSetContent } from '../../common/ruleset'
import { generatePacScriptFromPolicy } from '../../common/pac'
import { validatePattern } from '../../common/validation'
import { useDragDrop } from '../../common/dragDrop'
import { t } from '../../common/i18n'
import { toast } from '../utils/toast'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'
import RuleSetContentModal from '../components/RuleSetContentModal.vue'
import BatchProxyReplaceModal from '../components/BatchProxyReplaceModal.vue'
import PolicyMergeModal from '../components/PolicyMergeModal.vue'
import ProxySelect from '../components/ProxySelect.vue'
import BaseDetailView from '../components/BaseDetailView.vue'

const route = useRoute()
const router = useRouter()
const config = ref(null)
const policy = ref({})
const originalPolicy = ref({})
const showRenameModal = ref(false)
const showCloneModal = ref(false)
const showDeleteModal = ref(false)
const showRuleSetModal = ref(false)
const selectedRuleSetContent = ref('')
const selectedRuleSetUrl = ref('')
const selectedRuleSetLastUpdated = ref(null)
const selectedRuleSetIndex = ref(null)
const fetchingRuleSetIndex = ref(null)
const focusedIndex = ref(null)
const showBatchReplaceModal = ref(false)
const showPolicyMergeModal = ref(false)
const editingDividerIndex = ref(null)
const editingDividerLabel = ref('')
const dividerInput = ref(null)
const editingRejectDividerIndex = ref(null)
const editingRejectDividerLabel = ref('')
const rejectDividerInput = ref(null)

// Pattern validation (using common/validation.js)
const validationErrors = ref({})
const rejectValidationErrors = ref({})

const validateRule = (index, rule) => {
  const result = validatePattern(rule.ruleType, rule.pattern)
  if (result.valid) {
    delete validationErrors.value[index]
  } else {
    validationErrors.value[index] = result.message
  }
}

const validateRejectRule = (index, rule) => {
  const result = validatePattern(rule.ruleType, rule.pattern)
  if (result.valid) {
    delete rejectValidationErrors.value[index]
  } else {
    rejectValidationErrors.value[index] = result.message
  }
}

// Re-validate all rules (used after load/add/delete/drag operations)
const revalidateAllRules = () => {
  if (policy.value.rules) {
    policy.value.rules.forEach((rule, index) => {
      if (rule.type !== 'divider') {
        if (rule.valid === undefined) rule.valid = true
        validateRule(index, rule)
      }
    })
  }
}

const revalidateAllRejectRules = () => {
  if (policy.value.rejectRules) {
    policy.value.rejectRules.forEach((rule, index) => {
      if (rule.type !== 'divider') {
        validateRejectRule(index, rule)
      }
    })
  }
}



// Load Logic
const loadPolicyData = async () => {
    config.value = await loadConfig()
    const id = route.params.id
    if (config.value?.policies?.[id]) {
        policy.value = JSON.parse(JSON.stringify(config.value.policies[id]))
        
        // Reset UI states when loading new policy
        validationErrors.value = {}
        rejectValidationErrors.value = {}
        focusedIndex.value = null
        editingDividerIndex.value = null
        editingRejectDividerIndex.value = null
        fetchingRuleSetIndex.value = null

        // Ensure defaults - defensive initialization
        if (!Array.isArray(policy.value.rules)) {
            policy.value.rules = []
        }
        if (!Array.isArray(policy.value.rejectRules)) {
            policy.value.rejectRules = []
        } else {
            // Initialize defaults for existing reject rules
            policy.value.rejectRules.forEach(rule => {
                if (rule.type !== 'divider' && rule.valid === undefined) {
                    rule.valid = true
                }
            })
        }
        if (!policy.value.name) {
            policy.value.name = t('lblAutoPolicy') || 'Auto Policy'
        }
        if (!policy.value.id) {
            policy.value.id = id
        }
        if (!policy.value.color) {
            policy.value.color = '#10b981' // emerald-500
        }
        // Ensure default profile
        if (!policy.value.defaultProfileId) {
            policy.value.defaultProfileId = 'direct'
        }
        if (policy.value.showInPopup === undefined) policy.value.showInPopup = true
        
        originalPolicy.value = JSON.parse(JSON.stringify(policy.value))
        
        // Trigger initial validation
        nextTick(() => {
            revalidateAllRules()
            revalidateAllRejectRules()
        })
    } else {
        router.push('/settings')
    }
}

// Dirty State
const isDirty = computed(() => {
    if (!policy.value || !originalPolicy.value) return false
    return JSON.stringify(policy.value) !== JSON.stringify(originalPolicy.value)
})

// Duplicate detection - find rules with same type and pattern
const duplicateIndices = computed(() => {
  if (focusedIndex.value === null || !policy.value.rules) return new Set()
  
  const focusedRule = policy.value.rules[focusedIndex.value]
  if (!focusedRule || focusedRule.type === 'divider') return new Set()
  
  const duplicates = new Set()
  policy.value.rules.forEach((rule, index) => {
    if (rule.type !== 'divider' && 
        rule.ruleType === focusedRule.ruleType && 
        rule.pattern === focusedRule.pattern &&
        rule.pattern.trim() !== '') {
      duplicates.add(index)
    }
  })
  
  // Only return if there are actual duplicates (more than one)
  return duplicates.size > 1 ? duplicates : new Set()
})

onMounted(() => {
    loadPolicyData()
})

// Register unsaved changes checker
onMounted(() => {
  registerUnsavedChangesChecker(() => {
    if (isDirty.value) {
      toast.warning(t('phMsgUnsaved'))
      return true  // Has unsaved changes
    }
    return false  // No unsaved changes
  })
})

// Unregister on unmount
onBeforeUnmount(() => {
  unregisterUnsavedChangesChecker()
})

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) loadPolicyData()
})

// Actions
const resetChanges = () => {
    loadPolicyData()
}

const saveChanges = async () => {
    if (!config.value || !policy.value) return
    
    // Save locally
    config.value.policies[policy.value.id] = JSON.parse(JSON.stringify(policy.value))
    
    // Persist
    await savePolicies(config.value.policies)
    
    toast.success(t('msgPolicySaved') || 'Policy saved successfully')
    
    // Refresh
    await loadPolicyData()
}

const addRule = () => {
    const newRule = {
        id: `rule_${Date.now()}`,
        type: 'rule',
        ruleType: 'wildcard',
        pattern: '',
        valid: true,
        proxyId: 'direct',
        ruleSet: {}
    }
    policy.value.rules = [newRule, ...policy.value.rules]
    // Re-validate after adding
    nextTick(() => revalidateAllRules())
}

// Handle rule type change
const handleRuleTypeChange = (index, rule) => {
  // Validate the rule
  validateRule(index, rule)
  
  // If changed to RuleSet and has a URL, fetch content
  if (rule.ruleType === 'ruleset' && rule.pattern && rule.pattern.trim()) {
    fetchRuleSetContent(index, rule.pattern)
  }
}

const handleRejectRuleTypeChange = (index, rule) => {
  // Validate the rule
  validateRejectRule(index, rule)
}

const addRejectRule = () => {
    const newRule = {
        id: `reject_${Date.now()}`,
        ruleType: 'wildcard',
        valid: true,
        pattern: ''
    }
    policy.value.rejectRules = [newRule, ...policy.value.rejectRules]
    // Re-validate after adding
    nextTick(() => revalidateAllRejectRules())
}

const deleteRule = (index) => {
    policy.value.rules.splice(index, 1)
    // Re-validate after deletion
    nextTick(() => revalidateAllRules())
}

const deleteRejectRule = (index) => {
    policy.value.rejectRules.splice(index, 1)
    // Re-validate after deletion
    nextTick(() => revalidateAllRejectRules())
}

// Insert actions
const insertRuleBelow = (index) => {
    const newRule = {
        id: `rule_${Date.now()}`,
        type: 'rule',
        ruleType: 'wildcard',
        pattern: '',
        valid: true,
        proxyId: 'direct',
        ruleSet: {}
    }
    policy.value.rules.splice(index + 1, 0, newRule)
    nextTick(() => revalidateAllRules())
}

const insertDividerBelow = (index) => {
    const newDivider = {
        id: `divider_${Date.now()}`,
        type: 'divider',
        label: t('lblNewSection') || 'New Section'
    }
    policy.value.rules.splice(index + 1, 0, newDivider)
}

const insertRejectRuleBelow = (index) => {
    const newRule = {
        id: `reject_${Date.now()}`,
        ruleType: 'wildcard',
        valid: true,
        pattern: ''
    }
    policy.value.rejectRules.splice(index + 1, 0, newRule)
    nextTick(() => revalidateAllRejectRules())
}

const insertRejectDividerBelow = (index) => {
    const newDivider = {
        id: `divider_${Date.now()}`,
        type: 'divider',
        label: t('lblNewSection') || 'New Section'
    }
    policy.value.rejectRules.splice(index + 1, 0, newDivider)
}

// Divider editing
const startEditDivider = (index, currentLabel) => {
    editingDividerIndex.value = index
    editingDividerLabel.value = currentLabel || t('lblNewSection') || 'New Section'
    nextTick(() => {
        if (dividerInput.value && dividerInput.value[0]) {
            dividerInput.value[0].focus()
        }
    })
}

const saveDividerLabel = (index) => {
    if (editingDividerIndex.value === index) {
        policy.value.rules[index].label = editingDividerLabel.value
        editingDividerIndex.value = null
    }
}

const cancelEditDivider = () => {
    editingDividerIndex.value = null
}

const startEditRejectDivider = (index, currentLabel) => {
    editingRejectDividerIndex.value = index
    editingRejectDividerLabel.value = currentLabel || t('lblNewSection') || 'New Section'
    nextTick(() => {
        if (rejectDividerInput.value && rejectDividerInput.value[0]) {
            rejectDividerInput.value[0].focus()
        }
    })
}

const saveRejectDividerLabel = (index) => {
    if (editingRejectDividerIndex.value === index) {
        policy.value.rejectRules[index].label = editingRejectDividerLabel.value
        editingRejectDividerIndex.value = null
    }
}

const cancelEditRejectDivider = () => {
    editingRejectDividerIndex.value = null
}



const fetchRuleSetContent = async (index, url) => {
    if (!url) return
    
    // Simulate fetching or use cached content from policy if available
    // In a real scenario, this might trigger a background fetch or check local storage
    
    // For now, check if we already have content for this rule
    const rule = policy.value.rules[index]
    if (rule.ruleSet && rule.ruleSet.sourceUrl === url && rule.ruleSet.content) {
        // We have content
        return
    }
    
    fetchingRuleSetIndex.value = index
    try {
        // Attempt to fetch via background through message passing? 
        // Or if we persist content in storage, just read it.
        // Assuming we store a snapshot in the rule itself for now as per `ruleSet` object structure.
        
        // If it's a new URL, we might need to actually fetch it.
        // For this demo/refactor, we'll placeholder or rely on what's saved.
        
        // If it was recently saved, it might have content.
        
        // Real logic: Send message to background to fetch/update ruleset
         const response = await chrome.runtime.sendMessage({
            type: 'FETCH_RULESET',
            url: url
        })

        if (response && response.success) {
            rule.ruleSet = {
                sourceUrl: url,
                content: response.content,
                lastUpdated: Date.now()
            }
        } else {
             // Handle error or no-op
             console.warn('Failed to fetch ruleset', response?.error)
        }

    } catch (e) {
        console.error('Fetch ruleset error', e)
    } finally {
        fetchingRuleSetIndex.value = null
    }
}

const openRuleSetModal = (rule, index) => {
    if (!rule.ruleSet || !rule.ruleSet.content) {
        toast.warning('No content available for this RuleSet yet.')
        // Try to fetch?
        fetchRuleSetContent(index, rule.pattern)
        return
    }
    selectedRuleSetContent.value = decodeRuleSetContent(rule.ruleSet.content)
    selectedRuleSetUrl.value = rule.ruleSet.sourceUrl || rule.pattern
    selectedRuleSetLastUpdated.value = rule.ruleSet.lastUpdated
    selectedRuleSetIndex.value = index
    showRuleSetModal.value = true
}

const handleRuleSetUpdate = async (newContent) => {
    if (selectedRuleSetIndex.value !== null) {
        // Update the rule's content
        // Encode back to base64 or store as is? Assuming storage handle it or we re-encode
        // The decoder used atob, so we should use btoa
        const encoded = updateRuleSetContent(newContent)
        
        const rule = policy.value.rules[selectedRuleSetIndex.value]
        rule.ruleSet.content = encoded
        rule.ruleSet.lastUpdated = Date.now()
        rule.ruleSet.manualUpdate = true // Flag that user manually edited it?
        
        // Save policy implicit? User needs to click Save Policy to persist to disk.
        // But the modal action implies "Done editing".
        
        showRuleSetModal.value = false
        toast.success('RuleSet content updated in memory. Remember to Save Policy.')
    }
}

const openRenameModal = () => {
  if (isDirty.value) return toast.warning(t('phMsgRenameDirty'))
  showRenameModal.value = true
}

const openCloneModal = () => {
  if (isDirty.value) return toast.warning(t('phMsgCloneDirty'))
  showCloneModal.value = true
}

const openDeleteModal = () => {
    showDeleteModal.value = true
}

const handleRename = async (newName) => {
    policy.value.name = newName
    await saveChanges()
    showRenameModal.value = false
    toast.success(t('phMsgRenamed'))
}

const handleClone = async (newName) => {
    // Clone
    const newId = `policy_${Date.now()}`
    const newPolicy = JSON.parse(JSON.stringify(config.value.policies[policy.value.id]))
    newPolicy.id = newId
    newPolicy.name = newName
    
    config.value.policies[newId] = newPolicy
    await savePolicies(config.value.policies)
    
    toast.success(t('phMsgCloned'))
    router.push(`/policy/${newId}`)
    showCloneModal.value = false
}

const handleDelete = async () => {
    delete config.value.policies[policy.value.id]
    await savePolicies(config.value.policies)
    toast.success(t('phMsgDeleted'))
    router.push('/settings')
    showDeleteModal.value = false
}

// Drag and Drop
const rulesRef = computed({
  get: () => policy.value.rules,
  set: (val) => { policy.value.rules = val }
})

const rejectRulesRef = computed({
  get: () => policy.value.rejectRules,
  set: (val) => { policy.value.rejectRules = val }
})

const { 
  dragOverIndex, 
  handleDragStart, 
  handleDragOver, 
  handleDrop, 
  handleDragEnd 
} = useDragDrop(rulesRef)

const { 
  dragOverIndex: dragOverRejectIndex, 
  handleDragStart: handleRejectDragStart, 
  handleDragOver: handleRejectDragOver, 
  handleDrop: handleRejectDrop, 
  handleDragEnd: handleRejectDragEnd 
} = useDragDrop(rejectRulesRef)


const getPlaceholder = (type) => {
    if (type === 'wildcard') return '*.example.com'
    if (type === 'regex') return '^https://.*\\.example\\.com'
    if (type === 'ip') return '192.168.1.0/24'
    return ''
}

const handleBatchReplace = (fromProxyId, toProxyId) => {
    let count = 0
    policy.value.rules.forEach(rule => {
        if (rule.type !== 'divider' && rule.proxyId === fromProxyId) {
            rule.proxyId = toProxyId
            count++
        }
    })
    
    if (count > 0) {
        toast.success(t('bpmMsgReplaced', [count]))
        showBatchReplaceModal.value = false
    } else {
        toast.info(t('bpmMsgNoMatch'))
    }
}

const handlePolicyMerge = async (sourcePolicyId) => {
    const sourcePolicy = config.value.policies[sourcePolicyId]
    if (!sourcePolicy) return
    
    // Merge rules
    // Strategy: Append non-duplicate rules
    // Or just append all? Let's append all for now, user can dedupe or we can smart dedupe
    
    // Simple Append
    const newRules = JSON.parse(JSON.stringify(sourcePolicy.rules))
    // Determine where to append? End of list
    policy.value.rules = [...policy.value.rules, ...newRules]
    
    toast.success(t('msgPolicyMerged'))
    showPolicyMergeModal.value = false
}

const handleExportPAC = () => {
    const pacScript = generatePacScriptFromPolicy(policy.value, config.value.proxies, config.value.proxyGroups)
    
    // Trigger download
    const blob = new Blob([pacScript], { type: 'application/x-ns-proxy-autoconfig' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${policy.value.name || 'proxy'}.pac`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
</script>
