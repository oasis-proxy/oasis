<template>
  <aside class="w-72 bg-slate-50 dark:bg-sidebar-dark border-r border-slate-200 dark:border-divider-dark flex flex-col shrink-0 transition-colors">
    <!-- Logo / Brand -->
    <div class="h-24 flex items-center px-6 border-b border-slate-100 dark:border-divider-dark transition-colors">
      <div class="flex items-center gap-3 text-slate-900 dark:text-white">
        <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30" style="width: 32px; height: 32px;">
          <i class="bi bi-router text-[18px]"></i>
        </div>
        <h1 class="text-base font-bold tracking-tight m-0">Oasis Proxy</h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
      
      <!-- Fixed: Configuration -->
      <div>
        <div class="px-2 mb-2 flex items-center justify-between group cursor-pointer">
          <h3 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider m-0">Configuration</h3>
        </div>
        <div class="space-y-1">
          <router-link 
            to="/settings" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
              @click="navigate"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border group"
              :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
            >
              <i class="bi bi-gear text-[18px]"></i>
              <span class="text-xs">General Settings</span>
            </button>
          </router-link>

          <router-link 
            to="/temp-rules" 
            custom 
            v-slot="{ navigate, isActive }"
          >
            <button 
               @click="navigate"
               class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
               :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
            >
              <i class="bi bi-clock-history text-[18px]"></i>
              <span class="text-xs">Temporary Rules</span>
            </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Proxy Hosts -->
      <div>
        <div class="px-2 mb-2 flex items-center justify-between group">
          <h3 class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider m-0">Proxy Hosts</h3>
          <button class="text-slate-400 hover:text-primary transition-colors p-1 rounded bg-transparent hover:bg-transparent dark:hover:bg-white/5 border-0">
            <i class="bi bi-plus text-[14px]"></i>
          </button>
        </div>
        <div class="space-y-1">
          <router-link 
            v-for="host in proxyHosts" 
            :key="host.id"
            :to="`/host/${host.id}`"
            custom 
            v-slot="{ navigate, isActive }"
          >
             <button 
                @click="navigate"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
                :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
             >
                <i :class="['bi text-[18px]', host.icon, isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300']"></i>
                <span class="text-xs">{{ host.name }}</span>
                <span v-if="host.status" :class="['ml-auto w-2 h-2 rounded-full', host.statusColor]"></span>
             </button>
          </router-link>
        </div>
      </div>

      <!-- Variable: Policy Rules -->
      <div>
        <div class="px-2 mb-2 flex items-center justify-between group">
          <h3 class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider m-0">Policy Rules</h3>
          <button class="text-slate-400 hover:text-primary transition-colors p-1 rounded bg-transparent hover:bg-transparent dark:hover:bg-white/5 border-0">
            <i class="bi bi-plus text-[14px]"></i>
          </button>
        </div>
        <div class="space-y-1">
          <router-link 
            v-for="rule in policyRules" 
            :key="rule.id"
            :to="`/policy/${rule.id}`"
            custom 
            v-slot="{ navigate, isActive }"
          >
             <button 
                @click="navigate"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border group"
                :class="isActive ? 'nav-item-active shadow-sm border-slate-100 dark:border-divider-dark text-primary font-medium' : 'border-transparent text-slate-600 dark:text-slate-400 nav-item-hover'"
             >
                <i :class="['bi text-[18px]', rule.icon, isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300']"></i>
                <span class="text-xs">{{ rule.name }}</span>
             </button>
          </router-link>
        </div>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

// Mock Data for "Variable" items
// In a real app, this would come from a store or props
const proxyHosts = ref([
    { id: '1', name: 'Home Server', icon: 'bi-hdd-network', status: 'online', statusColor: 'bg-green-500' },
    { id: '2', name: 'Office VPN', icon: 'bi-building', status: null },
    { id: '3', name: 'US West Node', icon: 'bi-rocket-takeoff', status: null },
])

const policyRules = ref([
    { id: '1', name: 'Netflix Direct', icon: 'bi-list-check' },
    { id: '2', name: 'AdBlock Lists', icon: 'bi-shield-check' }
])
</script>
