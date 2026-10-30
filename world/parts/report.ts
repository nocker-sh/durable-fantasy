import type { Notice } from "#/world/state"

export type Told = {
  notices: { text: string; tone: Notice["tone"] }[]
  chat: string[]
}
