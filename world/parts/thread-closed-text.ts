/** Why a muffler-thread swap did not happen. */
export const threadClosedText = (reason: string) => (reason === "TOO_FAR" ? "もっと近くに寄らないと。" : "糸の交換を断られた。")
