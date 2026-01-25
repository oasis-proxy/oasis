/**
 * Proxy config definitions and default state.
 */

// Proxy Modes
export const ProxyMode = {
  FIXED: 'fixed',
  PAC: 'pac',
  AUTO: 'auto'
}

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
  // Current active mode
  mode: ProxyMode.FIXED,

  // Map of proxy profiles
  // Key: ID, Value: Proxy Config
  proxies: {
    'direct': { id: 'direct', type: 'direct', label: 'Direct' },
    'system': { id: 'system', type: 'system', label: 'System' },
    'reject': {
      id: 'reject',
      type: 'reject',
      label: 'Reject',
      host: '127.0.0.1',
      port: 65535
    },
    'default': {
      id: 'default',
      type: 'server',
      label: 'Proxy 1',
      scheme: ProxyProtocol.HTTP,
      host: '127.0.0.1',
      port: 7890,
      auth: null
    }
  },

  // 1. Fixed Server Configuration
  fixed: {
    activeProxyId: 'default'
  },

  // 2. PAC Script Configuration
  pac: {
    url: '' // URL to the PAC file
  },

  // 3. Auto Switch Configuration
  auto: {
    // Default action if no rule matches
    defaultProfileId: 'direct',
    
    // Temporary Session Rules (Highest Priority)
    tempRules: [],

    // External Rule Sets Subscription
    rejectRuleSets: [],
    proxyRuleSets: [
        {
            id: 'gfwlist',
            url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
            format: 'autoproxy', // 'autoproxy' is the only supported format for now
            profileId: 'default', // Apply this proxy to all rules in this set
            enabled: false
        }
    ],

    // Custom Reject Rules (Higher Priority)
    rejectRules: [],

    // Custom Proxy Rules
    proxyRules: [
      {
        id: '1', // Unique ID
        type: RuleType.DOMAIN_KEYWORD,
        pattern: 'google',
        profileId: 'default'
      },
      {
        id: '2',
        type: RuleType.DOMAIN_SUFFIX,
        pattern: 'github.com',
        profileId: 'default'
      },
      {
        id: '3',
        type: RuleType.WILDCARD,
        pattern: '*.example.com',
        profileId: 'default'
      }

    ]
  },

  // 4. Global UI Settings
  ui: {
    theme: 'auto', // 'light', 'dark', 'auto'
  },

  // 5. Update Settings
  update: {
    // 0 = Manual, 15 = 15 min, 60 = 1 hr, 720 = 12 hr, 1440 = 24 hr
    interval: 0 
  },

  // 6. Behavior Settings
  behavior: {
    refreshOnSwitch: false
  },

  // 7. Cloud Sync Settings
  sync: {
    enabled: false
  },

  // 8. IP Tags
  ipTags: {}
}
