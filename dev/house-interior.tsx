import { authoredBuilding } from "#/world/scene/construction/authored-building"
import { setLayout } from "#/world/scene/set-layout"
import { groundH } from "#/world/scene/ground-h"
import { MARKET, INDOOR } from "#/world/maps/ground-layouts"
import * as THREE from "three"
import { useMemo, useState } from "react"
import type { HouseDef } from "#/world/town/house-types"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import { interiorPlan } from "#/world/town/interior-plan"
import { buildInterior } from "#/world/scene/build-interior"
import { Turntable } from "#/dev/turntable"

export function HouseInterior(inputProps: { house: HouseDef }) {
  const house = inputProps.house

  const exteriorState = useState(false),
    exterior = exteriorState[0],
    setExterior = exteriorState[1]
  const floorState = useState(0),
    floor = floorState[0],
    setFloor = floorState[1]
  const nightState = useState(false),
    night = nightState[0],
    setNight = nightState[1]
  const plan = useMemo(() => floorPlan(house.id), [house.id])
  const build = useMemo(() => {
    if (exterior && house.authored?.exterior)
      return (root: THREE.Group) => {
        const group = new THREE.Group(),
          site = house.authored!.exterior!
        setLayout(MARKET)
        try {
          authoredBuilding(group, site, groundH)
        } finally {
          setLayout(INDOOR)
        }
        group.position.set(24 - (site.bounds[0] + site.bounds[2]) / 2, 0, 24 - (site.bounds[1] + site.bounds[3]) / 2)
        root.add(group)
      }
    return buildInterior(interiorPlan(house, floor, plan))
  }, [house, floor, plan, exterior])
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {house.authored?.exterior && (
          <label className="flex items-center gap-2">
            表示
            <select aria-label="建物の表示" className="rounded border p-1" value={exterior ? "exterior" : "interior"} onChange={(event) => setExterior(event.target.value === "exterior")}>
              <option value="interior">室内</option>
              <option value="exterior">外観</option>
            </select>
          </label>
        )}
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
