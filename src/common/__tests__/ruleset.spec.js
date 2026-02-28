import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRuleSetContent, updatePolicyRuleSets } from '../ruleset'

// Mock fetch
global.fetch = vi.fn()

describe('fetchRuleSetContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return plain text content as is', async () => {
    const plainText = '[AutoProxy]\nDOMAIN-SUFFIX,google.com,Proxy'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(plainText)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.txt')
    expect(result.content).toBe(plainText)
    expect(result.fetchError).toBeNull()
  })

  it('should decode base64 content', async () => {
    const original = '[AutoProxy]\nHello World'
    const base64Content = btoa(original)

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(base64Content)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.b64')
    expect(result.content).toBe(original)
    expect(result.fetchError).toBeNull()
  })

  it('should handle base64 content with newlines', async () => {
    const original = '[AutoProxy]\nHello World'
    const base64Content = btoa(original).slice(0, 10) + '\n' + btoa(original).slice(10)

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(base64Content)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.b64')
    expect(result.content).toBe(original)
  })

  it('should treat invalid base64-looking content as plain text', async () => {
    const content = '[AutoProxy]\nabcde'

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(content)
    })

    const result = await fetchRuleSetContent('https://example.com/invalid')
    expect(result.content).toBe(content)
  })

  it('should accept AutoProxy headers with version suffixes', async () => {
    const plainText = '[AutoProxy 0.2b]\nDOMAIN-SUFFIX,google.com,Proxy'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(plainText)
    })
    const result = await fetchRuleSetContent('https://example.com/rules.txt')
    expect(result.fetchError).toBeNull()
    expect(result.content).toBe(plainText)
  })

  it('should accept AutoProxy headers with arbitrary suffixes', async () => {
    const plainText = '[autoproxy xxxxxx]\nDOMAIN-SUFFIX,google.com,Proxy'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(plainText)
    })
    const result = await fetchRuleSetContent('https://example.com/rules.txt')
    expect(result.fetchError).toBeNull()
    expect(result.content).toBe(plainText)
  })

  it('should throw error if AutoProxy header is missing', async () => {
    const plainText = 'DOMAIN-SUFFIX,google.com,Proxy'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(plainText)
    })
    const result = await fetchRuleSetContent('https://example.com/rules.txt')
    expect(result.fetchError).toBe('Invalid AutoProxy format (Missing [AutoProxy] header)')
  })
})

describe('updatePolicyRuleSets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear old content and lastUpdated when URL changes but fetch fails', async () => {
    // Setup policy with an existing ruleset but we're changing the URL to a new one
    const policy = {
      rules: [
        {
          ruleType: 'ruleset',
          pattern: 'https://example.com/new_rules.txt',
          ruleSet: {
            url: 'https://example.com/old_rules.txt',
            content: '[AutoProxy]\nOLD_CONTENT',
            lastUpdated: 1234567890,
            fetchError: null
          }
        }
      ]
    }

    // Mock fetch to fail for the new URL
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    const result = await updatePolicyRuleSets(policy)

    expect(result.changed).toBe(true)
    expect(result.errors.length).toBe(1)
    
    const configuredRuleSet = policy.rules[0].ruleSet
    expect(configuredRuleSet.url).toBe('https://example.com/new_rules.txt')
    expect(configuredRuleSet.content).toBeNull() // Old content should be purged
    expect(configuredRuleSet.lastUpdated).toBeNull() // Old timestamp should be purged
    expect(configuredRuleSet.fetchError).toBe('HTTP 404') // New error captured
  })
})
