import { hexToRgb as hex } from "../../../lib/graphics/hex-to-rgb"
import { hexes } from "#/world/art/items/hexes"
import { k } from "#/world/art/items/palette"

const BLOB = [
  "................",
  "................",
  "................",
  "................",
  ".......kk.......",
  ".....kkhhkk.....",
  "....khhmmmmk....",
  "...khwhmmmmsk...",
  "...khhmmmmmsk...",
  "..khmmmmmmmmsk..",
  "..kmmmmmmmmssk..",
  "..kmmmmmmmsssk..",
  "...kssssssssk...",
  "....kkkkkkkk....",
  "................",
  "................",
]

const CRYSTAL = [
  "................",
  ".......kk.......",
  "......khmk......",
  ".....khwmsk.....",
  ".....khmmsk.....",
  "....khwmmssk....",
  "....khmmmssk....",
  "....khmmmssk....",
  "...kkhmmmsskk...",
  "..khkkmmmskksk..",
  "..khmkmmsksssk..",
  "...kmmkkkkssk...",
  "....kkkkkkkk....",
  "................",
  "................",
  "................",
]

const FUR = [
  "................",
  "................",
  "...kkkkkkkkkk...",
  "..khhmmhmmmmsk..",
  ".khmmmmmmhmmmsk.",
  ".kmmhmmmmmmmmsk.",
  "..kmmmmhmmmmsk..",
  "..kmmmmmmmhmsk..",
  ".khmmhmmmmmmmsk.",
  ".kmmmmmmmhmmssk.",
  "..ksmmmmmmmssk..",
  "...kkkskkskkk...",
  "................",
  "................",
  "................",
  "................",
]

const FANG = [
  "................",
  "................",
  "...kkkk.........",
  "..khhmmkk.......",
  "..khmmmmmkk.....",
  "...kmmmmmmmk....",
  "....kkmmmmmsk...",
  "......kmmmmsk...",
  ".......kmmmsk...",
  "........kmmsk...",
  "........kmssk...",
  ".........kssk...",
  ".........ksk....",
  "..........k.....",
  "................",
  "................",
]

const FEATHER = [
  "................",
  "............kk..",
  "..........kkhk..",
  ".........khmmk..",
  "........khmmsk..",
  ".......khmmsk...",
  "......khmmsk....",
  ".....khmmsk.....",
  "....khmmsk......",
  "...khmmsk.......",
  "...kmmsk........",
  "..kbksk.........",
  ".kbk.k..........",
  ".kk.............",
  "................",
  "................",
]

const SHELL = [
  "................",
  "................",
  "................",
  "......kkkk......",
  "....kkhmmmkk....",
  "...khmkmmksmk...",
  "..khmmkmmksmmk..",
  "..kmmmkmmksmsk..",
  ".khmmmkmmksmssk.",
  ".kmmmkmmmmksssk.",
  ".kkkkkkkkkkkkkk.",
  "................",
  "................",
  "................",
  "................",
  "................",
]

const BONE = [
  "................",
  "................",
  "..kk............",
  ".khmk...........",
  ".kmmmk..........",
  "..kmmmk.........",
  "...kmmmk........",
  "....kmmmk.......",
  ".....kmmmk......",
  "......kmmmk.....",
  ".......kmmmk.kk.",
  "........kmmmkhmk",
  ".........kmmmmsk",
  "..........kmssk.",
  "...........kkk..",
  "................",
]

const COG = [
  "................",
  "......kkkk......",
  "...kk.kmmk.kk...",
  "..khmkkmmkkmsk..",
  "..kmmmmmmmmmsk..",
  "...kmmkkkkmmk...",
  ".kkkmk....kmkkk.",
  ".khmmk....kmmsk.",
  ".kmmmk....kmssk.",
  ".kkkmk....kskkk.",
  "...kmmkkkkmsk...",
  "..kmmmmmmmsssk..",
  "..kssk.kssk.ssk.",
  "...kk..kkkk.kk..",
  "................",
  "................",
]

const SCRAP = [
  "................",
  "................",
  "................",
  "....kk..........",
  "...khmk...kk....",
  "..khmmmkkkhmk...",
  "..kmmssmmmmmsk..",
  "...kmssmmmmsk...",
  "...kmmmmsmmsk...",
  "..khmmmmmssmk...",
  "..kmmmssmmmsk...",
  "...kkmmmmmsk....",
  ".....kkkkkk.....",
  "................",
  "................",
  "................",
]

const THREAD = [
  "................",
  "................",
  "................",
  ".....kkkkkk.....",
  "....khhhmmmk....",
  "...khmmhmmmsk...",
  "...khmhmmhmsk...",
  "...kmhmmhmmsk...",
  "...kmmhmmhssk...",
  "...kmmmhmmssk...",
  "....kmmmmssk.k..",
  ".....kkkkkk.kmk.",
  "............kk..",
  "................",
  "................",
  "................",
]

const GLOW = hexes("#e8ffff", "#8fd0e0", "#3a6a88")

const crystalWhite = { k, w: hex("#ffffff"), ...hexes("#f4f8ff", "#c8d4f0", "#6a7aa8") }

export { BLOB, CRYSTAL, FUR, FANG, FEATHER, SHELL, BONE, COG, SCRAP, THREAD, GLOW, crystalWhite }

/** A flattened hide, distinct from loose fleece; the dark edge becomes the leather rim. */
export const HIDE = [
  "................",
  ".....kkkkkk.....",
  "..kkkhhhhmmkkk..",
  ".khhhhhhhmmmmsk.",
  "..khhhmmmmmskk..",
  "...khhmmmmmsk...",
  "...khhmmmmmsk...",
  "..khhmmmmmmssk..",
  "..khmmmmmmmssk..",
  "..khmmmmmmsssk..",
  "...kmmmmmmssk...",
  "...kmmmmmmssk...",
  "..kkmmmmmmsskk..",
  ".kmmmkkkkkksssk.",
  "..kkk......kkk..",
  "................",
]
