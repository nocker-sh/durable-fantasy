export class Rng {
  s: number
  constructor(seed: number) {
    this.s = seed >>> 0 || 1
  }
  next(): number {
    this.s ^= this.s << 13
    this.s >>>= 0
    this.s ^= this.s >>> 17
    this.s ^= this.s << 5
    this.s >>>= 0
    return this.s / 4294967296
  }
  range(a: number, b: number) {
    return a + (b - a) * this.next()
  }
  int(n: number) {
    return Math.floor(this.next() * n)
  }
  pick<T>(a: T[]): T {
    return a[this.int(a.length)]
  }
}
