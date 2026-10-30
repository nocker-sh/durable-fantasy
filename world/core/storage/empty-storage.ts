import { emptyBag } from "#/world/core/empty-bag"
import type { Bag } from "#/world/core/bag-types"
import { STORAGE_SIZE } from "#/world/core/storage/rules"

export const emptyStorage = (): Bag => emptyBag(STORAGE_SIZE)
