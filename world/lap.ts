import { diagnosticTimer } from "#/world/diagnostics"

export function lap(step: string): void {
  diagnosticTimer.mark(step)
}
