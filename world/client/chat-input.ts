export type ChatInput = { kind: "message"; text: string; shout: boolean } | { kind: "unavailable"; text: string }

/** Unsupported private channels must never fall through to public speech. */
export function parseChatInput(input: string): ChatInput | null {
  const text = input.trim()
  if (!text) return null
  const [command] = text.split(/\s+/, 1)
  if (command === "/p") return { kind: "unavailable", text: "パーティチャットはまだ使えない。" }
  if (command === "/w") return { kind: "unavailable", text: "ささやきはまだ使えない。" }
  const shout = command === "/s"
  const said = (shout ? text.slice(2).trim() : text).slice(0, 140)
  return said ? { kind: "message", text: said, shout } : null
}
