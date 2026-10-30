import { emptyWild } from "#/world/core/wild/empty-wild"
import type { WildRecord } from "#/world/server/wild-record"

export const initialWildRecord = (): WildRecord => ({ revision: 0, wild: emptyWild(), serial: 0, jobs: {}, deliverySerial: 0, deliveries: {} })
