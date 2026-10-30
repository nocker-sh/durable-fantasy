import { BitmapCache } from "#/lib/graphics/bitmap-cache"
import type { FrameJob } from "#/world/scene/sprite.worker"

export type Listener = (frame: ImageBitmap) => void

export type Pending = {
  job: FrameJob
  score: number
  listeners: Listener[]
}

export const decoded = new BitmapCache(64 * 1024 * 1024, 512)

export const pending = new Map<string, Pending>()

export const running = new Map<string, Pending>()

export const idle: Worker[] = []

export const failedUntil = new Map<string, number>()

export const FRAME_RETRY_MS = 5000

export const workers = new Set<Worker>()

export const assigned = new Map<Worker, Pending>()

export const clock = { value: 0 }

export // ---------------------------------------------------------------- baked strips

type StripLoad = {
  url: string
  score: number
  listeners: ((strip: ImageBitmap | null) => void)[]
}

export const stripQueue = new Map<string, StripLoad>()

export const stripsLoading = new Map<string, StripLoad>()
