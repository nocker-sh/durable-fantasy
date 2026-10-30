import { availableParallelism } from "node:os"
import { join } from "node:path"
import { MAPS } from "../world/maps/index"
import { withSpriteBakeLock } from "./lib/with-sprite-bake-lock"
import { runSpriteBake } from "./bake/run-sprite-bake"

const args = process.argv.slice(2)
const outputDirectory = join(import.meta.dirname, "..", "public", MAPS.phanthiet.assets.sprites)
const only =
  args
    .find((argument) => argument.startsWith("--only="))
    ?.slice(7)
    .split(",") ?? null
await withSpriteBakeLock(outputDirectory, (token) =>
  runSpriteBake({
    outputDirectory,
    token,
    only,
    resume: args.includes("--resume"),
    serverUrl: args.find((argument) => !argument.startsWith("--")) ?? "https://durable-fantasy.localhost/",
    pageCount: Math.max(1, availableParallelism() - 2),
  }),
)
