import { diagnosticGlobal } from "#/world/diagnostics"

/** Dev builds retain the same global inspection point without exposing it in production. */
export function exposeScene(scene: unknown): void {
  if (import.meta.env.DEV) diagnosticGlobal.__scene = scene
}
