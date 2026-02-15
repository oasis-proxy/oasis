import { reactive } from 'vue'
import enMessages from '../_locales/en/messages.json'
import zhCNMessages from '../_locales/zh_CN/messages.json'

const messages = {
  en: enMessages,
  zh_CN: zhCNMessages
}

// Reactive state for language
// We use a simple reactive object that can be updated by storage listeners
const i18nState = reactive({
  language: 'auto'
})

// Initialize
chrome.storage.local.get('config', (result) => {
  if (result.config?.ui?.language) {
    i18nState.language = result.config.ui.language
  }
})

// Listen for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.config) {
    const newConfig = changes.config.newValue
    if (newConfig?.ui?.language) {
      i18nState.language = newConfig.ui.language
    }
  }
})

// Standalone translation function
export const t = (key, placeholders) => {
  // 1. Manual Override
  if (i18nState.language !== 'auto' && messages[i18nState.language]) {
    const entry = messages[i18nState.language][key]
    if (entry) {
      let msg = entry.message
      
      // Handle placeholders
      if (entry.placeholders && placeholders) {
         const args = Array.isArray(placeholders) ? placeholders : [placeholders]
         
         // Iterate over defined placeholders in the JSON
         // e.g. "count": { "content": "$1" }
         Object.keys(entry.placeholders).forEach(name => {
             const ph = entry.placeholders[name]
             const content = ph.content // "$1"
             
             // Extract index from "$1", "$2" etc.
             const match = content.match(/\$(\d+)/)
             if (match) {
                 const index = parseInt(match[1]) - 1
                 if (index >= 0 && index < args.length) {
                     const val = args[index]
                     // Replace $NAME$ (case insensitive)
                     // Regex: literal $, name, literal $
                     const regex = new RegExp(`\\$${name}\\$`, 'gi')
                     msg = msg.replace(regex, val)
                 }
             }
         })
      }
      return msg
    }
  }

  // 2. Native Chrome i18n (Auto / Fallback)
  return chrome.i18n.getMessage(key, placeholders) || key
}

export const i18n = {
  install(app) {
    app.config.globalProperties.$t = t
    app.provide('i18n', { t })
  }
}
