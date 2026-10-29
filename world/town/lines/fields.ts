import { lines as tenantA } from "./households/tenant-a.ts"
import { lines as tenantB } from "./households/tenant-b.ts"
import { lines as butcher } from "./households/butcher.ts"
import { lines as dairy } from "./households/dairy.ts"
import { lines as nanny } from "./households/nanny.ts"
import type { Line } from "./line.ts"

export const LINES: Record<string, readonly Line[]> = {
  ...tenantA,
  ...tenantB,
  ...butcher,
  ...dairy,
  ...nanny,
}
