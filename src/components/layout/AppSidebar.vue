<template>
  <aside class="ui-bg-card border-end border-subtle d-flex flex-column shrink-0 transition-colors" style="width: 18rem;">
    <SidebarBrand />

    <nav class="flex-1 overflow-y-auto custom-scrollbar p-3 d-flex flex-column gap-4">
      <!-- Fixed: Configuration -->
      <nav-group :title="$t('navConfig')">
        <SidebarItem to="/settings" icon="bi-gear" :label="$t('navGeneral')" />
        <SidebarItem to="/sync" icon="bi-cloud" :label="$t('navDataSync')" />
        <SidebarItem v-if="shouldShowTempRules" to="/temp-rules" icon="bi-clock-history" :label="$t('navTempRules')" />
        
        <button v-if="shouldShowMonitor" @click="openMonitor" class="w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-lg transition-colors group nav-item-inactive">
          <i class="bi bi-activity text-base" style="color: var(--ui-text-tertiary)"></i>
          <span class="text-xs text-truncate">{{ $t('navRequestMonitor') }}</span>
          <i class="bi bi-box-arrow-up-right text-xs ms-auto opacity-50"></i>
        </button>
      </nav-group>

      <!-- Proxy Hosts -->
      <nav-group :title="$t('navProxyHosts')" @add="showProxyModal = true">
        <SidebarItem v-for="h in proxyHosts" :key="h.id" :to="`/host/${h.id}`" icon="bi-pc-display" :label="h.name" :color="h.color" />
      </nav-group>

      <!-- Proxy Groups -->
      <nav-group :title="$t('navProxyGroups')" @add="showGroupModal = true">
        <SidebarItem v-for="g in proxyGroupsList" :key="g.id" :to="`/group/${g.id}`" icon="bi-layers-half" :label="g.name" :color="g.color" />
      </nav-group>

      <!-- Policy Rules -->
      <nav-group :title="$t('navPolicyRules')" @add="showPolicyModal = true">
        <SidebarItem v-for="r in policyRules" :key="r.id" :to="r.type === 'pac' ? `/pac/${r.id}` : `/policy/${r.id}`" :icon="r.icon" :label="r.name" :color="r.color" />
      </nav-group>
    </nav>

    <!-- Modals -->
    <PolicyCreationModal :visible="showPolicyModal" @close="showPolicyModal = false" @create="handleCreatePolicy" />
    <ProxyCreationModal :visible="showProxyModal" @close="showProxyModal = false" @create="handleCreateProxy" />
    <ProxyGroupCreationModal :visible="showGroupModal" @close="showGroupModal = false" @create="handleCreateProxyGroup" />
  </aside>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import SidebarBrand from './SidebarBrand.vue'
import SidebarItem from './SidebarItem.vue'
import PolicyCreationModal from '../policy/PolicyCreationModal.vue'
import ProxyCreationModal from '../proxy/ProxyCreationModal.vue'
import ProxyGroupCreationModal from '../proxy/ProxyGroupCreationModal.vue'
import { useSidebar } from '../../composables/useSidebar'

const {
  showPolicyModal, showProxyModal, showGroupModal,
  proxyHosts, proxyGroupsList, policyRules,
  shouldShowMonitor, shouldShowTempRules,
  handleCreateProxy, handleCreatePolicy, handleCreateProxyGroup, openMonitor
} = useSidebar()

// Inline NavGroup component to avoid creating another file for a tiny wrapper
const NavGroup = defineComponent({
  props: ['title'],

  setup(props, { slots, emit, attrs }) {
    return () => h('div', [
      h('div', { class: 'mb-2 d-flex align-items-center justify-content-between group' }, [
        h('h3', { class: 'text-xs fw-semibold ui-text-secondary text-uppercase m-0', style: { letterSpacing: '0.05em' } }, props.title),
        slots.add ? slots.add() : (attrs.onAdd ? h('button', { class: 'ui-button-icon', onClick: () => emit('add') }, [h('i', { class: 'bi bi-plus-lg text-sm' })]) : null)
      ]),
      h('div', { class: 'd-flex flex-column gap-1' }, slots.default?.())
    ])
  }
})
</script>

<style scoped>
/* Any remaining general sidebar styles */
.nav-item-active { background-color: var(--ui-bg-active); color: var(--bs-primary) !important; }
.nav-item-inactive { color: var(--ui-text-primary); }
.nav-item-inactive:hover { background-color: var(--ui-bg-hover); }
</style>
