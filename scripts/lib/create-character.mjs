import { waitReady } from "#resources/scripts/lib/wait-ready"

export async function createCharacter(page, name = "リント") {
  await page.addInitScript(() => performance.setResourceTimingBufferSize(20000))
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await waitReady(page)
  await page.getByRole("textbox", { name: "名前", exact: true }).fill(name)
  await page.getByRole("button", { name: "はじめる" }).click()
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ state: "hidden" })
  await waitReady(page)
}
