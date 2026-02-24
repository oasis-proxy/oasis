import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRuleSetContent } from '../ruleset'

// Mock fetch
global.fetch = vi.fn()

describe('fetchRuleSetContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return plain text content as is', async () => {
    const plainText = 'DOMAIN-SUFFIX,google.com,Proxy'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(plainText)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.txt')
    expect(result.content).toBe(plainText)
    expect(result.fetchError).toBeNull()
  })

  it('should decode base64 content', async () => {
    // 'Hello World' in base64 is 'SGVsbG8gV29ybGQ='
    const original = 'Hello World'
    const base64Content = 'SGVsbG8gV29ybGQ='

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(base64Content)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.b64')
    expect(result.content).toBe(original)
    expect(result.fetchError).toBeNull()
  })

  it('should handle base64 content with newlines', async () => {
    // 'Hello World' with newlines
    const base64Content = 'SGVsbG8g\nV29ybGQ='
    const original = 'Hello World'

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(base64Content)
    })

    const result = await fetchRuleSetContent('https://example.com/rules.b64')
    expect(result.content).toBe(original)
  })

  it('should treat invalid base64-looking content as plain text', async () => {
    // Looks like base64 characters but invalid padding or length for pure base64 if heavily modified?
    // Actually standard atob might throw.
    // Let's try something that matches regex but fails atob?
    // Regex is /^[A-Za-z0-9+/]+=*$/
    // "abcde" length 5, %4 != 0. atob throws.
    const content = 'abcde'
    // Regex matches?
    // /^[A-Za-z0-9+/]+=*$/.test('abcde') -> true.

    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(content)
    })

    const result = await fetchRuleSetContent('https://example.com/invalid')
    // atob('abcde') throws
    // The code should catch and return original 'abcde'
    expect(result.content).toBe(content)
  })
})
