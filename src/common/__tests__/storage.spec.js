/* global global */
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

global.chrome = {
    storage: {
        local: storageLocal,
        session: storageSession
    }
}

describe('storage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default mock implementations
        storageLocal.get.mockResolvedValue({})
        storageSession.get.mockResolvedValue({})
    })

    describe('exportConfig', () => {
        it('should return default config if storage is empty', async () => {
            const config = await exportConfig()
            expect(config).toEqual(DEFAULT_CONFIG)
        })

        it('should return stored config', async () => {
            const mockStored = { mode: 'test' }
            storageLocal.get.mockResolvedValue({ proxyConfig: mockStored })
            const config = await exportConfig()
            expect(config).toEqual(mockStored)
        })
    })

    describe('importConfig', () => {
        it('should save config to local storage', async () => {
            const newConfig = { mode: 'imported' }
            await importConfig(newConfig)
            expect(storageLocal.set).toHaveBeenCalledWith({ proxyConfig: newConfig })
        })

        it('should throw on invalid input', async () => {
            await expect(importConfig(null)).rejects.toThrow('Invalid configuration data')
        })
    })

    describe('clearConfig', () => {
        it('should remove proxyConfig from local and tempRules from session', async () => {
            await clearConfig()
            expect(storageLocal.remove).toHaveBeenCalledWith('proxyConfig')
            expect(storageSession.remove).toHaveBeenCalledWith('tempRules')
        })
    })

    describe('saveConfig', () => {
        it('should strip tempRules before saving', async () => {
            const configWithTemp = { 
                auto: { 
                    tempRules: [{ id: 1 }],
                    other: 'val'
                } 
            }
            await saveConfig(configWithTemp)
            
            const savedCall = storageLocal.set.mock.calls[0][0]
            expect(savedCall.proxyConfig.auto.tempRules).toEqual([])
            // Original object should not be mutated (depends on implementation, but good practice)
            expect(configWithTemp.auto.tempRules).toHaveLength(1)
        })
    })
})
