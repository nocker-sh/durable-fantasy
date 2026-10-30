import { expect, expectTypeOf, it } from "vitest"
import { withoutKeys } from "#/lib/engine/without-keys"

it("keeps required forwarded values and enumerable symbols without changing the source", () => {
  const marker = Symbol("forwarded")
  const value = { enabled: true }
  const source = { className: "panel", required: 1, [marker]: value }
  Object.defineProperty(source, "hidden", { value: true, enumerable: false })
  const remaining = withoutKeys(source, ["className"])

  expectTypeOf(remaining.required).toEqualTypeOf<number>()
  expect(remaining).toEqual({ required: 1, [marker]: value })
  expect(remaining[marker]).toBe(value)
  expect(remaining).not.toBe(source)
  expect(Object.hasOwn(remaining, "hidden")).toBe(false)
  expect(source.className).toBe("panel")
})

it("does not read excluded getters and copies own values without invoking prototype setters", () => {
  const reads: string[] = []
  const source = {
    get omitted() {
      reads.push("omitted")
      return 1
    },
    get kept() {
      reads.push("kept")
      return 2
    },
    3: "numeric",
  }
  Object.defineProperty(source, "__proto__", { value: "own", enumerable: true })
  const copied = withoutKeys(source, ["omitted", 3])
  expect(reads).toEqual(["kept"])
  expect(copied.kept).toBe(2)
  expect(Object.hasOwn(copied, "3")).toBe(false)
  expect(Object.getOwnPropertyDescriptor(copied, "__proto__")?.value).toBe("own")
  expect(Object.getPrototypeOf(copied)).toBe(Object.prototype)
})

it("retains discriminated success and failure variants", () => {
  type Outcome = { ok: true; value: number; drop: string } | { ok: false; reason: string; drop: string }
  function copy(source: Outcome) {
    return withoutKeys(source, ["drop"])
  }
  expectTypeOf<ReturnType<typeof copy>>().toEqualTypeOf<{ ok: true; value: number } | { ok: false; reason: string }>()
  expect(copy({ ok: true, value: 3, drop: "unused" })).toEqual({ ok: true, value: 3 })
  expect(copy({ ok: false, reason: "BUSY", drop: "unused" })).toEqual({ ok: false, reason: "BUSY" })
})
