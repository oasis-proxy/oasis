/**
 * Validation utilities for rule patterns
 */
import * as ipaddr from 'ipaddr.js'

/**
 * Validates a rule pattern based on its type
 * @param {string} ruleType - Type of rule: 'wildcard', 'regex', 'ip', 'ruleset'
 * @param {string} pattern - Pattern to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validatePattern(ruleType, pattern) {
  if (!pattern || !pattern.trim()) {
    return { valid: false, message: 'Pattern is required' }
  }

  switch (ruleType) {
    case 'ruleset':
      return validateRuleSetUrl(pattern)
    case 'regex':
      return validateRegex(pattern)
    case 'ip':
      return validateIpCidr(pattern)
    case 'wildcard':
      return { valid: true, message: '' }
    default:
      return { valid: true, message: '' }
  }
}

/**
 * Validates a RuleSet URL
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validateRuleSetUrl(url) {
  const urlPattern = /^https?:\/\/.+/i
  return urlPattern.test(url.trim())
    ? { valid: true, message: '' }
    : { valid: false, message: 'Must start with http:// or https://' }
}

/**
 * Validates a regex pattern
 * @param {string} pattern - Regex pattern to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validateRegex(pattern) {
  try {
    new RegExp(pattern)
    return { valid: true, message: '' }
  } catch (e) {
    return { valid: false, message: 'Invalid regex syntax' }
  }
}

/**
 * Validates strictly a single IP address (no CIDR)
 * @param {string} pattern - IP to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validateIp(pattern) {
  const trimmed = pattern.trim()
  if (!trimmed) {
    return { valid: false, message: 'IP is required' }
  }

  // Reject CIDR notation immediately
  if (trimmed.includes('/')) {
    return { valid: false, message: 'CIDR notation not allowed here' }
  }

  // Check if it's a raw IP
  try {
    const cleanIp = trimmed.replace(/^\[|\]$/g, '')
    if (ipaddr.isValid(cleanIp)) {
      const parsed = ipaddr.parse(cleanIp)
      // ipaddr.js allows loose IPv4 like '192.168.1'. We want strict 4 octets.
      if (parsed.kind() === 'ipv4' && cleanIp.split('.').length !== 4) {
        return { valid: false, message: 'Invalid IPv4 format' }
      }
      return { valid: true, message: '' }
    }
  } catch (e) {
    // ipaddr.isValid doesn't throw, but parse might if malformed string bypasses somehow
  }

  return { valid: false, message: 'Invalid IP format' }
}

/**
 * Validates an IP address or CIDR notation
 * @param {string} pattern - IP or CIDR to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validateIpCidr(pattern) {
  const trimmed = pattern.trim()
  if (!trimmed) {
    return { valid: false, message: 'IP or CIDR is required' }
  }

  // Check if it's a CIDR
  if (trimmed.includes('/')) {
    try {
      const parsed = ipaddr.parseCIDR(trimmed)
      return { valid: true, message: '' }
    } catch (e) {
      return { valid: false, message: 'Invalid IP CIDR format' }
    }
  }

  // Fallback to strict IP validation
  return validateIp(trimmed)
}

/**
 * Normalizes an IP address (especially for IPv6 shorthands)
 * @param {string} ip - IP address to normalize
 * @returns {string} - Normalized IP address, or original string if invalid
 */
export function normalizeIp(ip) {
  if (!ip) return ip
  const cleanIp = ip.replace(/^\[|\]$/g, '')
  try {
    let parsed = ipaddr.parse(cleanIp)

    // Convert IPv4-mapped IPv6 back to native IPv4 to prevent dupes
    if (parsed.kind() === 'ipv6' && parsed.isIPv4MappedAddress()) {
      parsed = parsed.toIPv4Address()
    }

    if (parsed.kind() === 'ipv6') {
      return parsed.toNormalizedString()
    }
    return parsed.toString()
  } catch (e) {
    return cleanIp
  }
}
