// Fresh character walks through real exits and gathers with server distance checks.
import { configureCpu } from "#resources/scripts/lib/configure-cpu"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { waitReady } from "#resources/scripts/lib/wait-ready"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
let page
try {
  page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const cpuSlowdown = await configureCpu(page)
  console.log(`CPU slowdown: ${cpuSlowdown}`)
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await createCharacter(page)
  const ready = () => waitReady(page)
  const route = await walkToMap(page, "south-meadow")
  const before = await page.evaluate(() => game.state.get().player.life.foraging)
  await page.evaluate(() => {
    window.__gatherCamera = null
    const renderer = game.scene.runtime.renderer
    const render = renderer.render.bind(renderer)
    renderer.render = (scene, camera) => {
      if (scene === window.__scene) window.__gatherCamera = camera
      return render(scene, camera)
    }
  })
  await page.waitForFunction(() => window.__gatherCamera !== null)
  // stand on a walkable cell beside the herb spot where it is now defined (the meadow layout changes over time)
  const spot = await page.evaluate(async () => {
    const { NODES } = await import("/world/core/gather")
    const { MAPS } = await import("/world/maps/index")
    const node = NODES.find((entry) => entry.id === "south-meadow-herbs-1")
    const rows = MAPS["south-meadow"].rows
    const around = []
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) around.push([node.cell[0] + dx, node.cell[1] + dy])
    around.sort((a, b) => Math.hypot(a[0] - node.cell[0], a[1] - node.cell[1]) - Math.hypot(b[0] - node.cell[0], b[1] - node.cell[1]))
    return around.find((cell) => rows[cell[1]]?.[cell[0]] === ".")
  })
  if (!spot) throw Error("No walkable cell beside the herb spot")
  await page.evaluate((cell) => game.scene.walkTo((cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2), spot)
  await page.waitForFunction(
    (cell) => {
      const at = game.scene.playerCell()
      return at && Math.hypot(at[0] - cell[0], at[1] - cell[1]) <= 1 && !game.scene.player().walking
    },
    spot,
    { timeout: 120000 },
  )
  const point = await page.evaluate(() => {
    const camera = window.__gatherCamera
    const canvas = game.scene.runtime.renderer.domElement
    const points = []
    window.__scene.traverse((object) => {
      if (object.userData.node !== "south-meadow-herbs-1" || !object.visible) return
      object.traverse((mesh) => {
        if (!mesh.isMesh || !mesh.visible) return
        mesh.geometry.computeBoundingBox()
        const at = mesh.geometry.boundingBox?.getCenter(camera.position.clone())
        if (!at) return
        mesh.localToWorld(at).project(camera)
        if (at.z < 1 && Math.abs(at.x) < 1 && Math.abs(at.y) < 1) points.push({ x: ((at.x + 1) / 2) * canvas.clientWidth, y: ((1 - at.y) / 2) * canvas.clientHeight, depth: at.z })
      })
    })
    points.sort((a, b) => a.depth - b.depth)
    if (!points.length) throw Error("Gathering spot is not visible")
    return points[0]
  })
  await page.mouse.click(point.x, point.y)
  await page.waitForFunction((before) => game.state.get().player.life.foraging > before, before, { timeout: 15000 })
  const result = await page.evaluate(() => ({
    map: game.state.get().map.id,
    cell: game.scene.playerCell(),
    life: game.state.get().player.life.foraging,
    herbs: game.state
      .get()
      .player.bag.filter((s) => s?.item === "herb")
      .reduce((n, s) => n + s.count, 0),
  }))
  if (result.herbs < 1) throw Error("No herb received")
  await page.reload()
  await ready()
  const restored = await page.evaluate(() => ({
    map: game.state.get().map.id,
    life: game.state.get().player.life.foraging,
    herbs: game.state
      .get()
      .player.bag.filter((s) => s?.item === "herb")
      .reduce((n, s) => n + s.count, 0),
  }))
  if (restored.map !== result.map || restored.life !== result.life || restored.herbs !== result.herbs) throw Error("Gathering progress did not persist")
  if (errors.length) throw Error(errors.join("\n"))
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/gathering.png" })
  await writeFile("public/tmp/gathering.json", JSON.stringify({ cpuSlowdown, route, result, restored }, null, 2))
  console.log(JSON.stringify({ cpuSlowdown, route, result, restored }))
} catch (error) {
  await mkdir("public/tmp", { recursive: true })
  await page?.screenshot({ path: "public/tmp/gathering-failure.png" })
  console.error(
    await page?.evaluate(() => (window.game ? { map: game.state.get().map, cell: game.scene?.playerCell(), loading: game.state.get().loading, notices: game.state.get().notices } : { game: false })),
  )
  throw error
} finally {
  await browser.close()
}
