<template>
  <div class="d-flex flex-column vh-100 bg-surface text-body font-sans" style="min-width: 360px;">
    
    <!-- Header -->
    <div class="flex-shrink-0 bg-surface z-sticky top-0 pt-3 px-3 shadow-sm">
      <div class="pb-3 d-flex align-items-center">
        <h2 class="fs-4 fw-bold m-0 tracking-tight">Downloads</h2>
      </div>
      
      <!-- Search -->
      <div class="pb-3">
        <div class="position-relative">
            <input 
                type="text" 
                class="form-control form-control-sm ui-input ps-3" 
                placeholder="Search files or links"
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
                <h3 class="m-0 fw-medium text-truncate" style="font-size: 13px; line-height: 1.2;" :title="item.filename">
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
                    class="badge bg-info-subtle text-info border border-info-subtle fw-normal"
                    style="font-size: 9px; padding: 2px 6px;"
                 >
                    In Progress {{ Math.round((item.bytesReceived / item.totalBytes) * 100) }}%
                 </span>
                 <span 
                    v-else-if="item.state === 'interrupted'"
                    class="badge bg-danger-subtle text-danger border border-danger-subtle fw-normal"
                    style="font-size: 9px; padding: 2px 6px;"
                 >
                    Failed
                 </span>
                 <span 
                    v-else-if="item.state === 'complete'"
                    class="badge bg-primary-subtle text-primary border border-primary-subtle fw-normal"
                    style="font-size: 9px; padding: 2px 6px;"
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
            <i class="bi bi-copy" style="font-size: 12px;"></i>
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
      <div class="notification-bar d-flex align-items-center justify-content-between p-3 rounded shadow-lg animate-fade-in-up">
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-check-circle-fill text-success" style="font-size: 1.25rem;"></i>
          <div style="font-size: 12px;">
            <span class="fw-bold d-block mb-1">{{ notification.title }}</span>
            <p class="m-0 text-white-50 text-truncate" style="max-width: 200px;">{{ notification.message }}</p>
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
        applyTheme(config.value.ui?.theme || 'auto')
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
    applyTheme(config.value.ui?.theme || 'auto')
})

onUnmounted(() => {
    chrome.downloads.onCreated.removeListener(onCreated)
    chrome.downloads.onChanged.removeListener(onChanged)
    chrome.downloads.onErased.removeListener(onErased)
    chrome.storage.onChanged.removeListener(storageListener)
})

// Theme Logic
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
    const domain = getDomain(item.url)
    if (!domain) return
    
    // Set Intent
    await chrome.storage.session.set({
        quickAddIntent: {
            domain: domain,
            timestamp: Date.now()
        }
    })
    
    // Open Popup
    try {
        await chrome.action.openPopup()
    } catch(e) {
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

<style scoped>
/* Scoped variables if needed, but relying on main.css globals where possible */

/* Custom Classes not in Bootstrap */
.bg-surface {
  background-color: #f8fafc; /* slate-50 */
}
.dark .bg-surface {
  background-color: #020617; /* slate-950 */
}

/* Text overrides */
.text-body {
  color: #0f172a; /* slate-900 */
}
.dark .text-body {
  color: #f1f5f9; /* slate-100 */
}

/* Sticky Header */
.z-sticky {
  position: sticky;
  z-index: 1000;
}

/* Search input overrides */
.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(19, 127, 236, 0.25);
}
.dark .form-control {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}
.dark .form-control::placeholder {
  color: #94a3b8; /* slate-400 */
}

/* Borders */
.border-bottom {
  border-bottom: 1px solid #e2e8f0 !important;
}
.dark .border-bottom {
  border-color: #1e293b !important; /* slate-800 */
}

/* Lighter Divider */
.border-bottom-light {
    border-bottom: 1px solid rgba(0,0,0,0.04);
}
.dark .border-bottom-light {
    border-bottom: 1px solid rgba(255,255,255,0.04);
}

/* Download Item */
.download-item:hover {
  background-color: #f1f5f9; /* slate-100 */
}
.dark .download-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.download-item:hover .opacity-50 {
  opacity: 1 !important;
}

/* Action Buttons */
.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 0;
}
.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--bs-primary) !important;
}
.dark .action-btn {
  color: #94a3b8 !important; /* slate-400 */
}
.dark .action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
}

/* Hover variants */
.action-btn.hover-danger:hover {
  color: #dc3545 !important;
}
.action-btn.hover-primary:hover {
  color: var(--bs-primary) !important;
}

/* Notification Bar */
.notification-bar {
  background-color: #0f172a; /* slate-900 */
  color: white;
  border: 1px solid #1e293b;
}
.dark .notification-bar {
  background-color: black;
  border-color: #1e293b;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}

/* Animations */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
}

/* Helper for icons */
.bi::before {
  vertical-align: 0; /* Align icons better */
}

/* Badge / Tag Styles (Bootstrap-ish) */
.bg-primary-subtle {
    background-color: #e0f2fe; /* cyan-100/blue-100 */
}
.text-primary {
    color: var(--bs-primary) !important;
}
.border-primary-subtle {
    border-color: #bae6fd !important;
}

.bg-danger-subtle {
    background-color: #fee2e2; /* red-100 */
}
.text-danger {
    color: #dc2626 !important;
}
.border-danger-subtle {
    border-color: #fecaca !important;
}

.bg-success-subtle {
    background-color: #dcfce7; /* green-100 */
}
.text-success {
    color: #16a34a !important;
}
.border-success-subtle {
    border-color: #bbf7d0 !important;
}

.bg-info-subtle {
    background-color: #e0f2fe; /* sky-100 */
}
.text-info {
    color: #0284c7 !important; /* sky-600 */
}
.border-info-subtle {
    border-color: #bae6fd !important; /* sky-200 */
}

/* Dark Mode Badges */
.dark .bg-primary-subtle { background-color: rgba(19, 127, 236, 0.15); border-color: rgba(19, 127, 236, 0.3) !important; }
.dark .bg-danger-subtle { background-color: rgba(220, 38, 38, 0.15); border-color: rgba(220, 38, 38, 0.3) !important; }
.dark .bg-success-subtle { background-color: rgba(22, 163, 74, 0.15); border-color: rgba(22, 163, 74, 0.3) !important; }
.dark .bg-info-subtle { background-color: rgba(2, 132, 199, 0.15); border-color: rgba(2, 132, 199, 0.3) !important; }

.dark .text-danger { color: #f87171 !important; }
.dark .text-success { color: #4ade80 !important; }
.dark .text-info { color: #38bdf8 !important; }
</style>
