<template>
  <div class="h-100 d-flex flex-column bg-white dark:bg-background-dark relative transition-colors">
    
    <!-- Header -->
    <header class="h-24 px-5 d-flex align-items-center justify-content-between border-b border-slate-100 dark:border-divider-dark transition-colors">
      <div>
        <div class="d-flex align-items-center gap-3">
          <input 
             type="color" 
             v-model="policy.color"
             class="p-0 border-0 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-110"
             style="width: 24px; height: 24px; min-width: 24px;"
             title="Choose color"
          />
          <h2 class="fs-4 font-bold ui-text-primary tracking-tight m-0 text-truncate" style="max-width: 300px;" :title="policy.name">
            {{ policy.name || 'Auto Policy' }}
          </h2>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <!-- Show in Popup Switch -->
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2" title="Whether to show in the Popup page">
           <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="showInPopup" v-model="policy.showInPopup">
           <label class="form-check-label text-xs font-medium ui-text-secondary cursor-pointer" for="showInPopup">Show in Popup</label>
        </div>
        <button 
          @click="resetChanges"
          :disabled="!isDirty"
          class="px-3 py-2 text-xs font-medium ui-button-secondary rounded-lg transition-all"
        >
          Reset
        </button>

        <button 
          @click="saveChanges"
          :disabled="!isDirty"
          class="px-3 py-2 text-xs font-medium ui-button-primary rounded-lg shadow-lg shadow-primary/30 transition-colors d-flex align-items-center gap-2"
        >
          <i class="bi bi-check-lg text-lg"></i>
          <span>Save Changes</span>
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
                     <i class="bi bi-pencil text-slate-400"></i> Rename
                 </button>
               </li>
               <li>
                 <button @click="openCloneModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                     <i class="bi bi-files text-slate-400"></i> Clone
                 </button>
               </li>
                <li>
                  <button @click="showPolicyMergeModal = true" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-arrow-down-up text-slate-400"></i> Merge Policy
                  </button>
                </li>
                <li>
                  <button @click="handleExportPAC" class="dropdown-item w-100 text-left px-3 py-2 text-xs ui-text-primary rounded-md transition-colors d-flex align-items-center gap-2">
                      <i class="bi bi-download text-slate-400"></i> Export PAC
                  </button>
                </li>

               <li><hr class="dropdown-divider my-1 border-slate-200 dark:border-divider-dark"></li>
               <li>
                 <button @click="openDeleteModal" class="dropdown-item w-100 text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 rounded-md transition-colors d-flex align-items-center gap-2">
                     <i class="bi bi-trash"></i> Delete
                 </button>
               </li>
           </ul>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-5 scroll-smooth">
      <div v-if="policy" class="max-w-6xl mx-auto d-flex flex-column gap-4 pb-5">
        
        <!-- Normal Rules Section -->
        <section>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="text-sm font-semibold ui-text-primary m-0 uppercase tracking-wide">Normal Rules</h3>
            <div class="d-flex align-items-center gap-2">
              <button @click="showBatchReplaceModal = true" class="ui-button-secondary px-2 py-1 rounded-lg text-xs transition-colors d-flex align-items-center gap-2">
                <i class="bi bi-arrow-left-right" style="font-size: 10px;"></i> Batch Replace
              </button>
              <button @click="addRule" class="ui-button-icon" title="Add Rule">
                <i class="bi bi-plus-lg text-sm"></i>
              </button>
            </div>
          </div>


          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="d-flex gap-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-divider-dark text-xs font-semibold ui-text-secondary uppercase tracking-wider">
              <div style="width: 4%;" class="text-center"></div>
              <div style="width: 8%;" class="text-center">Valid</div>
              <div style="width: 16%;">Type</div>
              <div style="width: 44%;">Pattern</div>
              <div style="width: 20%;">Proxy</div>
              <div style="width: 8%;" class="text-center">Action</div>
            </div>

            <!-- Rules -->
            <div v-if="policy.rules && policy.rules.length > 0">
              <div v-for="(rule, index) in policy.rules" :key="rule.id || index">
                <!-- Divider Row -->
                <div 
                  v-if="rule.type === 'divider'" 
                  :class="[
                    'd-flex align-items-center gap-1 transition-colors',
                    dragOverIndex === index ? 'border-t-2 border-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  style="padding: 0px 8px; min-height: 20px;"
                  @dragover.prevent="handleDragOver($event, index)"
                  @drop="handleDrop($event, index)"
                  @dragenter.prevent
                >
                  <div style="width: 4%;" class="d-flex justify-content-center">
                    <i 
                      class="bi bi-grip-vertical cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
                      style="font-size: 12px;"
                      draggable="true"
                      @dragstart="handleDragStart($event, index)" 
                      @dragend="handleDragEnd"
                    ></i>
                  </div>
                  <div class="flex-1 d-flex align-items-center gap-2">
                    <div style="flex: 1; height: 1px; border-top: 1px solid #cbd5e1;" class="dark:border-slate-600"></div>
                    <span 
                      v-if="editingDividerIndex !== index"
                      @dblclick="startEditDivider(index, rule.label)"
                      class="text-xs font-semibold ui-text-secondary uppercase tracking-widest cursor-pointer hover:text-primary transition-colors px-2 d-flex align-items-center gap-2"
                      style="user-select: none; line-height: 1;"
                      title="Double-click to edit section name"
                    >
                      {{ rule.label || 'New Section' }}
                      <i class="bi bi-pencil" style="font-size: 9px; opacity: 0.6;"></i>
                    </span>
                    <input 
                      v-else
                      ref="dividerInput"
                      v-model="editingDividerLabel"
                      @blur="saveDividerLabel(index)"
                      @keyup.enter="saveDividerLabel(index)"
                      @keyup.esc="cancelEditDivider"
                      class="form-control text-xs font-semibold uppercase tracking-widest text-center"
                      style="width: 150px; height: 18px; padding: 2px 8px;"
                    />
                    <div style="flex: 1; height: 1px; border-top: 1px solid #cbd5e1;" class="dark:border-slate-600"></div>
                  </div>
                  <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                    <button @click="insertRuleBelow(index)" class="ui-button-icon" title="Add rule below">
                      <i class="bi bi-plus-lg text-xs"></i>
                    </button>
                    <button @click="insertDividerBelow(index)" class="ui-button-icon" title="Add divider below">
                      <i class="bi bi-inboxes-fill text-xs"></i>
                    </button>
                    <button @click="deleteRule(index)" class="ui-button-icon" title="Delete">
                      <i class="bi bi-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Normal Rule Row -->
                <div 
                  v-else 
                  :class="[
                    'd-flex align-items-center gap-1 p-2 transition-colors',
                    dragOverIndex === index ? 'border-t-2 border-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                    !rule.valid ? 'opacity-50' : ''
                  ]"
                  @dragover.prevent="handleDragOver($event, index)"
                  @drop="handleDrop($event, index)"
                  @dragenter.prevent
                >
                  <div style="width: 4%;" class="d-flex justify-content-center">
                    <i 
                      class="bi bi-grip-vertical cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
                      style="font-size: 14px;"
                      draggable="true"
                      @dragstart="handleDragStart($event, index)" 
                      @dragend="handleDragEnd"
                    ></i>
                  </div>
                  <div style="width: 8%;" class="d-flex justify-content-center">
                    <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                      <input 
                        class="form-check-input cursor-pointer" 
                        type="checkbox" 
                        v-model="rule.valid"
                        style="width: 28px; height: 16px;"
                      >
                    </div>
                  </div>
                  <div style="width: 16%;">
                    <select 
                      v-model="rule.ruleType" 
                      class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                      style="height: 28px; max-width: none;"
                      @change="handleRuleTypeChange(index, rule)"
                    >
                      <option value="wildcard">Wildcard</option>
                      <option value="regex">Regex</option>
                      <option value="ip">IP/CIDR</option>
                      <option value="ruleset">Rule Set</option>
                    </select>
                  </div>
                  <div style="width: 44%;">
                    <!-- RuleSet input -->
                    <div v-if="rule.ruleType === 'ruleset'" class="position-relative w-100">
                      <input 
                        v-model="rule.pattern" 
                        type="text" 
                        placeholder="Enter RuleSet URL..." 
                        class="form-control ui-input w-100 mw-100 rounded text-xs py-0 font-mono"
                        :style="`height: 28px; padding-left: 8px; padding-right: 28px;${duplicateIndices.has(index) ? ' border-color: var(--bs-primary) !important;' : (validationErrors[index] ? ' border-color: #dc3545 !important;' : '')}`"
                        @focus="focusedIndex = index"
                        @blur="focusedIndex = null; validateRule(index, rule); fetchRuleSetContent(index, rule.pattern)"
                      />
                      <button 
                        @click="openRuleSetModal(rule, index)"
                        :disabled="fetchingRuleSetIndex === index"
                        class="position-absolute bg-transparent border-0 p-0 ui-text-secondary hover:text-primary transition-colors"
                        :class="{ 'cursor-not-allowed': fetchingRuleSetIndex === index }"
                        title="View RuleSet Content"
                        style="right: 6px; top: 50%; transform: translateY(-50%); font-size: 12px;"
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
                      placeholder="Pattern..." 
                      class="form-control ui-input w-100 mw-100 rounded text-xs py-0 px-2 font-mono"
                      :style="`height: 28px;${duplicateIndices.has(index) ? ' border-color: var(--bs-primary) !important;' : (validationErrors[index] ? ' border-color: #dc3545 !important;' : '')}`"
                      @focus="focusedIndex = index"
                      @blur="focusedIndex = null; validateRule(index, rule)"
                    />
                  </div>
                  <div style="width: 20%;">
                    <select 
                      v-model="rule.proxyId" 
                      class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                      style="height: 28px; max-width: none;"
                    >
                      <option value="direct">Direct</option>
                      <option v-for="proxy in proxyOptions" :key="proxy.id" :value="proxy.id">
                        {{ proxy.label }}
                      </option>
                    </select>
                  </div>
                  <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                    <button @click="insertRuleBelow(index)" class="ui-button-icon" title="Add rule below">
                      <i class="bi bi-plus-lg text-xs"></i>
                    </button>
                    <button @click="insertDividerBelow(index)" class="ui-button-icon p-0.5" title="Add divider">
                      <i class="bi bi-inboxes-fill text-xs"></i>
                    </button>
                    <button @click="deleteRule(index)" class="ui-button-icon p-0.5" title="Delete">
                      <i class="bi bi-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
              <p class="text-xs ui-text-secondary m-0">No rules defined. Click "+" to get started.</p>
            </div>


            <!-- Default Strategy Footer -->
            <div class="d-flex gap-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-divider-dark transition-colors">
              <div style="width: 4%;"></div>
              <div style="width: 8%;"></div>
              <div style="width: 16%;"></div>
              <div style="width: 44%;" class="d-flex align-items-center justify-content-end px-2">
                 <div class="d-flex align-items-center gap-2 text-xs font-semibold ui-text-secondary uppercase tracking-widest whitespace-nowrap">
                   <i class="bi bi-arrow-return-right"></i> Default Strategy
                </div>
              </div>
              <div style="width: 20%;">
                <select 
                    v-model="policy.defaultProfileId"
                    class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                    style="height: 28px; max-width: none;"
                >
                    <option value="direct">Direct</option>
                    <option v-for="proxy in proxyOptions" :key="proxy.id" :value="proxy.id">
                        {{ proxy.label }}
                    </option>
                </select>
              </div>
              <div style="width: 8%;"></div>
            </div>
          </div>
        </section>

        <!-- Reject Rules Section -->
        <section>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="text-sm font-semibold ui-text-primary m-0 uppercase tracking-wide">Reject Rules</h3>
            <button @click="addRejectRule" class="ui-button-icon" title="Add Reject Rule">
              <i class="bi bi-plus-lg text-sm"></i>
            </button>
          </div>

          <div class="ui-card rounded-xl border divide-y divide-slate-100 dark:divide-divider-dark shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="d-flex gap-1 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-divider-dark text-xs font-semibold ui-text-secondary uppercase tracking-wider">
              <div style="width: 4%;" class="text-center"></div>
              <div style="width: 8%;" class="text-center">Valid</div>
              <div style="width: 16%;">Type</div>
              <div style="width: 44%;">Pattern</div>
              <div style="width: 20%;">Proxy</div>
              <div style="width: 8%;" class="text-center">Action</div>
            </div>

            <!-- Reject Rules -->
            <div v-if="policy.rejectRules && policy.rejectRules.length > 0">
              <div v-for="(rule, index) in policy.rejectRules" :key="rule.id || index">
                <!-- Divider Row -->
                <div 
                  v-if="rule.type === 'divider'" 
                  :class="[
                    'd-flex align-items-center gap-1 transition-colors',
                    dragOverRejectIndex === index ? 'border-t-2 border-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  style="padding: 0px 8px; min-height: 20px;"
                  @dragover.prevent="handleRejectDragOver($event, index)"
                  @drop="handleRejectDrop($event, index)"
                  @dragenter.prevent
                >
                  <div style="width: 4%;" class="d-flex justify-content-center">
                    <i 
                      class="bi bi-grip-vertical cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
                      style="font-size: 12px;"
                      draggable="true"
                      @dragstart="handleRejectDragStart($event, index)" 
                      @dragend="handleRejectDragEnd"
                    ></i>
                  </div>
                  <div class="flex-1 d-flex align-items-center gap-2">
                    <div style="flex: 1; height: 1px; border-top: 1px solid #cbd5e1;" class="dark:border-slate-600"></div>
                    <span 
                      v-if="editingRejectDividerIndex !== index"
                      @dblclick="startEditRejectDivider(index, rule.label)"
                      class="text-xs font-semibold ui-text-secondary uppercase tracking-widest cursor-pointer hover:text-primary transition-colors px-2 d-flex align-items-center gap-1"
                      style="user-select: none; line-height: 1;"
                      title="Double-click to edit section name"
                    >
                      {{ rule.label || 'New Section' }}
                      <i class="bi bi-pencil" style="font-size: 9px; opacity: 0.6;"></i>
                    </span>
                    <input 
                      v-else
                      ref="rejectDividerInput"
                      v-model="editingRejectDividerLabel"
                      @blur="saveRejectDividerLabel(index)"
                      @keyup.enter="saveRejectDividerLabel(index)"
                      @keyup.esc="cancelEditRejectDivider"
                      class="form-control text-xs font-semibold uppercase tracking-widest text-center"
                      style="width: 150px; height: 18px; padding: 2px 8px;"
                    />
                    <div style="flex: 1; height: 1px; border-top: 1px solid #cbd5e1;" class="dark:border-slate-600"></div>
                  </div>
                  <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                    <button @click="insertRejectRuleBelow(index)" class="ui-button-icon" title="Add rule below">
                      <i class="bi bi-plus-lg text-xs"></i>
                    </button>
                    <button @click="insertRejectDividerBelow(index)" class="ui-button-icon" title="Add divider below">
                      <i class="bi bi-inboxes-fill text-xs"></i>
                    </button>
                    <button @click="deleteRejectRule(index)" class="ui-button-icon" title="Delete">
                      <i class="bi bi-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Normal Reject Rule Row -->
                <div 
                  v-else
                  :class="[
                  'd-flex align-items-center gap-1 p-2 transition-colors',
                  dragOverRejectIndex === index ? 'border-t-2 border-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                   !rule.valid ? 'opacity-50' : ''
                ]"
                @dragover.prevent="handleRejectDragOver($event, index)"
                @drop="handleRejectDrop($event, index)"
                @dragenter.prevent
              >
                <div style="width: 4%;" class="d-flex justify-content-center">
                  <i 
                    class="bi bi-grip-vertical cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
                    style="font-size: 14px;"
                    draggable="true"
                    @dragstart="handleRejectDragStart($event, index)"
                    @dragend="handleRejectDragEnd"
                  ></i>
                </div>
                <div style="width: 8%;" class="d-flex justify-content-center">
                    <div class="form-check form-switch m-0 d-flex align-items-center justify-content-center">
                      <input 
                        class="form-check-input cursor-pointer" 
                        type="checkbox" 
                        v-model="rule.valid"
                        style="width: 28px; height: 16px;"
                      >
                    </div>
                  </div>
                <div style="width: 16%;">
                  <select 
                    v-model="rule.ruleType" 
                    class="form-select ui-input w-100 rounded border text-xs py-0 px-1.5" 
                    style="height: 28px; max-width: none;"
                    @change="handleRejectRuleTypeChange(index, rule)"
                  >
                    <option value="wildcard">Wildcard</option>
                    <option value="regex">Regex</option>
                    <option value="ip">IP/CIDR</option>
                    <option value="ruleset">Rule Set</option>
                  </select>
                </div>
                <div style="width: 44%;" class="position-relative">
                  <input 
                    v-model="rule.pattern" 
                    type="text" 
                    placeholder="Pattern..." 
                    class="form-control ui-input w-100 mw-100 rounded border text-xs py-0 px-2 font-mono"
                    :style="`height: 28px;${rejectValidationErrors[index] ? ' border-color: #dc3545 !important;' : ''}`"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = null; validateRejectRule(index, rule)"
                  />

                </div>
                <div style="width: 20%;">
                  <div class="w-100 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs px-2 d-flex align-items-center gap-2 cursor-not-allowed" style="user-select: none; height: 28px;">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    REJECT
                  </div>
                </div>
                <div style="width: 8%;" class="d-flex align-items-center justify-content-around">
                  <button @click="insertRejectRuleBelow(index)" class="ui-button-icon" title="Add rule below">
                    <i class="bi bi-plus-lg text-xs"></i>
                  </button>
                  <button @click="insertRejectDividerBelow(index)" class="ui-button-icon p-0.5" title="Add divider">
                    <i class="bi bi-inboxes-fill text-xs"></i>
                  </button>
                  <button @click="deleteRejectRule(index)" class="ui-button-icon p-0.5" title="Delete">
                    <i class="bi bi-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-2 d-flex align-items-center justify-content-center" style="min-height: 44px;">
              <p class="text-xs ui-text-secondary m-0">No reject rules defined.</p>
            </div>
          </div>
        </section>

      </div>
    </div>

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
      :proxyOptions="proxyOptions" 
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerUnsavedChangesChecker, unregisterUnsavedChangesChecker } from '../router'
import { loadConfig, savePolicies } from '../../common/storage'
import { decodeRuleSetContent } from '../../common/ruleset'
import { generatePacScriptFromPolicy } from '../../common/pac'
import { validatePattern } from '../../common/validation'
import { useDragDrop } from '../../common/dragDrop'
import { toast } from '../utils/toast'
import ProxyRenameModal from '../components/ProxyRenameModal.vue'
import ProxyCloneModal from '../components/ProxyCloneModal.vue'
import ProxyDeleteModal from '../components/ProxyDeleteModal.vue'
import RuleSetContentModal from '../components/RuleSetContentModal.vue'
import BatchProxyReplaceModal from '../components/BatchProxyReplaceModal.vue'
import PolicyMergeModal from '../components/PolicyMergeModal.vue'

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

// Proxy options for dropdown
const proxyOptions = computed(() => {
  if (!config.value || !config.value.proxies) return []
  return Object.values(config.value.proxies).map(p => ({ id: p.id, label: p.label || p.name }))
})

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
            policy.value.name = 'Auto Policy'
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
      toast.warning('You have unsaved changes. Please save or reset before leaving.')
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
    
    toast.success('Policy saved successfully')
    
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
    // Re-validate after insertion
    nextTick(() => revalidateAllRules())
}

const insertDividerBelow = (index) => {
    const newDivider = {
        id: `divider_${Date.now()}`,
        type: 'divider',
        label: 'New Section'
    }
    policy.value.rules.splice(index + 1, 0, newDivider)
}

// Divider label editing
const startEditDivider = (index, currentLabel) => {
  editingDividerIndex.value = index
  editingDividerLabel.value = currentLabel || 'New Section'
  nextTick(() => {
    if (dividerInput.value) {
      const input = Array.isArray(dividerInput.value) ? dividerInput.value[0] : dividerInput.value
      if (input) {
        input.focus()
        input.select()
      }
    }
  })
}

const saveDividerLabel = (index) => {
  if (editingDividerIndex.value === index) {
    const label = editingDividerLabel.value.trim() || 'New Section'
    policy.value.rules[index].label = label
    editingDividerIndex.value = null
    editingDividerLabel.value = ''
  }
}

const cancelEditDivider = () => {
  editingDividerIndex.value = null
  editingDividerLabel.value = ''
}

// Insert actions for reject rules
const insertRejectRuleBelow = (index) => {
    const newRule = {
        id: `reject_${Date.now()}`,
        ruleType: 'wildcard',
        valid: true,
        pattern: ''
    }
    policy.value.rejectRules.splice(index + 1, 0, newRule)
    // Re-validate after insertion
    nextTick(() => revalidateAllRejectRules())
}

const insertRejectDividerBelow = (index) => {
    const newDivider = {
        id: `reject_divider_${Date.now()}`,
        type: 'divider',
        label: 'New Section'
    }
    policy.value.rejectRules.splice(index + 1, 0, newDivider)
}

// Reject Divider label editing
const startEditRejectDivider = (index, currentLabel) => {
  editingRejectDividerIndex.value = index
  editingRejectDividerLabel.value = currentLabel || 'New Section'
  nextTick(() => {
    if (rejectDividerInput.value) {
      const input = Array.isArray(rejectDividerInput.value) ? rejectDividerInput.value[0] : rejectDividerInput.value
      if (input) {
        input.focus()
        input.select()
      }
    }
  })
}

const saveRejectDividerLabel = (index) => {
  if (editingRejectDividerIndex.value === index) {
    const label = editingRejectDividerLabel.value.trim() || 'New Section'
    policy.value.rejectRules[index].label = label
    editingRejectDividerIndex.value = null
    editingRejectDividerLabel.value = ''
  }
}

const cancelEditRejectDivider = () => {
  editingRejectDividerIndex.value = null
  editingRejectDividerLabel.value = ''
}

// RuleSet content fetching
const fetchRuleSetContent = async (index, url) => {
  if (!url || !url.trim()) return
  
  const rule = policy.value.rules[index]
  if (!rule) return
  
  // Set loading state
  fetchingRuleSetIndex.value = index
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_URL',
      url: url.trim()
    })
    console.log('Response from background:', response)
    
    if (response.success) {
      let content = response.text
      console.log('Raw content:', content.substring(0, 100))
      
      // Process content based on format (Base64 detection)
      const decoded = decodeRuleSetContent(content)
      if (decoded !== content) {
          content = decoded
          console.log('Decoded Base64 RuleSet content')
      }
      
      // Update to new structure (with backward compatibility)
      const now = Date.now()
      if (!rule.ruleSet) {
        rule.ruleSet = {}
      }
      
      rule.ruleSet.content = content
      rule.ruleSet.lastUpdated = now
      rule.ruleSet.lastFetched = now
      rule.ruleSet.fetchError = null
      
      
      
      console.log('RuleSet content saved:', content.substring(0, 100))
      
      // Notify user to save manually
      toast.success('RuleSet content updated. Please save changes.')
      
    } else {
      console.error('Failed to fetch RuleSet:', response.error)
      // Save error to rule
      if (!rule.ruleSet) {
        rule.ruleSet = {}
      }
      rule.ruleSet.fetchError = response.error
      rule.ruleSet.lastFetched = Date.now()
    }
  } catch (error) {
    console.error('Error fetching RuleSet:', error)
    if (!rule.ruleSet) {
      rule.ruleSet = {}
    }
    rule.ruleSet.fetchError = error.message
    rule.ruleSet.lastFetched = Date.now()
  } finally {
    // Clear loading state
    fetchingRuleSetIndex.value = null
  }
}

const openRuleSetModal = (rule, index) => {
  // Support both old string parameter and new rule object
  if (typeof rule === 'string') {
    // Old usage: openRuleSetModal(content)
    selectedRuleSetContent.value = rule || ''
    selectedRuleSetUrl.value = ''
    selectedRuleSetLastUpdated.value = null
    selectedRuleSetIndex.value = null
  } else {
    // New usage: openRuleSetModal(rule, index)
    const content = rule.ruleSet?.content || ''
    const url = rule.pattern || ''
    const lastUpdated = rule.ruleSet?.lastUpdated || null
    
    selectedRuleSetContent.value = content
    selectedRuleSetUrl.value = url
    selectedRuleSetLastUpdated.value = lastUpdated
    selectedRuleSetIndex.value = index
  }
  
  showRuleSetModal.value = true
}

const handleRuleSetUpdate = async () => {
  if (selectedRuleSetIndex.value !== null && selectedRuleSetUrl.value) {
    await fetchRuleSetContent(selectedRuleSetIndex.value, selectedRuleSetUrl.value)
    // Update modal content after fetch (originalPolicy is already synced in fetchRuleSetContent)
    const rule = policy.value.rules[selectedRuleSetIndex.value]
    if (rule) {
      selectedRuleSetContent.value = rule.ruleSet?.content || ''
      selectedRuleSetLastUpdated.value = rule.ruleSet?.lastUpdated || null
    }
  }
}

// Batch Proxy Replace
const handleBatchReplace = (fromProxyId, toProxyId) => {
  if (!policy.value.rules) return
  
  policy.value.rules.forEach(rule => {
    if (rule.type !== 'divider' && rule.proxyId === fromProxyId) {
      rule.proxyId = toProxyId
    }
  })
  
  showBatchReplaceModal.value = false
}

// Policy Merge
const handlePolicyMerge = (options) => {
  const { sourceId, conflictMode, importNormal, importReject } = options
  const sourcePolicy = config.value.policies[sourceId]
  if (!sourcePolicy) return
  
  // Helper to check if rule exists (same type and pattern)
  const ruleExists = (rules, newRule) => {
    return rules.some(r => 
      r.type !== 'divider' && 
      r.ruleType === newRule.ruleType && 
      r.pattern === newRule.pattern
    )
  }
  
  // Merge Normal Rules (add at beginning)
  if (importNormal && sourcePolicy.rules) {
    const rulesToAdd = []
    sourcePolicy.rules.forEach(sourceRule => {
      if (sourceRule.type === 'divider') {
        if (conflictMode === 'overwrite') {
          rulesToAdd.push({ ...sourceRule })
        }
        return
      }
      
      const exists = ruleExists(policy.value.rules, sourceRule)
      if (!exists) {
        rulesToAdd.push({ ...sourceRule })
      } else if (conflictMode === 'overwrite') {
        const index = policy.value.rules.findIndex(r => 
          r.type !== 'divider' && 
          r.ruleType === sourceRule.ruleType && 
          r.pattern === sourceRule.pattern
        )
        if (index >= 0) {
          policy.value.rules[index] = { ...sourceRule }
        }
      }
    })
    // Add all new rules at the beginning
    policy.value.rules.unshift(...rulesToAdd)
  }
  
  // Merge Reject Rules (add at beginning)
  if (importReject && sourcePolicy.rejectRules) {
    const rulesToAdd = []
    sourcePolicy.rejectRules.forEach(sourceRule => {
      if (sourceRule.type === 'divider') {
        if (conflictMode === 'overwrite') {
          rulesToAdd.push({ ...sourceRule })
        }
        return
      }
      
      const exists = ruleExists(policy.value.rejectRules, sourceRule)
      if (!exists) {
        rulesToAdd.push({ ...sourceRule })
      } else if (conflictMode === 'overwrite') {
        const index = policy.value.rejectRules.findIndex(r => 
          r.type !== 'divider' && 
          r.ruleType === sourceRule.ruleType && 
          r.pattern === sourceRule.pattern
        )
        if (index >= 0) {
          policy.value.rejectRules[index] = { ...sourceRule }
        }
      }
    })
    // Add all new rules at the beginning
    policy.value.rejectRules.unshift(...rulesToAdd)
  }
  
  showPolicyMergeModal.value = false
  toast.success('Rules merged successfully')
  // Re-validate after merge
  nextTick(() => {
    revalidateAllRules()
    revalidateAllRejectRules()
  })
}

// PAC Script Export
const handleExportPAC = async () => {
  if (!policy.value || !policy.value.name) {
    console.error('Policy data not loaded')
    return
  }

  // Fetch temporary rules (if this is the active policy, or just include them anyway?)
  // The requirement says "active auto policy exporting... should include temporary rules".
  // We can check if this policy ID matches active ID, or just include all.
  // Generally, temp rules are session-bound and apply to the "current context".
  // If the user exports a *different* policy than active, should temp rules apply? Probably not?
  // But let's check activeProfileId.
  let tempRules = []
  try {
      if (config.value && config.value.activeProfileId === policy.value.id) {
           const sessionData = await chrome.storage.session.get('tempRules')
           if (sessionData && sessionData.tempRules) {
               tempRules = sessionData.tempRules
           }
      }
  } catch (e) {
      console.warn('Failed to fetch temp rules for export:', e)
  }
  
  // Generate PAC script using common module
  const pacScript = generatePacScriptFromPolicy(policy.value, config.value.proxies || {}, config.value.reject, tempRules)
  
  // Create download
  const blob = new Blob([pacScript], { type: 'application/x-ns-proxy-autoconfig' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${policy.value.name.replace(/[^a-zA-Z0-9]/g, '_')}.pac`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Drag and Drop (using common/dragDrop.js)
// Use writable computed refs to allow useDragDrop to modify the arrays
const normalRulesRef = computed({
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
} = useDragDrop(normalRulesRef, () => {
  // Re-validate after drag
  nextTick(() => revalidateAllRules())
})

const {
  dragOverIndex: dragOverRejectIndex,
  handleDragStart: handleRejectDragStart,
  handleDragOver: handleRejectDragOver,
  handleDrop: handleRejectDrop,
  handleDragEnd: handleRejectDragEnd
} = useDragDrop(rejectRulesRef)

// Modal Handlers
const openRenameModal = () => {
  if (isDirty.value) {
    toast.warning('Please save or reset your changes before renaming')
    return
  }
  showRenameModal.value = true
}

const openCloneModal = () => {
  if (isDirty.value) {
    toast.warning('Please save or reset your changes before cloning')
    return
  }
  showCloneModal.value = true
}

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const handleRename = async (newName) => {
    if (!policy.value || !config.value) return
    config.value.policies[policy.value.id].name = newName
    await savePolicies(config.value.policies)
    toast.success('Policy renamed successfully')
    await loadPolicyData()
    showRenameModal.value = false
}

const handleClone = async (newName) => {
    if (!policy.value || !config.value) return
    const newId = `policy_${Date.now()}`
    const newPolicy = JSON.parse(JSON.stringify(config.value.policies[policy.value.id]))
    newPolicy.id = newId
    newPolicy.name = newName
    config.value.policies[newId] = newPolicy
    await savePolicies(config.value.policies)
    toast.success('Policy cloned successfully')
    router.push(`/policy/${newId}`)
    showCloneModal.value = false
}

const handleDelete = async () => {
    if (!policy.value || !config.value) return
    delete config.value.policies[policy.value.id]
    await savePolicies(config.value.policies)
    toast.success('Policy deleted successfully')
    router.push('/settings')
    showDeleteModal.value = false
}
</script>

<style>
/* RuleSet loading animation - not scoped to avoid conflicts */
@keyframes ruleset-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.bi-arrow-repeat[style*="animation"] {
  display: inline-block !important;
}
</style>
