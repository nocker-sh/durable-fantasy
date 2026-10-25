// ---------------------------------------------------------------- looks
/** fringe designs, after the Animal Crossing set (zigzag, flicked, fringe back, devillock, …) */
export const FRINGES = ["swept", "curtain", "blunt", "spiky", "zigzag", "flicked", "back", "pompadour", "devillock", "slant", "dangle", "natural"] as const;

export type Fringe = (typeof FRINGES)[number];

export interface Look {
  sex: "f" | "m";
  age?: "child" | "adult" | "old";
  skin: "skin1" | "skin2" | "skin3";
  hair: string; // ramp
  style: "short" | "bob" | "long" | "braid" | "bun" | "bald" | "pony" | "curly";
  /** fringe shape; picked from the look when omitted */
  fringe?: Fringe;
  top: string; // tunic / dress ramp
  bottom?: string; // trousers ramp (men)
  apron?: string;
  bodice?: string; // women: laced bodice ramp
  hat?: "cap" | "hood" | "straw" | "kerchief" | "coif" | "beret" | "helm" | "greathelm" | null;
  /** plume on a helm */
  plume?: string;
  /** breastplate (iron, gold, leather...) worn over the top, with pauldrons on the shoulders */
  armor?: string;
  /** shield on the left arm and the colour of its face */
  shield?: "round" | "kite" | "buckler";
  shieldRamp?: string;
  /** charge painted on a kite shield */
  crest?: string;
  hatRamp?: string;
  shoes?: string;
  eye?: string; // iris ramp
  /** how the eyes are drawn: one dark upright stroke (the default), or a T — a dark lid across, the iris's colour below */
  /** the eyes: a T (lid across, iris below; everyone's) or the old upright stroke */
  eyeStyle?: "t" | "stroke";
  belt?: boolean;
  robe?: boolean; // long robe (priest)
  /** collar at the neck; null for none */
  collar?: string | null;
  /** what is wrapped round the neck: everyone in town wears something (it is cold all year) */
  neck?: "muffler" | "stole" | "scarf";
  /** its colour, and an optional stripe colour */
  neckRamp?: string;
  neckStripe?: string;
  /** hem, cuff and boot-turn trim; defaults to a darker tone of the garment */
  trim?: string;
  gloves?: string;
  /** sleeveless jerkin over the tunic, open down the front */
  vest?: string;
  /** short shoulder cape */
  cape?: string;
  /** ribbon bow at the collar */
  bow?: string;
  /** buttons down the front */
  buttons?: string;
  /** skirt length: long (mid-calf, default), mid (just under the knee), short (above the knee) */
  skirt?: "long" | "mid" | "short";
  /** open-front overskirt in this ramp, layered over the skirt */
  overskirt?: string;
  /** jacket over the top: a cropped bolero for women, a tailed coat for men; open down the front */
  jacket?: string;
  /** white petticoat frill under the skirt hem */
  frill?: boolean;
  footwear?: "boots" | "shoes" | "clogs" | "wraps";
  legs?: "tucked" | "straight" | "breeches";
  /** stockings */
  hose?: string;
  /** false: low shoes instead of cuffed boots (same as footwear: 'shoes') */
  boots?: boolean;
}

export type Item = "hammer" | "bucket" | "broom" | "axe" | "hoe" | "basket" | "cloth" | "peel" | "staff" | "sack" | "spear" | "sword" | "greatsword" | "mace" | "halberd" | "battleaxe" | null;
