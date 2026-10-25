// A value that changes over time and tells listeners. Snapshots are replaced, never mutated,
// so a reader can compare them by reference (useSyncExternalStore relies on that).
export class Store<T> {
  private listeners = new Set<() => void>();

  constructor(private value: T) {}

  get = (): T => this.value;

  set(next: T | ((current: T) => T)) {
    const value = typeof next === "function" ? (next as (current: T) => T)(this.value) : next;
    if (Object.is(value, this.value)) return;
    this.value = value;
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}
