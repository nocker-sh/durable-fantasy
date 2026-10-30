import { REASON_TEXT } from "#/world/core/commands"

/** How a face-to-face trade ended. */
export function tradeClosedText(reason: string): string {
  const text: Record<string, string> = {
    DONE: "取引が成立した。",
    PENDING: "取引結果を確認できなかった。少し待ってから町に入り直し、持ち物を確認してね。",
    DECLINED: "取引を断られた。",
    CANCELLED: "取引をやめた。",
    LEFT: "相手がいなくなった。",
    BUSY: "今は取引できない。",
    TOO_FAR: "もっと近くに寄らないと。",
  }
  const reasons: Readonly<Record<string, string | undefined>> = REASON_TEXT
  return text[reason] ?? (reason in reasons ? `取引できなかった: ${reasons[reason]}` : "取引できなかった。")
}
