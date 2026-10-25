// A picture of every room you can walk into, at night with the lamps lit, for checking the
// interiors (town.md「屋内マップ」). Run with the dev server up: bun scripts/shoot-interiors.ts [outdir]
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { INTERIORS } from "../world/town/interiors.ts";

const BASE = process.env.BASE ?? "https://durable-fantasy.localhost";
const out = process.argv[2] ?? join(homedir(), "Pictures", "durable-fantasy-houses");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } });
for (const it of INTERIORS) {
  for (let tries = 0; tries < 3; tries++) {
    await page.goto(`${BASE}/?map=${it.id}&time=21:00`, { waitUntil: "domcontentloaded" });
    if (
      await page.waitForSelector('body[data-ready="1"]', { timeout: 40_000 }).then(
        () => true,
        () => false,
      )
    )
      break;
  }
  await page.waitForTimeout(1500);
  const file = join(out, `${it.house.id}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
