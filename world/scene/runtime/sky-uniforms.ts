/**
 * Uniforms shared by the ground and the water of the current scene: the clock that drives the
 * cloud shadows, how strongly they fall (none at night, when there is no sun to cast them) and how
 * much sun there is to break through the haze in beams (0 at night, 1 at noon).
 * One scene is built at a time, so the shaders of that scene all read the same values.
 */
export const skyUniforms = { cloudTime: { value: 0 }, cloud: { value: 0 }, sun: { value: 0 } }
