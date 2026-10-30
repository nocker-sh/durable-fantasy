type WithoutKeys<Value, Key extends PropertyKey> = Value extends unknown ? Omit<Value, Key> : never

/** Copy enumerable own properties, preserving union types and object-rest getter behavior. */
export function withoutKeys<Value extends object, Key extends keyof Value>(source: Value, keys: readonly Key[]): WithoutKeys<Value, Key>
export function withoutKeys(source: object, keys: readonly PropertyKey[]): object {
  const excluded = new Set(keys.map((key) => (typeof key === "symbol" ? key : String(key))))
  const remaining = {}
  for (const key of Reflect.ownKeys(source)) {
    if (excluded.has(key) || !Object.getOwnPropertyDescriptor(source, key)?.enumerable) continue
    Object.defineProperty(remaining, key, { value: Reflect.get(source, key), enumerable: true, configurable: true, writable: true })
  }
  return remaining
}
