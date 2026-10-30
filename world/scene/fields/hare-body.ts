import { HARE_BODY_PARTS } from "#/world/core/monster-body-shapes"
import { mergeStatic } from "#/lib/graphics/batch"
import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

/** A hare's body: blocky, long-eared. */
export function hareBody(color = 0x8a7058): THREE.Group {
  const body = new THREE.Group()
  const fur = colorMat(color),
    pale = colorMat(0xd8ccb8)
  const eyes = new THREE.MeshBasicMaterial({ color: 0x1a1420 })
  const materials = { fur, pale, eyes }
  for (const part of HARE_BODY_PARTS) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...part.dimensions), materials[part.material])
    mesh.position.set(...part.position)
    mesh.castShadow = part.castsShadow
    body.add(mesh)
  }
  // Every part moves with the body; keep the original shadow flags while joining like materials.
  const parts = [...body.children] as THREE.Mesh[]
  mergeStatic(body, { anchors: [], moving: [] })
  for (const part of parts) if (!part.parent) part.geometry.dispose()
  return body
}
