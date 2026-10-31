import { expect, it, vi } from "vitest"
import { Group } from "three"
import { updateScheduledShopFronts } from "#/world/scene/runtime/update-scheduled-shop-fronts"
import { shopOpen } from "#/world/maps/shop-open"

vi.mock("#/world/maps/shop-open", () => ({ shopOpen: vi.fn() }))

it("keeps shop boards and wares synchronized with the authoritative opening rule", () => {
  const board = { shop: "bakery", open: new Group(), shut: new Group(), wares: new Group() } satisfies Parameters<typeof updateScheduledShopFronts>[0]["boards"][number]
  for (const isOpen of [true, false]) {
    vi.mocked(shopOpen).mockReturnValue(isOpen)
    updateScheduledShopFronts({ minute: 1290, boards: [board], stalls: {}, staffedPlaces: new Set() })
    expect(shopOpen).toHaveBeenLastCalledWith("bakery", 1290)
    expect([board.open.visible, board.shut.visible, board.wares.visible]).toEqual([isOpen, !isOpen, isOpen])
  }
})

it("removes a portable stall as a group while covering a fixed or groupless stall", () => {
  const fixed = { wares: new Group(), cover: new Group() }
  const portable = { wares: new Group(), cover: new Group(), vanish: true, group: new Group() }
  const groupless = { wares: new Group(), cover: new Group(), vanish: true }
  for (const staffedPlaces of [new Set<string>(), new Set(["fixed", "portable", "groupless"])]) {
    updateScheduledShopFronts({ minute: 1290, boards: [], stalls: { fixed, portable, groupless }, staffedPlaces })
    const isStaffed = staffedPlaces.size > 0
    expect(portable.group.visible).toBe(isStaffed)
    expect([portable.wares.visible, portable.cover.visible]).toEqual([true, true])
    expect([fixed.wares.visible, fixed.cover.visible]).toEqual([isStaffed, !isStaffed])
    expect([groupless.wares.visible, groupless.cover.visible]).toEqual([isStaffed, !isStaffed])
  }
})
