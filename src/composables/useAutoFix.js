import { ref } from 'vue'
import { COMPOUND_TLDS } from './tldData.js'

/**
 * Returns the registrable-domain wildcard for a hostname.
 *
 * Examples:
 *   www.google.com.hk  →  .google.com.hk
 *   google.com.hk      →  .google.com.hk
 *   maps.google.com    →  .google.com
 *   google.com         →  .google.com
 *   localhost          →  localhost
 */
function toWildcard(domain) {
  const parts = domain.split('.')
  if (parts.length < 2) return domain

  // Check if last two segments form a known compound TLD (e.g. "com.hk")
  const tail2 = parts.slice(-2).join('.')
  const useThree = COMPOUND_TLDS.has(tail2)

  const take = useThree ? 3 : 2
  if (parts.length <= take) {
    // Domain is exactly the registrable root — still wildcard it
    return '.' + parts.join('.')
  }
  return '.' + parts.slice(-take).join('.')
}

/**
 * Returns a Promise that resolves when the specified tab
 * reaches status=complete, or rejects after `timeoutMs`.
 *
 * We check the tab state FIRST (before registering the listener) to
 * close the race window where the tab could transition to 'complete'
 * between addListener and chrome.tabs.get.
 */
function waitForTabComplete(tabId, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    let settled = false
    let listenerRegistered = false

    function settle(fn) {
      if (settled) return
      settled = true
      if (listenerRegistered) chrome.tabs.onUpdated.removeListener(listener)
      clearTimeout(timer)
      fn()
    }

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        settle(resolve)
      }
    }

    const timer = setTimeout(() => settle(() => reject(new Error('Tab load timed out'))), timeoutMs)

    // Check current state before registering listener to eliminate race window
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        settle(resolve)
        return
      }
      // Tab is still loading — register listener now
      chrome.tabs.onUpdated.addListener(listener)
      listenerRegistered = true
    }).catch(() => {
      settle(() => reject(new Error('Tab not found')))
    })
  })
}

/**
 * AutoFix composable — runs entirely in the Monitor page.
 *
 * @param {import('vue').Ref} requests - reactive array of all request objects from useMonitorData
 * @param {import('vue').Ref} tabs     - reactive tabs map from useMonitorData
 */
export function useAutoFix(requests, tabs) {
  const status = ref('idle') // 'idle' | 'running' | 'done' | 'failed' | 'stopped'
  const fixedDomains = ref([])     // [{ domain, round }] — all domains added so far, with round number
  const currentRound = ref(0)
  const maxRetries = ref(5)
  const targetUrl = ref('')         // resolved URL that is actually being navigated to
  /**
   * roundHistory — one entry per completed round:
   * { round: Number, capturedDomains: String[], newDomains: String[] }
   * capturedDomains = all error wildcards seen this round
   * newDomains      = subset that were actually new (added to tempRules)
   */
  const roundHistory = ref([])

  let aborted = false
  let running = false  // guard against concurrent start() calls

  /**
   * Collect error domains for a tabId from requests added after `fromIndex`.
   * Returns both the deduplicated raw hostnames (for display) and the
   * deduplicated wildcard patterns (for rule generation) in a single pass.
   */
  function collectErrorDomains(tabId, fromIndex = 0) {
    const seenRaw = new Set()
    const rawList = []
    requests.value.slice(fromIndex).forEach((r) => {
      if (r.tabId === tabId && r.error && r.domain && !seenRaw.has(r.domain)) {
        seenRaw.add(r.domain)
        rawList.push(r.domain)
      }
    })
    const wildcards = [...new Set(rawList.map(toWildcard))]
    return { raw: rawList, wildcards }
  }

  /**
   * Navigate a tab to its original URL reliably.
   *
   * chrome.tabs.reload() reloads whatever URL the tab currently has, but after
   * a failed navigation Chrome\'s internal error page (chrome-error://…) may be
   * committed, making reload() a no-op for our purposes.  Instead we:
   *   1. Look up the known http(s) URL from the Monitor\'s own tabs map.
   *   2. Fall back to chrome.tabs.get() if not found there.
   *   3. Use chrome.tabs.update({ url }) to force a fresh navigation.
   *   4. Only fall back to chrome.tabs.reload() when absolutely necessary.
   */
  /**
   * Navigate a tab to its original URL reliably, and record the resolved URL.
   */
  async function navigateTab(tabId) {
    // 1. Try the URL stored by the Monitor (populated from past request events)
    const knownUrl = tabs.value?.[tabId]?.url
    if (knownUrl && knownUrl.startsWith('http')) {
      targetUrl.value = knownUrl
      await chrome.tabs.update(tabId, { url: knownUrl })
      return
    }

    // 2. Ask Chrome directly
    try {
      const tab = await chrome.tabs.get(tabId)
      if (tab.url && tab.url.startsWith('http')) {
        targetUrl.value = tab.url
        await chrome.tabs.update(tabId, { url: tab.url })
        return
      }
      // pendingUrl is set while the page is still loading
      if (tab.pendingUrl && tab.pendingUrl.startsWith('http')) {
        targetUrl.value = tab.pendingUrl
        await chrome.tabs.update(tabId, { url: tab.pendingUrl })
        return
      }
    } catch {
      // Tab not found — let waitForTabComplete handle the rejection
    }

    // 3. Last resort
    await chrome.tabs.reload(tabId)
  }

  /**
   * Write new rules to session storage AND wait for the background to
   * call applyProxySettings() before returning.
   *
   * Previously this just called chrome.storage.session.set() and returned
   * immediately.  The background's storage.onChanged handler is async, so
   * navigateTab() was racing against PAC-script application — the tab would
   * reload with the *old* PAC still in effect, and the same domains would
   * fail again in the next round.
   *
   * The APPLY_TEMP_RULES message merges the new rules with any existing ones
   * inside the background (where loadConfig() is available), applies settings,
   * and only ACKs once chrome.proxy.settings.set() has resolved.
   */
  async function appendTempRules(domains, proxyId) {
    // Build the new rule objects
    const newRules = domains.map((pattern) => ({
      id: `autofix_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'rule',
      ruleType: 'wildcard',
      pattern,
      proxyId,
      valid: true
    }))

    // Merge with existing tempRules in session storage
    const sessionData = await chrome.storage.session.get('tempRules')
    const existing = sessionData.tempRules || []
    const merged = [...newRules, ...existing]

    // Send to background and await confirmation that PAC is updated.
    // Falls back to a direct session write if messaging fails (e.g. SW restarted).
    try {
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'APPLY_TEMP_RULES', rules: merged }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else if (response && response.success) {
            resolve()
          } else {
            reject(new Error(response?.error || 'APPLY_TEMP_RULES failed'))
          }
        })
      })
    } catch (err) {
      // Fallback: write directly and give background a moment to process
      console.warn('AutoFix: APPLY_TEMP_RULES message failed, falling back:', err)
      await chrome.storage.session.set({ tempRules: merged })
      await new Promise((r) => setTimeout(r, 800))
    }
  }

  /**
   * Main AutoFix loop.
   */
  async function start({ tabId, proxyId, maxRetriesParam, waitWindow }) {
    if (running) return   // prevent concurrent loops
    running = true
    aborted = false
    status.value = 'running'
    currentRound.value = 0
    fixedDomains.value = []
    roundHistory.value = []
    targetUrl.value = ''
    maxRetries.value = maxRetriesParam

    // roundRequestBaseline: index into requests.value before each navigate.
    // Requests at or after this index belong to the current round's page load.
    // (We cannot use Date.now() here because webRequest's details.timeStamp is
    // milliseconds since browser startup, not Unix epoch — they are incomparable.)
    let roundRequestBaseline = 0

    try {
      // Snapshot baseline before initial navigate
      roundRequestBaseline = requests.value.length
      await navigateTab(tabId)

      while (!aborted) {
        currentRound.value++

        // Wait for tab to finish loading
        await waitForTabComplete(tabId, 60000)
        if (aborted) break

        // Wait additional collection window for errors to come in
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, waitWindow * 1000)
          // Allow stop() to interrupt the wait
          const check = setInterval(() => {
            if (aborted) { clearTimeout(timer); clearInterval(check); resolve() }
          }, 200)
          // Clear interval when timer fires normally
          setTimeout(() => clearInterval(check), waitWindow * 1000 + 100)
        })
        if (aborted) break

        // Collect error domains for THIS round only (requests added after baseline).
        // capturedDomains (wildcards) drive rule logic; rawDomains (hostnames) drive display.
        const { raw: rawDomains, wildcards: capturedDomains } = collectErrorDomains(tabId, roundRequestBaseline)
        const fixedSet = new Set(fixedDomains.value.map((e) => e.domain))
        const newDomains = capturedDomains.filter((w) => !fixedSet.has(w))
        const newDomainSet = new Set(newDomains)
        // rawDomains whose wildcard is newly routed this round
        const newRawDomains = rawDomains.filter((d) => newDomainSet.has(toWildcard(d)))

        // Record the round snapshot
        roundHistory.value = [...roundHistory.value, {
          round: currentRound.value,
          capturedDomains,   // wildcards — for rule tracking
          newDomains,        // wildcards — for rule tracking
          rawDomains,        // full hostnames — for display
          newRawDomains      // full hostnames of newly routed — for display
        }]

        if (newDomains.length === 0) {
          // No more new errors — success
          status.value = 'done'
          break
        }

        // Add rules and track with round number
        await appendTempRules(newDomains, proxyId)
        const round = currentRound.value
        fixedDomains.value = [
          ...fixedDomains.value,
          ...newDomains.map((domain) => ({ domain, round }))
        ]

        // Stop after maxRetries rounds total (currentRound already incremented at loop top).
        // Using currentRound keeps the limit consistent with the progress bar display.
        if (currentRound.value >= maxRetries.value) {
          status.value = 'failed'
          break
        }

        // Snapshot baseline for next round BEFORE navigating
        roundRequestBaseline = requests.value.length
        // Navigate tab again with new rules applied
        await navigateTab(tabId)
      }

      if (aborted && status.value === 'running') {
        status.value = 'stopped'
      }
    } catch (err) {
      if (!aborted) {
        console.error('AutoFix error:', err)
        status.value = 'failed'
      } else {
        status.value = 'stopped'
      }
    } finally {
      running = false
    }
  }

  function stop() {
    aborted = true
    if (status.value === 'running') {
      status.value = 'stopped'
    }
  }

  function reset() {
    aborted = true
    running = false
    status.value = 'idle'
    currentRound.value = 0
    fixedDomains.value = []
    roundHistory.value = []
    targetUrl.value = ''
  }

  return {
    status,
    currentRound,
    maxRetries,
    targetUrl,
    roundHistory,
    fixedDomains,
    start,
    stop,
    reset
  }
}
