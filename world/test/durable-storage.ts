import { vi } from "vitest"

export function durableStorage(value: object, version: number) {
  const saved = new Map<string, unknown>([["__void_durable_state", { __voidDurableState: true, version, value }]])
  let fail = false
  const alarms = vi.fn(async (_at: number) => {})
  const state = {
    id: { toString: () => "test-object" },
    blockConcurrencyWhile: <T>(fn: () => Promise<T>) => fn(),
    storage: {
      setAlarm: alarms,
      get: async (key: string) => structuredClone(saved.get(key)),
      put: async (key: string, next: unknown) => {
        if (fail) {
          fail = false
          throw Error("Storage unavailable")
        }
        saved.set(key, structuredClone(next))
      },
    },
  } as unknown as DurableObjectState
  return {
    state,
    saved,
    alarms,
    failNextSave: () => {
      fail = true
    },
  }
}
