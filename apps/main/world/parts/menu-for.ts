import type { DialogueChoice } from "#/world/state"

const SERVICES: readonly DialogueChoice["action"][] = ["shop", "lodge", "commission", "storage"]

/**
 * A resident who serves you now (shop, commission, storage) opens with what you can do instead of
 * talking first; talking is one of the choices. Null for everyone else, who just talks.
 */
export function menuFor(choices: readonly DialogueChoice[]): DialogueChoice[] | null {
  if (!choices.some((choice) => SERVICES.includes(choice.action))) return null
  const close = choices.filter((choice) => choice.action === "close")
  return [...choices.filter((choice) => choice.action !== "close"), { label: "話をする", action: "talk" }, ...close]
}
