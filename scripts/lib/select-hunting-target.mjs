/** Inspect the live renderer, walk through the normal movement API, then select the creature with a real canvas click. */
export async function selectHuntingTarget(page, kind) {
  const target = await page.evaluate((kind) => {
    const available = Object.entries(game.session.wild).find(([id, health]) => id.includes("-" + kind + "-") && health.hp > 0 && health.back <= Date.now() && !health.combat)
    if (!available) throw Error("No available opponent")
    const renderer = game.scene.runtime.renderer
    const original = renderer.render
    window.huntingView = null
    renderer.render = function (scene, camera) {
      scene.traverse((object) => {
        if (object.userData.monster !== available[0]) return
        window.huntingView = { body: object, camera, renderer }
        renderer.render = original
      })
      return original.call(this, scene, camera)
    }
    return available[0]
  }, kind)
  await page.waitForFunction(() => window.huntingView !== null)
  await page.evaluate(() => {
    const body = huntingView.body
    const position = body.getWorldPosition(body.position.clone())
    game.scene.walkTo(position.x + 0.8, position.z)
  })
  await page.waitForFunction(
    () => {
      const position = huntingView.body.getWorldPosition(huntingView.body.position.clone())
      const player = game.scene.player()
      return player && !player.walking && Math.hypot(position.x - player.x, position.z - player.z) < 2
    },
    null,
    { timeout: 120000 },
  )
  const point = await page.evaluate(() => {
    const view = huntingView
    const position = view.body.localToWorld(view.body.position.clone().set(0, 0.2, 0)).project(view.camera)
    const rect = view.renderer.domElement.getBoundingClientRect()
    return { x: rect.left + ((position.x + 1) * rect.width) / 2, y: rect.top + ((1 - position.y) * rect.height) / 2 }
  })
  await page.mouse.click(point.x, point.y)
  await page.waitForFunction((id) => game.session.fighting?.monster === id, target, { timeout: 15000 })
  return target
}
