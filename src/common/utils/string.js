/**
 * Get filename from a full path
 * @param {string} path
 * @returns {string}
 */
export const getFilename = (path) => {
  if (!path) return 'Unknown'
  return path.split(/[/\\]/).pop()
}

/**
 * Get hostname from a URL
 * @param {string} url
 * @returns {string}
 */
export const getDomain = (url) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * Truncate a string in the middle
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateMiddle = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  const charsToShow = maxLength - 3
  const backChars = Math.min(Math.floor(charsToShow / 3), 10) // Keep at most 10 chars at the end
  const frontChars = charsToShow - backChars
  return text.substr(0, frontChars) + '...' + text.substr(text.length - backChars)
}
