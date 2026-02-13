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

export const i18n = {
  install(app) {
    const t = (key, placeholders) => {
      // 1. Manual Override
      if (i18nState.language !== 'auto' && messages[i18nState.language]) {
        const entry = messages[i18nState.language][key]
        if (entry) {
          let msg = entry.message
          
          // Handle placeholders
          if (placeholders) {
            const args = Array.isArray(placeholders) ? placeholders : [placeholders]
            args.forEach((val, index) => {
              // Replace $1, $2, etc. (Chrome i18n syntax)
              msg = msg.replace(`$${index + 1}`, val)
            })
          }
          return msg
        }
      }

      // 2. Native Chrome i18n (Auto / Fallback)
      return chrome.i18n.getMessage(key, placeholders) || key
    }

    app.config.globalProperties.$t = t
    
    app.provide('i18n', { t })
  }
}
