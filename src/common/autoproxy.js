/**
 * Parses AutoProxy rules (gfwlist format).
 * @param {string} content - The content of the rule list (usually Base64 encoded or plain text).
 * @returns {Array<{pattern: string, type: string, isWhitelist: boolean}>}
 */
export function parseAutoProxyRules(content) {
  const rules = [];
  
  // Basic check for Base64 (common for gfwlist)
  let decoded = content;
  try {
      // Improved check for Base64
      // 1. Must not contain whitespace
      // 2. Length must be multiple of 4
      // 3. Must match Base64 charset
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!content.includes('\n') && !content.includes(' ') && content.length % 4 === 0 && base64Regex.test(content)) {
        const decodedCandidate = atob(content);
        // Sanity check: decoded content should look like text (no binary control chars)
        // AutoProxy rules are text, so we expect mostly printable items + newlines
        // If it has many control chars, it's likely not what we want
        // eslint-disable-next-line no-control-regex
        if (!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(decodedCandidate)) {
           decoded = decodedCandidate;
        }
      }
  } catch (e) {
      // Not base64, assume plain text
  }

  const lines = decoded.split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('!') || line.startsWith('[')) continue; // Skip comments and sections

    let isWhitelist = false;
    if (line.startsWith('@@')) {
      isWhitelist = true;
      line = line.substring(2);
    }

    let pattern = line;
    let type = 'keyword'; // Default to keyword search

    if (pattern.startsWith('/')) {
        // Regex /pattern/
        if (pattern.endsWith('/')) {
             pattern = pattern.substring(1, pattern.length - 1);
             type = 'regex';
        } else {
            // Invalid regex format, treat as keyword or ignore?
            // Treating as wildcard/keyword for now unless strict regex
        }
    } else if (pattern.startsWith('||')) {
        // Domain anchor
        pattern = pattern.substring(2);
        type = 'domain'; 
    } else if (pattern.startsWith('|')) {
        // Start anchor
        pattern = pattern.substring(1);
        type = 'full_url_start'; // Special handling needed usually
    } else if (pattern.endsWith('|')) {
        // End anchor
        pattern = pattern.substring(0, pattern.length - 1);
        type = 'full_url_end'; // Special handling needed
    } else {
        // Plain keyword or wildcard (if contains *)
        if (pattern.includes('*')) {
            type = 'wildcard';
        }
    }

    rules.push({
      pattern,
      type,
      isWhitelist,
      original: line
    });
  }

  return rules;
}

/**
 * Converts parsed AutoProxy rules to internal rule format.
 * @param {Array<{pattern: string, type: string, isWhitelist: boolean}>} parsedRules
 * @param {string} defaultRuleType - Default rule type to use ('wildcard', 'regex', etc.)
 * @returns {Array<{ruleType: string, pattern: string}>}
 */
export function convertAutoProxyToInternalRules(parsedRules, defaultRuleType = 'wildcard') {
  const internalRules = [];

  for (const rule of parsedRules) {
    let ruleType = defaultRuleType;
    let pattern = rule.pattern;
    const isWhitelist = rule.isWhitelist;

    switch (rule.type) {
      case 'regex':
        ruleType = 'regex';
        break;
      case 'domain':
        // Domain rules like ||example.com should be strict wildcard
        ruleType = 'wildcard';
        // Convert to *.domain.com to trigger optimized dnsDomainIs path in PAC
        pattern = `*.${pattern}`;
        break;
      case 'wildcard':
        ruleType = 'wildcard';
        break;
      case 'keyword':
        // Keywords can be treated as wildcard with * on both sides
        ruleType = 'wildcard';
        if (!pattern.includes('*')) {
          pattern = `*${pattern}*`;
        }
        break;
      case 'full_url_start':
      case 'full_url_end':
        // These need regex for proper matching
        ruleType = 'regex';
        if (rule.type === 'full_url_start') {
          pattern = `^${escapeRegex(pattern)}`;
        } else {
          pattern = `${escapeRegex(pattern)}$`;
        }
        break;
      default:
        // Default to wildcard
        ruleType = 'wildcard';
        if (!pattern.includes('*')) {
          pattern = `*${pattern}*`;
        }
    }

    internalRules.push({
      ruleType,
      pattern,
      isWhitelist
    });
  }

  return internalRules;
}

/**
 * Helper function to escape special regex characters.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
