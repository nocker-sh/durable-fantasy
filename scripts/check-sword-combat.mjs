// Development-only sword fixture (Lv 12 through the hunting fixture), then real combat.
// Exercise the real shortcut, SP payment, rejected duplicate attack and persisted cooldown.
import { chromium } from "playwright-core"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { waitReady } from "#resources/scripts/lib/wait-ready"
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
  // the development fixture for an unused character: Lv 12 with the sword budget (strength enough for the heavy cut).
  // Earning those points through slimes alone takes most of an hour on the current level curve.
  await page.evaluate(async () => {
    const response = await fetch("/api/player/hunting-fixture", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ level: 12, build: "sword" }) })
    if (!response.ok) throw Error(`Fixture rejected: ${response.status}`)
  })
  await page.reload()
  await waitReady(page)
  await walkToMap(page, "south-meadow")
  await page.evaluate(async () => {
    while (game.state.get().player.stats.str < 14) if (!(await game.run({ type: "raise", stat: "str" }))) throw Error("Strength refused")
    const slot = game.state.get().player.bag.findIndex((s) => s?.item === "wooden-stick")
    if (!(await game.run({ type: "equip", slot }))) throw Error("Starter weapon missing")
  })
  // the last kill may have left every meadow slime coming back; wait for one to be up
  await page.waitForFunction(
    async () => {
      const { SPAWNS } = await import("/world/core/monsters")
      return SPAWNS.some((s) => s.map === "south-meadow" && s.kind === "slime" && game.session.wild[s.id]?.hp > 0 && game.session.wild[s.id].back <= Date.now())
    },
    null,
    { timeout: 180000 },
  )
  const target = await page.evaluate(async () => {
    const { SPAWNS } = await import("/world/core/monsters")
    const { monsterAt } = await import("/world/core/monster-at")
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
  // an art is held for the next swing (solo-hunting.md), so the fight goes on before its payment can be seen
  await page.keyboard.press("3")
  await page.evaluate((id) => game.scene.fight(id), target)
  // the heavy cut was paid: its cooldown started and SP went down (natural recovery may refill part of it meanwhile)
  await page.waitForFunction((sp) => (game.state.get().player.ready.hew ?? 0) > Date.now() && game.state.get().player.sp < sp, before.sp, { timeout: 60000 })
  await page.waitForFunction((exp) => game.state.get().player.exp > exp, before.exp)
  await page.evaluate(() => game.scene.runtime.stop())
  const cooldown = await page.evaluate(() => game.state.get().player.ready.hew)
  const after = await page.evaluate(() => ({ sp: game.state.get().player.sp, exp: game.state.get().player.exp }))
  // a blow inside the attack interval is ignored without a reply (is-attack-cooling-down.ts, next-struck.ts); let it pass
  await page.waitForTimeout(4000)
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
