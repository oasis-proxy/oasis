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
        expect(script).toContain('PROXY 127.0.0.1:7890')
    })
    
    it('should include wildcard check', () => {
        const script = generatePacScriptFromPolicy(mockPolicy, mockProxies)
        expect(script).toContain('shExpMatch(host, "*.google.com")')
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
