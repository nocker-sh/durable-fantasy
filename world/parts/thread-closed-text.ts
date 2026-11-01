/** Why a muffler-thread swap did not happen. */
export const threadClosedText = (reason: string) => (reason === "TOO_FAR" ? "相手が遠すぎる。" : "糸の交換を断られた。")
