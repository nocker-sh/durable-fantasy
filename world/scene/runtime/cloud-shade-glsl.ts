/**
 * GLSL for the shadows of the clouds drifting over the land (landscape.md「何を美しいとするか」:
 * where the ash thins and the sun breaks through, a patch of light moves over the ground). The
 * shade is snapped to the ground's pixels and stepped, with a dithered rim, so it reads as pixel
 * art rather than a soft wash. Needs the uniforms of skyUniforms.
 */
export const CLOUD_SHADE_GLSL = `
uniform float cloudTime; uniform float cloud;
float cloudHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cloudNoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(cloudHash(i),cloudHash(i+vec2(1,0)),f.x), mix(cloudHash(i+vec2(0,1)),cloudHash(i+vec2(1,1)),f.x), f.y); }
float cloudShade(vec3 wp){
  if (cloud <= 0.0) return 1.0;
  vec2 px = floor(wp.xz * 8.0);
  vec2 p = px / 8.0 * 0.075 + vec2(cloudTime * 0.018, cloudTime * 0.007);
  float c = cloudNoise(p) * 0.62 + cloudNoise(p * 2.3 + 7.1) * 0.28 + cloudNoise(p * 5.1 + 3.3) * 0.1;
  float edge = cloudHash(px) * 0.05;
  float s = c > 0.58 + edge ? 1.0 : c > 0.53 + edge ? 0.5 : 0.0;
  return 1.0 - s * cloud;
}`
