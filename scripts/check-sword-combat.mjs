// Development-only sword fixture; levels and stat points are earned through normal combat.
// Exercise the real shortcut, SP payment, rejected duplicate attack and persisted cooldown.
import { chromium } from "playwright-core"
import { createCharacter, walkToMap, waitReady } from "./lib/game-browser.mjs"
let page
let onRefusal
const events = []
const errors = []
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("websocket", (socket) => {
    for (const event of ["framesent", "framereceived"])
      socket.on(event, ({ payload }) => {
        try {
          const m = JSON.parse(String(payload))
          if (m.type === "refused") onRefusal?.(m)
          if (["move", "attack", "struck", "refused", "result"].includes(m.type))
            events.push({ pathLength: m.path?.length, at: m.at, event, type: m.type, monster: m.monster, art: m.art, reason: m.reason ?? m.result?.reason, hp: m.hp, back: m.back, ok: m.result?.ok })
          if (events.length > 80) events.shift()
        } catch {
          // Ignore frames outside the game JSON protocol.
        }
      })
  })
  await createCharacter(page)
  await page.evaluate(async () => {
    const res = await fetch("/api/player/give", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: game.debugInfo().playerId, item: "iron-sword", count: 1 }),
    })
    if (!res.ok) throw Error("Dev equipment grant failed")
  })
  await page.reload()
  await waitReady(page)
  await page.evaluate(async () => {
    for (const [stat, min] of [
      ["str", 11],
      ["dex", 9],
    ])
      while (game.state.get().player.stats[stat] < min) {
        if (!(await game.run({ type: "raise", stat }))) throw Error("Stat allocation refused")
      }
  })
  await walkToMap(page, "south-meadow")
  await page.evaluate(async () => {
    const slot = game.state.get().player.bag.findIndex((s) => s?.item === "iron-sword")
    if (!(await game.run({ type: "equip", slot }))) throw Error("Equip failed")
  })
  while (await page.evaluate(() => game.state.get().player.statPoints < 3)) {
    const progress = await page.evaluate(() => ({ level: game.state.get().player.level, exp: game.state.get().player.exp }))
    const spawnIds = await page.evaluate(async () => {
      const { SPAWNS } = await import("/world/core/monsters.ts")
      return SPAWNS.filter((s) => s.map === "south-meadow" && s.kind === "slime").map((s) => s.id)
    })
    const available = await page.waitForFunction((ids) => ids.find((id) => game.session.wild[id]?.hp > 0 && game.session.wild[id].back <= Date.now()) || false, spawnIds, { timeout: 120000 })
    const id = await available.jsonValue()
    await available.dispose()
    console.log("selected", id)
    await page.evaluate((id) => game.scene.fight(id), id)
    await page.waitForFunction(
      (p) => {
        const s = game.state.get().player
        return s.level > p.level || s.exp > p.exp
      },
      progress,
      { timeout: 120000 },
    )
    await page.evaluate(() => game.scene.runtime.stop())
    console.log("earned", await page.evaluate(() => ({ level: game.state.get().player.level, exp: game.state.get().player.exp, points: game.state.get().player.statPoints })))
  }
  await page.evaluate(async () => {
    while (game.state.get().player.stats.str < 14) if (!(await game.run({ type: "raise", stat: "str" }))) throw Error("Strength refused")
    const slot = game.state.get().player.bag.findIndex((s) => s?.item === "wooden-stick")
    if (!(await game.run({ type: "equip", slot }))) throw Error("Starter weapon missing")
  })
  const target = await page.evaluate(async () => {
    const { SPAWNS, monsterAt } = await import("/world/core/monsters.ts")
    const cell = game.scene.playerCell()
    const candidates = SPAWNS.filter((s) => s.map === "south-meadow" && s.kind === "slime" && game.session.wild[s.id]?.hp > 0 && game.session.wild[s.id].back <= Date.now())
    const distance = (s) => {
      const p = monsterAt(s, Date.now())
      return Math.hypot(p.x - (cell[0] + 0.5) / 2, p.z - (cell[1] + 0.5) / 2)
    }
    candidates.sort((a, b) => distance(a) - distance(b))
    game.scene.fight(candidates[0].id)
    return candidates[0].id
  })
  await page.waitForFunction((id) => game.session.fighting?.monster === id, target, { timeout: 120000 })
  await page.evaluate(async () => {
    game.scene.runtime.stop()
    const slot = game.state.get().player.bag.findIndex((s) => s?.item === "iron-sword")
    if (!(await game.run({ type: "equip", slot }))) throw Error("Equip failed")
  })
  await page.evaluate(async () => {
    if (!(await game.run({ type: "hotbar", index: 2, item: "skill:hew" }))) throw Error("Hotbar assignment refused")
  })
  const before = await page.evaluate(() => ({ sp: game.state.get().player.sp, exp: game.state.get().player.exp }))
  await page.keyboard.press("3")
  await page.waitForFunction((sp) => game.state.get().player.sp === sp - 7, before.sp)
  await page.evaluate((id) => game.scene.fight(id), target)
  await page.waitForFunction((exp) => game.state.get().player.exp > exp, before.exp)
  await page.evaluate(() => game.scene.runtime.stop())
  const cooldown = await page.evaluate(() => game.state.get().player.ready.hew)
  const after = await page.evaluate(() => ({ sp: game.state.get().player.sp, exp: game.state.get().player.exp }))
  const refused = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error("No refusal for the defeated target")), 10000)
    onRefusal = (message) => {
      if (message.what !== "attack" || message.monster !== target || message.reason !== "TARGET_GONE") return
      clearTimeout(timeout)
      onRefusal = undefined
      resolve()
    }
  })
  await Promise.all([refused, page.evaluate((id) => game.session.socket.send({ type: "attack", monster: id, art: "hew" }), target)])
  await page.getByText("相手はもういない。", { exact: true }).first().waitFor()
  const rejected = await page.evaluate(() => ({ sp: game.state.get().player.sp, exp: game.state.get().player.exp }))
  if (JSON.stringify(after) !== JSON.stringify(rejected)) throw Error("Rejected art changed SP or rewards")
  await page.reload()
  await waitReady(page)
  const saved = await page.evaluate(() => ({ exp: game.state.get().player.exp, ready: game.state.get().player.ready.hew }))
  if (saved.exp !== after.exp || !saved.ready || saved.ready !== cooldown) throw Error("Art result was not saved")
  if (errors.length) throw Error(errors.join("\n"))
  console.log(JSON.stringify({ before, after, rejected, persisted: true }))
} catch (error) {
  console.log(
    JSON.stringify({
      events,
      state: await page
        ?.evaluate(() => ({
          map: game.state.get().map.id,
          player: game.scene.player(),
          cell: game.scene.playerCell(),
          fighting: game.session.fighting,
          hp: game.state.get().player.hp,
          sp: game.state.get().player.sp,
          notices: game.state.get().notices,
        }))
        .catch(() => null),
    }),
  )
  throw error
} finally {
  await browser.close()
}
