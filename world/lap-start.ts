import { diagnosticTimer } from "#/world/diagnostics"

export function lapStart(what: string): void {
  diagnosticTimer.begin(what)
}
