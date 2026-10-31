import type { Object3D, Raycaster } from "three"

type Props<T> = Readonly<{
  ray: Pick<Raycaster, "intersectObjects">
  owners: ReadonlyArray<T>
  root(owner: T): Object3D
}>

/** 最前面の交点から親をたどり、表示中の描画物を登録済みの持ち主へ結ぶ。 */
export function pickVisibleOwner<T>(props: Props<T>): T | null {
  const roots = new Map<Object3D, T>()
  for (const owner of props.owners) {
    const root = props.root(owner)
    if (root.visible && !roots.has(root)) roots.set(root, owner)
  }
  const hits = props.ray.intersectObjects([...roots.keys()], true)
  const cursor: { object: Object3D | null } = { object: hits[0]?.object ?? null }
  while (cursor.object) {
    const owner = roots.get(cursor.object)
    if (owner !== undefined) return owner
    cursor.object = cursor.object.parent
  }
  return null
}
