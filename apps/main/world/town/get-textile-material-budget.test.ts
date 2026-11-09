import { expect, it } from "vitest"
import { getTextileMaterialBudget } from "#/world/town/get-textile-material-budget"
const fixture = () => ({ clothAreaM2: 2.8, cutAreaM2: 2.448, arealMassGPerM2: 900, prepareYieldPermille: 650, spinYieldPermille: 900, weaveYieldPermille: 950 })

it("conserves raw fleece across prepared wool, yarn, cloth, cut pieces and separate process differences", () => {
  const source = fixture(),
    before = JSON.stringify(source),
    budget = getTextileMaterialBudget(source)
  if (budget instanceof Error) throw budget
  expect(budget).toEqual({
    rawFleeceG: 4536,
    preparedWoolG: 2948,
    yarnG: 2653,
    clothG: 2520,
    cutG: 2204,
    preparationDifferenceG: 1588,
    spinningDifferenceG: 295,
    weavingDifferenceG: 133,
    offcutsG: 316,
  })
  expect(budget.cutG + budget.offcutsG + budget.weavingDifferenceG + budget.spinningDifferenceG + budget.preparationDifferenceG).toBe(budget.rawFleeceG)
  expect(JSON.stringify(source)).toBe(before)
})

it("does not invent process differences at full yield and never lets offcuts disappear", () => {
  const budget = getTextileMaterialBudget({ clothAreaM2: 1, cutAreaM2: 0.8, arealMassGPerM2: 1000, prepareYieldPermille: 1000, spinYieldPermille: 1000, weaveYieldPermille: 1000 })
  if (budget instanceof Error) throw budget
  expect(budget).toEqual({ rawFleeceG: 1000, preparedWoolG: 1000, yarnG: 1000, clothG: 1000, cutG: 800, preparationDifferenceG: 0, spinningDifferenceG: 0, weavingDifferenceG: 0, offcutsG: 200 })
})

it("refuses impossible areas, missing or nonfinite mass, unsafe totals and invalid process assumptions", () => {
  const source = fixture()
  expect(getTextileMaterialBudget({ ...source, cutAreaM2: 3 })).toBeInstanceOf(Error)
  for (const invalid of [0, -1, NaN, Infinity]) {
    expect(getTextileMaterialBudget({ ...source, arealMassGPerM2: invalid })).toBeInstanceOf(Error)
    expect(getTextileMaterialBudget({ ...source, clothAreaM2: invalid })).toBeInstanceOf(Error)
  }
  expect(getTextileMaterialBudget({ ...source, arealMassGPerM2: Number.MAX_SAFE_INTEGER })).toBeInstanceOf(Error)
  expect(getTextileMaterialBudget({ ...source, spinYieldPermille: 1001 })).toBeInstanceOf(Error)
})
