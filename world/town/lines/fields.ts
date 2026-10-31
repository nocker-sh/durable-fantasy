import { lines as tenantA } from "#/world/town/lines/households/tenant-a"
import { lines as tenantB } from "#/world/town/lines/households/tenant-b"
import { lines as butcher } from "#/world/town/lines/households/butcher"
import { lines as dairy } from "#/world/town/lines/households/dairy"
import { lines as nanny } from "#/world/town/lines/households/nanny"
import type { Line } from "#/world/town/lines/line"

export const LINES: Record<string, readonly Line[]> = {
  ...tenantA,
  ...tenantB,
  ...butcher,
  ...dairy,
  ...nanny,
}
