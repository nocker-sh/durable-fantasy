import type { RuntimeOmission } from "#/scripts/lib/runtime-graphics"

export const inventory = (entries: readonly RuntimeOmission[]) =>
  JSON.stringify(
    entries
      .map((inputProps) => {
        const floor = inputProps.floor
        const name = inputProps.name
        return JSON.stringify([floor, name])
      })
      .sort(),
  )
