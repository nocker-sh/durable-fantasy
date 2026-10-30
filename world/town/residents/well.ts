import type { Resident } from "../resident"

const residents = {
  リーゼル: {
    name: "リーゼル",
    job: "水汲み",
    at: "well",
    item: null,
    look: {
      skirt: "mid",
      jacket: "cBlue",
      footwear: "clogs",
      top: "cSky",
      bodice: "cCream",
      frill: true,
      bow: "cRose",
      trim: "cBlue",
      sex: "f",
      skin: "skin2",
      hair: "hRed",
      style: "braid",
      eye: "cGreen",
    },
  },
  ヘレナ: {
    name: "ヘレナ",
    job: "繕い物",
    at: "s2b",
    item: "basket",
    look: { shoes: "leatherR", top: "cSky", apron: "cCream", frill: true, bow: "cRose", trim: "cBlue", sex: "f", skin: "skin2", hair: "hBrown", style: "pony", eye: "cGreen" },
  },
} satisfies Record<string, Resident>

export { residents }
