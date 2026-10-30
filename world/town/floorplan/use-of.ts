import type { Use } from "#/world/town/floorplan/types"

/** Named uses take precedence over the generic word for a private room. */
export function useOf(name: string): Use {
  if (/店先|売り場|買取場|預かり場/.test(name)) return "売り場"
  if (/土間/.test(name)) return "土間"
  if (/台所/.test(name) && !/居間/.test(name)) return "台所"
  if (/客室/.test(name)) return "客室"
  if (/寝|寝所/.test(name)) return "寝間"
  if (/倉|貯蔵|物置|置き場|酒蔵|乾燥|干し草|農具/.test(name)) return "貯蔵"
  if (/鶏/.test(name)) return "家畜"
  if (/居間|食堂|酒場|集会|書斎/.test(name)) return "食事"
  if (/工房|仕事場|作業場|調合|なめし|仕上げ|鍛冶|仕込み|燻し|詰所|脱穀/.test(name)) return "作業場"
  return /部屋/.test(name) ? "寝間" : "住まい"
}
