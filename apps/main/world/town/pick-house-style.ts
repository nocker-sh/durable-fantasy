export const pickHouseStyle = <T>(xs: readonly T[], seed: number, salt: number): T => xs[Math.abs(Math.imul(seed + 7, 2654435761) ^ Math.imul(salt + 3, 40503)) % xs.length]
