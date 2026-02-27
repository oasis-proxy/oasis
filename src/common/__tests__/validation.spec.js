import { describe, it, expect } from 'vitest'
import { validateIpCidr, validateIp, normalizeIp } from '../validation'

describe('validation.js', () => {
  describe('validateIp', () => {
    it('accepts valid IP addresses', () => {
      expect(validateIp('192.168.1.1').valid).toBe(true)
      expect(validateIp('2001:db8::1').valid).toBe(true)
      expect(validateIp('::ffff:192.168.1.1').valid).toBe(true)
    })

    it('rejects CIDR notations', () => {
      expect(validateIp('192.168.1.0/24').valid).toBe(false)
      expect(validateIp('2001:db8::/32').valid).toBe(false)
    })

    it('rejects invalid IPs', () => {
      expect(validateIp('256.1.1.1').valid).toBe(false)
      expect(validateIp(':::').valid).toBe(false)
      expect(validateIp('not.an.ip').valid).toBe(false)
    })
  })

  describe('validateIpCidr', () => {
    it('accepts valid IPv4 addresses', () => {
      expect(validateIpCidr('192.168.1.1').valid).toBe(true)
      expect(validateIpCidr('0.0.0.0').valid).toBe(true)
      expect(validateIpCidr('255.255.255.255').valid).toBe(true)
    })

    it('rejects invalid IPv4 addresses', () => {
      expect(validateIpCidr('256.1.1.1').valid).toBe(false)
      expect(validateIpCidr('192.168.1').valid).toBe(false)
      expect(validateIpCidr('not.an.ip').valid).toBe(false)
    })

    it('accepts valid IPv6 addresses', () => {
      expect(validateIpCidr('2001:0db8:85a3:0000:0000:8a2e:0370:7334').valid).toBe(true)
      expect(validateIpCidr('2001:db8::1').valid).toBe(true)
      expect(validateIpCidr('::1').valid).toBe(true)
      expect(validateIpCidr('::').valid).toBe(true)
      expect(validateIpCidr('fe80::1').valid).toBe(true)
    })

    it('accepts IPv4-mapped IPv6 addresses', () => {
      expect(validateIpCidr('::ffff:192.168.1.1').valid).toBe(true)
      expect(validateIpCidr('0:0:0:0:0:ffff:192.168.1.2').valid).toBe(true)
    })

    it('rejects invalid IPv6 addresses (preventing P1 bypass)', () => {
      expect(validateIpCidr(':::').valid).toBe(false)
      expect(validateIpCidr('1::2:').valid).toBe(false)
      expect(validateIpCidr('2001:db8:::1').valid).toBe(false)
      expect(validateIpCidr('fe80:').valid).toBe(false)
    })

    it('accepts CIDR notations', () => {
      expect(validateIpCidr('192.168.1.0/24').valid).toBe(true)
      expect(validateIpCidr('2001:db8::/32').valid).toBe(true)
    })

    it('rejects invalid CIDR notations', () => {
      expect(validateIpCidr('192.168.1.1/33').valid).toBe(false)
      expect(validateIpCidr('2001:db8::/129').valid).toBe(false)
      expect(validateIpCidr('192.168.1.1/').valid).toBe(false)
    })
  })

  describe('normalizeIp', () => {
    it('normalizes IPv6 shorthand to expanded strings', () => {
      // Different formats that evaluate to the same IP logically
      const form1 = normalizeIp('2001:db8:0::1')
      const form2 = normalizeIp('2001:db8::1')
      const form3 = normalizeIp('2001:0db8:0000:0000:0000:0000:0000:0001')

      expect(form1).toBe(form2)
      expect(form2).toBe(form3)
    })

    it('converts IPv4-mapped IPv6 to native IPv4', () => {
      // Prevents 192.168.1.1 and ::ffff:192.168.1.1 from co-existing differently
      expect(normalizeIp('::ffff:192.168.1.1')).toBe('192.168.1.1')
      expect(normalizeIp('0:0:0:0:0:ffff:10.0.0.1')).toBe('10.0.0.1')
    })

    it('strips IPv6 brackets correctly', () => {
      expect(normalizeIp('[fe80::1]')).toBe(normalizeIp('fe80::1'))
      expect(normalizeIp('[::1]')).toBe(normalizeIp('::1'))
    })

    it('returns original input if invalid', () => {
      expect(normalizeIp('invalid-ip')).toBe('invalid-ip')
      expect(normalizeIp(':::')).toBe(':::')
    })
  })
})
