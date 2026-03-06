import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('fetch', vi.fn())

import { checkUpdates } from '../updater'
import { loadConfig, saveConfig } from '../../common/storage'
import { updatePolicyRuleSets } from '../../common/ruleset'

// Mock dependencies
vi.mock('../../common/storage', () => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn()
}))

vi.mock('../../common/ruleset', () => ({
  updatePolicyRuleSets: vi.fn()
}))

describe('updater.js - checkUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  it('should return details for successful and failed PAC script updates', async () => {
    loadConfig.mockResolvedValue({
      pacs: {
        pac1: { mode: 'remote', name: 'MyPAC', url: 'https://example.com/pac1.js', script: 'old_content' },
        pac2: { mode: 'remote', name: 'FaultyPAC', url: 'https://example.com/pac2.js', script: 'old_content' }
      }
    })

    global.fetch.mockImplementation(async (url) => {
      if (url === 'https://example.com/pac1.js') {
        return { ok: true, status: 200, text: () => Promise.resolve('new_content') }
      } else {
        return { ok: false, status: 404 }
      }
    })

    const result = await checkUpdates()

    expect(result.changed).toBe(true)
    expect(result.details.length).toBe(2)

    const pac1Detail = result.details.find(d => d.url === 'https://example.com/pac1.js')
    expect(pac1Detail).toMatchObject({
      type: 'pac',
      name: 'MyPAC',
      success: true,
      message: 'msgUpdateSuccess'
    })

    const pac2Detail = result.details.find(d => d.url === 'https://example.com/pac2.js')
    expect(pac2Detail).toMatchObject({
      type: 'pac',
      name: 'FaultyPAC',
      success: false,
      message: 'Failed: HTTP 404'
    })

    expect(saveConfig).toHaveBeenCalled()
  })

  it('should return details including policy and PACs together with correct `isManual` propagation', async () => {
    loadConfig.mockResolvedValue({
      pacs: {
        pac1: { mode: 'remote', url: 'https://example.com/pac1.js', script: 'same_content' }
      },
      policies: {
        policy1: {
          id: 'policy1',
          name: 'Global Node',
          rules: []
        }
      }
    })

    global.fetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('same_content') })

    // Mock policy rulesets returning their own details
    updatePolicyRuleSets.mockResolvedValue({
      changed: false,
      errors: [],
      details: [
        { url: 'https://example.com/ruleset.txt', success: true, message: 'msgUpdateSuccess' }
      ]
    })

    const result = await checkUpdates(true)

    expect(updatePolicyRuleSets).toHaveBeenCalledWith(expect.anything(), true, expect.any(Function)) // Check isManual propagation + onProgress
    expect(result.details.length).toBe(2)

    const pacDetail = result.details.find(d => d.type === 'pac')
    expect(pacDetail).toMatchObject({ success: true, message: 'msgNoChanges', name: 'Unnamed PAC' })

    const rulesetDetail = result.details.find(d => d.type === 'ruleset')
    expect(rulesetDetail).toMatchObject({
      policyName: 'Global Node',
      success: true,
      url: 'https://example.com/ruleset.txt',
      message: 'msgUpdateSuccess'
    })
  })
})
