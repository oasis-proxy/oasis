import { describe, it, expect } from 'vitest'
import { generatePacScript } from '../pac'
import { RuleType, ProxyMode, ProxyProtocol } from '../config'

describe('generatePacScript', () => {
    const mockConfig = {
        mode: ProxyMode.AUTO,
        proxies: {
            'direct': { id: 'direct', type: 'direct' },
            'reject': { id: 'reject', type: 'reject' },
            'proxy1': { 
                id: 'proxy1', 
                type: 'server', 
                scheme: ProxyProtocol.HTTP, 
                host: '127.0.0.1', 
                port: 7890 
            }
        },
        auto: {
            defaultProfileId: 'direct',
            tempRules: [
                {
                    id: 'temp1',
                    type: RuleType.DOMAIN_KEYWORD,
                    pattern: 'temporary',
                    profileId: 'direct'
                }
            ],
            rejectRules: [
                {
                    id: '3',
                    type: RuleType.DOMAIN_KEYWORD,
                    pattern: 'ad-server',
                    profileId: 'reject'
                }
            ],
            proxyRules: [
                {
                    id: '1',
                    type: RuleType.DOMAIN_SUFFIX,
                    pattern: 'google.com',
                    profileId: 'proxy1'
                },
                {
                    id: '2',
                    type: RuleType.WILDCARD,
                    pattern: '*.example.com',
                    profileId: 'proxy1'
                }
            ]
        }
    }

    it('should generate a valid function string', () => {
        const script = generatePacScript(mockConfig)
        expect(script).toContain('function FindProxyForURL(url, host)')
        expect(script).toContain('return "DIRECT"')
    })

    it('should include correct proxy return string', () => {
        const script = generatePacScript(mockConfig)
        expect(script).toContain('PROXY 127.0.0.1:7890')
    })
    
    it('should include domain suffix check', () => {
        const script = generatePacScript(mockConfig)
        expect(script).toContain('dnsDomainIs(host, "google.com")')
    })

    it('should include wildcard check', () => {
        const script = generatePacScript(mockConfig)
        expect(script).toContain('_wildcard("*.example.com", host)')
    })

    it('should return blackhole proxy for reject rule', () => {
        const script = generatePacScript(mockConfig)
        expect(script).toContain('PROXY 127.0.0.1:65535')
    })
    
    it('should include temporary rules with high priority', () => {
        const script = generatePacScript(mockConfig)
        // Basic check for existence
        expect(script).toContain('host.indexOf("temporary")')
        
        // Check ordering: Temp rule should appear before Reject rule ('ad-server')
        const tempIndex = script.indexOf('temporary')
        const rejectIndex = script.indexOf('ad-server')
        expect(tempIndex).toBeLessThan(rejectIndex)
    })

    it('should use configured port for reject proxy', () => {
        const customConfig = JSON.parse(JSON.stringify(mockConfig))
        customConfig.proxies.reject = {
            id: 'reject',
            type: 'reject',
            host: '127.0.0.1',
            port: 12345
        }
        
        const script = generatePacScript(customConfig)
        expect(script).toContain('PROXY 127.0.0.1:12345')
    })

    it('should include rules from external rule sets', () => {
        const configWithSets = JSON.parse(JSON.stringify(mockConfig))
        configWithSets.auto.proxyRuleSets = [
            {
                id: 'set1',
                enabled: true,
                profileId: 'proxy1',
                rules: [
                    { type: RuleType.DOMAIN_KEYWORD, pattern: 'external-proxy', profileId: '' }
                ]
            }
        ]
        configWithSets.auto.rejectRuleSets = [
            {
                id: 'set2',
                enabled: true,
                profileId: 'reject',
                rules: [
                    { type: RuleType.DOMAIN_KEYWORD, pattern: 'external-reject', profileId: '' }
                ]
            }
        ]

        const script = generatePacScript(configWithSets)

        // Verify rules are present
        expect(script).toContain('external-reject')
        expect(script).toContain('external-proxy')

        // Verify Priority: 
        // 0. Temp
        // 1. Custom Reject
        // 2. External Reject
        // 3. Custom Proxy
        // 4. External Proxy
        
        // 'ad-server' (Custom Reject) < 'external-reject' (Ext Reject)
        expect(script.indexOf('ad-server')).toBeLessThan(script.indexOf('external-reject'))
        
        // 'external-reject' (Ext Reject) < 'google.com' (Custom Proxy)
        expect(script.indexOf('external-reject')).toBeLessThan(script.indexOf('google.com'))
        
        // 'google.com' (Custom Proxy) < 'external-proxy' (Ext Proxy)
        expect(script.indexOf('google.com')).toBeLessThan(script.indexOf('external-proxy'))
    })
})
