// Client walking integration check: bun scripts/check-walking-directions.mjs
// Disables walk messages to isolate keyboard, path following and camera projection from server corrections.
// Diagonal key pairs arrive in one frame so a preceding single-key step is not measured.
import { chromium } from "playwright-core"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.goto(`${process.env.BASE ?? "https://durable-fantasy.localhost"}/?map=south-meadow`)
  await page.waitForFunction(() => window.game?.scene?.runtime?.running && window.game.state.get().loading === null, null, { timeout: 180000 })
  await page.evaluate(async () => {
    const r = window.game.scene.runtime
    r.events = { ...r.events, walk: () => {} }
    const { isFree, walkH } = await import("/world/scene/world")
    let cell
    for (let j = 20; j < 76 && !cell; j++)
      for (let i = 20; i < 76 && !cell; i++) {
        let free = true
        for (let z = -2; z <= 2; z += 0.5) for (let x = -2; x <= 2; x += 0.5) if (!isFree((i + 0.5) / 2 + x, (j + 0.5) / 2 + z)) free = false
        if (free) cell = [i, j]
      }
    if (!cell) throw Error("No open walking test area")
    window.__walkCheck = { cell, walkH, camera: null, start: null }
    const render = r.renderer.render.bind(r.renderer)
    r.renderer.render = (scene, camera) => {
      if (scene === window.__scene) window.__walkCheck.camera = camera
      return render(scene, camera)
    }
  })
  const cases = [
    ["w", 0, 1],
    ["w d", 1, 1],
    ["d", 1, 0],
    ["s d", 1, -1],
    ["s", 0, -1],
    ["s a", -1, -1],
    ["a", -1, 0],
    ["w a", -1, 1],
  ]
  const results = []
  for (let turn = 0; turn < 8; turn++)
    for (const [keys, x, y] of cases) {
      await page.evaluate((turn) => {
        const r = window.game.scene.runtime
        r.hold(null)
        r.stop()
        r.placePlayer(window.__walkCheck.cell)
        r.movement.yawTarget = (turn * Math.PI) / 4
        window.__walkCheck.start = [...r.movement.pos]
      }, turn)
      await page.waitForTimeout(60)
      await page.evaluate((keys) => {
        for (const key of keys.split(" ")) document.body.dispatchEvent(new KeyboardEvent("keydown", { key, code: "Key" + key.toUpperCase(), bubbles: true }))
      }, keys)
      await page.waitForTimeout(250)
      await page.evaluate((keys) => {
        for (const key of keys.split(" ")) document.body.dispatchEvent(new KeyboardEvent("keyup", { key, code: "Key" + key.toUpperCase(), bubbles: true }))
      }, keys)
      const delta = await page.evaluate(() => {
        const r = window.game.scene.runtime,
          { start, camera, walkH } = window.__walkCheck
        const screen = (p) => camera.position.clone().set(p[0], walkH(p[0], p[1]), p[1]).project(camera)
        const before = screen(start),
          after = screen(r.movement.pos)
        return [after.x - before.x, after.y - before.y]
      })
      const magnitude = Math.max(...delta.map(Math.abs))
      if (magnitude < 0.001 || [x, y].some((expected, i) => (expected === 0 ? Math.abs(delta[i]) > magnitude * 0.2 : Math.sign(delta[i]) !== expected)))
        throw Error(
          JSON.stringify({
            turn,
            keys,
            delta,
            debug: await page.evaluate(() => ({
              cell: window.__walkCheck.cell,
              start: window.__walkCheck.start,
              pos: window.game.scene.runtime.movement.pos,
              path: window.game.scene.runtime.movement.path,
              modal: window.game.state.get().modal,
              loading: window.game.state.get().loading,
              typing: window.game.state.get().typing,
              online: window.game.state.get().online,
            })),
          }),
        )
      results.push({ turn, keys, delta })
    }
  console.log(JSON.stringify({ cases: results.length, errors }))
  if (errors.length) throw Error("Browser errors")
} finally {
  await browser.close()
}
