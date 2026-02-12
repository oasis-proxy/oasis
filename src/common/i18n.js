export const i18n = {
  install(app) {
    app.config.globalProperties.$t = (key, placeholders) => {
      return chrome.i18n.getMessage(key, placeholders) || key
    }
    // Also provide a composition API friendly version if needed,
    // but global property is easiest for migrating templates.
    app.provide('i18n', {
      t: (key, placeholders) => chrome.i18n.getMessage(key, placeholders) || key
    })
  }
}
