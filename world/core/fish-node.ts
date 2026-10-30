import type { NodeDef } from "#/world/core/gather-types"

type Props = { map: string; index: number; cell: readonly [number, number]; river: boolean }

/** 海と川の成果を分け、川だけに沈んだ鉄と高い節目の魚を含める。 */
export function fishNode(props: Props): NodeDef {
  return {
    id: `${props.map}-fish-${props.index}`,
    map: props.map,
    cell: props.cell,
    kind: "fish",
    skill: "fishing",
    needsTool: true,
    max: 5,
    regen: 25,
    yields: props.river
      ? [
          { item: "trout", weight: 10 },
          { item: "rusty-scrap", weight: 1, level: 2 },
          { item: "winter-char", weight: 3, level: 16 },
          { item: "engine-core", weight: 1, level: 32 },
          { item: "elder-scale", weight: 0.5, level: 64 },
        ]
      : [
          { item: "sea-fish", weight: 10 },
          { item: "trout", weight: 1 },
        ],
  }
}
