import { describe, it, expect } from 'vitest'
import { generatePacScriptFromPolicy } from '../pac'
import { ProxyProtocol } from '../config'

describe('generatePacScriptFromPolicy', () => {
    const mockProxies = {
        'direct': { id: 'direct', type: 'direct' },
        'reject': { id: 'reject', type: 'reject' },
        'proxy1': { 
            id: 'proxy1', 
            type: 'server', 
            scheme: ProxyProtocol.HTTP, 
            host: '127.0.0.1', 
            port: 7890 
        }
    }

    const mockPolicy = {
        id: 'policy1',
        name: 'Test Policy',
        rules: [
            {
                id: '1',
                ruleType: 'wildcard', // Note: Function expects 'wildcard' string, not RuleType enum value if different
                pattern: '*.google.com',
                proxyId: 'proxy1'
            },
            {
                id: '2',
                ruleType: 'regex',
                pattern: '^https?://.*\\.example\\.com/',
                proxyId: 'direct'
            }
        ],
        rejectRules: [
            {
                id: '3',
                ruleType: 'ip',
                pattern: '192.168.1.1',
                proxyId: 'reject'
            }
        ]
    }

    it('should generate a valid function string', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        expect(script).toContain('function FindProxyForURL(url, host)')
        expect(script).toContain('return "DIRECT"')
    })

    it('should include correct proxy return string', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        expect(script).toContain('return "HTTP 127.0.0.1:7890"')
    })
    
    it('should generate valid wildcard checks', () => {
        const script = generatePacScriptFromPolicy({
            ...mockPolicy,
            rules: [
                { ruleType: 'wildcard', pattern: '**.example.com', proxyId: 'proxy1' },
                { ruleType: 'wildcard', pattern: '*.test.com', proxyId: 'proxy1' },
                { ruleType: 'wildcard', pattern: '.domain.com', proxyId: 'proxy1' },
                { ruleType: 'wildcard', pattern: '*google.com*', proxyId: 'proxy1' }
            ]
        }, mockProxies)

        // **.example.com -> Subdomains only
        expect(script).toContain('dnsDomainIs(host, ".example.com") && host !== "example.com"')
        
        // *.test.com -> Root + Subdomains
        expect(script).toContain('(dnsDomainIs(host, ".test.com") || host === "test.com")')
        
        // .domain.com -> Root + Subdomains
        expect(script).toContain('(dnsDomainIs(host, ".domain.com") || host === "domain.com")')
        
        // *google.com* -> Standard shExpMatch
        expect(script).toContain('shExpMatch(host, "*google.com*")')
    })

    it('should handle RuleSet with whitelist correctly', () => {
        const script = generatePacScriptFromPolicy({
            ...mockPolicy,
            rules: [
                { 
                    ruleType: 'ruleset', 
                    proxyId: 'proxy1',
                    ruleSet: {
                        content: '||example.com\n@@||whitelist.com'
                    }
                }
            ]
        }, mockProxies)
        
        // Whitelist rule (@@) should be checked first and return DIRECT
        // ||whitelist.com -> *.whitelist.com -> strict wildcard logic
        const whitelistCheck = '(dnsDomainIs(host, ".whitelist.com") || host === "whitelist.com")'
        expect(script).toContain(`if (${whitelistCheck}) return "DIRECT";`)
        
        // Proxy rule (||) should be checked after
        // ||example.com -> *.example.com -> strict wildcard logic
        const proxyCheck = '(dnsDomainIs(host, ".example.com") || host === "example.com")'
        expect(script).toContain(`if (${proxyCheck}) return "HTTP 127.0.0.1:7890";`)
        
        // Verify order
        const whitelistIndex = script.indexOf(`if (${whitelistCheck}) return "DIRECT"`)
        const proxyIndex = script.indexOf(`if (${proxyCheck}) return "HTTP`)
        
        expect(whitelistIndex).toBeLessThan(proxyIndex)
    })

    it('should include regex check', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        // Note: regex pattern escaping in JS string
        expect(script).toContain('/^https?:\\/\\/.*\\.example\\.com\\//.test(host)')
    })

    it('should include reject rule check', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        expect(script).toContain('host === "192.168.1.1"')
        expect(script).toContain('PROXY 127.0.0.1:1') // Reject proxy
    })
    
    it('should check reject rules before normal rules', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        const rejectIndex = script.indexOf('Reject Rules')
        const normalIndex = script.indexOf('Normal Rules')
        expect(rejectIndex).toBeLessThan(normalIndex)
    })

    it('should handle CIDR ranges correctly', () => {
        const policyWithCidr = {
            ...mockPolicy,
            rules: [
                {
                    ruleType: 'ip',
                    pattern: '10.0.0.0/8',
                    proxyId: 'proxy1'
                }
            ]
        }
        const script = generatePacScriptFromPolicy(policyWithCidr, mockProxies)
        expect(script).toContain('isInNet(host, "10.0.0.0", "255.0.0.0")')
    })
})
