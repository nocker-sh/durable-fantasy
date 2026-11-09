import { getRequiredTextileInputMass } from "#/world/town/get-required-textile-input-mass"
type Props = Readonly<{ clothAreaM2: number; cutAreaM2: number; arealMassGPerM2: number; prepareYieldPermille: number; spinYieldPermille: number; weaveYieldPermille: number }>

/** A hypothetical whole-gram budget conserves process differences and offcuts; no game-item count or fulfilled stock is inferred. */
export function getTextileMaterialBudget(props: Props) {
  if (![props.clothAreaM2, props.cutAreaM2, props.arealMassGPerM2].every((value) => Number.isFinite(value) && value > 0) || props.cutAreaM2 > props.clothAreaM2)
    return new Error("Invalid textile material areas or mass")
  const clothG = Math.ceil(props.clothAreaM2 * props.arealMassGPerM2),
    cutG = Math.ceil(props.cutAreaM2 * props.arealMassGPerM2)
  if (![clothG, cutG].every((value) => Number.isSafeInteger(value) && value > 0) || cutG > clothG) return new Error("Unbounded textile cloth mass")
  const yarnG = getRequiredTextileInputMass({ outputG: clothG, yieldPermille: props.weaveYieldPermille })
  if (yarnG instanceof Error) return yarnG
  const preparedWoolG = getRequiredTextileInputMass({ outputG: yarnG, yieldPermille: props.spinYieldPermille })
  if (preparedWoolG instanceof Error) return preparedWoolG
  const rawFleeceG = getRequiredTextileInputMass({ outputG: preparedWoolG, yieldPermille: props.prepareYieldPermille })
  if (rawFleeceG instanceof Error) return rawFleeceG

  return {
    rawFleeceG,
    preparedWoolG,
    yarnG,
    clothG,
    cutG,
    preparationDifferenceG: rawFleeceG - preparedWoolG,
    spinningDifferenceG: preparedWoolG - yarnG,
    weavingDifferenceG: yarnG - clothG,
    offcutsG: clothG - cutG,
  }
}
