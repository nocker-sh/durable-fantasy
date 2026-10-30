import { waitReady } from "#resources/scripts/lib/wait-ready"

export async function createCharacter(page, name = "エルナ") {
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await waitReady(page)
  await page.getByRole("textbox", { name: "名前", exact: true }).fill(name)
  await page.getByRole("button", { name: "はじめる" }).click()
  await page.getByRole("button", { name: "町を歩く", exact: true }).click()
  await waitReady(page)
}
