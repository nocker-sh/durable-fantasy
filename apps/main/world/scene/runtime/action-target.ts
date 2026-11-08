export type ActionTarget<T> = { kind: "talk"; resident: T } | { kind: "spot"; id: string } | { kind: "fight"; id: string }

/** One destination has one purpose. Arrival consumes it before callbacks can select another. */
export class PendingAction<T> {
  private target: ActionTarget<T> | null = null

  get current() {
    return this.target
  }

  select(target: ActionTarget<T>) {
    this.target = target
  }

  clear() {
    this.target = null
  }

  arrive() {
    const target = this.target
    // Chasing a creature can finish many short paths before an attack is in reach.
    if (target?.kind === "fight") return null
    this.target = null
    return target
  }

  endFight(id?: string) {
    if (this.target?.kind === "fight" && (id === undefined || this.target.id === id)) this.clear()
  }

  get fighting() {
    return this.target?.kind === "fight" ? this.target.id : null
  }
}
