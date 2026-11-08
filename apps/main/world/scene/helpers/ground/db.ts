const database: { value: Promise<IDBDatabase | null> | null } = { value: null }
import { DB, STORE } from "#/world/scene/ground"

export function db(): Promise<IDBDatabase | null> {
  return (database.value ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => {
        req.result.onversionchange = () => {
          req.result.close()
          database.value = null
        }
        resolve(req.result)
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  }))
}
