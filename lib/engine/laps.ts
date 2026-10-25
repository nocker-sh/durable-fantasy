export type Lap = { step: string; at: number; took: number };

/** A load timeline with an injectable monotonic clock. */
export class LoadTimer {
  private start = 0;
  private last = 0;
  private laps: Lap[] = [];
  constructor(private readonly now: () => number = () => performance.now()) {}
  begin(what: string) {
    this.start = this.last = this.now();
    this.laps = [{ step: `${what} (page open ${Math.round(this.start)} ms)`, at: 0, took: 0 }];
  }
  mark(step: string) {
    const now = this.now();
    this.laps.push({ step, at: Math.round(now - this.start), took: Math.round(now - this.last) });
    this.last = now;
  }
  end(step: string): Lap[] {
    this.mark(step);
    return this.laps.slice();
  }
}
