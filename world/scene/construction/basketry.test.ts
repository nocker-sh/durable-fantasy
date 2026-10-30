import { expect, it } from "vitest"
import * as THREE from "three"
import { basketry } from "./basketry"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { SceneResources } from "../../../lib/graphics/scene-resources"

it.each([
  ["毛糸の籠", "yarn-basket", 0.75, 0.75],
  ["編みかけの籠", "unfinished-basket", 0.9, 0.9],
  ["柳の束", "willow-bundle", 1.5, 0.75],
  ["柳の束", "willow-bundle", 0.75, 1.5],
] as const)("renders %s within its original footprint (%s %s %s)", (name, kind, w, d) => {
  const piece = getInteriorPiece({ piece: { name, solid: true, on: undefined }, placement: { x: 12, z: 18, w, d } })
  expect(piece).toMatchObject({ kind, name, solid: true })
  if (!("kind" in piece)) throw new Error("Missing furniture mapping")
  const root = basketry(piece, 0.3, kind),
    box = new THREE.Box3().setFromObject(root)
  expect(box.min.x).toBeGreaterThanOrEqual(piece.x - w / 2 - 1e-6)
  expect(box.max.x).toBeLessThanOrEqual(piece.x + w / 2 + 1e-6)
  expect(box.min.z).toBeGreaterThanOrEqual(piece.z - d / 2 - 1e-6)
  expect(box.max.z).toBeLessThanOrEqual(piece.z + d / 2 + 1e-6)
  expect(box.min.y).toBeCloseTo(0.3, 2)
  if (kind === "yarn-basket") expect(root.children.filter((child) => child.name === "yarn-ball")).toHaveLength(3)
  if (kind === "unfinished-basket") {
    expect(root.getObjectByName("finished-rim")).toBeUndefined()
    const upright = new THREE.Box3().setFromObject(root.getObjectByName("upright")!)
    expect(upright.max.y).toBeGreaterThan(0.3 + Math.min(w, d) * 0.6)
  }
  if (kind === "willow-bundle") expect(root.children.filter((child) => child.name === "bundle-tie")).toHaveLength(2)
  new SceneResources(root).dispose()
})
