export const hookOf = (piece: string | undefined) => (piece && /網|服|革|皮|姿見|杖|鋤|煙突|車輪/.test(piece) ? 1.75 : 1.5)
