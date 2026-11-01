export type ChatInput = { kind: "message"; text: string; shout: boolean } | { kind: "party"; text: string } | { kind: "whisper"; to: string; text: string }

/** Private and party lines must never fall through to public speech. */
export function parseChatInput(input: string): ChatInput | null {
  const text = input.trim()
  if (!text) return null
  const commandState = text.split(/\s+/, 1),
    command = commandState[0]
  if (command === "/p") {
    const said = text.slice(2).trim().slice(0, 140)
    return said ? { kind: "party", text: said } : null
  }
  if (command === "/w") {
    // "/w name text": a private line never falls through to public speech, even when malformed
    const parts = /^\/w\s+(\S+)\s+([\s\S]+)$/.exec(text)
    return parts ? { kind: "whisper", to: parts[1].normalize("NFC"), text: parts[2].trim().slice(0, 140) } : null
  }
  const shout = command === "/s"
  const said = (shout ? text.slice(2).trim() : text).slice(0, 140)
  return said ? { kind: "message", text: said, shout } : null
}
