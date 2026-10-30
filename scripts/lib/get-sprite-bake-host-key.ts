import { createHash } from "node:crypto"
import { hostname } from "node:os"

export function getSpriteBakeHostKey(): string {
  return createHash("sha256").update(hostname()).digest("hex")
}
