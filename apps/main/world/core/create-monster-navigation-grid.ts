import { getMonsterGridLayout } from "#/world/core/get-monster-grid-layout"

type Props = Readonly<{ area: readonly [number, number, number, number]; cellsPerTile: number; free: (x: number, z: number) => boolean }>

/** 検証した正方形の格子を行順に埋め、余白を地形へ問い合わせない。 */
export function createMonsterNavigationGrid(props: Props) {
  const layout = getMonsterGridLayout({ area: props.area, cellsPerTile: props.cellsPerTile, storage: "square" })
  if (layout instanceof Error) return layout
  const blocked = new Uint8Array(layout.count)
  for (const index of blocked.keys()) {
    const x = index % layout.size
    const z = Math.floor(index / layout.size)
    if (x >= layout.width || z >= layout.depth) {
      blocked[index] = 1
      continue
    }
    const worldX = Math.min(props.area[2], Math.max(props.area[0], (layout.ox + x + 0.5) / props.cellsPerTile))
    const worldZ = Math.min(props.area[3], Math.max(props.area[1], (layout.oz + z + 0.5) / props.cellsPerTile))
    blocked[index] = props.free(worldX, worldZ) ? 0 : 1
  }
  return { layout, blocked }
}
