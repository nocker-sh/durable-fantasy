import type { HouseStyle } from "#/world/town/style"

/** A building's look in a few words, to tell neighbours apart. */
export const lookKey = (st: HouseStyle) => `${st.roofShape}/${st.wall}/${st.roofRamp}/${st.windows}`
