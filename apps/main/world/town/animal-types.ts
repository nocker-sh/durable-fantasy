export type TownAnimalSpawn = {
  id: string
  map: string
  kind: "hen" | "cat" | "pig" | "sheep" | "cow"
  variant: number
  area: [number, number, number, number]
  speed: number
  scale: number
}
