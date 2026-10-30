import { acquireSpriteBakeLock } from "./acquire-sprite-bake-lock"
const directory = process.argv[2]
const mode = process.argv[3]
if (!directory) throw new Error("Missing fixture directory")

function attempt(): void {
  try {
    const lease = acquireSpriteBakeLock(directory)
    console.log("acquired")
    if (mode === "try") {
      lease.release()
      process.exit(0)
    }
    process.stdin.resume()
    process.stdin.once("data", () => {
      lease.release()
      process.exit(0)
    })
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "Sprite output is locked by an active or unverifiable owner") throw error
    console.log("rejected")
    process.exit(2)
  }
}
if (mode === "race") {
  process.stdin.resume()
  process.stdin.once("data", attempt)
  console.log("ready")
} else attempt()
