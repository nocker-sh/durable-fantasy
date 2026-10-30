import { EPS } from "#/scripts/lib/storage-retrieval"

export const overlaps = (a: readonly number[], b: readonly number[]) => a[0] < b[2] - EPS && a[2] > b[0] + EPS && a[1] < b[3] - EPS && a[3] > b[1] + EPS
