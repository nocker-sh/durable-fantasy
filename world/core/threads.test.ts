import { describe, expect, it } from "vitest";
import { apply } from "./apply.ts";
import { hometownOf } from "../channels.ts";
import { MAX_THREADS, keep, mayVisit, threadKey, threadOf } from "./threads.ts";
import { player } from "../test/helpers.ts";

const A = "6f1c2a9e-0b7d-4c55-9a11-2e3f4a5b6c7d",
  B = "a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d";

describe("muffler threads", () => {
  it("a thread names its friend and their town, and does not give away their id", () => {
    const t = threadOf(A, "アンナ", 1);
    expect(t).toMatchObject({ name: "アンナ", town: hometownOf(A) });
    expect(t.key).not.toContain(A.slice(0, 8));
    expect(threadKey(A)).toBe(threadKey(A));
    expect(threadKey(A)).not.toBe(threadKey(B));
  });

  it("swapping again replaces the old thread; at most fifty are kept", () => {
    let ts = keep([], threadOf(A, "アンナ", 1));
    ts = keep(ts, threadOf(A, "アンナ2", 2));
    expect(ts).toHaveLength(1);
    expect(ts[0].name).toBe("アンナ2");
    for (let i = 0; i < 60; i++) ts = keep(ts, threadOf(`id-${i}`, `n${i}`, i));
    expect(ts).toHaveLength(MAX_THREADS);
  });

  it("you may be in your own town, or a town a thread leads to", () => {
    const home = hometownOf(B);
    const other = (home % 8) + 1;
    expect(mayVisit(B, [], home)).toBe(true);
    expect(mayVisit(B, [], other)).toBe(false);
    expect(mayVisit(B, [{ key: "x", name: "x", town: other, at: 0 }], other)).toBe(true);
    const r = apply(player(), { type: "thread", thread: threadOf(A, "アンナ", 5) }, { now: 5 });
    expect(r.ok && r.state.threads).toHaveLength(1);
  });
});
