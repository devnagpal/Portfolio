import * as THREE from 'three';

// -------------------------------------------------------------
// 1. Approved Final Stage 1 Baseline Configuration (LOCKED)
// -------------------------------------------------------------
export const CONFIG = {
  // Image Registration
  cyberOffsetX: -0.004,
  cyberOffsetY: -0.029,
  cyberScale: 1.082,
  cyberRotation: 0.0,

  // Fluid Wake Dynamics
  fluidDecay: 0.946,
  fluidAdvection: 0.15,
  fluidViscosity: 0.32,
  fluidMomentum: 1.6,
  fluidStrength: 1.6,
  fluidRadius: 0.06,
  speedThreshold: 0.00005,
  pointerSmoothing: 0.44,

  // Optics & Cyber Reveal
  distortionStrength: 0.0,
  chromaticAberration: 0.0,
  revealStrength: 1.25,
  revealHardness: 0.55,

  // Embedded Gradient Map
  gradientIntensity: 0.8,
  gradientMix: 0.5,
  gradientPhase: 0.0,
};

// -------------------------------------------------------------
// 2. Setup Three.js Unified WebGL Renderer (Pinned Viewport)
// -------------------------------------------------------------
const container = document.getElementById('canvas-container');

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const scene = new THREE.Scene();
const geometry = new THREE.PlaneGeometry(2, 2);

// Ping-Pong FBOs for Stage 1 GPU Fluid Simulation
let rtA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.HalfFloatType,
  depthBuffer: false,
  stencilBuffer: false,
});
let rtB = rtA.clone();

// -------------------------------------------------------------
// 3. Stage 1 GPU Fluid Simulation Shaders
// -------------------------------------------------------------
const fluidVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const fluidFragmentShader = `
uniform sampler2D tFluid;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform float uAspect;
uniform float uDecay;
uniform float uAdvection;
uniform float uViscosity;
uniform float uMomentum;
uniform float uStrength;
uniform float uRadius;
uniform float uSpeedThreshold;
uniform vec2 uTexelSize;
uniform float uStage1Active; // 1.0 when at top, fades out when scrolling

varying vec2 vUv;

float sdSegment( in vec2 p, in vec2 a, in vec2 b ) {
    vec2 pa = p - a, ba = b - a;
    float d2 = dot(ba, ba);
    if (d2 < 0.0000001) return length(pa);
    float h = clamp(dot(pa, ba) / d2, 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    // 1. Advection
    vec4 current = texture2D(tFluid, vUv);
    vec2 vel = current.rg;
    
    vec2 uvAdvected = vUv - vel * uTexelSize * 70.0 * uAdvection;
    vec4 advected = texture2D(tFluid, uvAdvected);
    
    // 2. Viscous Diffusion
    vec4 nUp    = texture2D(tFluid, uvAdvected + vec2(0.0, uTexelSize.y));
    vec4 nDown  = texture2D(tFluid, uvAdvected - vec2(0.0, uTexelSize.y));
    vec4 nLeft  = texture2D(tFluid, uvAdvected - vec2(uTexelSize.x, 0.0));
    vec4 nRight = texture2D(tFluid, uvAdvected + vec2(uTexelSize.x, 0.0));
    vec4 diffused = mix(advected, (nUp + nDown + nLeft + nRight) * 0.25, uViscosity);
    
    // 3. Natural Dissipation (faster decay if scrolling away)
    float activeDecay = mix(0.85, uDecay, uStage1Active);
    vel = diffused.rg * activeDecay;
    float density = diffused.b * activeDecay;
    
    // 4. Pointer Interaction Injection (active when at resting state)
    vec2 p = vUv * vec2(uAspect, 1.0);
    vec2 m = uMouse * vec2(uAspect, 1.0);
    vec2 pm = uPrevMouse * vec2(uAspect, 1.0);
    
    float segDist = sdSegment(p, pm, m);
    vec2 delta = m - pm;
    float speed = length(delta);
    
    if (speed > uSpeedThreshold && uMouse.x > -1.0 && uMouse.x < 2.0 && uStage1Active > 0.05) {
        float inject = exp(- (segDist * segDist) / (2.0 * uRadius * uRadius * 0.35));
        
        vec2 dir = normalize(delta);
        vel += dir * speed * 40.0 * uMomentum * inject * uStage1Active;
        
        float speedMod = smoothstep(uSpeedThreshold, 0.012, speed);
        density = clamp(density + inject * uStrength * speedMod * uStage1Active, 0.0, 1.0);
    }
    
    gl_FragColor = vec4(vel, density, 1.0);
}
`;

const fluidMaterial = new THREE.ShaderMaterial({
  vertexShader: fluidVertexShader,
  fragmentShader: fluidFragmentShader,
  uniforms: {
    tFluid: { value: null },
    uMouse: { value: new THREE.Vector2(-10, -10) },
    uPrevMouse: { value: new THREE.Vector2(-10, -10) },
    uAspect: { value: window.innerWidth / window.innerHeight },
    uDecay: { value: CONFIG.fluidDecay },
    uAdvection: { value: CONFIG.fluidAdvection },
    uViscosity: { value: CONFIG.fluidViscosity },
    uMomentum: { value: CONFIG.fluidMomentum },
    uStrength: { value: CONFIG.fluidStrength },
    uRadius: { value: CONFIG.fluidRadius },
    uSpeedThreshold: { value: CONFIG.speedThreshold },
    uTexelSize: { value: new THREE.Vector2(1 / window.innerWidth, 1 / window.innerHeight) },
    uStage1Active: { value: 1.0 }
  },
  depthWrite: false,
  depthTest: false
});

const fluidMesh = new THREE.Mesh(geometry, fluidMaterial);
const fluidScene = new THREE.Scene();
fluidScene.add(fluidMesh);

// -------------------------------------------------------------
// 4. Unified Final Composite Shader (Stage 1 + Stage 2 Sequence)
// -------------------------------------------------------------
const finalVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const finalFragmentShader = `
uniform sampler2D tOriginal;
uniform sampler2D tCyber;
uniform sampler2D tFluid;
uniform sampler2D tSequence;
uniform vec4 uResolution;
uniform vec2 uTexelSize;
uniform float uTransition; // 0.0 = 100% Stage 1, 1.0 = 100% Stage 2 Frame sequence

// Spatial Registration
uniform vec2 uCyberOffset;
uniform float uCyberScale;
uniform float uCyberRotation;

// Optics & Physics
uniform float uDistortionStrength;
uniform float uChromaticAberration;
uniform float uRevealStrength;
uniform float uRevealHardness;

// Gradient Map
uniform float uGradientIntensity;
uniform float uGradientMix;
uniform float uGradientPhase;

varying vec2 vUv;

// Cybernetic 4-Stop Color Ramp
vec3 cyberGradientMap(float t) {
    t = clamp(t + uGradientPhase, 0.0, 1.0);
    vec3 c0 = vec3(0.05, 0.02, 0.10);
    vec3 c1 = vec3(0.52, 0.14, 0.95);
    vec3 c2 = vec3(0.24, 0.76, 0.98);
    vec3 c3 = vec3(0.96, 0.99, 1.00);
    
    if (t < 0.33) {
        return mix(c0, c1, t / 0.33);
    } else if (t < 0.75) {
        return mix(c1, c2, (t - 0.33) / 0.42);
    } else {
        return mix(c2, c3, (t - 0.75) / 0.25);
    }
}

void main() {
    // 1. Shared Base UV Coordinates (Preserves exact 16:9 composition)
    vec2 uvOrig = (vUv - 0.5) * uResolution.zw + 0.5;
    
    // 2. Transformed Cyber UV Coordinates (Spatially Registered)
    vec2 uvCyber = (uvOrig - 0.5 - uCyberOffset) / uCyberScale + 0.5;
    if (abs(uCyberRotation) > 0.00001) {
        float s = sin(uCyberRotation);
        float c = cos(uCyberRotation);
        uvCyber = mat2(c, -s, s, c) * (uvCyber - 0.5) + 0.5;
    }
    
    // 3. Sample Stage 1 Fluid Simulation State
    vec4 fluid = texture2D(tFluid, vUv);
    vec2 vel = fluid.rg;
    float density = fluid.b;
    
    float dRight = texture2D(tFluid, vUv + vec2(uTexelSize.x * 2.0, 0.0)).b;
    float dUp    = texture2D(tFluid, vUv + vec2(0.0, uTexelSize.y * 2.0)).b;
    vec2 densityGrad = vec2(dRight - density, dUp - density);
    vec2 disp = (vel * 0.035 + densityGrad * 0.4) * uDistortionStrength;
    
    vec2 dispR = disp * (1.0 + uChromaticAberration * 25.0);
    vec2 dispG = disp;
    vec2 dispB = disp * (1.0 - uChromaticAberration * 25.0);
    
    // Sample Stage 1 Original Portrait
    vec3 origCol;
    origCol.r = texture2D(tOriginal, uvOrig + dispR).r;
    origCol.g = texture2D(tOriginal, uvOrig + dispG).g;
    origCol.b = texture2D(tOriginal, uvOrig + dispB).b;
    
    // Sample Stage 1 Cyber Portrait
    vec3 cyberCol;
    cyberCol.r = texture2D(tCyber, uvCyber + dispR).r;
    cyberCol.g = texture2D(tCyber, uvCyber + dispG).g;
    cyberCol.b = texture2D(tCyber, uvCyber + dispB).b;
    
    float reveal = smoothstep(0.0, uRevealHardness, density * uRevealStrength);
    vec3 stage1Blended = mix(origCol, cyberCol, reveal);
    
    if (uGradientIntensity > 0.001) {
        float disturbanceEnergy = length(vel) * 0.5 + density;
        float lum = dot(stage1Blended, vec3(0.299, 0.587, 0.114));
        vec3 gradColor = cyberGradientMap(clamp(lum * 0.75 + disturbanceEnergy * 0.6, 0.0, 1.0));
        
        float gradWeight = smoothstep(0.015, 0.6, disturbanceEnergy) * uGradientIntensity;
        stage1Blended = mix(stage1Blended, stage1Blended * gradColor * 2.2, gradWeight * uGradientMix);
    }
    
    // 4. Sample Stage 2 Frame Sequence (Pure frames, identical 16:9 framing)
    vec3 stage2Col = texture2D(tSequence, uvOrig).rgb;
    
    // 5. Seamless Transition Blend
    // When uTransition == 0.0: Pure Stage 1 interactive mode
    // When uTransition == 1.0: Pure Stage 2 scroll-driven sequence
    vec3 finalColor = mix(stage1Blended, stage2Col, smoothstep(0.0, 1.0, uTransition));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Dynamic Sequence Texture for Stage 2
const sequenceTexture = new THREE.Texture();
sequenceTexture.wrapS = THREE.ClampToEdgeWrapping;
sequenceTexture.wrapT = THREE.ClampToEdgeWrapping;
sequenceTexture.minFilter = THREE.LinearFilter;
sequenceTexture.magFilter = THREE.LinearFilter;
sequenceTexture.generateMipmaps = false;

const finalMaterial = new THREE.ShaderMaterial({
  vertexShader: finalVertexShader,
  fragmentShader: finalFragmentShader,
  uniforms: {
    tOriginal: { value: null },
    tCyber: { value: null },
    tFluid: { value: null },
    tSequence: { value: sequenceTexture },
    uTransition: { value: 0.0 },
    uResolution: { value: new THREE.Vector4(1, 1, 1, 1) },
    uTexelSize: { value: new THREE.Vector2(1 / window.innerWidth, 1 / window.innerHeight) },
    uCyberOffset: { value: new THREE.Vector2(CONFIG.cyberOffsetX, CONFIG.cyberOffsetY) },
    uCyberScale: { value: CONFIG.cyberScale },
    uCyberRotation: { value: CONFIG.cyberRotation },
    uDistortionStrength: { value: CONFIG.distortionStrength },
    uChromaticAberration: { value: CONFIG.chromaticAberration },
    uRevealStrength: { value: CONFIG.revealStrength },
    uRevealHardness: { value: CONFIG.revealHardness },
    uGradientIntensity: { value: CONFIG.gradientIntensity },
    uGradientMix: { value: CONFIG.gradientMix },
    uGradientPhase: { value: CONFIG.gradientPhase },
  },
  depthWrite: false,
  depthTest: false
});

const finalMesh = new THREE.Mesh(geometry, finalMaterial);
scene.add(finalMesh);

// -------------------------------------------------------------
// 5. Memory-Conscious Sliding Window Frame Manager (Stage 2)
// -------------------------------------------------------------
const TOTAL_FRAMES = 300;
const MAX_CACHE_SIZE = 35; // Controlled memory limit (~280MB max bitmap footprint)
const frameCache = new Map(); // frameIndex -> HTMLImageElement
let lastLoadedFrame = null;
let currentFrameIndex = 1;

function getFrameUrl(index) {
  const num = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${num}.jpg`;
}

function loadFrameImage(index) {
  if (frameCache.has(index)) {
    return frameCache.get(index);
  }
  
  const img = new Image();
  img.src = getFrameUrl(index);
  img.onload = () => {
    img._loaded = true;
  };
  frameCache.set(index, img);
  return img;
}

// Memory Eviction: Prune frames furthest from active playhead
function pruneCache(centerIndex) {
  if (frameCache.size <= MAX_CACHE_SIZE) return;
  
  const entries = Array.from(frameCache.keys()).sort((a, b) => {
    return Math.abs(b - centerIndex) - Math.abs(a - centerIndex);
  });
  
  while (frameCache.size > MAX_CACHE_SIZE && entries.length > 0) {
    const evictIdx = entries.shift();
    // Keep frame 1 always anchored
    if (evictIdx !== 1) {
      const img = frameCache.get(evictIdx);
      if (img) img.src = '';
      frameCache.delete(evictIdx);
    }
  }
}

// Preload priority window around active scroll position
function updatePreloadWindow(targetIndex, scrollDirection) {
  // Preload immediate neighborhood
  const forwardAhead = scrollDirection >= 0 ? 25 : 10;
  const backwardAhead = scrollDirection <= 0 ? 20 : 8;
  
  const start = Math.max(1, targetIndex - backwardAhead);
  const end = Math.min(TOTAL_FRAMES, targetIndex + forwardAhead);
  
  for (let i = start; i <= end; i++) {
    loadFrameImage(i);
  }
  
  pruneCache(targetIndex);
}

// Find nearest already-loaded neighbor to prevent any black/blank frames
function getNearestAvailableFrame(targetIndex) {
  const exact = frameCache.get(targetIndex);
  if (exact && exact._loaded && exact.naturalWidth > 0) {
    return exact;
  }
  
  // Search outward for closest loaded frame
  for (let radius = 1; radius < 40; radius++) {
    const left = frameCache.get(targetIndex - radius);
    if (left && left._loaded && left.naturalWidth > 0) return left;
    const right = frameCache.get(targetIndex + radius);
    if (right && right._loaded && right.naturalWidth > 0) return right;
  }
  
  return lastLoadedFrame || frameCache.get(1);
}

// Preload Frame 1 immediately
const frame1 = loadFrameImage(1);
frame1.onload = () => {
  frame1._loaded = true;
  lastLoadedFrame = frame1;
  sequenceTexture.image = frame1;
  sequenceTexture.needsUpdate = true;
};

// -------------------------------------------------------------
// 6. Asset Loading & Texture Management (Stage 1)
// -------------------------------------------------------------
const textureLoader = new THREE.TextureLoader();
let originalTex, cyberTex;

function setupTexture(tex) {
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  rtA.setSize(w, h);
  rtB.setSize(w, h);
  
  fluidMaterial.uniforms.uAspect.value = w / h;
  fluidMaterial.uniforms.uTexelSize.value.set(1 / w, 1 / h);
  finalMaterial.uniforms.uTexelSize.value.set(1 / w, 1 / h);
  
  // Clean 16:9 aspect ratio mapping consistent across all frames and portraits
  const imgAspect = 1920 / 1080;
  const screenAspect = w / h;
  
  let a1, a2;
  if (screenAspect > imgAspect) {
    a1 = 1.0;
    a2 = imgAspect / screenAspect;
  } else {
    a1 = screenAspect / imgAspect;
    a2 = 1.0;
  }
  finalMaterial.uniforms.uResolution.value.set(w, h, a1, a2);
}

window.addEventListener('resize', resize);

Promise.all([
  new Promise(res => textureLoader.load('/original.jpg', (tex) => { setupTexture(tex); res(tex); })),
  new Promise(res => textureLoader.load('/cyber.jpg', (tex) => { setupTexture(tex); res(tex); }))
]).then(([orig, cyber]) => {
  originalTex = orig;
  cyberTex = cyber;
  finalMaterial.uniforms.tOriginal.value = orig;
  finalMaterial.uniforms.tCyber.value = cyber;
  resize();
});

// -------------------------------------------------------------
// 7. Interactive Pointer & Scroll Tracking
// -------------------------------------------------------------
const mouse = new THREE.Vector2(-10, -10);
const targetMouse = new THREE.Vector2(-10, -10);

window.addEventListener('mousemove', (e) => {
  targetMouse.x = e.clientX / window.innerWidth;
  targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
});

window.addEventListener('mouseleave', () => {
  targetMouse.set(-10, -10);
});

// Scroll Timeline State
let rawScrollProgress = 0.0;
let smoothScrollProgress = 0.0;
let lastScrollProgress = 0.0;

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    rawScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0.0), 1.0);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// -------------------------------------------------------------
// 8. High-Performance Coordinated Render Loop
// -------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  
  // 1. Smooth Scroll Interpolation (Lerp for cinematic frame scrubbing)
  smoothScrollProgress += (rawScrollProgress - smoothScrollProgress) * 0.12;
  const scrollDelta = smoothScrollProgress - lastScrollProgress;
  lastScrollProgress = smoothScrollProgress;
  
  // 2. Timeline Mapping & Seamless Handoff
  // [0.00 -> 0.05]: Seamless blend from Stage 1 into Frame 001
  // [0.05 -> 1.00]: Pure Stage 2 timeline progression (Frame 1 -> Frame 300)
  const handoffRange = 0.05;
  let transitionVal = 0.0;
  let targetFrame = 1;
  
  if (smoothScrollProgress <= 0.0001) {
    transitionVal = 0.0;
    targetFrame = 1;
  } else if (smoothScrollProgress < handoffRange) {
    transitionVal = smoothScrollProgress / handoffRange;
    targetFrame = 1;
  } else {
    transitionVal = 1.0;
    const seqProg = (smoothScrollProgress - handoffRange) / (1.0 - handoffRange);
    targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + seqProg * (TOTAL_FRAMES - 1))));
  }
  
  // Update Shader Uniforms
  finalMaterial.uniforms.uTransition.value = transitionVal;
  fluidMaterial.uniforms.uStage1Active.value = Math.max(0.0, 1.0 - transitionVal * 1.5);
  
  // 3. Stage 2 Frame Texture Update
  if (transitionVal > 0.0 || smoothScrollProgress > 0.0) {
    updatePreloadWindow(targetFrame, Math.sign(scrollDelta));
    const activeImg = getNearestAvailableFrame(targetFrame);
    if (activeImg && activeImg._loaded && sequenceTexture.image !== activeImg) {
      sequenceTexture.image = activeImg;
      sequenceTexture.needsUpdate = true;
      lastLoadedFrame = activeImg;
    }
  }
  
  // 4. Smooth Pointer Tracking with Inertia
  fluidMaterial.uniforms.uPrevMouse.value.copy(mouse);
  mouse.lerp(targetMouse, CONFIG.pointerSmoothing);
  fluidMaterial.uniforms.uMouse.value.copy(mouse);
  
  // 5. GPU Fluid Simulation Pass (Render to rtB)
  fluidMaterial.uniforms.tFluid.value = rtA.texture;
  renderer.setRenderTarget(rtB);
  renderer.render(fluidScene, camera);
  
  // 6. Ping-Pong Buffer Swap
  const temp = rtA;
  rtA = rtB;
  rtB = temp;
  
  // 7. Final Unified Scene Render (Render to Screen)
  finalMaterial.uniforms.tFluid.value = rtA.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();
