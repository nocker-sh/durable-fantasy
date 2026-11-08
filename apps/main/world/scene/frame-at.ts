import { clipDur } from "#/world/scene/clip-dur"
import { frameCount } from "#/world/scene/frame-count"

/** Frame index of a clip that has been playing for t seconds (looping). */
export function frameAt(clip: string, t: number, seatY?: number) {
  const n = frameCount(clip, seatY),
    d = clipDur(clip)
  return Math.floor(((t % d) / d) * n) % n
}
