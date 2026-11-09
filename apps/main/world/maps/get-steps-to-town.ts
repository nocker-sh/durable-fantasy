import type { MapDefinition } from "#/world/maps/types"

type Props = Readonly<{ maps: Readonly<Record<string, MapDefinition>>; open: (map: string) => boolean }>

/** Fewest ways out from each map to a town map. A way into a map that is not open does not count. */
export function getStepsToTown(props: Props): ReadonlyMap<string, number> {
  const sources = new Map<string, string[]>()
  for (const map of Object.values(props.maps))
    for (const warp of map.warps) {
      const into = sources.get(warp.to.map)
      if (into) into.push(map.id)
      else sources.set(warp.to.map, [map.id])
    }
  const steps = new Map<string, number>()
  const pending = Object.values(props.maps)
    .filter((map) => map.kind === "town")
    .map((map) => ({ id: map.id, steps: 0 }))
  for (const town of pending) steps.set(town.id, 0)
  for (const current of pending) {
    if (!props.open(current.id)) continue
    for (const source of sources.get(current.id) ?? [])
      if (!steps.has(source)) {
        steps.set(source, current.steps + 1)
        pending.push({ id: source, steps: current.steps + 1 })
      }
  }
  return steps
}
