<template>
  <div>
    <!-- Defaults Section -->
    <div class="mb-2">
      <h3 class="section-heading">{{ $t('defaults') }}</h3>
      <div>
        <label
          class="profile-item"
          :class="{ active: isActive('direct') }"
          @click="$emit('select', 'direct')"
        >
          <div class="profile-icon">
            <i class="bi bi-power ui-icon-lg"></i>
          </div>
          <p class="profile-name">{{ $t('directConnect') }}</p>
          <div v-if="isActive('direct')" class="text-primary">
            <i class="bi bi-check-circle-fill ui-icon-lg"></i>
          </div>
        </label>

        <label
          class="profile-item"
          :class="{ active: isActive('system') }"
          @click="$emit('select', 'system')"
        >
          <div class="profile-icon">
            <i class="bi bi-globe ui-icon-lg"></i>
          </div>
          <p class="profile-name">{{ $t('systemProxy') }}</p>
          <div v-if="isActive('system')" class="text-primary">
            <i class="bi bi-check-circle-fill ui-icon-lg"></i>
          </div>
        </label>
      </div>
    </div>

    <!-- Host Proxy Section -->
    <div v-if="hostProxies.length > 0" class="mb-2">
      <h3 class="section-heading">{{ $t('hostProxy') }}</h3>
      <div>
        <label
          v-for="profile in hostProxies"
          :key="profile.id"
          class="profile-item"
          :class="{ active: isActive(profile.id) }"
          @click="$emit('select', profile.id)"
        >
          <div class="profile-icon" :style="getIconStyle(profile)">
            <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
          </div>
          <p class="profile-name">{{ profile.name }}</p>
          <div v-if="isActive(profile.id)" class="text-primary">
            <i class="bi bi-check-circle-fill ui-icon-lg"></i>
          </div>
        </label>
      </div>
    </div>

    <!-- PAC Script Section -->
    <div v-if="pacScripts.length > 0" class="mb-2">
      <h3 class="section-heading">{{ $t('pacScript') }}</h3>
      <div>
        <label
          v-for="profile in pacScripts"
          :key="profile.id"
          class="profile-item"
          :class="{ active: isActive(profile.id) }"
          @click="$emit('select', profile.id)"
        >
          <div class="profile-icon" :style="getIconStyle(profile)">
            <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
          </div>
          <p class="profile-name">{{ profile.name }}</p>
          <div v-if="isActive(profile.id)" class="text-primary">
            <i class="bi bi-check-circle-fill ui-icon-lg"></i>
          </div>
        </label>
      </div>
    </div>

    <!-- Auto Policy Section -->
    <div v-if="autoPolicies.length > 0" class="mb-2">
      <h3 class="section-heading">{{ $t('autoPolicy') }}</h3>
      <div>
        <label
          v-for="profile in autoPolicies"
          :key="profile.id"
          class="profile-item"
          :class="{ active: isActive(profile.id) }"
          @click="$emit('select', profile.id)"
        >
          <div class="profile-icon" :style="getIconStyle(profile)">
            <i :class="['bi', profile.icon, 'ui-icon-lg']"></i>
          </div>
          <p class="profile-name">{{ profile.name }}</p>
          <div v-if="isActive(profile.id)" class="text-primary">
            <i class="bi bi-check-circle-fill ui-icon-lg"></i>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeProfileId: String,
  hostProxies: Array,
  pacScripts: Array,
  autoPolicies: Array
})
defineEmits(['select'])

const isActive = (id) => {
  return props.activeProfileId === id
}

const getIconStyle = (profile) => {
  if (isActive(profile.id)) {
    return { color: 'var(--bs-primary)' }
  }
  return { color: profile.color || 'var(--ui-text-secondary)' }
}
</script>
