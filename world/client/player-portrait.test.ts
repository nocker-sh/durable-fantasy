import { afterEach, expect, it, vi } from "vitest"
import type { Game } from "#/world/game"
import type { ServerMessages } from "#/world/client/server-messages"
import { newPlayer } from "#/world/core/new-player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { runPlayerCommand } from "#/world/server/run-player-command"
import { FW, FH } from "#/world/scene/figure/render"
import type { FrameJob } from "#/world/scene/sprite.worker"

type Bitmap = { width: number; height: number; pixels: Uint8ClampedArray; close(): void }

class WorkerStub {
  static all: WorkerStub[] = []
  onmessage?: (event: { data: unknown }) => void
  jobs: FrameJob[] = []
  constructor() {
    WorkerStub.all.push(this)
  }
  postMessage(job: FrameJob) {
    this.jobs.push(job)
  }
  finish() {
    const job = this.jobs.at(-1)!
    const color = job.look.neckRamp === "cBlue" ? 22 : 11
    const pixels = new Uint8ClampedArray(FW * FH * 4)
    for (let offset = 0; offset < pixels.length; offset += 4) {
      pixels[offset] = color
      pixels[offset + 3] = 255
    }
    const bitmap: Bitmap = { width: FW, height: FH, pixels, close: () => {} }
    this.onmessage?.({ data: { key: job.key, bitmap, png: null } })
  }
}

/** Browser image transport and canvas encoding stand in for pixels; portrait, frame cache and request ownership stay real. */
class CanvasStub {
  width = 0
  height = 0
  private pixels: Uint8ClampedArray = new Uint8ClampedArray()
  getContext() {
    return {
      drawImage: (bitmap: Bitmap) => {
        this.pixels = bitmap.pixels
      },
      getImageData: () => ({ data: this.pixels }),
      putImageData: (image: { data: Uint8ClampedArray }) => {
        this.pixels = image.data
      },
    }
  }
  toDataURL() {
    return `data:image/png;test-color=${this.pixels.find((value) => value > 0)}`
  }
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
  WorkerStub.all = []
})

async function fixture() {
  vi.useFakeTimers()
  vi.setSystemTime(Date.UTC(2026, 10, 7, 12))
  vi.stubGlobal("Worker", WorkerStub)
  vi.stubGlobal("navigator", { hardwareConcurrency: 3 })
  vi.stubGlobal("indexedDB", undefined)
  vi.stubGlobal("OffscreenCanvas", CanvasStub)
  vi.stubGlobal("document", { createElement: () => new CanvasStub() })
  vi.stubGlobal(
    "ImageData",
    class {
      constructor(readonly data: Uint8ClampedArray) {}
    },
  )
  const RuntimeGame = (await import("#/world/game")).Game
  const portraitUrl = (await import("#/world/art/portrait-url")).portraitUrl
  const playerAvatar = (await import("#/world/client/player-avatar")).playerAvatar
  const record = { ...initialPlayerRecord(), player: { ...newPlayer("PortraitTest"), profileComplete: true } }
  const game: Game = new RuntimeGame()
  const messages = (game as unknown as { serverMessages: ServerMessages }).serverMessages
  function profile(neckRamp: "cRed" | "cBlue") {
    const result = runPlayerCommand(record, { command: { type: "profile", name: record.player.name, look: 0, neck: "muffler", neckRamp }, context: {} }, Date.now())
    if (!result.ok) throw new Error(result.reason)
    messages.handle({ type: "result", seq: -1, result })
  }
  function hurt() {
    const result = runPlayerCommand(record, { command: { type: "hurt", amount: 1, by: "slime" }, context: {} }, Date.now())
    if (!result.ok) throw new Error(result.reason)
    messages.handle({ type: "result", seq: -1, result })
  }
  function worker(neckRamp: string) {
    const found = WorkerStub.all.find((entry) => entry.jobs.at(-1)?.look.neckRamp === neckRamp)
    if (!found) throw new Error(`No pending image job for ${neckRamp}`)
    return found
  }
  return { game, record, profile, hurt, worker, portraitUrl, playerAvatar }
}

it("keeps the current cached portrait when an earlier appearance finishes later", async () => {
  const f = await fixture()
  const primed: string[] = []
  f.portraitUrl(f.playerAvatar({ ...f.record.player, neckRamp: "cBlue" }).look, (url) => primed.push(url))
  await vi.advanceTimersByTimeAsync(0)
  f.worker("cBlue").finish()
  expect(primed).toEqual(["data:image/png;test-color=22"])
  f.profile("cRed")
  await vi.advanceTimersByTimeAsync(0)
  const old = f.worker("cRed")
  expect(f.game.state.get().portrait).toBeNull()
  f.profile("cBlue")
  expect(f.game.state.get().portrait).toBe(primed[0])
  old.finish()
  expect(f.game.state.get().player?.neckRamp).toBe("cBlue")
  expect(f.game.state.get().portrait).toBe(primed[0])
})

it("keeps the latest asynchronous portrait when worker replies arrive in reverse order", async () => {
  const f = await fixture()
  f.profile("cRed")
  await vi.advanceTimersByTimeAsync(0)
  const old = f.worker("cRed")
  f.profile("cBlue")
  await vi.advanceTimersByTimeAsync(0)
  f.worker("cBlue").finish()
  expect(f.game.state.get().portrait).toBe("data:image/png;test-color=22")
  old.finish()
  expect(f.game.state.get().portrait).toBe("data:image/png;test-color=22")
})

it("retains a pending portrait through a health update with the same appearance", async () => {
  const f = await fixture()
  f.profile("cRed")
  await vi.advanceTimersByTimeAsync(0)
  const pending = f.worker("cRed")
  const before = f.game.state.get().player!
  f.hurt()
  expect(f.game.state.get().player?.hp).toBe(before.hp - 1)
  expect(WorkerStub.all.flatMap((entry) => entry.jobs)).toHaveLength(1)
  pending.finish()
  expect(f.game.state.get().portrait).toBe("data:image/png;test-color=11")
})

it("publishes ordinary portrait completions for successive appearances", async () => {
  const f = await fixture()
  f.profile("cRed")
  await vi.advanceTimersByTimeAsync(0)
  f.worker("cRed").finish()
  expect(f.game.state.get().portrait).toBe("data:image/png;test-color=11")
  f.profile("cBlue")
  await vi.advanceTimersByTimeAsync(0)
  f.worker("cBlue").finish()
  expect(f.game.state.get().portrait).toBe("data:image/png;test-color=22")
})
