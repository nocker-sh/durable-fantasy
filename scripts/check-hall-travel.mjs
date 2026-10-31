import { readRuntimeModuleUrl } from "#resources/scripts/lib/read-runtime-module-url"
// Walk through the real client and server; never bypass a warp or place the player directly.
import { chromium } from "playwright-core"
import { mkdir } from "node:fs/promises"

const base = process.env.BASE ?? "http://127.0.0.1:4027"
const destinations = ["phanthiet-market", "phanthiet-in-h-m5", "phanthiet-in-h-m5-floor-2", "phanthiet-in-h-m5", "phanthiet-market"]
const browser = await chromium.launch({ channel: "chrome" })
const errors = [],
  refused = [],
  route = [],
  moves = [],
  joins = [],
  clockChecks = []
const transport = []
let page, lastTarget
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) transport.push({ type: "navigation" })
  })
  page.on("websocket", (socket) => {
    socket.on("close", () => transport.push({ type: "socket-close" }))
    socket.on("framesent", ({ payload }) => {
      try {
        const message = JSON.parse(String(payload))
        if (message.type === "move") moves.push(message)
        if (message.type === "join") joins.push({ time: message.time })
      } catch {
        /* Non-JSON transport frames carry no game command. */
      }
    })
    socket.on("framereceived", ({ payload }) => {
      try {
        const message = JSON.parse(String(payload))
        if (["snapshot", "warped", "refused"].includes(message.type)) transport.push({ type: message.type, at: message.at, map: message.map })
        if (message.type === "refused") refused.push({ what: message.what, reason: message.reason, at: message.at })
      } catch {
        /* Non-JSON transport frames carry no game response. */
      }
    })
  })
  await page.addInitScript(() => performance.setResourceTimingBufferSize(20000))
  await page.goto(`${base}/?time=21:30`)
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await page.waitForFunction(() => window.game?.state.get().loading === null, null, { timeout: 180000 })
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("エルナ")
  await page.getByRole("button", { name: "はじめる", exact: true }).click()
  await page.getByRole("button", { name: "町を歩く", exact: true }).click({ timeout: 60000 })
  await mkdir("public/tmp/checks", { recursive: true })
  for (const target of destinations) {
    lastTarget = target
    await page.waitForFunction(
      () => {
        const game = window.game,
          state = game?.state.get()
        if (!game?.scene?.runtime?.running || state.loading !== null || state.online !== "online") return false
        if (state.map.id === "phanthiet-in-h-m5") {
          const pupils = game.scene.runtime.people.filter((person) => person.seat)
          return pupils.length === 8 && pupils.every((person) => person.anim === "sit")
        }
        return true
      },
      null,
      { timeout: 180000 },
    )
    console.log("walking toward", target)
    const modules = await Promise.all(
      ["/world/maps/index", "/world/town/activity-pose", "/world/town/interior-rules", "/world/scene/figure/display-scale"].map((path) => readRuntimeModuleUrl(page, path)),
    )
    const from = await page.evaluate(
      async (input) => {
        const target = input.target
        const maps = await import(input.modules[0])
        const game = window.game,
          id = game.state.get().map.id,
          map = maps.MAPS[id]
        const warp = map.warps.find((w) => w.to.map === target)
        if (!warp) throw new Error(`No direct warp from ${id} to ${target}`)
        if (id === "phanthiet-market" || id.startsWith("phanthiet-in-h-m5")) {
          const poses = await import(input.modules[1])
          if (id.startsWith("phanthiet-in-h-m5")) {
            const rules = await import(input.modules[2])
            const display = await import(input.modules[3])
            for (const figure of [...game.scene.runtime.people.map((person) => person.fig), ...Array.from(game.scene.runtime.remotes.values(), (person) => person.fig)]) {
              if (Math.abs(figure.root.scale.x - rules.ROOM_SCALE / display.FIG) > 1e-6) throw new Error("Interior character and furniture scales disagree")
            }
          }
          let focused = 0
          for (const person of game.scene.runtime.people) {
            if (!person.fig.root.visible) continue
            const pose = poses.activityPose(person.name, 21 * 60 + 30, id)
            const target = pose?.facing
            if (!target) continue
            focused++
            const seat = pose?.seat
            if (seat && (!person.seat || person.anim !== "sit")) throw new Error(`Pupil is not seated: ${person.name}`)
            const expected = Math.atan2(target[0] - person.pos[0], target[1] - person.pos[1])
            if (Math.abs(Math.atan2(Math.sin(person.heading - expected), Math.cos(person.heading - expected))) > 0.001) {
              throw new Error(`Resident faces away from activity: ${person.name}`)
            }
          }
          const expectedResidents = id === "phanthiet-in-h-m5" ? 9 : id === "phanthiet-in-h-m5-floor-2" ? 1 : 0
          if (focused !== expectedResidents) throw new Error(`Missing activity residents in ${id}: ${focused}/${expectedResidents}`)
          const grid = game.walkGrid()
          const mismatches = []
          for (let z = 0; z < map.size; z++)
            for (let x = 0; x < map.size; x++) {
              if (Boolean(grid[z * map.size + x]) !== (map.rows[z][x] === "#")) mismatches.push([x, z])
            }
          if (mismatches.length) throw new Error(`Scene and published grid differ in ${id}: ${JSON.stringify(mismatches.slice(0, 10))}`)
        }
        window.__walkGame = game
        window.__walkRuntime = game.scene.runtime
        window.__walkFrom = id
        game.walkTo((warp.at[0] + 0.5) / 2, (warp.at[1] + 0.5) / 2)
        return id
      },
      { target, modules },
    )
    await page.waitForFunction(
      (target) => {
        const state = window.game?.state.get()
        if (window.__walkGame && window.game !== window.__walkGame) throw new Error("Game rebuilt during travel; development reload interrupted the check")
        if (state?.map.id === window.__walkFrom && window.game.scene?.runtime && window.game.scene.runtime !== window.__walkRuntime)
          throw new Error("Scene rebuilt during travel; development reload interrupted the check")
        return state?.map.id === target && state.loading === null && state.online === "online"
      },
      target,
      { timeout: 60000 },
    )
    await page.locator('div[style*="Shippori Mincho"]').waitFor({ state: "detached", timeout: 60000 })
    route.push({ from, to: target })
    console.log("arrived", target)
    await page.screenshot({ path: `public/tmp/checks/hall-live-${route.length}.png` })
    if (route.length === 4) {
      for (const minute of [23 * 60 + 10, 12 * 60, 21 * 60 + 30]) {
        const previousChannel = await page.evaluate(() => window.game.state.get().room.channel)
        const before = joins.length
        await page.evaluate((minute) => window.game.setClock(minute), minute)
        await page.waitForFunction(
          (minute) => {
            const game = window.game,
              state = game?.state.get()
            return state?.clock.min === minute && state.loading === null && state.online === "online" && !!game.session.others.you
          },
          minute,
          { timeout: 60000 },
        )
        await page.locator('div[style*="Shippori Mincho"]').waitFor({ state: "detached", timeout: 60000 })
        if ((await page.evaluate(() => window.game.state.get().room.channel)) !== previousChannel) throw new Error("Clock change switched channels")
        const expected = minute === 1290 ? { visible: 9, seated: 8, lit: true } : minute === 1390 ? { visible: 1, seated: 0, lit: true } : { visible: 0, seated: 0, lit: false }
        await page.waitForFunction(
          (expected) => {
            const people = window.game.scene.runtime.people
            return people.filter((person) => person.fig.root.visible).length === expected.visible && people.filter((person) => person.seat && person.anim === "sit").length === expected.seated
          },
          expected,
          { timeout: 60000 },
        )
        const registryUrl = await readRuntimeModuleUrl(page, "/world/scene/construction/registry")
        const result = await page.evaluate(async (url) => {
          const registry = await import(url)
          const lamps = registry.fireLights.filter((fixture) => fixture.room?.house === "h-m5" && fixture.room.floor === 0)
          return {
            visible: window.game.scene.runtime.people.filter((person) => person.fig.root.visible).map((person) => person.name),
            seated: window.game.scene.runtime.people.filter((person) => person.seat && person.anim === "sit").length,
            lamps: lamps.length,
            lit: lamps.every((fixture) => fixture.light.intensity > 0),
          }
        }, registryUrl)
        if (joins.length !== before + 1 || joins.at(-1).time !== minute) throw new Error("Clock change did not join with the displayed server time")
        if (result.lamps !== 2 || result.lit !== expected.lit) throw new Error(`Room lamps disagree with routine: ${JSON.stringify(result)}`)
        clockChecks.push({ minute, ...result })
        await page.screenshot({ path: `public/tmp/checks/hall-time-${minute}.png` })
        const same = joins.length
        const unchanged = await page.evaluate((minute) => {
          const game = window.game,
            socket = game.session.socket,
            you = game.session.others.you
          game.setClock(minute)
          return game.session.socket === socket && game.session.others.you === you && game.state.get().online === "online" && game.state.get().loading === null
        }, minute)
        if (!unchanged || joins.length !== same) throw new Error("Unchanged clock reconnected the room")
      }
    }
  }
  const realChannel = await page.evaluate(() => window.game.state.get().room.channel)
  const beforeReal = joins.length
  await page.evaluate(() => window.game.setClock(null))
  await page.waitForFunction(
    () => {
      const game = window.game,
        state = game?.state.get()
      return state?.clock.held === false && state.loading === null && state.online === "online" && !!game.session.others.you
    },
    null,
    { timeout: 60000 },
  )
  if ((await page.evaluate(() => window.game.state.get().room.channel)) !== realChannel) throw new Error("Returning to the real clock switched channels")
  if (joins.length !== beforeReal + 1 || joins.at(-1).time !== undefined) throw new Error("Real clock retained an old server time override")
  clockChecks.push({ minute: null, mode: "real", joinedWithoutTime: true })
  if (errors.length || refused.length) throw new Error(JSON.stringify({ errors, refused }))
  console.log(JSON.stringify({ route, clockChecks, errors, refused }))
} catch (error) {
  const mapsUrl = await readRuntimeModuleUrl(page, "/world/maps/index").catch(() => null)
  const state = await page
    ?.evaluate(
      async (input) => {
        const maps = input.mapsUrl ? await import(input.mapsUrl) : null
        const game = window.game
        if (!game) return { missingGame: true }
        const state = game.state.get(),
          map = maps?.MAPS[state.map.id]
        return {
          map: state.map.id,
          online: state.online,
          loading: state.loading,
          sameGame: game === window.__walkGame,
          sameRuntime: game.scene?.runtime === window.__walkRuntime,
          visibility: document.visibilityState,
          running: game.scene?.runtime?.running,
          path: game.scene?.runtime?.movement?.path,
          engaged: game.session.engaged,
          player: game.scene?.player(),
          cell: game.scene?.playerCell(),
          goal: map?.warps.find((w) => w.to.map === input.target),
          badCells: input.moves
            .slice(-1)
            .flatMap((m) => m.path ?? [])
            .filter(([x, z]) => map?.rows?.[z]?.[x] === "#"),
          refusedWarp: game.session.refusedWarp,
          warping: game.session.warping,
        }
      },
      { target: lastTarget, moves, mapsUrl },
    )
    .catch((e) => ({ diagnosticError: String(e) }))
  console.error(JSON.stringify({ state, errors, refused, route, moves: moves.slice(-1), transport }))
  await page?.screenshot({ path: "public/tmp/checks/hall-live-failure.png" }).catch(() => {})
  throw error
} finally {
  await browser.close()
}
