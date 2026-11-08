import { selectHuntingTarget } from "#/scripts/lib/select-hunting-target"
import { SKILLS } from "#/world/core/skills"
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { HUNTING_STAGES } from "#/world/test/hunting-stages"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { waitReady } from "#resources/scripts/lib/wait-ready"
import { readRuntimeModuleUrl } from "#resources/scripts/lib/read-runtime-module-url"

const level = Number(process.env.HUNT_LEVEL ?? 12)
const build = process.env.HUNT_BUILD ?? "sword"
const stage = HUNTING_STAGES.find((entry) => entry.level === level && entry.build === build)
if (!stage) throw Error("Unknown hunting fixture")
const output = `/tmp/product-test/visual/solo-hunting/${level}-${build}`
await mkdir(output, { recursive: true })
process.env.BASE ??= "https://durable-fantasy.localhost/?time=21:00"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
const errors = []
const events = []
page.on("pageerror", (error) => errors.push(error.message))
page.on("websocket", (socket) =>
  socket.on("framereceived", ({ payload }) => {
    try {
      const message = JSON.parse(String(payload))
      if (message.type === "result" && message.result?.ok)
        for (const event of message.result.events) if (["looted", "art", "healed", "used"].includes(event.type)) events.push({ type: event.type, monster: event.monster, skill: event.skill })
      if (message.type === "struck" || message.type === "refused") events.push({ type: message.type, monster: message.monster, hp: message.hp, reason: message.reason })
    } catch {
      /* Ignore non-game frames. */
    }
  }),
)
try {
  await createCharacter(page)
  const prepared = await page.evaluate(
    async ({ level, build }) => {
      const response = await fetch("/api/player/hunting-fixture", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ level, build }) })
      if (!response.ok) throw Error(`Fixture rejected: ${response.status}`)
      return response.json()
    },
    { level, build },
  )
  console.log("prepared explicit fixture", prepared)
  await page.reload()
  await waitReady(page)
  const deriveUrl = await readRuntimeModuleUrl(page, "/world/core/derive")
  const caps = await page.evaluate(async (url) => {
    const module = await import(url)
    const stats = module.derive(game.state.get().player)
    return { hp: stats.maxHp, sp: stats.maxSp }
  }, deriveUrl)
  const restStarted = Date.now()
  await page.keyboard.press("z")
  await page.waitForFunction(() => game.state.get().player.sitting)
  await page.waitForFunction(
    (caps) =>
      Number.parseFloat(document.querySelector('[data-slot="meter"][aria-label="HP"]')?.textContent ?? "") >= caps.hp &&
      Number.parseFloat(document.querySelector('[data-slot="meter"][aria-label="SP"]')?.textContent ?? "") >= caps.sp,
    caps,
    { timeout: 80000 },
  )
  await page.keyboard.press("z")
  await page.waitForFunction(() => !game.state.get().player.sitting)
  const rested = await page.evaluate(() => ({ hp: game.state.get().player.hp, sp: game.state.get().player.sp }))
  if (rested.hp !== caps.hp || rested.sp !== caps.sp) throw Error("Rest display disagreed with server")
  const restMs = Date.now() - restStarted
  if (restMs > 25000) throw Error("Seated recovery took longer than a short fight")
  console.log("rested to full", caps, { restMs })
  await walkToMap(page, stage.map)
  const mapName = await page.evaluate(() => game.state.get().map.name)
  console.log("entered", mapName)
  const progress = await page.evaluate(async (arts) => {
    for (const entry of arts.entries()) if (!(await game.run({ type: "hotbar", index: entry[0] + 3, item: "skill:" + entry[1] }))) throw Error("Skill binding failed")
    if (!(await game.run({ type: "hotbar", index: 2, item: "skill:first-aid" }))) throw Error("Healing binding failed")
    const player = game.state.get().player
    return { level: player.level, exp: player.exp, hp: player.hp, sp: player.sp }
  }, stage.arts)
  const battles = []
  const roundCount = Number(process.env.HUNT_ROUNDS ?? 2)
  if (!Number.isInteger(roundCount) || roundCount < 1 || roundCount > 3) throw Error("Invalid round count")
  for (const round of Array.from({ length: roundCount }).keys()) {
    if (round > 0) {
      const beforeMeal = await page.evaluate(() => game.state.get().player.stamina)
      await page.keyboard.press("1")
      await page.waitForFunction((stamina) => game.state.get().player.stamina > stamina, beforeMeal)
      await page.keyboard.press("z")
      await page.waitForFunction(() => game.state.get().player.sitting)
      await page.waitForFunction(
        (caps) =>
          Number.parseFloat(document.querySelector('[data-slot="meter"][aria-label="HP"]')?.textContent ?? "") >= caps.hp &&
          Number.parseFloat(document.querySelector('[data-slot="meter"][aria-label="SP"]')?.textContent ?? "") >= caps.sp,
        caps,
        { timeout: 80000 },
      )
      await page.keyboard.press("z")
      await page.waitForFunction(() => !game.state.get().player.sitting)
    }
    const eventOffset = events.length
    const target = await selectHuntingTarget(page, stage.kind)
    const combat = { skills: 0, heals: 0, started: Date.now() }
    while (Date.now() - combat.started < 120000) {
      const state = await page.evaluate((id) => ({ player: game.state.get().player, health: game.session.wild[id], pending: !!game.session.art }), target)
      if (state.player.hp <= 0) throw Error("Fixture fell")
      if (state.health?.hp === 0) break
      const now = Date.now()
      if (state.player.hp < caps.hp * 0.65 && state.player.sp >= 3 && (state.player.ready["first-aid"] ?? 0) <= now) {
        await page.keyboard.press("3")
        combat.heals++
      }
      for (const entry of state.pending ? [] : stage.arts.entries()) {
        if ((state.player.ready[entry[1]] ?? 0) > now || state.player.sp < SKILLS[entry[1]].sp) continue
        await page.keyboard.press(String(entry[0] + 4))
        combat.skills++
        break
      }
      await page.waitForTimeout(500)
    }
    await page.waitForFunction((id) => game.session.wild[id]?.hp === 0, target, { timeout: 10000 })
    await page.waitForFunction((before) => game.state.get().player.level === 32 || game.state.get().player.level > before.level || game.state.get().player.exp > before.exp, progress)
    if (!combat.skills) throw Error("No skill keyboard action")
    const deadline = Date.now() + 10000
    while (!events.slice(eventOffset).some((event) => event.type === "looted" && event.monster === target) && Date.now() < deadline) await page.waitForTimeout(100)
    if (!events.slice(eventOffset).some((event) => event.type === "looted" && event.monster === target)) throw Error("No server loot receipt")
    combat.acceptedSkills = events.slice(eventOffset).filter((event) => event.type === "art" && stage.arts.includes(event.skill)).length
    const after = await page.evaluate(() => {
      const p = game.state.get().player
      return { level: p.level, exp: p.exp, hp: p.hp, sp: p.sp, ready: p.ready, equipment: p.equipment, bag: p.bag }
    })
    if (!stage.arts.some((id) => after.ready[id] > 0)) throw Error("No skill accepted by the server")
    await page.screenshot({ path: `${output}/battle-${round}.png` })
    battles.push({ target, combat, after })
  }
  const after = battles.at(-1).after
  await page.reload()
  await waitReady(page)
  const restored = await page.evaluate(() => {
    const p = game.state.get().player
    return { level: p.level, exp: p.exp, equipment: p.equipment, bag: p.bag }
  })
  for (const key of ["level", "exp", "equipment", "bag"]) if (JSON.stringify(restored[key]) !== JSON.stringify(after[key])) throw Error("Save mismatch: " + key)
  if (errors.length) throw Error(errors.join("\n"))
  await writeFile(`${output}/result.json`, JSON.stringify({ fixture: { level, build }, caps, restMs, mapName, progress, battles, after, restored, events }, null, 2))
  console.log(
    JSON.stringify({
      passed: true,
      level,
      build,
      mapName,
      rounds: battles.length,
      skills: battles.map((battle) => battle.combat.skills),
      acceptedSkills: battles.map((battle) => battle.combat.acceptedSkills),
      heals: battles.map((battle) => battle.combat.heals),
      hp: after.hp,
      exp: after.exp,
    }),
  )
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await writeFile(`${output}/failure.json`, JSON.stringify({ message: String(error), events, errors }, null, 2))
  throw error
} finally {
  await browser.close()
}
