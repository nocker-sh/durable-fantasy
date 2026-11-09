export type PartyChatLine = {
  seq: number
  owner: string
  name: string
  text: string
  at: number
}
export type PartyChat = {
  seq: number
  lines: PartyChatLine[]
  joined: Record<string, number>
  attempts: Record<string, number[]>
}
