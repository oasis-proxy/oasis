import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DataSync from '../DataSync.vue'

// Mock dependencies
vi.mock('../../../common/storage', () => ({
  exportConfig: vi.fn(),
  importConfig: vi.fn(),
  clearLocalConfig: vi.fn(),
  clearCloudConfig: vi.fn(),
  saveGeneralSettings: vi.fn()
}))

vi.mock('../../../common/i18n', () => ({
  t: (key) => key
}))

vi.mock('../../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../../../composables/useDataSync', () => ({
  useDataSync: () => ({
    config: { sync: { enabled: true } },
    cloudConfig: null,
    showConflictModal: false,
    softwareVersion: '1.0.0',
    loadLocalData: vi.fn(),
    loadCloudData: vi.fn(),
    handleSyncToCloud: vi.fn(),
    handleSyncFromCloud: vi.fn(),
    toggleAutoSync: vi.fn(),
    resolveConflictCloud: vi.fn(),
    resolveConflictLocal: vi.fn(),
    cancelAutoSync: vi.fn()
  })
}))

// Mock Sub Components to simplify mount
vi.mock('../../../components/sync/SyncConflictModal.vue', () => ({
  default: {
    name: 'SyncConflictModal',
    template: '<div></div>'
  }
}))
vi.mock('../../../components/sync/UpdateStatusModal.vue', () => ({
  default: {
    name: 'UpdateStatusModal',
    template: '<div class="mock-update-modal" v-if="visible" :data-details="JSON.stringify(details)"></div>',
    props: ['visible', 'details']
  }
}))
vi.mock('../../../components/base/BaseDetailView.vue', () => ({
  default: {
    name: 'BaseDetailView',
    template: '<div><slot></slot></div>',
    props: ['title', 'maxWidth']
  }
}))
vi.mock('../../../components/sync/SyncVersionCard.vue', () => ({
  default: {
    name: 'SyncVersionCard',
    template: '<div></div>',
    props: ['title', 'data', 'softwareVersion']
  }
}))

describe('DataSync.vue - UpdateStatusModal Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.chrome = {
      runtime: {
        sendMessage: vi.fn(),
        lastError: null,
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn()
        }
      }
    }
  })

  it('should render UpdateStatusModal with details when triggering Update All RuleSets', async () => {
    // Mount component
    const wrapper = mount(DataSync, {
      global: {
        mocks: {
          $t: (msg) => msg
        }
      }
    })

    // Verify modal is initially hidden (not rendered due to v-if/v-show or visible=false logic) 
    // Wait, the mock template uses v-if="visible"
    expect(wrapper.find('.mock-update-modal').exists()).toBe(false)

    // Simulate sending message — new contract returns `targets` (pending items)
    const mockTargets = [
      { id: 'pac::https://test.com/pac.js::0', type: 'pac', url: 'https://test.com/pac.js', status: 'pending', message: 'msgPending' },
      { id: 'ruleset::Test Policy::https://test.com/rule.txt::1', type: 'ruleset', policyName: 'Test Policy', url: 'https://test.com/rule.txt', status: 'pending', message: 'msgPending' }
    ]

    global.chrome.runtime.sendMessage.mockImplementation((msg, cb) => {
      if (msg.type === 'TRIGGER_UPDATE') {
        cb({ success: true, targets: mockTargets })
      }
    })

    // Find the Update All RuleSets button and click it
    // Use heuristic: it has the bi-arrow-clockwise icon
    const updateButton = wrapper.findAll('button').find(b => b.html().includes('bi-arrow-clockwise'))
    expect(updateButton.exists()).toBe(true)

    await updateButton.trigger('click')

    // Expect message sent
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'TRIGGER_UPDATE' }, expect.any(Function))

    // Expect modal to appear and have details
    const modal = wrapper.find('.mock-update-modal')
    expect(modal.exists()).toBe(true)
    
    // Check if the bound details match mockDetails
    const detailsPropString = modal.attributes('data-details')
    const detailsArray = JSON.parse(detailsPropString)
    
    expect(detailsArray).toHaveLength(2)
    expect(detailsArray[0].url).toBe('https://test.com/pac.js')
    expect(detailsArray[1].policyName).toBe('Test Policy')
  })

  it('should render UpdateStatusModal with system error when TRIGGER_UPDATE fails (success: false)', async () => {
    // Mount component
    const wrapper = mount(DataSync, {
      global: {
        mocks: {
          $t: (msg) => msg
        }
      }
    })

    // Simulate sending message with success: false
    global.chrome.runtime.sendMessage.mockImplementation((msg, cb) => {
      if (msg.type === 'TRIGGER_UPDATE') {
        cb({ success: false, error: 'Network Error' })
      }
    })

    const updateButton = wrapper.findAll('button').find(b => b.html().includes('bi-arrow-clockwise'))
    await updateButton.trigger('click')

    // Expect modal to appear and have the system error mapped
    const modal = wrapper.find('.mock-update-modal')
    expect(modal.exists()).toBe(true)
    
    const detailsArray = JSON.parse(modal.attributes('data-details'))
    
    expect(detailsArray).toHaveLength(1)
    expect(detailsArray[0].type).toBe('system')
    expect(detailsArray[0].success).toBe(false)
    expect(detailsArray[0].message).toBe('Network Error')
  })
})
