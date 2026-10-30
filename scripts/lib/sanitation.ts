import type { SettingDocument } from "#/scripts/lib/setting-document"
type Stream = "excreta" | "greywater" | "treated_residue" | "treated_water"
type Route = { stream: Stream; to: string; container_id: string; container_symbol: string | null; status: "proposed" | "designed" }
/** Trace segregated household waste; accepting a route is not proof of treatment capacity or hygiene. */
export function auditSanitation(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = [],
    containers = new Set<string>()
  for (const doc of documents.values()) {
    const fail = (message: string) => errors.push(`${doc.id}: ${message}`)
    const role = doc.sanitation_role as string | undefined,
      routes = (doc.material_routes ?? []) as Route[]
    if (role) {
      const owner = documents.get(String(doc.owner_building)),
        caretakers = (doc.caretakers ?? []) as string[]
      if (doc.kind !== "facilities" || owner?.kind !== "buildings" || !(owner.facilities as string[] | undefined)?.includes(doc.id)) fail("sanitation facility has no reciprocal household owner")
      if (
        !caretakers.length ||
        new Set(caretakers).size !== caretakers.length ||
        caretakers.some((id) => documents.get(id)?.kind !== "residents" || !(owner?.residents as string[] | undefined)?.includes(id))
      )
        fail("sanitation maintenance has no household caretaker")
      if (role === "privy" && !routes.some((r) => r.stream === "excreta")) fail("privy has no contained waste destination")
      if (role === "treatment" && !["treated_residue", "treated_water"].every((stream) => routes.some((r) => r.stream === stream))) fail("treatment has an incomplete output plan")
      if (role === "nonfood_planting" && routes.length) fail("terminal nonfood plot must not conceal an onward waste route")
    }
    if (routes.length && !["rooms", "facilities"].includes(doc.kind)) fail("waste route has no physical source")
    for (const route of routes) {
      const target = documents.get(route.to),
        raw = route.stream === "excreta" || route.stream === "greywater"
      if (target?.kind !== "facilities" || target.sanitation_role !== (raw ? "treatment" : "nonfood_planting") || !(target.accepts_streams as string[] | undefined)?.includes(route.stream))
        fail("waste stream has no compatible destination")
      if (!raw && role !== "treatment") fail("treated output has no treatment source")
      const sourceOwner = doc.kind === "rooms" ? doc.building : doc.owner_building
      if (!sourceOwner || sourceOwner !== target?.owner_building) fail("private waste route changes household ownership")
      if (route.container_symbol !== null) {
        const container = doc.furniture?.find((f) => f.symbol === route.container_symbol)?.transport_container
        if (!doc.grid || !container || container.id !== route.container_id || container.stream !== route.stream) fail("waste route has no matching placed container")
      } else if (doc.design_gate === "通過") fail("waste container has no physical placement")
      if (containers.has(route.container_id)) fail("transport container is shared between waste routes")
      containers.add(route.container_id)
      if (doc.design_gate === "通過" && route.status !== "designed") fail("waste route is still proposed")
    }
  }
  return [...new Set(errors)]
}
