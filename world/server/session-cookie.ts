import { playerId } from "#/world/core/identity"
import { COOKIE } from "#/world/server/session"

export function sessionCookie(request: Request): { id: string; secret: string } | null {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  if (!value) return null
  const fields = value.split(".")
  const id = fields[0]
  const secret = fields[1]
  const extra = fields[2]
  return !extra && playerId.safeParse(id).success && /^[a-f0-9]{64}$/.test(secret ?? "") ? { id, secret } : null
}
