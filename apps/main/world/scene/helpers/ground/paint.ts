import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { GROUND_PX } from "#/world/scene/terrain"
import { paintRows } from "#/world/scene/paint-rows"
import { primeFields } from "#/world/scene/prime-fields"
import { setLayout } from "#/world/scene/set-layout"
import { currentLayout } from "#/world/scene/current-layout"
import { layoutOf } from "#/world/maps/layouts"
import type { GroundDone, GroundJob } from "#/world/scene/ground.worker"
import { cacheWrites } from "#/world/scene/ground"
import { keepFields } from "#/world/scene/helpers/ground/keep-fields"

/** Only the current map may fall back to main-thread painting if a worker fails. */
export function paint(map: string, foreground: () => boolean): Promise<PixBuf> {
  const n = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1))
  const buf = new PixBuf(GROUND_PX, GROUND_PX)
  const band = Math.ceil(GROUND_PX / n)
  const pending = new Set<() => boolean>()
  const jobs = Array.from(
    { length: n },
    (_, k) =>
      new Promise<void>((resolve, reject) => {
        const job: GroundJob = { map, y0: k * band, y1: Math.min(GROUND_PX, (k + 1) * band) }
        const worker: { value: Worker | undefined } = { value: undefined },
          settled = { value: false }
        const release = () => {
          if (settled.value) return false
          settled.value = true
          pending.delete(release)
          if (worker.value) {
            worker.value.onmessage = worker.value.onerror = worker.value.onmessageerror = null
            worker.value.terminate()
          }
          return true
        }
        pending.add(release)
        const fail = (error: unknown) => {
          if (!release()) return
          if (!foreground()) {
            reject(error)
            return
          }
          const previous = currentLayout()
          try {
            setLayout(layoutOf(map))
            const part = new PixBuf(GROUND_PX, job.y1 - job.y0)
            paintRows(part, job.y0, job.y1)
            buf.data.set(part.data, job.y0 * GROUND_PX * 4)
            resolve()
          } catch (error) {
            reject(error)
          } finally {
            setLayout(previous)
          }
        }
        try {
          worker.value = new Worker(new URL("../../ground.worker.ts", import.meta.url), { type: "module" })
          worker.value.onmessage = (event: MessageEvent<GroundDone>) => {
            if (settled.value) return
            try {
              const result = event.data
              if (result?.y0 !== job.y0 || !(result.data instanceof Uint8ClampedArray) || result.data.length !== (job.y1 - job.y0) * GROUND_PX * 4) throw new Error("Invalid ground band")
              buf.data.set(result.data, job.y0 * GROUND_PX * 4)
              if (result.fields) {
                primeFields(layoutOf(map), result.fields)
                void cacheWrites.run(() => keepFields(map, result.fields!), undefined)
              }
              release()
              resolve()
            } catch (error) {
              fail(error)
            }
          }
          worker.value.onerror = (event) => {
            event.preventDefault()
            fail(event)
          }
          worker.value.onmessageerror = () => fail(new Error("Ground worker response could not be decoded"))
          worker.value.postMessage(job)
        } catch (error) {
          fail(error)
        }
      }),
  )
  return Promise.all(jobs)
    .then(() => buf)
    .finally(() => {
      // A failed band cancels siblings; late callbacks cannot mutate a discarded painting.
      for (const release of pending) release()
    })
}
