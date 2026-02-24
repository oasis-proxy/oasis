import { describe, it, expect } from 'vitest'
import { parseAutoProxyRules } from '../autoproxy'

describe('parseAutoProxyRules', () => {
  it('should parse domain rules (||)', () => {
    const rules = parseAutoProxyRules('||google.com')
    expect(rules).toHaveLength(1)
    expect(rules[0]).toMatchObject({
      pattern: 'google.com',
      type: 'domain',
      isWhitelist: false
    })
  })

  it('should parse whitelist rules (@@)', () => {
    const rules = parseAutoProxyRules('@@||localhost')
    expect(rules).toHaveLength(1)
    expect(rules[0]).toMatchObject({
      pattern: 'localhost',
      type: 'domain',
      isWhitelist: true
    })
  })

  it('should parse wildcard rules', () => {
    const rules = parseAutoProxyRules('*.example.com')
    expect(rules).toHaveLength(1)
    expect(rules[0]).toMatchObject({
      pattern: '*.example.com',
      type: 'wildcard',
      isWhitelist: false
    })
  })

  it('should parse keywords', () => {
    const rules = parseAutoProxyRules('keyword')
    expect(rules).toHaveLength(1)
    expect(rules[0]).toMatchObject({
      pattern: 'keyword',
      type: 'keyword',
      isWhitelist: false
    })
  })

  it('should ignore comments', () => {
    const content = `
        ! This is a comment
        [AutoProxy 0.2.9]
        ||test.com
        `
    const rules = parseAutoProxyRules(content)
    expect(rules).toHaveLength(1)
    expect(rules[0].pattern).toBe('test.com')
  })

  it('should handle Base64 content', () => {
    // '||encoded.com' in base64 is 'fHxlbmNvZGVkLmNvbQ=='
    const encoded = btoa('||encoded.com')
    const rules = parseAutoProxyRules(encoded)
    expect(rules).toHaveLength(1)
    expect(rules[0].pattern).toBe('encoded.com')
  })

  it('should handle raw configuration (mutli-line)', () => {
    const content = `[AutoProxy 0.2.9]
! Comment
||raw-example.com
|http://raw-start.com
`
    const rules = parseAutoProxyRules(content)
    expect(rules.length).toBeGreaterThan(0)
    expect(rules.some((r) => r.pattern === 'raw-example.com')).toBe(true)
    expect(rules.some((r) => r.pattern === 'http://raw-start.com')).toBe(true)
  })

  it('should handle raw configuration (single line with symbols)', () => {
    // ||example.com contains characters not in Base64 (.|) so it should be treated as raw
    const content = '||example.com'
    const rules = parseAutoProxyRules(content)
    expect(rules).toHaveLength(1)
    expect(rules[0].pattern).toBe('example.com')
  })
})
