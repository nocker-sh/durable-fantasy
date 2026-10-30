import { SIZES } from "#/world/town/fit"

export const sizeOf = (name: string) => {
  const s = SIZES[name]
  return s && s !== "wall" ? s : null
}
