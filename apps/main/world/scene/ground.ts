import { OptionalCacheAccess } from "#/lib/engine/optional-cache-access"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"

export const memory = new Map<string, Promise<PixBuf>>()

export const cacheReads = new OptionalCacheAccess(5000)

export const cacheWrites = new OptionalCacheAccess(5000)

export type GroundJobState = {
  foreground: boolean
  promise: Promise<PixBuf>
}

export const DB = "df-ground",
  STORE = "ground"
