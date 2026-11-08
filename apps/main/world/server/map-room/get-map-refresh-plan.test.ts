import { expect, it } from "vitest"
import { getMapRefreshPlan } from "#/world/server/map-room/get-map-refresh-plan"

it("schedules all existing field resources on the first attempt", () => {
  expect(getMapRefreshPlan({ map: "south-meadow", me: {}, now: 1000 })).toEqual({
    delivery: true,
    wild: true,
    nature: true,
    attempts: { deliveryCheckedAt: 1000, wildCheckedAt: 1000, natureCheckedAt: 1000 },
  })
})

it("refreshes the town river resource without requesting creatures", () => {
  expect(getMapRefreshPlan({ map: "phanthiet", me: {}, now: 1000 })).toEqual({ delivery: true, wild: false, nature: true, attempts: { deliveryCheckedAt: 1000, natureCheckedAt: 1000 } })
})

it("does not request absent creatures or resources on an unknown map", () => {
  expect(getMapRefreshPlan({ map: "unknown-map", me: {}, now: 1000 })).toEqual({ delivery: true, wild: false, nature: false, attempts: { deliveryCheckedAt: 1000 } })
})

it("treats zero as a previous attempt and includes the exact retry boundary", () => {
  const me = { deliveryCheckedAt: 0, wildCheckedAt: 0, natureCheckedAt: 0 }
  expect(getMapRefreshPlan({ map: "south-meadow", me, now: 4999 })).toEqual({ delivery: false, wild: false, nature: false, attempts: {} })
  expect(getMapRefreshPlan({ map: "south-meadow", me, now: 5000 })).toEqual({
    delivery: true,
    wild: true,
    nature: true,
    attempts: { deliveryCheckedAt: 5000, wildCheckedAt: 5000, natureCheckedAt: 5000 },
  })
})

it("keeps independent attempt clocks without modifying the input", () => {
  const me = Object.freeze({ deliveryCheckedAt: 1000, wildCheckedAt: 0, natureCheckedAt: 2000 })
  expect(getMapRefreshPlan({ map: "south-meadow", me, now: 5000 })).toEqual({ delivery: false, wild: true, nature: false, attempts: { wildCheckedAt: 5000 } })
  expect(me).toEqual({ deliveryCheckedAt: 1000, wildCheckedAt: 0, natureCheckedAt: 2000 })
})

it("does not retry early if the clock moves backwards", () => {
  const me = { deliveryCheckedAt: 5000, wildCheckedAt: 5000, natureCheckedAt: 5000 }
  expect(getMapRefreshPlan({ map: "south-meadow", me, now: 1000 })).toEqual({ delivery: false, wild: false, nature: false, attempts: {} })
})
