import { createApp, h } from 'vue'
import AppToast from '../../components/base/AppToast.vue'

let toastInstance = null
let toastContainer = null

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.message - Toast message
 * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} options.duration - Auto-close duration in ms (0 = no auto-close)
 * @param {boolean} options.showClose - Show close button
 */
export function showToast(options) {
  const {
    message,
    type = 'info',
    duration = 3000,
    showClose = true
  } = options

  // Remove existing toast
  if (toastInstance) {
    toastInstance.unmount()
    if (toastContainer && toastContainer.parentNode) {
      toastContainer.parentNode.removeChild(toastContainer)
    }
  }

  // Create container
  toastContainer = document.createElement('div')
  document.body.appendChild(toastContainer)

  // Create toast instance
  toastInstance = createApp({
    render() {
      return h(AppToast, {
        message,
        type,
        duration,
        showClose,
        onClose: () => {
          if (toastInstance) {
            toastInstance.unmount()
            if (toastContainer && toastContainer.parentNode) {
              toastContainer.parentNode.removeChild(toastContainer)
            }
            toastInstance = null
            toastContainer = null
          }
        }
      })
    }
  })

  toastInstance.mount(toastContainer)
}

// Convenience methods
export const toast = {
  success: (message, duration = 3000) => showToast({ message, type: 'success', duration }),
  error: (message, duration = 3000) => showToast({ message, type: 'error', duration }),
  warning: (message, duration = 3000) => showToast({ message, type: 'warning', duration }),
  info: (message, duration = 3000) => showToast({ message, type: 'info', duration })
}
