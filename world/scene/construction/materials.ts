import * as THREE from "three";
import { mat, toTex, colorMat } from "../gfx";
import { PixBuf, pick, hash2 } from "../pix";
import { stoneTex, woodTex, roofTex, thatchTex, leafTex, plainTex, rockTex } from "../textures";

// ---------------------------------------------------------------- materials
const M = {
  stone: mat(stoneTex("stone", 0.55, 1)),
  stoneDark: mat(stoneTex("stone", 0.38, 2)),
  rock: mat(rockTex("stone", 0.55, 3)),
  rockDark: mat(rockTex("stone", 0.38, 4)),
  ashlar: mat(stoneTex("sand", 0.62, 3, 26, 12)),
  wood: mat(woodTex(0.55, 9, 2)),
  woodV: mat(woodTex(0.5, 9, 5, 64, true)),
  woodDark: mat(woodTex(0.32, 9, 6)),
  roof: mat(roofTex("roof", 0.6, 3), { side: THREE.DoubleSide }),
  roof2: mat(roofTex("roof2", 0.6, 4), { side: THREE.DoubleSide }),
  slate: mat(roofTex("slate", 0.58, 5), { side: THREE.DoubleSide }),
  thatch: mat(thatchTex(4), { side: THREE.DoubleSide }),
  leaf: mat(leafTex("leaf", 5)),
  leaf2: mat(leafTex("leaf2", 6)),
  autumn: mat(leafTex("autumn", 7)),
  iron: mat(plainTex("iron", 0.45, 0.2, 3)),
  plaster: mat(plainTex("plaster", 0.7, 0.12, 4)),
  hay: mat(thatchTex(9), {}),
  linen: mat(plainTex("cLinen", 0.7, 0.15, 5), { side: THREE.DoubleSide }),
  sack: mat(plainTex("sand", 0.62, 0.25, 8)),
  water: new THREE.MeshLambertMaterial({ color: 0x2c4a66 }),
  dark: colorMat(0x1a141c),
  rope: colorMat(0x8a7a5a),
  wool: mat(plainTex("wool", 0.7, 0.35, 11)),
  pig: mat(plainTex("pig", 0.6, 0.12, 12)),
};

const coalBuf = new PixBuf(16, 16);

coalBuf.fill((x, y) => pick("fire", 0.3 + hash2(x, y, 3) * 0.7, x, y));

const coalMat = new THREE.MeshBasicMaterial({ map: toTex(coalBuf) });

export { M, coalMat };
