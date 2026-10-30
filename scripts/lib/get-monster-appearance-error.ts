import { monsterAppearanceSchema } from "#/scripts/lib/monster-appearance-schema"
import type { MonsterKind } from "#/world/core/monster-types"
type Props = { appearance: unknown; kind: Pick<MonsterKind, "look" | "color" | "size"> }
/** Source references and tuning overrides describe the real definition; walk-grid adoption does not complete ecological design. */
export function getMonsterAppearanceError(props: Props): Error | null {
  const appearance = monsterAppearanceSchema.safeParse(props.appearance)
  if (!appearance.success) return new Error("Monster appearance needs shared shape and walk-grid clearance metadata")

  if (appearance.data.look !== props.kind.look || appearance.data.color !== (props.kind.color ?? null) || appearance.data.size !== (props.kind.size ?? null))
    return new Error("Monster appearance disagrees with its registered definition")
  return null
}
