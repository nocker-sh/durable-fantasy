import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { auditEcologyZones } from "#/scripts/lib/audit-ecology-zones"
import { ecologyZonesSchema, type EcologySite } from "#/scripts/lib/ecology-zone-schema"
import { getEcologySiteErrors } from "#/scripts/lib/get-ecology-site-errors"
import { getEcologyPlacementErrors } from "#/scripts/lib/get-ecology-placement-errors"
import { getEcologyAccessErrors } from "#/scripts/lib/get-ecology-access-errors"
import { readSetting } from "#/scripts/lib/read-setting"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { MAPS } from "#/world/maps/index"
const document = readSetting(readFileSync(new URL("../../.docs/settings/maps/map-south-meadow.md", import.meta.url), "utf8"))
const zones = ecologyZonesSchema.parse(document.ecology_zones)
const placement = zones.find((zone) => zone.species === "monster-blue-slime")?.placement
if (!placement) throw new Error("Missing authored meadow habitat proposal")
const props = { spawns: SPAWNS, document, map: MAPS["south-meadow"], kinds: new Map(Object.entries(MONSTER_KINDS).map(([id, kind]) => [`monster-${id}`, kind])) }
const site = placement.sites[0]
const candidate = { site, map: props.map, kind: MONSTER_KINDS["blue-slime"] }
it("checks the authored ground and full-body approaches without promoting the proposal", () => {
  expect(auditEcologyZones(props)).toEqual([])
  expect(placement.status).toBe("proposed")
  expect(document.design_gate).toBe("未通過")
  expect(zones.filter((zone) => zone.placement === null)).toHaveLength(0)
})
it("requires exactly the registered species without duplicates or invented species", () => {
  for (const ecology_zones of [zones.slice(1), [...zones, zones[0]], [...zones.slice(1), { ...zones[0], species: "monster-unknown" }]]) {
    expect(auditEcologyZones({ ...props, document: { ...document, ecology_zones } }).length).toBeGreaterThan(0)
  }
})
it("rejects an unsupported adoption claim and a passed gate with unresolved habitats", () => {
  expect(
    auditEcologyZones({ ...props, document: { ...document, ecology_zones: zones.map((zone) => (zone.placement ? { ...zone, placement: { ...zone.placement, status: "adopted" } } : zone)) } }),
  ).toContain("Invalid map ecology zones")
  expect(auditEcologyZones({ ...props, document: { ...document, design_gate: "通過" } })).toHaveLength(3)
})
it("rejects stale terrain, unknown symbols, misaligned grids and off-map origins", () => {
  for (const grid of Array<EcologySite["grid"]>(
    { ...site.grid, rows: ["#" + site.grid.rows[0].slice(1), ...site.grid.rows.slice(1)] },
    { ...site.grid, rows: ["?" + site.grid.rows[0].slice(1), ...site.grid.rows.slice(1)] },
    { ...site.grid, cell_tiles: 1 },
    { ...site.grid, origin_tiles: [-1, 34] },
  ))
    expect(getEcologySiteErrors({ ...candidate, site: { ...site, grid } }).length).toBeGreaterThan(0)
})
it("rejects missing water, duplicate identities and mismatched feature footprints", () => {
  const first = site.features[0]
  for (const features of Array<EcologySite["features"]>(
    site.features.filter((feature) => feature.role !== "water"),
    [...site.features, first],
    [{ ...first, rect: [0, 0, 1, 1] }, ...site.features.slice(1)],
  ))
    expect(getEcologySiteErrors({ ...candidate, site: { ...site, features } }).length).toBeGreaterThan(0)
})
it("rejects blocked, off-grid and distant approaches", () => {
  for (const access of Array<EcologySite["features"][number]["access"]>([[15, 0]], [[16, 1]], [[0, 15]])) {
    const features = [{ ...site.features[0], access }, ...site.features.slice(1)]
    expect(getEcologySiteErrors({ ...candidate, site: { ...site, features } }).length).toBeGreaterThan(0)
  }
})
it("rejects separated approaches even when their individual points remain free", () => {
  const rows = props.map.rows.map((row, z) => (z === 73 ? "#".repeat(props.map.size) : row))
  const features = site.features.map((feature, index) => ({ ...feature, access: Array<[number, number]>(index === 3 ? [7, 8] : [12, 1]) }))
  expect(getEcologyAccessErrors({ ...candidate, site: { ...site, features }, map: { ...props.map, rows } }).length).toBeGreaterThan(0)
})
it("checks the body footprint rather than accepting a free centre beside a wall", () => {
  const rows = props.map.rows.map((row, z) => (z === 69 ? row.slice(0, 83) + "#" + row.slice(84) : row))
  expect(getEcologyAccessErrors({ ...candidate, map: { ...props.map, rows } }).length).toBeGreaterThan(0)
})
it("does not borrow unplanned ground outside the habitat grid to fit the body", () => {
  const features = site.features.map((feature) => ({ ...feature, access: Array<[number, number]>([15, 5]) }))
  expect(getEcologyAccessErrors({ ...candidate, site: { ...site, features } }).length).toBeGreaterThan(0)
})
it.each(zones.filter((zone) => zone.placement !== null))("keeps $species approaches inside its authored grid with its own body size", (zone) => {
  if (!zone.placement) throw new Error("Missing habitat proposal")
  const kind = props.kinds.get(zone.species)
  if (!kind) throw new Error("Unregistered species")
  expect(getEcologyPlacementErrors({ placement: zone.placement, map: props.map, kind })).toEqual([])
})
it("does not count an eastern slime proposal as resources for the western population", () => {
  const ecology_zones = zones.map((zone) => (zone.species === "monster-slime" ? { ...zone, placement } : zone))
  const errors = auditEcologyZones({ ...props, document: { ...document, ecology_zones } })
  expect(errors.filter((message) => message.includes("Territory 8,28,20,40"))).toHaveLength(4)
})
it("keeps disjoint sites independent when the ground between them is blocked", () => {
  const rows = props.map.rows.map((row) => row.slice(0, 48) + "#" + row.slice(49))
  expect(auditEcologyZones({ ...props, map: { ...props.map, rows } })).toEqual([])
})
it("rejects duplicate site identities and empty placements", () => {
  expect(getEcologyPlacementErrors({ placement: { ...placement, sites: [site, site] }, map: props.map, kind: candidate.kind })).toContain(`Duplicate habitat site ${site.id}`)
  expect(ecologyZonesSchema.safeParse([{ ...zones[0], placement: { status: "proposed", sites: [] } }]).success).toBe(false)
})
it("requires each separated slime territory after one authored site is removed", () => {
  const slime = zones.find((zone) => zone.species === "monster-slime")?.placement
  if (!slime) throw new Error("Missing separate slime sites")
  for (const omitted of slime.sites) {
    const ecology_zones = zones.map((zone) => (zone.species === "monster-slime" ? { ...zone, placement: { ...slime, sites: slime.sites.filter((entry) => entry.id !== omitted.id) } } : zone))
    expect(auditEcologyZones({ ...props, document: { ...document, ecology_zones } }).filter((message) => message.includes("Territory"))).toHaveLength(4)
  }
})
it("rejects an extra site outside the species territories even when every population has resources", () => {
  const hare = zones.find((zone) => zone.species === "monster-hare")?.placement
  const slime = zones.find((zone) => zone.species === "monster-slime")?.placement
  if (!hare || !slime) throw new Error("Missing authored sites")
  const ecology_zones = zones.map((zone) => (zone.species === "monster-slime" ? { ...zone, placement: { ...slime, sites: [...slime.sites, ...hare.sites] } } : zone))
  expect(auditEcologyZones({ ...props, document: { ...document, ecology_zones } })).toContain("monster-slime: Site meadow-hare-grass leaves registered territories")
})
