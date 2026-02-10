<template>
  <div class="d-flex flex-column vh-100 text-body font-sans" style="min-width: 360px;">
    
    <!-- Header -->
    <div class="flex-shrink-0 z-sticky top-0 pt-3 px-3 shadow-sm" style="background-color: var(--ui-bg-card);">
      <div class="pb-3 d-flex align-items-center">
        <h2 class="fs-4 fw-bold m-0 tracking-tight" style="color: var(--ui-text-primary);">Downloads</h2>
      </div>
      
      <!-- Search -->
      <div class="pb-3">
        <div class="position-relative">
            <input 
                type="text" 
                class="w-100 rounded-lg border ui-input h-10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 transition-all shadow-sm"
                style="min-width: 100%; width: 100%; max-width: 100% !important;" 
                placeholder="Filter downloads by name or URL..."
                v-model="searchQuery"
            >
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="flex-fill overflow-y-auto custom-scrollbar">
      <div v-if="filteredDownloads.length === 0" class="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
          <i class="bi bi-download mb-2 opacity-50" style="font-size: 2rem;"></i>
          <p class="small m-0">No downloads found in the last 7 days.</p>
      </div>

      <div 
        v-for="item in filteredDownloads" 
        :key="item.id"
        class="download-item d-flex align-items-center px-3 py-3 border-bottom-light transition-colors w-100"
      >
        <!-- Info (Takes remaining space) -->
        <div class="d-flex flex-column justify-content-center pe-3 flex-grow-1 min-w-0">
            <!-- Filename -->
            <div class="py-1">
                <h3 class="m-0 fw-medium text-truncate" style="font-size: 13px; line-height: 1.2; color: var(--ui-text-primary);" :title="item.filename">
                    {{ truncateMiddle(getFilename(item.filename), 28) }}
                </h3>
            </div>
            
            <!-- URL -->
            <div class="d-flex align-items-center gap-2 text-truncate pb-1">
                 <p class="m-0 text-secondary text-truncate" style="font-size: 11px;" :title="item.finalUrl || item.url">
                    {{ truncateMiddle(item.finalUrl || item.url, 35) }}
                 </p>
            </div>

            <!-- Status Line: Time + Tags -->
            <div class="d-flex align-items-center gap-2">
                 <span class="text-secondary" style="font-size: 10px;">
                    {{ formatTime(item.endTime || item.startTime) }}
                 </span>
                 
                 <!-- Status Tags -->
                 <span 
                    v-if="item.state === 'in_progress'"
                    class="ui-tag ui-tag-info"
                 >
                    In Progress {{ Math.round((item.bytesReceived / item.totalBytes) * 100) }}%
                 </span>
                 <span 
                    v-else-if="item.state === 'interrupted'"
                    class="ui-tag ui-tag-danger"
                 >
                    Failed
                 </span>
                 <span 
                    v-else-if="item.state === 'complete'"
                    class="ui-tag ui-tag-primary"
                 >
                    Completed
                 </span>
            </div>
        </div>

        <!-- Actions (Fixed 100px, Right Aligned) -->
        <div class="d-flex align-items-center justify-content-end flex-shrink-0" style="width: 120px;">
          <!-- Folder -->
          <button 
             @click="openFileLocation(item.id)"
             class="ui-button-icon" 
             title="Show in Folder"
          >
            <i class="bi bi-folder2-open" style="font-size: 12px;"></i>
          </button>

          <!-- Add to Temp (Redirect to Quick Add) -->
          <button 
            @click="openQuickAdd(item)"
            class="ui-button-icon" 
            title="Add Rule"
          >
            <i class="bi bi-plus-lg" style="font-size: 12px;"></i>
          </button>

          <!-- Copy Link -->
           <button 
            @click="copyLink(item.finalUrl || item.url)"
            class="ui-button-icon" 
            title="Copy Link"
          >
            <i class="bi bi-link" style="font-size: 12px;"></i>
          </button>

          <!-- Cancel (In Progress) -->
          <button 
            v-if="item.state === 'in_progress'"
            @click="cancelDownload(item.id)"
            class="ui-button-icon text-danger hover-danger" 
            title="Cancel Download"
          >
            <i class="bi bi-x-circle" style="font-size: 12px;"></i>
          </button>

          <!-- Retry (Interrupted/Complete) -->
          <button 
            v-else
            @click="retryDownload(item.url)"
             class="ui-button-icon" 
            title="Re-download"
          >
            <i class="bi bi-arrow-clockwise" style="font-size: 12px;"></i>
          </button>
        </div>
      </div>
    
      <div style="height: 64px;"></div>
    </div>

    <!-- Notification Area (Bottom) -->
    <div v-if="notification" class="position-absolute bottom-0 start-0 w-100 p-3" style="z-index: 20;">
      <div class="notification-bar d-flex align-items-center justify-content-between p-3 rounded shadow-lg animate-fade-in-up" style="background-color: var(--ui-notification-bg);">
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-check-circle-fill text-success" style="font-size: 1.25rem;"></i>
          <div style="font-size: 12px;">
            <span class="fw-bold d-block mb-1" style="color: white;">{{ notification.title }}</span>
            <p class="m-0 text-white-50">{{ notification.message }}</p>
          </div>
        </div>
        <button @click="notification = null" class="btn btn-link link-light p-0 border-0">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { loadConfig } from '../common/storage'

const downloads = ref([])
const searchQuery = ref('')
const notification = ref(null)
const config = ref(null)
let notificationTimer = null

// Fetch downloads
const loadDownloads = async () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    try {
        const items = await chrome.downloads.search({
            startedAfter: sevenDaysAgo.toISOString(),
            orderBy: ['-startTime'],
            limit: 50
        })
        console.log(`Oasis: Found ${items.length} downloads.`)
        items.forEach(item => {
            console.log('Oasis Download Item:', {
                id: item.id,
                filename: item.filename,
                url: item.url,
                state: item.state,
                mime: item.mime,
                bytes: item.bytesReceived,
                total: item.totalBytes,
                startTime: item.startTime,
                endTime: item.endTime,
                error: item.error,
                finalUrl: item.finalUrl,
                referrer: item.referrer
            })
        })
        downloads.value = items
    } catch (e) {
        console.error('Failed to load downloads:', e)
    }
}

// Listeners
const onCreated = (item) => {
    downloads.value.unshift(item)
}

const onChanged = (delta) => {
    const index = downloads.value.findIndex(d => d.id === delta.id)
    if (index !== -1) {
        if (delta.state) downloads.value[index].state = delta.state.current
        if (delta.endTime) downloads.value[index].endTime = delta.endTime.current
    }
}

const onErased = (id) => {
    const index = downloads.value.findIndex(d => d.id === id)
    if (index !== -1) downloads.value.splice(index, 1)
}

const storageListener = async (changes, area) => {
    if (area === 'local' && changes.config) {
        config.value = await loadConfig()
        // Apply theme when config changes
        if (changes.config.newValue?.ui?.theme) {
            applyTheme(changes.config.newValue.ui.theme)
        }
    }
}

// Theme management
const mediaQuery = ref(null)

const applyTheme = (theme) => {
  const root = document.documentElement
  root.classList.remove('dark')
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  }
  // 'light' is default, no class needed
}

const handleSystemThemeChange = () => {
  if (config.value?.ui?.theme === 'auto') {
    applyTheme('auto')
  }
}

onMounted(async () => {
    loadDownloads()
    chrome.downloads.onCreated.addListener(onCreated)
    chrome.downloads.onChanged.addListener(onChanged)
    chrome.downloads.onErased.addListener(onErased)
    chrome.storage.onChanged.addListener(storageListener)
    
    // Load config and apply theme
    config.value = await loadConfig()
    applyTheme(config.value.ui?.theme || 'light')
    
    // Listen for system theme changes
    mediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.value.addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
    chrome.downloads.onCreated.removeListener(onCreated)
    chrome.downloads.onChanged.removeListener(onChanged)
    chrome.downloads.onErased.removeListener(onErased)
    chrome.storage.onChanged.removeListener(storageListener)
    if (mediaQuery.value) {
        mediaQuery.value.removeEventListener('change', handleSystemThemeChange)
    }
})

// Computed
const filteredDownloads = computed(() => {
    if (!searchQuery.value) return downloads.value
    const q = searchQuery.value.toLowerCase()
    return downloads.value.filter(d => {
        const name = getFilename(d.filename).toLowerCase()
        const url = (d.url || '').toLowerCase()
        return name.includes(q) || url.includes(q)
    })
})


// Helpers
const getFilename = (path) => {
    if (!path) return 'Unknown'
    return path.split(/[/\\]/).pop()
}

const getDomain = (url) => {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

const truncateMiddle = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    const charsToShow = maxLength - 3
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return text.substr(0, frontChars) + '...' + text.substr(text.length - backChars)
}

const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    // Simple format: HH:mm (or whatever is preferred, maybe MM-DD HH:mm)
    return date.toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

// Actions
const openQuickAdd = async (item) => {
    // Prefer finalUrl if available (e.g. after redirects)
    const urlToUse = item.finalUrl || item.url
    const domain = getDomain(urlToUse)
    
    if (!domain) {
        showNotification('Not Supported', 'Only HTTP/HTTPS links are supported')
        return
    }
    
    // Set Intent
    await chrome.storage.session.set({
        quickAddIntent: {
            domain: domain,
            source: 'sidepanel',
            timestamp: Date.now()
        }
    })
    
    // Open Popup
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tabs.length > 0) {
            await chrome.action.openPopup({ windowId: tabs[0].windowId })
        } else {
            await chrome.action.openPopup()
        }
    } catch(e) {
        console.error('Failed to open popup:', e)
        showNotification('Error', 'Failed to open Quick Add popup')
    }
}

const openFileLocation = (id) => {
    chrome.downloads.show(id)
}

const cancelDownload = (id) => {
    chrome.downloads.cancel(id, () => {
        showNotification('Canceled', 'Download has been canceled')
    })
}

const retryDownload = (url) => {
    if (!url) return
    chrome.downloads.download({ url }, () => {
        if (chrome.runtime.lastError) {
             showNotification('Error', 'Failed to restart download')
        } else {
             showNotification('Started', 'Download restarted')
        }
    })
}

const copyLink = (url) => {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Copied', 'Like copied to clipboard')
    }).catch(() => {
        showNotification('Error', 'Failed to copy link')
    })
}

const showNotification = (title, message) => {
    notification.value = { title, message }
    if (notificationTimer) clearTimeout(notificationTimer)
    notificationTimer = setTimeout(() => {
        notification.value = null
    }, 3000)
}

</script>


