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
  DOMAIN_SUFFIX: 'domainSuffix', // e.g. google.com matches www.google.com
  DOMAIN_KEYWORD: 'domainKeyword', // e.g. google matches www.google.com
  IP_CIDR: 'ipCIDR', // e.g. 192.168.1.0/24
  WILDCARD: 'wildcard', // e.g. *.google.com
  REGEX: 'regex', // e.g. ^https?://.*\.google\.com/
  RULE_SET: 'ruleSet' // External rule list
}

// Default Configuration Structure
export const DEFAULT_CONFIG = {
  // --- General Settings (Storage Key: 'config') ---
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
    connectionMonitoring: false,
    autoRefresh: false
  },

  sync: {
    enabled: false
  },

  ipTags: {},


  // --- Profiles (Storage Keys: 'proxies', 'pacs', 'policies') ---
  
  // Map of Proxy Servers (Key: ID)
  proxies: {
    'default_proxy': {
      id: 'default_proxy',
      type: 'server',
      label: 'Example Proxy',
      scheme: ProxyProtocol.HTTP,
      host: '127.0.0.1',
      port: 7890,
      auth: null,
      bypassList: []
    }
  },

  // Map of PAC Scripts (Key: ID)
  pacs: {
    'default_pac': {
      id: 'default_pac',
      url: '' 
    }
  },

  // Map of Auto Policies (Key: ID)
  policies: {
    'default_policy': {
      id: 'default_policy',
      defaultProfileId: 'direct',
      rules: [],
      ruleSets: [] // Subscriptions
    }
  },


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
