import { getSpriteBakeHostKey } from "./get-sprite-bake-host-key"

/** 経過時間で所有者の停止を推測せず、判別不能な所有者も使用中として扱う。 */
export function isSpriteBakeClaimBlocking(name: string): boolean {
  const fields = name.split(".")
  const pid = Number(fields[0])
  if (
    fields.length !== 4 ||
    fields[3] !== "claim" ||
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    String(pid) !== fields[0] ||
    fields[1] !== getSpriteBakeHostKey() ||
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/.test(fields[2])
  )
    return true
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return !(error instanceof Error && "code" in error && error.code === "ESRCH")
  }
}
