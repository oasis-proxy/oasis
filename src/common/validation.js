/**
 * Validation utilities for rule patterns
 */

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
 * Validates an IP address or CIDR notation
 * @param {string} pattern - IP or CIDR to validate
 * @returns {{valid: boolean, message: string}}
 */
export function validateIpCidr(pattern) {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  const cidrPattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

  const trimmed = pattern.trim()

  // IPv4 validation
  if (ipv4Pattern.test(trimmed)) {
    const octets = trimmed.split('.')
    const valid = octets.every((o) => parseInt(o) >= 0 && parseInt(o) <= 255)
    return valid
      ? { valid: true, message: '' }
      : { valid: false, message: 'IP octets must be 0-255' }
  }

  // CIDR validation
  if (cidrPattern.test(trimmed)) {
    const [ip, mask] = trimmed.split('/')
    const octets = ip.split('.')
    const maskNum = parseInt(mask)
    const validOctets = octets.every((o) => parseInt(o) >= 0 && parseInt(o) <= 255)
    const validMask = maskNum >= 0 && maskNum <= 32

    if (validOctets && validMask) {
      return { valid: true, message: '' }
    }
    return { valid: false, message: 'Invalid IP or CIDR mask' }
  }

  // IPv6 validation
  if (ipv6Pattern.test(trimmed)) {
    return { valid: true, message: '' }
  }

  return { valid: false, message: 'Invalid IP or CIDR format' }
}
