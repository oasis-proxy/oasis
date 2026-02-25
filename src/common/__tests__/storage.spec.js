import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportConfig, importConfig, clearConfig, saveConfig } from '../storage'
import { DEFAULT_CONFIG } from '../config'

// Mock chrome.storage
const storageLocal = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn()
}
const storageSession = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn()
}
// Mock chrome.alarms (used by saveConfig -> triggerAutoSync -> syncToCloud -> ... or just side effects)
// actually saveConfig calls triggerAutoSync which might look at chrome.storage.sync
const storageSync = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn()
}

global.chrome = {
  storage: {
    local: storageLocal,
    session: storageSession,
    sync: storageSync
  },
  alarms: {
    clear: vi.fn(),
    create: vi.fn()
  }
}

// Mock fetch for hydrateConfig
global.fetch = vi.fn()

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    storageLocal.get.mockResolvedValue({})
    storageSession.get.mockResolvedValue({})
    storageSync.get.mockResolvedValue({})
  })

  describe('exportConfig', () => {
    it('should return default config as JSON string if storage is empty', async () => {
      // loadConfig returns DEFAULT_CONFIG if empty
      const configStr = await exportConfig()
      const config = JSON.parse(configStr)
      expect(config).toMatchObject(DEFAULT_CONFIG)
    })

    it('should return stored config as JSON string', async () => {
      const mockStoredConfig = { version: 2, activeProfileId: 'system' }
      storageLocal.get.mockResolvedValue({
        config: mockStoredConfig,
        proxies: { p1: { id: 'p1' } }
      })

      const configStr = await exportConfig()
      const config = JSON.parse(configStr)

      expect(config.version).toBe(2)
      expect(config.activeProfileId).toBe('system')
      expect(config.proxies).toEqual({ p1: { id: 'p1' } })
    })
  })

  describe('importConfig', () => {
    it('should save config to local storage', async () => {
      const newConfig = { ...DEFAULT_CONFIG, version: 5 }
      const jsonString = JSON.stringify(newConfig)

      const success = await importConfig(jsonString)
      expect(success).toBe(true)

      // It calls saveConfig, which calls chrome.storage.local.set
      expect(storageLocal.set).toHaveBeenCalled()
      // Check that it set at least the config key
      const setCall = storageLocal.set.mock.calls[0][0]
      expect(setCall.config.version).toBe(5)
    })

    it('should return false on invalid JSON', async () => {
      const success = await importConfig('{ invalid json')
      expect(success).toBe(false)
    })
  })

  describe('clearConfig', () => {
    it('should remove all keys from local and tempRules from session', async () => {
      await clearConfig()
      // clearConfig removes specific list of keys
      const keys = [
        'config',
        'proxies',
        'proxyGroups',
        'pacs',
        'policies',
        'system',
        'direct',
        'reject',
        'sync_state'
      ]
      expect(storageLocal.remove).toHaveBeenCalledWith(keys)
      expect(storageSession.remove).toHaveBeenCalledWith('tempRules')
    })
  })

  describe('saveConfig', () => {
    it('should split config into multiple keys', async () => {
      const config = {
        ...DEFAULT_CONFIG,
        proxies: { p1: { id: 'p1' } },
        policies: { po1: { id: 'po1' } }
      }

      await saveConfig(config, true, true) // skip sync, skip touch

      const savedCall = storageLocal.set.mock.calls[0][0]

      expect(savedCall.config).toBeDefined()
      expect(savedCall.proxies).toEqual({ p1: { id: 'p1' } })
      expect(savedCall.policies).toEqual({ po1: { id: 'po1' } })
    })
  })
})
