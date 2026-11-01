/** A creature drawn from a rigged model in `public/models/monsters/<id>/` (model, walk and idle clips). */
export type MonsterModel = {
  id: "spider" | "snake" | "trex"
  /** how long the model is drawn along `axis`, in tiles, before the kind's `size` */
  length: number
  axis: "x" | "y" | "z"
  /** the model turned so its face looks along +z, in radians */
  yaw?: number
  /** the colour its painted texture is pulled toward, keeping the painted shading */
  tint: number
  /** 0 keeps the painted colours, 1 is fully the tint */
  mute: number
  /** how far it reaches from its centre on the ground in any pose, in tiles before `size` */
  reach: number
}
