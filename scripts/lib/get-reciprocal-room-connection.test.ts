import { expect, it } from "vitest"
import { getReciprocalRoomConnection } from "#/scripts/lib/get-reciprocal-room-connection"
import type { Connection } from "#/scripts/lib/building-layout"

function fixture() {
  const connection: Connection = { kind: "stair", target: "upper", furniture: "S", target_furniture: "T", access: [2, 1], target_access: [2, 3] }
  const reverse: Connection = { kind: "stair", target: "lower", furniture: "T", target_furniture: "S", access: [2, 3], target_access: [2, 1] }
  return { roomId: "lower", connection, candidates: [reverse] }
}
it("matches reversed furniture and both endpoint descriptions without rewriting them", () => {
  const request = fixture(),
    original = structuredClone(request)
  expect(getReciprocalRoomConnection(request)).toBe(request.candidates[0])
  expect(request).toEqual(original)
})
it("rejects a return stair that starts at a different use position", () => {
  const request = fixture()
  request.candidates[0].access = [3, 3]
  expect(getReciprocalRoomConnection(request)).toBeUndefined()
})
it("rejects a return stair that ends at a different use position", () => {
  const request = fixture()
  request.candidates[0].target_access = [3, 1]
  expect(getReciprocalRoomConnection(request)).toBeUndefined()
})
it("does not let a different endpoint shadow a later matching stair declaration", () => {
  const request = fixture(),
    correct = request.candidates[0]
  request.candidates.unshift({ ...correct, access: [3, 3] })
  expect(getReciprocalRoomConnection(request)).toBe(correct)
})
it("does not acknowledge an omitted stair endpoint", () => {
  const request = fixture()
  delete request.candidates[0].access
  expect(getReciprocalRoomConnection(request)).toBeUndefined()
})
