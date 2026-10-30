import type { SettingDocument } from "#/scripts/lib/setting-document"
const fields: Record<string, Record<string, string>> = {
  towns: { maps: "maps", facilities: "facilities" },
  maps: { town: "towns", buildings: "buildings", monsters: "monsters", facilities: "facilities" },
  buildings: { town: "towns", map: "maps", rooms: "rooms", residents: "residents", workers: "residents", home_building: "buildings", facilities: "facilities" },
  rooms: { town: "towns", building: "buildings", private_for: "residents", users: "residents" },
  residents: { town: "towns", buildings: "buildings", bedroom: "rooms", bedroom_candidates: "rooms", work_rooms: "rooms", learning_rooms: "rooms" },
  monsters: { habitats: "maps" },
  facilities: { town: "towns", users: "residents", owner_building: "buildings", caretakers: "residents" },
}
const plural = new Set([
  "maps",
  "facilities",
  "buildings",
  "monsters",
  "rooms",
  "residents",
  "workers",
  "work_rooms",
  "learning_rooms",
  "private_for",
  "caretakers",
  "bedroom_candidates",
  "habitats",
  "users",
])
/** Known relationships require existing targets of the right kind; custom metadata stays untouched. */
export function auditSettingReferenceTypes(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const doc of documents.values()) {
    const check = (value: unknown, kinds: readonly string[], path: string) => {
      if (typeof value !== "string") {
        errors.push(`${doc.id}: invalid reference at ${path}`)
        return
      }
      const target = documents.get(value)
      if (!target) {
        errors.push(`${doc.id}: unresolved reference at ${path}`)
        return
      }
      if (!kinds.includes(target.kind)) errors.push(`${doc.id}: ${path} refers to ${target.kind}, expected ${kinds.join(" or ")}`)
    }
    const many = (value: unknown, kinds: readonly string[], path: string) => {
      if (!Array.isArray(value)) {
        errors.push(`${doc.id}: invalid reference array at ${path}`)
        return
      }
      value.forEach((ref, index) => check(ref, kinds, `${path}[${index}]`))
    }
    for (const entry2 of Object.entries(fields[doc.kind] ?? {})) {
      const field = entry2[0]
      const kind = entry2[1]
      if (doc[field] !== undefined) {
        // Outdoor routes can explicitly belong to no town; a room or building still needs its own parent.
        if (doc.kind === "maps" && field === "town" && doc[field] === null) continue
        if (plural.has(field)) many(doc[field], [kind], field)
        else check(doc[field], [kind], field)
      }
    }
    if (doc.kind === "rooms") {
      for (const entry3 of (doc.furniture ?? []).entries()) {
        const i = entry3[0]
        const item = entry3[1]
        if (item.maintainers !== undefined) many(item.maintainers, ["residents"], `furniture[${i}].maintainers`)
      }
      for (const entry4 of ((doc.connections ?? []) as { target: string }[]).entries()) {
        const i = entry4[0]
        const c = entry4[1]
        check(c.target, ["rooms", "maps"], `connections[${i}].target`)
      }
      for (const field of ["sleeping_places", "personal_storage"])
        for (const entry5 of ((doc[field] ?? []) as { resident: string }[]).entries()) {
          const i = entry5[0]
          const place = entry5[1]
          check(place.resident, ["residents"], `${field}[${i}].resident`)
        }
    }
    for (const entry6 of ((doc.entry_steps ?? []) as { room: string }[]).entries()) {
      const i = entry6[0]
      const steps = entry6[1]
      check(steps.room, ["rooms"], `entry_steps[${i}].room`)
    }
    if (doc.classroom) {
      const classroom = doc.classroom as { teachers: string[]; routine_map: string; places: { resident: string }[] }
      many(classroom.teachers, ["residents"], "classroom.teachers")
      check(classroom.routine_map, ["maps"], "classroom.routine_map")
      classroom.places.forEach((place, i) => check(place.resident, ["residents"], `classroom.places[${i}].resident`))
    }
    if (doc.hot_work) check((doc.hot_work as { handler: string }).handler, ["residents"], "hot_work.handler")
    if (doc.animal_care) check((doc.animal_care as { keeper: string }).keeper, ["residents"], "animal_care.keeper")
    for (const entry7 of ((doc.ground_storage ?? []) as { handler: string }[]).entries()) {
      const i = entry7[0]
      const entry = entry7[1]
      check(entry.handler, ["residents"], `ground_storage[${i}].handler`)
    }
    for (const entry8 of ((doc.laundry_drying as { racks?: { handler: string }[] } | undefined)?.racks ?? []).entries()) {
      const i = entry8[0]
      const rack = entry8[1]
      check(rack.handler, ["residents"], `laundry_drying.racks[${i}].handler`)
    }
    for (const entry9 of ((doc.outdoor_journeys ?? []) as { map: string; from: { document: string; room: string }; to_facility: string }[]).entries()) {
      const i = entry9[0]
      const journey = entry9[1]

      check(journey.map, ["maps"], `outdoor_journeys[${i}].map`)
      check(journey.from.document, ["buildings"], `outdoor_journeys[${i}].from.document`)
      check(journey.from.room, ["rooms"], `outdoor_journeys[${i}].from.room`)
      check(journey.to_facility, ["facilities"], `outdoor_journeys[${i}].to_facility`)
    }
    for (const entry10 of ((doc.material_routes ?? []) as { to: string; carry_plan?: { carrier: string } }[]).entries()) {
      const i = entry10[0]
      const route = entry10[1]

      check(route.to, ["facilities"], `material_routes[${i}].to`)
      if (route.carry_plan) check(route.carry_plan.carrier, ["residents"], `material_routes[${i}].carry_plan.carrier`)
    }
    for (const entry11 of ((doc.access_routes ?? []) as { from: { document: string; room?: string } }[]).entries()) {
      const i = entry11[0]
      const route = entry11[1]

      check(route.from.document, ["buildings", "facilities"], `access_routes[${i}].from.document`)
      if (route.from.room) check(route.from.room, ["rooms"], `access_routes[${i}].from.room`)
    }
    if (doc.kind === "facilities" && doc.site) check((doc.site as { map: string }).map, ["maps"], "site.map")
    if (doc.kind === "monsters")
      for (const entry12 of ((doc.materials ?? []) as { users: string[] }[]).entries()) {
        const i = entry12[0]
        const material = entry12[1]
        many(material.users, ["residents"], `materials[${i}].users`)
      }
  }
  return errors
}
