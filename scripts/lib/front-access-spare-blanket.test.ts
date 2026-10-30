import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { getFrontAccessSpareBlanketReview } from "#/scripts/lib/get-front-access-spare-blanket-review"
import { getFrontAccessStorageError } from "#/scripts/lib/get-front-access-storage-error"
import { spareBlanketStorageSchema } from "#/scripts/lib/spare-blanket-storage-schema"
import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import { buildBody } from "#/world/scene/figure/body"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"

function fixture(number = 3) {
  const room = readSetting(readFileSync(`.docs/settings/rooms/room-h1-${number}.md`, "utf8")),
    building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}

it("supports a distinct covered spare on each owner's cabinet without changing the three stored belongings or in-use bedding", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify(source),
      review = getFrontAccessSpareBlanketReview(source)
    if (review instanceof Error) throw review
    expect(review.source.id).not.toBe(review.source.source_blanket)
    expect(review.size[1]).toBeCloseTo(0.255, 14)
    expect(review.box.bottom).toBe(source.slot.packing?.front_access?.top_m)
    expect(review.textile.weaver).toBe("resident-ベルタ")
    expect(getFrontAccessStorageError(source)).toBeNull()
    expect(JSON.stringify(source)).toBe(before)
  }
})

it("refuses another owner's blanket and overhanging, unsupported or over-height packages", () => {
  const source = fixture(),
    spare = source.slot.packing?.front_access?.spare_blanket
  if (!spare) throw new Error("Missing spare proposal")
  spare.source_blanket = "bed-h1-4-1:blanket"
  expect(getFrontAccessSpareBlanketReview(source)).toBeInstanceOf(Error)
  spare.source_blanket = "bed-h1-3-1:blanket"
  expect(spareBlanketStorageSchema.safeParse({ ...spare, position_m: [0.08, 0.01, 0.25] }).success).toBe(false)
  for (const position of [
    [0, 0, 0.25],
    [0.4, 0, 0.25],
    [0.08, 0, 0.9],
  ] satisfies [number, 0, number][]) {
    spare.position_m = position
    expect(getFrontAccessSpareBlanketReview(source)).toBeInstanceOf(Error)
  }
  spare.position_m = [0.08, 0, 0.25]
  spare.folds = [30, 30]
  expect(getFrontAccessSpareBlanketReview(source)).toBeInstanceOf(Error)
})

it("detects an actual head surface inside the spare's full-walk envelope while the empty cabinet remains clear", () => {
  const source = fixture(),
    review = getFrontAccessSpareBlanketReview(source),
    frame = getFrontAccessHandleFrame({ ...source, leaf: "north", progress: 0 })
  if (review instanceof Error || frame instanceof Error) throw new Error("Missing top-storage proposal")
  const box = review.box,
    skeleton = frame.posed.skeleton,
    original = buildBody(frame.look, skeleton, null).head.c
  const target = toHeadingLocalPoint([(box.x0 + box.x1) / 2, box.top - 0.04, (box.z0 + box.z1) / 2], [frame.body[0], frame.posed.rootY, frame.body[1]], Math.PI / 2)
  const head = skeleton.p.head,
    posed = buildBody(frame.look, { ...skeleton, p: { ...skeleton.p, head: [head[0] + target[0] - original[0], head[1] + target[1] - original[1], head[2] + target[2] - original[2]] } }, null)
  const primitive = posed.prims.find((piece) => piece.a === posed.head.c)
  if (!primitive?.sd) throw new Error("Missing actual native head surface")
  expect(primitive.sd([...target])).toBeLessThan(0)
  const context = getFrontAccessHandleExternalObstacleContext({ ...source, leaf: "north" })
  if (context instanceof Error) throw context
  expect(context.fixedBoxes.some((obstacle) => !canSeparatePrimitiveFromCuboid({ primitive, box: obstacle }))).toBe(true)
  const front = source.slot.packing?.front_access
  if (!front) throw new Error("Missing front-access proposal")
  delete front.spare_blanket
  const empty = getFrontAccessHandleExternalObstacleContext({ ...source, leaf: "north" })
  if (empty instanceof Error) throw empty
  expect(empty.fixedBoxes.every((obstacle) => canSeparatePrimitiveFromCuboid({ primitive, box: obstacle }))).toBe(true)
})
