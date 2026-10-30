import * as THREE from "three"
import type { PotHandleSection } from "#/world/town/get-pouring-pot-handle"

/** A real bore keeps the wooden sleeve from occupying the iron bar's volume. */
export function getPotHandleGeometry(section: PotHandleSection): THREE.BufferGeometry | Error {
  const length = Math.hypot(...section.to.map((value, axis) => value - section.from[axis]))
  if (section.material === "iron") return new THREE.CapsuleGeometry(section.radius, length, 4, 8)
  const segments = Math.max(12, Math.floor(Math.PI / Math.acos(section.innerRadius / section.radius)) + 1)
  if (!Number.isSafeInteger(segments) || segments > 256 || section.innerRadius <= 0 || section.innerRadius >= section.radius) return new Error("Wooden pot grip leaves no drawable bore and wall")
  const r = section.radius,
    inner = section.innerRadius / Math.cos(Math.PI / segments),
    h = length / 2
  const profile = [
    [r, -h],
    [r, h],
    [inner, h],
    [inner, -h],
    [r, -h],
  ]

  return new THREE.LatheGeometry(
    profile.map((point) => new THREE.Vector2(point[0], point[1])),
    segments,
  )
}
