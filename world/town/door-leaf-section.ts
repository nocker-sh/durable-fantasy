/** Vertical fit of a leaf inside its opening, measured from the finished floor. */
export function doorLeafSection(height: number, clearance: { bottom: number; top: number }): { bottom: number; top: number } {
  if (!Number.isFinite(height) || height <= 0 || ![clearance.bottom, clearance.top].every((n) => Number.isFinite(n) && n > 0) || clearance.bottom + clearance.top >= height)
    throw new Error("Door leaf needs positive clearances within its opening")
  return { bottom: clearance.bottom, top: height - clearance.top }
}
