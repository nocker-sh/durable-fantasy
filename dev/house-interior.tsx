import { useMemo, useState } from "react"
import type { HouseDef } from "#/world/town/houses.ts"
import { floorPlan } from "#/world/town/floorplan.ts"
import { interiorPlan } from "#/world/town/interiors.ts"
import { buildInterior } from "#/world/scene/interior.ts"
import { Turntable } from "./three-view"

export function HouseInterior({ house }: { house: HouseDef }) {
  const [floor, setFloor] = useState(0)
  const [night, setNight] = useState(false)
  const plan = useMemo(() => floorPlan(house.id), [house.id])
  const build = useMemo(() => buildInterior(interiorPlan(house, floor)), [house, floor])
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          階
          <select aria-label="室内の階" className="rounded border p-1" value={floor} onChange={(event) => setFloor(Number(event.target.value))}>
            {Array.from({ length: plan.floors }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}階
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={night} onChange={(event) => setNight(event.target.checked)} />
          夜の照明
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {plan.rooms
          .filter((room) => room.floor === floor)
          .map((room) => room.name)
          .join("・")}
      </p>
      <Turntable build={build} night={night} cutaway />
    </div>
  )
}
