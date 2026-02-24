import { t } from '../common/i18n'

/**
 * Update Context Menus based on configuration.
 * @param {object} config
 */
export async function updateContextMenus(config) {
  // Always clear first to avoid duplicates or stale state
  await chrome.contextMenus.removeAll()

  if (config.ui && config.ui.showContextMenu) {
    chrome.contextMenus.create({
      id: 'oasis-quick-add',
      title: t('contextMenuQuickAdd'),
      contexts: ['page', 'link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    })
    console.log('Oasis: Context menu enabled.')
  } else {
    console.log('Oasis: Context menu disabled.')
  }
}

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'oasis-quick-add') {
    let targetUrl = ''

    // Prioritize link URL, fallback to page URL
    if (info.linkUrl) {
      targetUrl = info.linkUrl
    } else if (info.pageUrl) {
      targetUrl = info.pageUrl
    }

    if (targetUrl) {
      try {
        const url = new URL(targetUrl)
        const domain = url.hostname

        // Store intent
        await chrome.storage.session.set({
          quickAddIntent: {
            domain: domain,
            source: 'context-menu',
            timestamp: Date.now()
          }
        })

        // Open Popup (MV3)
        // Note: requires Chrome 99+
        try {
          await chrome.action.openPopup()
        } catch (e) {
          console.warn(
            'Oasis: Failed to open popup programmatically (might require user gesture or newer Chrome):',
            e
          )
          // Fallback could be creating a window, but standard flow usually assumes user clicks extension icon if this fails
          // or we notify via badge? User requested "popup".
        }
      } catch (e) {
        console.warn('Oasis: Invalid URL in context menu action:', targetUrl)
      }
    }
  }
})
