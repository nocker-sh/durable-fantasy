import { DataTexture, LinearFilter, RedFormat, UnsignedByteType } from "three"
import { N, WATER_Y } from "#/world/maps/ground/rules"

/** How deep the water reads as fully deep, in world units below the surface. */
const FULL_DEPTH = 0.6

/**
 * How deep the water stands over each part of the map, from the ground's height: 0 at the shore
 * (or on dry land) to 255 where it is deep. The water's shader shallows its colour and draws the
 * foam and the ripples along the shore from it.
 */
export function createWaterDepthTexture(heightAt: (x: number, z: number) => number, perTile = 4): DataTexture {
  const side = N * perTile
  const data = new Uint8Array(side * side)
  for (let j = 0; j < side; j++)
    for (let i = 0; i < side; i++) {
      const depth = WATER_Y - heightAt((i + 0.5) / perTile, (j + 0.5) / perTile)
      data[j * side + i] = Math.round(Math.max(0, Math.min(1, depth / FULL_DEPTH)) * 255)
    }
  const texture = new DataTexture(data, side, side, RedFormat, UnsignedByteType)
  texture.magFilter = LinearFilter
  texture.minFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}
