import { diagnosticGlobal, diagnosticTimer } from "#/world/diagnostics"

/** Keep one shared load timeline and the existing global history used by profiling tools. */
export function lapEnd(step: string): void {
  const laps = diagnosticTimer.end(step)
  diagnosticGlobal.__laps ??= []
  diagnosticGlobal.__laps.push(laps)
  if (import.meta.env.DEV) console.table(laps)
}
