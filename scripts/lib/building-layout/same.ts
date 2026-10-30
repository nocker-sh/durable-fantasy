export const same = (a: number[] | undefined, b: number[] | undefined) => !!a && !!b && a.length === b.length && a.every((value, i) => value === b[i])
