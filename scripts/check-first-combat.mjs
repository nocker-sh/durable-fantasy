// Fight with the actual starting equipment and persist the server-awarded experience.
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { configureCpu, createCharacter, waitReady, walkToMap } from "./lib/game-browser.mjs"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
let page
const commands = []
const errors = []
const started = Date.now()
try {
  page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const cpuSlowdown = await configureCpu(page)
  console.log(`CPU slowdown: ${cpuSlowdown}`)
  page.on("pageerror", (error) => errors.push(error.message))
  // Keep only command metadata: socket URLs and full player snapshots contain private data.
  page.on("websocket", (socket) => {
    for (const event of ["framesent", "framereceived"]) {
      socket.on(event, ({ payload }) => {
        let message
        try {
          message = JSON.parse(String(payload))
        } catch {
          return
        }
        if (!["command", "result", "move", "attack", "refused"].includes(message?.type)) return
        commands.push({
          ms: Date.now() - started,
          event,
          type: message.type,
          seq: message.seq,
          command: message.command?.type,
          ok: message.result?.ok,
          reason: message.result?.reason ?? message.reason,
          what: message.what,
          monster: message.monster,
          pathLength: message.path?.length,
        })
      })
    }
  })
  await createCharacter(page)
  const route = await walkToMap(page, "south-meadow")
  const before = await page.evaluate(() => ({ exp: game.state.get().player.exp, weapon: game.state.get().player.equipment.weapon }))
  if (before.weapon !== "wooden-stick") throw Error("Unexpected starting equipment")
  const target = await page.evaluate(async () => {
    const { SPAWNS, monsterAt } = await import("/world/core/monsters.ts")
    const cell = game.scene.playerCell()
    const candidates = SPAWNS.filter((s) => s.map === game.state.get().map.id && s.kind === "slime" && game.session.wild[s.id]?.hp > 0 && game.session.wild[s.id].back <= Date.now())
    const distance = (s) => {
      const at = monsterAt(s, Date.now())
      return Math.hypot(at.x - (cell[0] + 0.5) / 2, at.z - (cell[1] + 0.5) / 2)
    }
    candidates.sort((a, b) => distance(a) - distance(b))
    if (!candidates.length) throw Error("No slime in the meadow")
    game.scene.fight(candidates[0].id)
    return candidates[0].id
  })
  console.log("fighting", target)
  await page.waitForFunction((exp) => game.state.get().player.exp > exp || game.state.get().player.hp <= 0, before.exp, { timeout: 120000 })
  const result = await page.evaluate(() => ({ exp: game.state.get().player.exp, hp: game.state.get().player.hp, level: game.state.get().player.level, bag: game.state.get().player.bag }))
  if (result.hp <= 0) throw Error("Starting character fell before earning experience")
  if (result.exp <= before.exp) throw Error("No experience awarded")
  // Stay in the same room: only an authoritative refresh can restore the defeated target.
  await page.waitForFunction((id) => game.session.wild[id]?.hp > 0 && game.session.wild[id].back <= Date.now(), target, { timeout: 120000 })
  await page.evaluate((id) => game.scene.fight(id), target)
  await page.waitForFunction(
    (before) => {
      const p = game.state.get().player
      return p.level > before.level || p.exp > before.exp || p.hp <= 0
    },
    result,
    { timeout: 120000 },
  )
  if (await page.evaluate(() => game.state.get().player.hp <= 0)) throw Error("Starting character fell after the creature recovered")
  console.log("defeated the recovered creature without rejoining")
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/first-combat.png" })
  // Eat the starting bread through its real shortcut, then rest through the keyboard.
  const beforeMeal = await page.evaluate(() => ({
    hp: game.state.get().player.hp,
    stamina: game.state.get().player.stamina,
    bread: game.state
      .get()
      .player.bag.filter((s) => s?.item === "rye-bread")
      .reduce((n, s) => n + s.count, 0),
  }))
  await page.keyboard.press("1")
  await page.waitForFunction(
    (count) =>
      game.state
        .get()
        .player.bag.filter((s) => s?.item === "rye-bread")
        .reduce((n, s) => n + s.count, 0) ===
      count - 1,
    beforeMeal.bread,
  )
  const afterMeal = await page.evaluate(() => ({ hp: game.state.get().player.hp, stamina: game.state.get().player.stamina }))
  if (afterMeal.hp < beforeMeal.hp || afterMeal.stamina <= beforeMeal.stamina) throw Error("Starting bread did not restore stamina")
  await page.keyboard.press("z")
  await page.waitForFunction(() => game.state.get().player.sitting === true)
  const needsRest = await page.evaluate(async () => {
    const { derive } = await import("/world/core/stats.ts")
    return game.state.get().player.hp < derive(game.state.get().player).maxHp
  })
  if (needsRest) await page.waitForFunction((hp) => Number.parseFloat(document.querySelector('[data-slot="meter"][aria-label="HP"]')?.textContent ?? "") > hp, afterMeal.hp, { timeout: 45000 })
  await page.keyboard.press("z")
  await page.waitForFunction(() => game.state.get().player.sitting === false)
  const afterRest = await page.evaluate(() => ({ hp: game.state.get().player.hp, exp: game.state.get().player.exp, level: game.state.get().player.level, bag: game.state.get().player.bag }))
  if (needsRest && afterRest.hp <= afterMeal.hp) throw Error("Server did not confirm the displayed rest recovery")
  await page.reload()
  await waitReady(page)
  const restored = await page.evaluate(() => ({ exp: game.state.get().player.exp, level: game.state.get().player.level, bag: game.state.get().player.bag }))
  if (restored.exp !== afterRest.exp || restored.level !== afterRest.level || JSON.stringify(restored.bag) !== JSON.stringify(afterRest.bag)) throw Error("Combat rewards did not persist")
  if (errors.length) throw Error(errors.join("\n"))
  await writeFile("public/tmp/first-combat.json", JSON.stringify({ cpuSlowdown, route, target, before, result, beforeMeal, afterMeal, afterRest, restored }, null, 2))
  console.log(
    JSON.stringify({
      cpuSlowdown,
      route,
      target,
      weapon: before.weapon,
      exp: restored.exp,
      hp: result.hp,
      recoveredTargetDefeated: true,
      afterMeal: afterMeal.hp,
      afterRest: afterRest.hp,
      persisted: true,
    }),
  )
} catch (error) {
  await mkdir("public/tmp", { recursive: true })
  await page?.screenshot({ path: "public/tmp/first-combat-failure.png" })
  console.error({ commands, errors })
  console.error(
    await page?.evaluate(() =>
      window.game
        ? {
            map: game.state.get().map.id,
            cell: game.scene?.playerCell(),
            online: game.state.get().online,
            hp: game.state.get().player?.hp,
            profileComplete: game.state.get().player?.profileComplete,
            busy: game.state.get().busy,
            joined: !!game.session.others.you,
            exp: game.state.get().player?.exp,
            notices: game.state.get().notices,
            wild: game.session.wild,
          }
        : { game: false },
    ),
  )
  throw error
} finally {
  await browser.close()
}
