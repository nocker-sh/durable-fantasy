import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
export type GableRoof = { bounds: Rectangle; eave: number; ridge: number; ridgeAxis: "x" | "z"; overhang: number }

export type RoofPoint = [number, number, number]
export type RoofPanel = readonly [RoofPoint, RoofPoint, RoofPoint, RoofPoint]
