<template>
  <!-- Header -->
  <header class="popup-header">
      <div class="d-flex align-items-center gap-2">
        <div class="text-primary d-flex align-items-center justify-content-center" style="width: 20px; height: 20px;">
          <i class="bi bi-shield-lock" style="font-size: 20px;"></i>
        </div>
        <h2>Oasis Proxy</h2>
      </div>
      <div class="d-flex align-items-center gap-1">
        <button @click="openOptions" class="header-btn" title="Options">
          <i class="bi bi-gear" style="font-size: 20px;"></i>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="popup-main">
      <!-- Defaults Section -->
      <div class="mb-2">
        <h3 class="section-heading">Defaults</h3>
        <div>
          <label 
            class="profile-item"
            :class="{ active: isActive('direct') }"
            @click="selectProfile('direct')"
          >
            <div class="profile-icon">
              <i class="bi bi-lightning" style="font-size: 18px;"></i>
            </div>
            <p class="profile-name">Direct Connect</p>
            <div class="profile-radio">
              <i v-if="isActive('direct')" class="bi bi-check" style="font-size: 10px;"></i>
            </div>
          </label>

          <label 
            class="profile-item"
            :class="{ active: isActive('system') }"
            @click="selectProfile('system')"
          >
            <div class="profile-icon">
              <i class="bi bi-globe" style="font-size: 18px;"></i>
            </div>
            <p class="profile-name">System Proxy</p>
            <div class="profile-radio">
              <i v-if="isActive('system')" class="bi bi-check" style="font-size: 10px;"></i>
            </div>
          </label>
        </div>
      </div>

      <!-- Host Proxy Section -->
      <div v-if="hostProxies.length > 0" class="mb-2">
        <h3 class="section-heading">Host Proxy</h3>
        <div>
          <label 
            v-for="profile in hostProxies"
            :key="profile.id"
            class="profile-item"
            :class="{ active: isActive(profile.id) }"
            @click="selectProfile(profile.id)"
          >
            <div 
              class="profile-icon"
              :style="getIconStyle(profile)"
            >
              <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
            </div>
            <p class="profile-name">{{ profile.name }}</p>
            <div 
              v-if="isActive(profile.id)"
              class="text-primary"
            >
              <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
            </div>
            <div v-else class="profile-radio"></div>
          </label>
        </div>
      </div>

      <!-- PAC Script Section -->
      <div v-if="pacScripts.length > 0" class="mb-2">
        <h3 class="section-heading">PAC Script</h3>
        <div>
          <label 
            v-for="profile in pacScripts"
            :key="profile.id"
            class="profile-item"
            :class="{ active: isActive(profile.id) }"
            @click="selectProfile(profile.id)"
          >
            <div 
              class="profile-icon"
              :style="getIconStyle(profile)"
            >
              <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
            </div>
            <p class="profile-name">{{ profile.name }}</p>
            <div 
              v-if="isActive(profile.id)"
              class="text-primary"
            >
              <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
            </div>
            <div v-else class="profile-radio"></div>
          </label>
        </div>
      </div>

      <!-- Auto Policy Section -->
      <div v-if="autoPolicies.length > 0" class="mb-2">
        <h3 class="section-heading">Auto Policy</h3>
        <div>
          <label 
            v-for="profile in autoPolicies"
            :key="profile.id"
            class="profile-item"
            :class="{ active: isActive(profile.id) }"
            @click="selectProfile(profile.id)"
          >
            <div 
              class="profile-icon"
              :style="getIconStyle(profile)"
            >
              <i :class="['bi', profile.icon]" style="font-size: 18px;"></i>
            </div>
            <p class="profile-name">{{ profile.name }}</p>
            <div 
              v-if="isActive(profile.id)"
              class="text-primary"
            >
              <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
            </div>
            <div v-else class="profile-radio"></div>
          </label>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadConfig, saveConfig } from '../common/storage'

const config = ref(null)
const activeProfileId = ref('direct')

// Load configuration
onMounted(async () => {
  config.value = await loadConfig()
  activeProfileId.value = config.value.activeProfileId || 'direct'
  
  // Apply theme based on config
  applyTheme(config.value.ui?.theme || 'auto')
})

const applyTheme = (mode) => {
  const html = document.documentElement
  if (mode === 'dark') {
    html.classList.add('dark')
  } else if (mode === 'light') {
    html.classList.remove('dark')
  } else {
    // Auto mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

// Compute grouped profiles
const hostProxies = computed(() => {
  if (!config.value?.proxies) return []
  return Object.values(config.value.proxies).map(proxy => ({
    id: proxy.id,
    name: proxy.label || proxy.host || 'Unnamed Proxy',
    icon: 'bi-hdd-network',
    color: proxy.color,
    type: 'proxy'
  }))
})

const pacScripts = computed(() => {
  if (!config.value?.pacs) return []
  return Object.values(config.value.pacs).map(pac => ({
    id: pac.id,
    name: pac.name || pac.url || 'Unnamed PAC',
    icon: 'bi-file-earmark-code',
    color: pac.color,
    type: 'pac'
  }))
})

const autoPolicies = computed(() => {
  if (!config.value?.policies) return []
  return Object.values(config.value.policies).map(policy => ({
    id: policy.id,
    name: policy.name || policy.id,
    icon: 'bi-diagram-3',
    color: policy.color,
    type: 'policy'
  }))
})

const isActive = (id) => {
  return activeProfileId.value === id
}

const getIconStyle = (profile) => {
  if (isActive(profile.id)) {
    return {
      color: profile.color || 'var(--bs-primary)'
    }
  }
  return {
    color: profile.color || '#4b5563'
  }
}

const selectProfile = async (profileId) => {
  activeProfileId.value = profileId
  
  // Save to config
  if (config.value) {
    config.value.activeProfileId = profileId
    await saveConfig(config.value)

    // Handle Refresh on Switch
    if (config.value.behavior?.refreshOnSwitch) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.reload(tabs[0].id)
        }
      })
    }
  }
}

const openOptions = () => {
  chrome.runtime.openOptionsPage()
}
</script>
