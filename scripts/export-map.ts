// Write each map's walk grid and where each resident stands to world/maps/<map>.json, for the
// server to check paths and distances without building the 3D scene. Both come from the scene
// the browser builds, so run this after changing the terrain, buildings or residents, with the
// dev server running:
//   npx tsx scripts/export-map.ts [dev server URL] [map …]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const URL = process.argv[2] ?? "https://durable-fantasy.localhost/";
const only = process.argv.slice(3);
const browser = await chromium.launch();
for (const map of only.length
  ? only
  : [
      "phanthiet",
      "phanthiet-market",
      "phanthiet-craft",
      "phanthiet-gate",
      "south-meadow",
      "red-dunes",
      "sea-cliff",
      "net-sheds",
      "forest-edge",
      "deep-forest",
      "quynhon-gate",
      "mountain-pass",
      "hue-gate",
    ]) {
  const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();
  await page.goto(`${URL}?map=${map}`);
  await page.waitForFunction(() => (window as unknown as { game?: { state: { get(): { loading: string | null } } } }).game?.state.get().loading === null, null, { timeout: 120_000 });
  const data = await page.evaluate(async () => {
    // through the game, so it is the very grid the scene built
    const game = (window as unknown as { game: { walkGrid(): Uint8Array; state: { get(): { npcs: { name: string; x: number; z: number }[] } } } }).game;
    const grid = game.walkGrid();
    let bits = "";
    for (let i = 0; i < grid.length; i++) bits += grid[i] ? "1" : "0";
    return {
      size: Math.round(Math.sqrt(grid.length)),
      blocked: bits,
      npcs: game.state.get().npcs.map((r) => ({ name: r.name, cell: [Math.floor(r.x * 2), Math.floor(r.z * 2)] })),
      places: (game as unknown as { places(): Record<string, [number, number]> }).places(),
    };
  });
  await page.close();

  // one row of the grid per line, '#' blocked and '.' free, readable in a diff
  const rows: string[] = [];
  for (let j = 0; j < data.size; j++)
    rows.push(
      data.blocked
        .slice(j * data.size, (j + 1) * data.size)
        .replace(/1/g, "#")
        .replace(/0/g, "."),
    );
  const out = { size: data.size, rows, places: data.places };
  writeFileSync(join(import.meta.dirname, "..", "src", "game", "maps", `${map}.json`), JSON.stringify(out, null, 1) + "\n");
  console.log(`${map}: grid ${data.size}×${data.size}, ${Object.keys(data.places).length} places`);
}
await browser.close();
