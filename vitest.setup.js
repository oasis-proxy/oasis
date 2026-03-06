// vitest.setup.js
import { vi } from 'vitest'

global.chrome = {
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn()
    }
  },
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
    onMessage: {
      addListener: vi.fn()
    }
  },
  i18n: {
    getMessage: (msg) => msg
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    },
    onChanged: {
      addListener: vi.fn()
    }
  }
}
