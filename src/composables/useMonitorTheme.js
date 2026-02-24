import { ref } from 'vue'

import lightIconUrl from '../assets/icons/light/ripple-icon-light-64x64-blurred.png'
import darkIconUrl from '../assets/icons/dark/ripple-icon-dark-64x64-blurred.png'
import lightBrandUrl from '../assets/img/oasis-proxy-primary-96px.png'
import darkBrandUrl from '../assets/img/oasis-proxy-white-96px.png'

export function useMonitorTheme() {
  const isDark = ref(false)

  const applyTheme = (theme) => {
    const root = document.documentElement
    root.classList.remove('dark')

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
      if (prefersDark) root.classList.add('dark')
    } else if (theme === 'dark') {
      root.classList.add('dark')
      isDark.value = true
    } else {
      isDark.value = false
    }
  }

  return {
    isDark,
    applyTheme,
    darkIconUrl,
    lightIconUrl,
    darkBrandUrl,
    lightBrandUrl
  }
}
