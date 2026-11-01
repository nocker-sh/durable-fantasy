import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { mergeStatic } from "#/lib/graphics/merge-static"
import { getFigurePartPivot } from "#/world/core/get-figure-part-pivot"
import type { FigurePaint, FigurePart, MonsterFigure } from "#/world/core/monster-figure-types"

/** Where a body stands: the scene lifts every creature this far above the ground. */
const GROUND = -0.06

/** A creature built from its figure's blocks. Swinging parts hang from their own joints for `poseFigure`. */
export function figureBody(figure: MonsterFigure): THREE.Group {
  const body = new THREE.Group()
  const p = figure.palette
  const colours: Record<FigurePaint, number> = {
    hide: p.hide,
    belly: p.belly ?? 0xd8ccb8,
    dark: p.dark ?? 0x3a3238,
    eye: p.eye ?? 0x1a1420,
    accent: p.accent ?? p.hide,
    bone: p.bone ?? 0xe6dcc4,
    glow: p.glow ?? 0xf0e0a0,
  }
  const materials = new Map<FigurePaint, THREE.Material>()
  const paint = (key: FigurePaint) => {
    let m = materials.get(key)
    if (!m) {
      m = key === "eye" || key === "glow" ? new THREE.MeshBasicMaterial({ color: colours[key] }) : colorMat(colours[key])
      materials.set(key, m)
    }
    return m
  }
  const joints: THREE.Group[] = []
  for (const part of figure.parts) {
    const mesh = new THREE.Mesh(partGeometry(part), paint(part.paint))
    if (part.shape === "ball") mesh.scale.set(part.size[0], part.size[1], part.size[2])
    if (part.turn) mesh.rotation.set(part.turn[0], part.turn[1], part.turn[2])
    mesh.castShadow = part.paint !== "eye"
    if (!part.swing) {
      mesh.position.set(part.at[0], part.at[1] + GROUND, part.at[2])
      body.add(mesh)
      continue
    }
    const pivot = getFigurePartPivot(part)
    const joint = new THREE.Group()
    joint.position.set(pivot[0], pivot[1] + GROUND, pivot[2])
    joint.userData.swing = part.swing
    joint.userData.side = Math.sign(pivot[0]) || 1
    mesh.position.set(part.at[0] - pivot[0], part.at[1] - pivot[1], part.at[2] - pivot[2])
    joint.add(mesh)
    body.add(joint)
    joints.push(joint)
  }
  body.userData.joints = joints
  const parts: THREE.Mesh[] = []
  body.traverse((o) => {
    if (o instanceof THREE.Mesh) parts.push(o)
  })
  mergeStatic(body, { anchors: [], moving: joints })
  for (const part of parts) if (!part.parent) part.geometry.dispose()
  return body
}

function partGeometry(part: FigurePart): THREE.BufferGeometry {
  const s = part.size
  if (part.shape === "box") return new THREE.BoxGeometry(s[0], s[1], s[2])
  if (part.shape === "ball") return new THREE.SphereGeometry(1, 8, 6)
  if (part.shape === "cone") return new THREE.ConeGeometry(s[0], s[1], Math.max(3, Math.round(s[2]) || 6))
  return new THREE.CylinderGeometry(s[0], s[2], s[1], 6)
}
