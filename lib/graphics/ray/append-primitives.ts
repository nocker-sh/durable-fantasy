import type { Primitive } from "./primitive-types"

/** Extra pose geometry shares the native depth and outline passes without reusing body-part identifiers. */
export function appendPrimitives(base: readonly Primitive[], extra: readonly Omit<Primitive, "id">[]): readonly Primitive[] | Error {
  if (!extra.length) return base
  const first = Math.max(-1, ...base.map((part) => part.id)) + 1
  if (!Number.isSafeInteger(first) || first < 0 || first + extra.length > 32768) return new Error("Extra primitive identifiers leave the renderer range")

  return [...base, ...extra.map((part, index) => ({ ...part, id: first + index }))]
}
