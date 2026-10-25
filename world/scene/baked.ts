// Residents' sprites baked ahead of time (scripts/bake-sprites.ts): one strip per resident × anim
// × view, in the map's sprite directory (MapDefinition.assets.sprites), with this manifest.

/** sprites.json: which resident looks the strips were baked from. */
export interface SpriteManifest {
  frame: [number, number];
  residents: { name: string; key: string; anims: Record<string, number> }[];
}

export const stripFile = (resident: number, anim: string, view: number) => `${resident}-${anim}-${view}.webp`;
