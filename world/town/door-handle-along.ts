/** Distance from the hinge to the grip; legacy unmeasured panels retain their tip. */
export function doorHandleAlong(radius: number, along?: number): number {
  if (!Number.isFinite(radius) || radius <= 0 || (along !== undefined && (!Number.isFinite(along) || along <= 0 || along > radius))) throw new Error("Door handle must lie on its leaf")
  return along ?? radius
}
