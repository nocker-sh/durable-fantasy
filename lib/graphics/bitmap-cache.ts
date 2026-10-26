/** Decoded image ownership stays here; callers borrow images only for synchronous drawing. */
export class BitmapCache {
  private readonly entries = new Map<string, { bitmap: ImageBitmap | null; bytes: number }>()
  private used = 0

  constructor(
    readonly maxBytes: number,
    readonly maxEntries: number,
  ) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 0 || !Number.isSafeInteger(maxEntries) || maxEntries < 0) throw new RangeError("Invalid bitmap cache capacity")
  }

  get bytes() {
    return this.used
  }
  get size() {
    return this.entries.size
  }

  /** Undefined means absent; null remembers a failed image load. */
  get(key: string): ImageBitmap | null | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.bitmap
  }

  /** Takes ownership, closing the least recently used images until both limits hold. */
  set(key: string, bitmap: ImageBitmap | null) {
    const previous = this.entries.get(key)
    if (previous?.bitmap === bitmap) {
      this.get(key)
      return
    }
    this.delete(key)
    const bytes = bitmap ? bitmap.width * bitmap.height * 4 : 0
    if (bytes > this.maxBytes || this.maxEntries === 0) {
      bitmap?.close()
      return
    }
    this.entries.set(key, { bitmap, bytes })
    this.used += bytes
    while (this.used > this.maxBytes || this.entries.size > this.maxEntries) this.delete(this.entries.keys().next().value!)
  }

  private delete(key: string) {
    const entry = this.entries.get(key)
    if (!entry) return
    this.entries.delete(key)
    this.used -= entry.bytes
    entry.bitmap?.close()
  }

  clear() {
    for (const key of this.entries.keys()) this.delete(key)
  }
}
