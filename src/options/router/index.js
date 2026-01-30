import { createRouter, createWebHashHistory } from 'vue-router'
import GeneralSettings from '../views/GeneralSettings.vue'
import TempRules from '../views/TempRules.vue'
import ProxyHostDetail from '../views/ProxyHostDetail.vue'
import PolicyRuleDetail from '../views/PolicyRuleDetail.vue'
import PacScriptDetail from '../views/PacScriptDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/settings'
  },
  {
    path: '/settings',
    name: 'GeneralSettings',
    component: GeneralSettings
  },
  {
    path: '/temp-rules',
    name: 'TempRules',
    component: TempRules
  },
  {
    path: '/host/:id',
    name: 'ProxyHost',
    component: ProxyHostDetail
  },
  {
    path: '/policy/:id',
    name: 'PolicyRule',
    component: PolicyRuleDetail
  },
  {
    path: '/pac/:id',
    name: 'PacScript',
    component: PacScriptDetail
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Global navigation guard to prevent leaving pages with unsaved changes
let checkUnsavedChanges = null

// Export function to register unsaved changes checker
export function registerUnsavedChangesChecker(checker) {
  checkUnsavedChanges = checker
}

// Export function to unregister checker
export function unregisterUnsavedChangesChecker() {
  checkUnsavedChanges = null
}

// Export function to check if there are unsaved changes (renamed to avoid conflict)
export function hasUnsavedChanges() {
  if (checkUnsavedChanges && typeof checkUnsavedChanges === 'function') {
    return checkUnsavedChanges()
  }
  return false
}

router.beforeEach((to, from, next) => {
  // Check if current page has unsaved changes
  if (checkUnsavedChanges && typeof checkUnsavedChanges === 'function') {
    const hasUnsaved = checkUnsavedChanges()
    if (hasUnsaved) {
      // Block navigation
      next(false)
      return
    }
  }
  // Allow navigation
  next()
})

export default router
