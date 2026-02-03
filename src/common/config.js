/**
 * Proxy config definitions and default state.
 */

// Proxy Protocols
export const ProxyProtocol = {
  HTTP: 'http',
  HTTPS: 'https',
  SOCKS4: 'socks4',
  SOCKS5: 'socks5'
}

// Auto Switch Rule Types
export const RuleType = {
  IP_CIDR: 'ipCIDR', // e.g. 192.168.1.0/24
  WILDCARD: 'wildcard', // e.g. *.google.com
  REGEX: 'regex', // e.g. ^https?://.*\.google\.com/
  RULE_SET: 'ruleSet' // External rule list
}

// Default Configuration Structure
export const DEFAULT_CONFIG = {
  // --- General Settings (Storage Key: 'config') ---
  version: 1, // Configuration version for sync
  activeProfileId: 'direct', // Only one active profile at a time

  ui: {
    theme: 'auto', // 'light', 'dark', 'auto'
    showContextMenu: false
  },

  update: {
    // 0 = Manual, 15 = 15 min, 60 = 1 hr, 720 = 12 hr, 1440 = 24 hr
    interval: 0 
  },

  behavior: {
    refreshOnSwitch: false,
    connectionMonitoring: false
  },

  sync: {
    enabled: false
  },

  ipTags: {},

  // --- Profiles (Storage Keys: 'proxies', 'pacs', 'policies') ---
  
  // Map of Proxy Servers (Key: ID) 
  proxies: {},

  // Map of PAC Scripts (Key: ID)
  pacs: {},

  /**
   * Map of Auto Policies (Key: ID).
   * 
   * Schema:
   * {
   *   id: string,               // Unique ID
   *   type: 'policy',           // Fixed type
   *   name: string,             // Display name
   *   color: string,            // UI color (hex)
   *   defaultProfileId: string, // ID of profile to use if no rules match
   *   
   *   // Rules Lists (Ordered)
   *   rules: Array<Rule>,       // Standard proxy rules
   *   rejectRules: Array<Rule>, // Rejection/Blocking rules (Processed first)
   * }
   * 
   * Rule Object Schema:
   * {
   *   type: 'rule' | 'divider', // 'divider' is a visual separator
   *   ruleType: 'wildcard' | 'regex' | 'ip' | 'ruleset',
   *   pattern: string,          // Matching pattern or RuleSet URL (Source of Truth)
   *   proxyId: string,          // Target proxy ID
   *   label: string,            // Optional label (for dividers)
   *   
   *   // RuleSet Cache (Populated by background script)
   *   ruleSet: {
   *     content: string,        // Raw content (stripped during cloud sync)
   *     lastUpdated: number,    // Content timestamp
   *     lastFetched: number,    // Fetch attempt timestamp
   *     fetchError: string|null // Last fetch error
   *   }
   * }
   */
  policies: {},


  // --- Singletons (Storage Keys: 'system', 'direct', 'reject') ---
  
  system: { id: 'system', type: 'system', label: 'System' },
  
  direct: { id: 'direct', type: 'direct', label: 'Direct' },
  
  reject: {
    id: 'reject',
    type: 'reject',
    label: 'Reject',
    host: '127.0.0.1',
    port: 65535
  }
}
