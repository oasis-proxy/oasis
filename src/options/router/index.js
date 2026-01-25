import { createRouter, createWebHashHistory } from 'vue-router'
import GeneralSettings from '../views/GeneralSettings.vue'
import TempRules from '../views/TempRules.vue'
import ProxyHostDetail from '../views/ProxyHostDetail.vue'
import PolicyRuleDetail from '../views/PolicyRuleDetail.vue'

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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
