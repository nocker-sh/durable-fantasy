import { execFile } from "node:child_process"
import { promisify } from "node:util"
const encode = promisify(execFile)

export async function encodeSpriteWebp(source: string, destination: string): Promise<void> {
  await encode("cwebp", ["-quiet", "-lossless", "-z", "9", "-exact", source, "-o", destination])
}
