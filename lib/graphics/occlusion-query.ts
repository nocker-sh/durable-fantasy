import { Box3, Ray, Vector3 } from "three"

/** Reuses visibility tests until either endpoint moves. Boxes are fixed for this query's lifetime. */
export class OcclusionQuery {
  private readonly ray = new Ray()
  private readonly hit = new Vector3()
  private readonly from = new Vector3()
  private readonly to = new Vector3()
  private readonly hits: boolean[]
  private valid = false

  constructor(
    private readonly boxes: readonly Box3[],
    private readonly clearance: number,
  ) {
    this.hits = boxes.map(() => false)
  }

  update(from: Vector3, to: Vector3): readonly boolean[] {
    if (this.valid && this.from.equals(from) && this.to.equals(to)) return this.hits
    this.from.copy(from)
    this.to.copy(to)
    this.valid = true
    this.ray.set(from, this.hit.copy(to).sub(from).normalize())
    const distance = from.distanceTo(to) - this.clearance
    for (let i = 0; i < this.boxes.length; i++) {
      this.hits[i] = distance > 0 && !!this.ray.intersectBox(this.boxes[i], this.hit) && this.hit.distanceToSquared(from) < distance * distance
    }
    return this.hits
  }
}
