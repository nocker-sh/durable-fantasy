import type { Shape } from "#/world/core/items/weapon-types"

/** Iron shapes use only their authored positive plank and grip-leather quantities. */
export function ironForgeOf(forge: Shape["forge"]): { inputs: [string, number][]; min: number } {
  const inputs: [string, number][] = [["iron-ingot", forge.iron]]
  if (forge.plank) inputs.push(["plank", forge.plank])
  if (forge.fur) inputs.push(["soft-fur", forge.fur])

  return { inputs, min: forge.min }
}
