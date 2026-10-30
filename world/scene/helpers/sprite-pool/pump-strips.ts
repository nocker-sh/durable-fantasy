const STRIP_FETCHES = 6

const loading = { value: 0 }
import { decoded, stripQueue, stripsLoading } from "#/world/scene/sprite-pool"
import type { StripLoad } from "#/world/scene/sprite-pool"

export function pumpStrips() {
  while (loading.value < STRIP_FETCHES && stripQueue.size) {
    const best: { value: StripLoad | null } = { value: null }
    for (const s of stripQueue.values()) if (!best.value || s.score > best.value.score) best.value = s
    const s = best.value!
    stripQueue.delete(s.url)
    stripsLoading.set(s.url, s)
    loading.value++
    fetch(s.url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => createImageBitmap(blob))
      .catch(() => null)
      .then((bitmap) => {
        loading.value--
        stripsLoading.delete(s.url)
        s.listeners.forEach((fn) => fn(bitmap))
        decoded.set(`strip:${s.url}`, bitmap)
        pumpStrips()
      })
  }
}
