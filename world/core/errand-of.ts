import { ERRANDS } from "#/world/core/errands"

/** 元の定義順で依頼を識別子から引く。 */
export function errandOf(id: string) {
  return ERRANDS.find((errand) => errand.id === id)
}
