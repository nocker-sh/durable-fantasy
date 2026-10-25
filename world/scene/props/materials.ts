import * as THREE from "three";
import { colorMat } from "../gfx";
import { groundH } from "../world";

const ash = colorMat(0x9a968e),
  ashDark = colorMat(0x7a766e);

const clay = colorMat(0x9a5a3a),
  clayDark = colorMat(0x6a3a2a);

const straw = colorMat(0xb8984a),
  wicker = colorMat(0x8a6a3a);

const furGrey = colorMat(0x6a6460),
  furGinger = colorMat(0xb87a3a),
  furBlack = colorMat(0x2a2628);

const tin = colorMat(0x7a7e86),
  cloth = [colorMat(0x7a3a3a), colorMat(0x3a5a6a), colorMat(0x6a6a3a), colorMat(0x5a4a6a)];

const y0 = (x: number, z: number) => groundH(x, z);

let glass: THREE.MeshLambertMaterial | null = null;

/** The glass of a lantern: it glows by night with the town's lamps (glowMats). */
function lanternGlass() {
  glass ??= new THREE.MeshLambertMaterial({ color: 0xffd890, emissive: new THREE.Color(0xffb050), emissiveIntensity: 0.9 });
  return glass;
}

export { ash, ashDark, clay, clayDark, straw, wicker, furGrey, furGinger, furBlack, tin, cloth, y0, lanternGlass };
