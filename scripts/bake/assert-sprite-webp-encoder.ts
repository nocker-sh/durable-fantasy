import { execFileSync } from "node:child_process"

export function assertSpriteWebpEncoder(): void {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" })
}
