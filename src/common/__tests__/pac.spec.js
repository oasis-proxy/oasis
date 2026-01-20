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
            rules: [
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
                },
                {
                    id: '3',
                    type: RuleType.DOMAIN_KEYWORD,
                    pattern: 'ad-server',
                    profileId: 'reject'
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
})
