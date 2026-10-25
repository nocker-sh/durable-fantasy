import * as THREE from "three";
export interface DioramaSettings {
  enabled: boolean;
  start: number;
  falloff: number;
  strength: number;
  saturation: number;
  contrast: number;
}
function createState() {
  const rtOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true };
  const rtScene = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const rtBlur = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });
  const blur = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      src: { value: null },
      texel: { value: new THREE.Vector2() },
      dir: { value: new THREE.Vector2(1, 0) },
      start: { value: 0 },
      falloff: { value: 0 },
      radius: { value: 0 },
      grade: { value: 0 },
      saturation: { value: 1 },
      contrast: { value: 1 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform sampler2D src; uniform vec2 texel, dir;
      uniform float start, falloff, radius, grade, saturation, contrast;
      varying vec2 vUv;
      void main(){
        float k = smoothstep(start, start + falloff, length((vUv - 0.5) * 2.0)) * radius / 6.0;
        vec4 c = vec4(0.0); float sum = 0.0;
        for (int i = -6; i <= 6; i++) {
          float x = float(i), w = exp(-x * x / 18.0);
          c += texture2D(src, vUv + dir * texel * x * k) * w; sum += w;
        }
        c /= sum;
        if (grade > 0.5) {
          float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
          c.rgb = max(vec3(0.0), (mix(vec3(l), c.rgb, saturation) - 0.18) * contrast + 0.18);
        }
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,
  });
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { rtScene, rtBlur, blur, postScene, postCam };
}
export class DioramaPostProcessing {
  private readonly state = createState();
  constructor(private readonly renderer: THREE.WebGLRenderer) {}
  render(scene: THREE.Scene, cam: THREE.Camera, diorama: DioramaSettings, renderScale: number) {
    const { rtScene, rtBlur, blur, postScene, postCam } = this.state;
    const renderer = this.renderer;
    if (!diorama.enabled) {
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
      return;
    }
    renderer.setRenderTarget(rtScene);
    renderer.render(scene, cam);
    const u = blur.uniforms;
    u.texel.value.set(1 / rtScene.width, 1 / rtScene.height);
    u.start.value = diorama.start;
    u.falloff.value = diorama.falloff;
    u.radius.value = diorama.strength / renderScale;
    u.saturation.value = diorama.saturation;
    u.contrast.value = diorama.contrast;
    u.src.value = rtScene.texture;
    u.dir.value.set(1, 0);
    u.grade.value = 0;
    renderer.setRenderTarget(rtBlur);
    renderer.render(postScene, postCam);
    u.src.value = rtBlur.texture;
    u.dir.value.set(0, 1);
    u.grade.value = 1;
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  }
  resize(width: number, height: number) {
    this.state.rtScene.setSize(width, height);
    this.state.rtBlur.setSize(width, height);
  }
  dispose() {
    this.state.rtScene.dispose();
    this.state.rtBlur.dispose();
    this.state.blur.dispose();
    for (const mesh of this.state.postScene.children) (mesh as THREE.Mesh).geometry.dispose();
  }
}
