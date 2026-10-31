import { ESSENTIALS } from "#/world/town/household-essentials"
import { named } from "#/world/town/get-household-furniture-name"
export const missing = (furniture: readonly string[]) => ESSENTIALS.filter(([, re]) => !furniture.some((f) => re.test(named(f)))).map(([name]) => name)
