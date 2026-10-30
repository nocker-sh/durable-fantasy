/** Why an invitation into a party did not work. */
export function partyClosedText(reason: string): string {
  const text: Record<string, string> = { DECLINED: "パーティの誘いを断られた。", BUSY: "今は誘えない。", NOT_LEADER: "誘えるのはリーダーだけ。", FULL: "パーティはもう一杯だ。" }
  return text[reason] ?? "誘えなかった。"
}
