const started = { value: false }
import { pump } from "#/world/scene/helpers/sprite-pool/pump"

import { spawnWorker } from "#/world/scene/helpers/sprite-pool/spawn-worker"

export function start() {
  if (started.value) return
  started.value = true
  const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1))
  for (const i = { value: 0 }; i.value < n; i.value++) spawnWorker(pump)
}
