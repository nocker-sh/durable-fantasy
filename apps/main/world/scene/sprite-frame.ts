import { ANIMS } from "#/world/scene/figure/animation"
import type { Anim } from "#/world/scene/figure/animation"
import type { Item, Look } from "#/world/scene/figure/look"
import { lookKey } from "#/world/scene/sprite-key"
import type { Listener } from "#/world/scene/sprite-pool"
import { decoded, pending, running, failedUntil, clock } from "#/world/scene/sprite-pool"
import { start } from "#/world/scene/helpers/sprite-pool/start"
import { pump } from "#/world/scene/helpers/sprite-pool/pump"

/**
 * The frame if it is ready; otherwise null, and it is queued. `urgency` orders requests made in
 * the same animation frame (higher first); `onReady` runs when the frame arrives.
 */
type Props = {
  look: Look
  item: Item
  anim: Anim
  view: number
  f: number
  urgency?: number
  onReady?: Listener
  id?: string
}

export function spriteFrame(props: Props): ImageBitmap | null {
  const urgency = props.urgency === undefined ? 0 : props.urgency
  const id = props.id === undefined ? lookKey(props.look, props.item) : props.id

  const key = `${id}|${props.anim}|${props.view}|${props.f}`
  const done = decoded.get(`frame:${key}`)
  if (done) return done
  const retryAt = failedUntil.get(key)
  if (retryAt !== undefined) {
    if (performance.now() < retryAt) return null
    failedUntil.delete(key)
  }
  start()
  const score = clock.value * 1000 + urgency
  const run = running.get(key)
  if (run) {
    if (props.onReady && !run.listeners.includes(props.onReady)) run.listeners.push(props.onReady)
    return null
  }
  const p = pending.get(key)
  if (p) {
    p.score = Math.max(p.score, score)
    if (props.onReady && !p.listeners.includes(props.onReady)) p.listeners.push(props.onReady)
    return null
  }
  pending.set(key, {
    job: { key, look: props.look, anim: props.anim, spec: ANIMS[props.anim], item: props.item, view: props.view, f: props.f },
    score,
    listeners: props.onReady ? [props.onReady] : [],
  })
  pump()
  return null
}
