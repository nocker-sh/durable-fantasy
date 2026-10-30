// Existing exterior geometry, shared by rendering and the settings placement audit.
export const CHAPEL = {
  id: "chapel",
  map: "phanthiet",
  body: { x0: 8, x1: 15, z0: 3, z1: 7, height: 3.4 },
  tower: { x0: 5.6, x1: 8, z0: 3.8, z1: 6.2, height: 6.2, capOverhang: 0.12 },
  baseMargin: 0.1,
  buttressDepth: 0.35,
  roofOverhang: 0.25,
  doorOffset: 3.6,
  approachOffset: 0.8,
} as const

/** Conservative envelopes include the roof, base and projecting buttresses. */
export function chapelFootprints(): { id: string; rect: readonly [number, number, number, number] }[] {
  const bodySource = CHAPEL,
    body = bodySource.body,
    tower = bodySource.tower,
    roofOverhang = bodySource.roofOverhang,
    buttressDepth = bodySource.buttressDepth
  return [
    { id: "building-chapel/body", rect: [body.x0 - roofOverhang, body.z0 - buttressDepth, body.x1 + roofOverhang, body.z1 + buttressDepth] },
    { id: "building-chapel/tower", rect: [tower.x0 - tower.capOverhang, tower.z0 - tower.capOverhang, tower.x1 + tower.capOverhang, tower.z1 + tower.capOverhang] },
  ]
}
