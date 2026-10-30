const db: { value: Promise<IDBDatabase | null> | null } = { value: null }

export function open(): Promise<IDBDatabase | null> {
  db.value ??= new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null)
    const req = indexedDB.open("durable-fantasy-sprites", 1)
    req.onupgradeneeded = () => req.result.createObjectStore("frames")
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
  return db.value
}
