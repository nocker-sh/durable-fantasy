import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { DialogueBox } from "#/components/hud/dialogue"
import { GameProvider } from "#/components/game/game-provider"
import { Game } from "#/world/game"
import type { GameSession } from "#/world/client/game-session"
import type { ClientMessage } from "#/world/protocol"
import { ERRANDS } from "#/world/core/errands"
import type { Errand } from "#/world/core/errand-types"
import { apply } from "#/world/core/apply"
import { parsePlayer } from "#/world/core/parse-player"
import { fullyShown } from "#/world/fully-shown"
import { RESIDENTS } from "#/world/town/residents"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { errandAskTime } from "#/world/test/errand-ask-time"

const drawn = vi.hoisted(() => ({ clicks: [] as (() => void)[] }))
// Observe actual DOM callbacks without replacing the dialogue view, hooks or game logic.
vi.mock("react/jsx-runtime", async (original) => {
  const actual = await original<typeof import("react/jsx-runtime")>()
  const record = (type: unknown, props: unknown) => {
    if (type !== "button" || !props || typeof props !== "object" || !("onClick" in props)) return
    const handler = props.onClick
    if (typeof handler === "function") drawn.clicks.push(() => handler())
  }
  return {
    ...actual,
    jsx: (...args: Parameters<typeof actual.jsx>) => {
      record(args[0], args[1])
      return actual.jsx(...args)
    },
    jsxs: (...args: Parameters<typeof actual.jsxs>) => {
      record(args[0], args[1])
      return actual.jsxs(...args)
    },
  }
})
vi.mock("react/jsx-dev-runtime", async (original) => {
  const actual = await original<typeof import("react/jsx-dev-runtime")>()
  return {
    ...actual,
    jsxDEV: (...args: Parameters<typeof actual.jsxDEV>) => {
      const type = args[0],
        props = args[1]
      if (type === "button" && props && typeof props === "object" && "onClick" in props) {
        const handler = props.onClick
        if (typeof handler === "function") drawn.clicks.push(() => handler())
      }
      return actual.jsxDEV(...args)
    },
  }
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  drawn.clicks = []
})

// a day each errand is drawn, at a quarter hour its asker asks it
const days = new Map(ERRANDS.map((errand) => [errand.id, errandAskTime(errand)] as const))

function start(now: number) {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.advanceTimersByTime(100)
  const saved = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value)
    },
  })
  const game = new Game()
  const native = game as unknown as { session: GameSession; onReachResident: (id: number) => void }
  native.session.others.welcome("connection", [])
  const sent: ClientMessage[] = []
  native.session.socket = { send: (message: ClientMessage) => sent.push(structuredClone(message)) } as unknown as VoidSocket<"/map/:mapId">
  return { game, native, sent }
}

function render(game: Game) {
  drawn.clicks = []
  renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(DialogueBox) }))
  const dialogue = game.state.get().dialogue!
  const text = dialogue.pages[dialogue.page]
  return { next: text ? drawn.clicks[0] : undefined, choices: drawn.clicks.slice(text ? 1 : 0) }
}

function ready(game: Game) {
  const pages = game.state.get().dialogue!.pages.length
  for (let count = 0; count < pages * 2 + 1; count++) {
    const current = game.state.get().dialogue!
    if (current.page === current.pages.length - 1 && fullyShown(current)) return
    game.advanceDialogue()
  }
  throw new Error("The native dialogue did not reveal its final page")
}

function fixture(errand: Errand, stage: "take" | "hand") {
  const f = start(days.get(errand.id)!)
  const fresh = player({ profileComplete: true, ...(errand.kind === "bring" ? { bag: bagWith([errand.wants.item, errand.wants.count]) } : {}) })
  const taken = apply(fresh, { type: "errand-take", errand: errand.id, from: errand.from }, { now: Date.now() })
  if (!taken.ok) throw new Error(taken.reason)
  let server = stage === "take" ? fresh : taken.state
  const resident = stage === "take" ? errand.from : errand.kind === "bring" ? errand.from : errand.to
  const residentId = RESIDENTS.findIndex((entry) => entry.name === resident)
  expect(residentId).toBeGreaterThanOrEqual(0)
  const publish = () => f.game.state.set((state) => ({ ...state, player: structuredClone(server), online: "online" }))
  publish()
  const open = () => {
    f.native.onReachResident(residentId)
    ready(f.game)
    if (stage === "take") {
      const ask = f.game.state.get().dialogue!.choices.findIndex((entry) => entry.action === "errand-ask" && entry.errand === errand.id)
      expect(ask).toBeGreaterThanOrEqual(0)
      f.game.choose(ask)
      ready(f.game)
    }
    f.sent.length = 0
  }
  const button = () => {
    const dialogue = f.game.state.get().dialogue!
    const index = dialogue.choices.findIndex((entry) => entry.action === `errand-${stage}` && entry.errand === errand.id)
    expect(index).toBeGreaterThanOrEqual(0)
    const rows = render(f.game).choices
    expect(rows).toHaveLength(dialogue.choices.length)
    return rows[index]
  }
  const deliver = async () => {
    const request = f.sent.find((entry) => entry.type === "errand")
    if (!request || request.type !== "errand") throw new Error("No native errand request")
    const command =
      request.action === "take" ? { type: "errand-take" as const, errand: request.errand, from: request.resident } : { type: "errand-hand" as const, errand: request.errand, to: request.resident }
    const result = apply(server, command, { now: Date.now() })
    if (result.ok) {
      const restored = parsePlayer(JSON.parse(JSON.stringify(result.state)))
      expect(restored).toEqual(result.state)
      if (!restored) throw new Error("The actual result failed save decoding")
      server = restored
    }
    f.native.session.waiting.get(request.seq)!(result)
    await Promise.resolve()
    await Promise.resolve()
    expect(f.native.session.waiting.size).toBe(0)
    expect(f.game.state.get().busy).toBe(false)
    return result
  }
  open()
  return {
    ...f,
    open,
    button,
    deliver,
    read: () => structuredClone(server),
    unrelated: () => {
      const result = apply(server, { type: "sit" }, { now: Date.now() })
      if (!result.ok) throw new Error(result.reason)
      server = result.state
      publish()
    },
  }
}

for (const stage of ["take", "hand"] as const) {
  it.each(ERRANDS)(`$id ${stage}: a button from a retired conversation cannot act on the reopened request`, async (errand) => {
    const f = fixture(errand, stage)
    const click = f.button()
    f.game.closeDialogue()
    f.open()
    const before = f.read()
    const dialogue = f.game.state.get().dialogue
    const chat = f.game.state.get().chat
    click()
    if (f.sent.some((entry) => entry.type === "errand")) await f.deliver()
    expect(f.read()).toEqual(before)
    expect(f.sent).toEqual([])
    expect(f.game.state.get().dialogue).toBe(dialogue)
    expect(f.game.state.get().chat).toBe(chat)
    const fresh = f.button()
    fresh()
    fresh()
    expect(f.sent.filter((entry) => entry.type === "errand")).toHaveLength(1)
    expect((await f.deliver()).ok).toBe(true)
    const answered = f.game.state.get().dialogue
    click()
    expect(f.game.state.get().dialogue).toBe(answered)
  })

  it.each(ERRANDS)(`$id ${stage}: unrelated player updates preserve the actual rendered conversation choice`, async (errand) => {
    const f = fixture(errand, stage)
    const click = f.button()
    const dialogue = f.game.state.get().dialogue
    f.unrelated()
    expect(f.game.state.get().dialogue).toBe(dialogue)
    const expected = apply(
      f.read(),
      stage === "take" ? { type: "errand-take", errand: errand.id, from: errand.from } : { type: "errand-hand", errand: errand.id, to: errand.kind === "bring" ? errand.from : errand.to },
      { now: Date.now() },
    )
    expect(expected.ok).toBe(true)
    click()
    expect(await f.deliver()).toEqual(expected)
    if (!expected.ok) throw new Error(expected.reason)
    expect(f.read()).toEqual(expected.state)
    expect(f.game.state.get().player).toEqual(expected.state)
  })
}

it.each(RESIDENTS)("$name: an old text click cannot reveal or skip the next dialogue state", (resident) => {
  const f = start(Date.UTC(2026, 10, 8, 3))
  f.game.state.set((state) => ({ ...state, player: player({ profileComplete: true }), online: "online" }))
  f.native.onReachResident(RESIDENTS.indexOf(resident))
  const menu = f.game.state.get().dialogue!
  if (menu.pages[0] === "") {
    const talk = menu.choices.findIndex((entry) => entry.action === "talk")
    expect(talk).toBeGreaterThanOrEqual(0)
    f.game.choose(talk)
  }
  const click = render(f.game).next
  expect(click).toBeTypeOf("function")
  f.game.advanceDialogue()
  const advanced = f.game.state.get().dialogue
  click!()
  expect(f.game.state.get().dialogue).toBe(advanced)
})
