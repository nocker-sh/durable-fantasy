// Still meshes joined into few draw calls. Nothing leaves the picture: meshes that share a
// material and never move on their own are merged into one, so the GPU is asked once for a
// street of fences instead of once per post. Whatever moves, fades or is hidden later keeps its
// own transform: it is an anchor, and what stands under it merges under it, never above.
import * as THREE from "three"

export type MergeOptions = {
  /** objects whose transform or visibility changes later (what is under them merges under them) */
  anchors: Iterable<THREE.Object3D>
  /** objects whose local transforms change after construction */
  moving: Iterable<THREE.Object3D>
}

/** Merge every still mesh under `root` with the others that share its material and nearest anchor. */
export function mergeStatic(root: THREE.Object3D, options: MergeOptions): { before: number; after: number } {
  const moving = new Set(options.moving)
  const anchors = new Set<THREE.Object3D>([root, ...options.anchors, ...moving])
  root.updateMatrixWorld(true)
  const groups = new Map<string, { anchor: THREE.Object3D; sample: THREE.Mesh; meshes: THREE.Mesh[] }>()
  const toAnchor = new THREE.Matrix4()
  let before = 0
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    before++
    if (moving.has(mesh) || !mergeable(mesh)) return
    const anchor = anchorOf(mesh, anchors)
    if (!anchor) return
    const key = keyOf(mesh, anchor)
    let g = groups.get(key)
    if (!g) groups.set(key, (g = { anchor, sample: mesh, meshes: [] }))
    g.meshes.push(mesh)
  })
  let after = before
  const emptied = new Set<THREE.Object3D>()
  for (const g of groups.values()) {
    if (g.meshes.length < 2) continue
    const inverse = g.anchor.matrixWorld.clone().invert()
    const geometries = g.meshes.map((mesh) => {
      toAnchor.copy(inverse).multiply(mesh.matrixWorld)
      return mesh.geometry.clone().applyMatrix4(toAnchor)
    })
    const m = new THREE.Mesh(concat(geometries), g.sample.material)
    for (const geometry of geometries) geometry.dispose()
    m.castShadow = g.sample.castShadow
    m.receiveShadow = g.sample.receiveShadow
    m.renderOrder = g.sample.renderOrder
    m.frustumCulled = g.sample.frustumCulled
    m.layers.mask = g.sample.layers.mask
    g.anchor.add(m)
    for (const old of g.meshes) {
      const parent = old.parent
      old.removeFromParent()
      if (parent) emptied.add(parent)
    }
    after -= g.meshes.length - 1
  }
  // groups left with nothing in them cost a visit every frame; anchors stay, they are referred to
  for (let o of emptied)
    while (o && o !== root && !anchors.has(o) && o.children.length === 0) {
      const parent = o.parent
      o.removeFromParent()
      o = parent!
    }
  root.traverse((object) => {
    if (!anchors.has(object)) {
      object.updateMatrix()
      object.matrixAutoUpdate = false
    }
  })
  return { before, after }
}

/** One geometry holding all of these, which share their attribute names and sizes and are all indexed or none. */
function concat(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry()
  const first = geometries[0]
  for (const name of Object.keys(first.attributes)) {
    const size = first.attributes[name].itemSize
    const total = geometries.reduce((n, g) => n + g.attributes[name].count, 0)
    const ArrayType = first.attributes[name].array.constructor as typeof Float32Array
    const data = new ArrayType(total * size)
    let at = 0
    for (const g of geometries) {
      const a = g.attributes[name]
      data.set(a.array, at)
      at += a.count * size
    }
    out.setAttribute(name, new THREE.BufferAttribute(data, size, first.attributes[name].normalized))
  }
  if (first.index) {
    const total = geometries.reduce((n, g) => n + g.index!.count, 0)
    const index = new Uint32Array(total)
    let at = 0,
      base = 0
    for (const g of geometries) {
      const ix = g.index!
      for (let i = 0; i < ix.count; i++) index[at + i] = ix.array[i] + base
      at += ix.count
      base += g.attributes.position.count
    }
    out.setIndex(new THREE.BufferAttribute(index, 1))
  }
  return out
}

function mergeable(m: THREE.Mesh): boolean {
  if (!m.visible || Array.isArray(m.material) || m.name || Object.keys(m.userData).length) return false
  if ((m as THREE.InstancedMesh).isInstancedMesh || (m as THREE.SkinnedMesh).isSkinnedMesh) return false
  const g = m.geometry
  if (!g.attributes.position || Object.keys(g.morphAttributes).length) return false
  if (g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false
  if (Object.values(g.attributes).some((a) => (a as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute)) return false
  return true
}

/** The nearest anchor above the mesh; none if something hidden stands between. */
function anchorOf(mesh: THREE.Object3D, anchors: Set<THREE.Object3D>): THREE.Object3D | null {
  for (let o = mesh.parent; o; o = o.parent) {
    if (anchors.has(o)) return o
    if (!o.visible) return null
  }
  return null
}

function keyOf(m: THREE.Mesh, anchor: THREE.Object3D): string {
  const g = m.geometry
  const attributes = Object.keys(g.attributes)
    .sort()
    .map((n) => `${n}:${g.attributes[n].itemSize}:${g.attributes[n].normalized}:${g.attributes[n].array.constructor.name}`)
    .join(",")
  const material = m.material as THREE.Material
  return [anchor.id, material.id, +m.castShadow, +m.receiveShadow, m.renderOrder, +m.frustumCulled, m.layers.mask, g.index ? 1 : 0, attributes].join("|")
}
