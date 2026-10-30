/** Door parts remain separate so a rejected path identifies the panel or the framed aperture. */
export type DoorPassageObstacle = Readonly<{ kind: "leaf" | "frame"; bounds: readonly [number, number, number, number] }>
