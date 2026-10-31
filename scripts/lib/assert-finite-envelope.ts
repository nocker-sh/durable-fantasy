/** The compiler emits acyclic records and arrays; all numeric geometry must be finite before it is returned. */
export function assertFiniteEnvelope(value: unknown, path = "exterior"): void {
  if (typeof value === "number" && !Number.isFinite(value)) throw new RangeError(`Exterior geometry contains a nonfinite number at ${path}`)
  if (value === null || typeof value !== "object") return
  for (const entry of Object.entries(value)) assertFiniteEnvelope(entry[1], `${path}.${entry[0]}`)
}
