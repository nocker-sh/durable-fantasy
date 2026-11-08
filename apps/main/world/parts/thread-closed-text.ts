/** Why a muffler-thread swap did not happen. */
export function threadClosedText(reason: string): string {
  const text: Record<string, string> = { TOO_FAR: "相手が遠すぎる。", BUSY: "今は糸を交換できない。", WAIT: "続けては申し込めない。", DECLINED: "糸の交換を断られた。" }
  return text[reason] ?? "糸を交換できなかった。"
}
