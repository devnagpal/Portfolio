import * as THREE from 'three';
import { HERO_CONTENT, ABOUT_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT, CONTACT_CONTENT, QUOTE_CONTENT } from './content.js';

// -------------------------------------------------------------
// 1. Populate Content from content.js (Hero, About, Projects)
// -------------------------------------------------------------
const greetingEl = document.getElementById('hero-greeting');
const nameEl = document.getElementById('hero-name');
const bioEl = document.getElementById('hero-bio');
const heroEditorialEl = document.getElementById('hero-editorial');

if (greetingEl && nameEl && bioEl) {
  greetingEl.textContent = HERO_CONTENT.greeting;
  nameEl.innerHTML = `<span class="name-line">${HERO_CONTENT.nameLine1}</span><span class="name-line">${HERO_CONTENT.nameLine2}</span>`;
  bioEl.textContent = HERO_CONTENT.bio;
}

const aboutHeadingEl = document.getElementById('about-heading');
const aboutLeadEl = document.getElementById('about-lead');
const aboutSubEl = document.getElementById('about-sub');

if (aboutHeadingEl && aboutLeadEl && aboutSubEl) {
  aboutHeadingEl.textContent = ABOUT_CONTENT.heading;
  aboutLeadEl.textContent = ABOUT_CONTENT.leadText;
  aboutSubEl.textContent = ABOUT_CONTENT.subText;
}

const projectsHeadingEl = document.getElementById('projects-heading');
const projectsGridEl = document.getElementById('projects-grid');

if (projectsHeadingEl && projectsGridEl) {
  projectsHeadingEl.textContent = PROJECTS_CONTENT.heading;

  const ICONS = {
    github: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    external: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
  };

  projectsGridEl.innerHTML = PROJECTS_CONTENT.items.map(project => {
    const tagsHtml = project.tags && project.tags.length > 0
      ? `<div class="project-tags">${project.tags.map(tag => `<span class="project-tag ${tag.toLowerCase() === '+more' ? 'tag-more' : ''}">${tag}</span>`).join('')}</div>`
      : '';

    const linksHtml = project.links && project.links.length > 0
      ? `<div class="project-links">${project.links.map(link => {
          const iconSvg = ICONS[link.icon] || ICONS.external;
          return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="project-link-icon" aria-label="${link.label}" title="${link.label}">${iconSvg}</a>`;
        }).join('')}</div>`
      : '';

    const imageHtml = project.image
      ? `<div class="project-image"><img src="${project.image}" alt="${project.title} preview" loading="lazy" /></div>`
      : '';

    return `
      <article class="project-card">
        <div class="project-card-main">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          ${imageHtml}
        </div>
        <div class="project-card-footer">
          ${tagsHtml}
          ${linksHtml}
        </div>
      </article>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 1b. Populate Skills Section (Cluster pattern matching sketch)
// -------------------------------------------------------------
const skillsFieldEl = document.getElementById('skills-field');

if (skillsFieldEl && SKILLS_CONTENT) {
  // Flatten all skills from all categories into one array
  const allSkills = SKILLS_CONTENT.categories.flatMap(cat => cat.skills);

  // Chunk skills into the sketch row pattern: [2, 2, 3, 2, 2] repeating
  const ROW_PATTERN = [2, 2, 3, 2, 2];
  let skillIdx = 0;
  let rowIdx = 0;
  let html = '';

  while (skillIdx < allSkills.length) {
    const count = ROW_PATTERN[rowIdx % ROW_PATTERN.length];
    const rowSkills = allSkills.slice(skillIdx, skillIdx + count);
    skillIdx += count;
    rowIdx++;

    let rowInnerHtml = '';
    for (const skill of rowSkills) {
      let iconHtml = '';
      if (skill.icon) {
        if (skill.icon.trim().startsWith('<svg')) {
          iconHtml = `<span class="skill-icon-wrap" aria-hidden="true">${skill.icon}</span>`;
        } else {
          iconHtml = `<img class="skill-icon" src="${skill.icon}" alt="" aria-hidden="true" loading="lazy">`;
        }
      }
      rowInnerHtml += `<span class="skill-chip" data-skill="${skill.name}">${iconHtml}<span>${skill.name}</span></span>`;
    }

    const rowClassNum = ((rowIdx - 1) % 5) + 1;
    html += `<div class="skill-row skill-row-${rowClassNum}">${rowInnerHtml}</div>`;
  }

  skillsFieldEl.innerHTML = html;

  const chips = Array.from(skillsFieldEl.querySelectorAll('.skill-chip'));

  // ── Magnetic cursor interaction ──
  const MAGNET_RADIUS = 150; // px — proximity reach
  const MAGNET_MAX = 12;     // px — maximum displacement

  let rafSkills = null;
  let smx = -9999, smy = -9999;

  function tickMagnet() {
    rafSkills = null;
    chips.forEach(chip => {
      const rect = chip.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const dx = smx - cx;
      const dy = smy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNET_RADIUS && dist > 0) {
        const s = 1 - dist / MAGNET_RADIUS;
        const tx = (dx / dist) * s * MAGNET_MAX;
        const ty = (dy / dist) * s * MAGNET_MAX;
        chip.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
      } else {
        chip.style.transform = '';
      }
    });
  }

  skillsFieldEl.addEventListener('mousemove', e => {
    smx = e.clientX;
    smy = e.clientY;
    if (!rafSkills) rafSkills = requestAnimationFrame(tickMagnet);
  });

  skillsFieldEl.addEventListener('mouseleave', () => {
    smx = -9999;
    smy = -9999;
    chips.forEach(c => {
      c.style.transform = '';
    });
    skillsFieldEl.classList.remove('has-hover');
    chips.forEach(c => c.classList.remove('is-active'));
  });

  skillsFieldEl.addEventListener('mouseover', e => {
    const chip = e.target.closest('.skill-chip');
    if (!chip) return;
    skillsFieldEl.classList.add('has-hover');
    chips.forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
  });

  skillsFieldEl.addEventListener('mouseout', e => {
    const chip = e.target.closest('.skill-chip');
    if (!chip) return;
    if (!skillsFieldEl.contains(e.relatedTarget) || !e.relatedTarget?.closest('.skill-chip')) {
      skillsFieldEl.classList.remove('has-hover');
      chips.forEach(c => c.classList.remove('is-active'));
    }
  });
}

// -------------------------------------------------------------
// 1c. Populate Contact Section
// -------------------------------------------------------------
const contactHeadingEl = document.getElementById('contact-heading');
const contactLinksEl = document.getElementById('contact-links');

if (contactHeadingEl && contactLinksEl && CONTACT_CONTENT) {
  contactHeadingEl.textContent = CONTACT_CONTENT.heading;

  let html = '';
  CONTACT_CONTENT.links.forEach((link, index) => {
    let iconHtml = '';
    if (link.icon) {
      if (link.icon.trim().startsWith('<svg')) {
        iconHtml = `<span class="contact-icon-wrap" aria-hidden="true">${link.icon}</span>`;
      } else {
        iconHtml = `<img class="contact-icon-img" src="${link.icon}" alt="" aria-hidden="true" loading="lazy">`;
      }
    }
    
    html += `
      <a href="${link.url}" class="contact-link-item" data-contact="${link.label}" target="_blank" rel="noopener noreferrer" style="--stagger: ${index};">
        <span class="contact-icon">${iconHtml}</span>
        <span class="contact-label">${link.label}</span>
      </a>
    `;
  });
  contactLinksEl.innerHTML = html;

  // Magnetic hover for contact links
  const contactLinks = Array.from(contactLinksEl.querySelectorAll('.contact-link-item'));
  const MAGNET_RADIUS = 120;
  const MAGNET_MAX = 15;

  let rafContact = null;
  let cmx = -9999, cmy = -9999;

  const tickContact = () => {
    rafContact = null;
    contactLinks.forEach(link => {
      const rect = link.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const dx = cmx - cx;
      const dy = cmy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNET_RADIUS && dist > 0) {
        const s = 1 - dist / MAGNET_RADIUS;
        const tx = (dx / dist) * s * MAGNET_MAX;
        const ty = (dy / dist) * s * MAGNET_MAX;
        link.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(1.02)`;
        link.style.color = '#ffffff';
      } else {
        link.style.transform = 'translate(0px, 0px) scale(1)';
        link.style.color = '';
      }
    });
  };

  const contactSection = document.getElementById('section-contact');
  if (contactSection) {
    contactSection.addEventListener('mousemove', e => {
      cmx = e.clientX;
      cmy = e.clientY;
      if (!rafContact) rafContact = requestAnimationFrame(tickContact);
    });

    contactSection.addEventListener('mouseleave', () => {
      cmx = -9999;
      cmy = -9999;
      contactLinks.forEach(link => {
        link.style.transform = '';
        link.style.color = '';
      });
    });
  }
}



// -------------------------------------------------------------
// 2. Approved Final Stage 1 Baseline Configuration (LOCKED)
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
// 3. Setup Three.js Unified WebGL Renderer (Pinned Viewport)
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
// 4. Stage 1 GPU Fluid Simulation Shaders
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
uniform float uStage1Active;

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
    
    // 3. Natural Dissipation
    float activeDecay = mix(0.85, uDecay, uStage1Active);
    vel = diffused.rg * activeDecay;
    float density = diffused.b * activeDecay;
    
    // 4. Pointer Interaction Injection
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
// 5. Final Composite Shader (Stage 1 + Stage 2 Sequence)
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
uniform sampler2D tCutout;

uniform sampler2D tTextFilled;
uniform sampler2D tTextStroke;
uniform vec4 uTextBounds;
uniform float uHasText;

uniform sampler2D tQuoteFilled;
uniform sampler2D tQuoteOverlay;
uniform vec4 uQuoteBounds;
uniform float uQuoteFade;

uniform vec4 uResolution;
uniform vec2 uTexelSize;
uniform float uTransition;

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
    // 1. Shared Base UV Coordinates (Preserves exact 16:9 framing)
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
    cyberCol.g = texture2D(tCyber, uvCyber + dispR).g;
    cyberCol.b = texture2D(tCyber, uvCyber + dispR).b;
    
    float reveal = smoothstep(0.0, uRevealHardness, density * uRevealStrength);
    vec3 stage1Blended = mix(origCol, cyberCol, reveal);
    
    if (uGradientIntensity > 0.001) {
        float disturbanceEnergy = length(vel) * 0.5 + density;
        float lum = dot(stage1Blended, vec3(0.299, 0.587, 0.114));
        vec3 gradColor = cyberGradientMap(clamp(lum * 0.75 + disturbanceEnergy * 0.6, 0.0, 1.0));
        
        float gradWeight = smoothstep(0.015, 0.6, disturbanceEnergy) * uGradientIntensity;
        stage1Blended = mix(stage1Blended, stage1Blended * gradColor * 2.2, gradWeight * uGradientMix);
    }
    
    // -------------------------------------------------------------
    // VISUAL LAYER COMPOSITING MODEL
    // -------------------------------------------------------------

    // LAYER 1: Base Visual (Stage 1 blended seamlessly with Stage 2)
    vec3 stage2Col = texture2D(tSequence, uvOrig).rgb;
    vec3 finalColor = mix(stage1Blended, stage2Col, smoothstep(0.0, 1.0, uTransition));
    
    vec2 screenCoord = vUv * uResolution.xy;

    // LAYER 2: Behind-Subject Text (Active during Stage 2)
    // A. PROJECTS Heading Filled Text (sits behind cutout)
    if (uHasText > 0.001 && uTransition > 0.0) {
        vec2 textUv = (screenCoord - uTextBounds.xy) / uTextBounds.zw;
        if (textUv.x >= 0.0 && textUv.x <= 1.0 && textUv.y >= 0.0 && textUv.y <= 1.0) {
            float alphaFilled = texture2D(tTextFilled, textUv).a * uHasText;
            if (alphaFilled > 0.0) {
                finalColor = mix(finalColor, vec3(1.0), alphaFilled);
            }
        }
    }
    
    // B. Final QUOTE Solid Filled Text (sits behind cutout)
    if (uQuoteFade > 0.0 && uTransition > 0.0) {
        vec2 quoteUv = (screenCoord - uQuoteBounds.xy) / uQuoteBounds.zw;
        if (quoteUv.x >= 0.0 && quoteUv.x <= 1.0 && quoteUv.y >= 0.0 && quoteUv.y <= 1.0) {
            vec4 quoteData = texture2D(tQuoteFilled, quoteUv);
            float quoteAlpha = quoteData.a * uQuoteFade;
            if (quoteAlpha > 0.0) {
                finalColor = mix(finalColor, quoteData.rgb, quoteAlpha);
            }
        }
    }
    
    // LAYER 3: Stage 2 Subject Cutout Frame (Active ONLY for Stage 2)
    if (uTransition > 0.0) {
        vec3 cutoutCol = texture2D(tCutout, uvOrig).rgb;
        float maxC = max(cutoutCol.r, max(cutoutCol.g, cutoutCol.b));
        // Clean anti-aliased edge where cutout is non-black
        float cutoutAlpha = smoothstep(0.001, 0.015, maxC) * smoothstep(0.0, 1.0, uTransition);
        // Paint the pristine stage2 subject over the behind-text layer
        finalColor = mix(finalColor, stage2Col, cutoutAlpha);
    }
    
    // LAYER 4: Foreground Overlay Layer (In front of cutout)
    // A. PROJECTS heading stroke in front of cutout
    if (uHasText > 0.001 && uTransition > 0.0) {
        vec2 textUv = (screenCoord - uTextBounds.xy) / uTextBounds.zw;
        if (textUv.x >= 0.0 && textUv.x <= 1.0 && textUv.y >= 0.0 && textUv.y <= 1.0) {
            float alphaStroke = texture2D(tTextStroke, textUv).a * uHasText;
            if (alphaStroke > 0.0) {
                finalColor = mix(finalColor, vec3(1.0), alphaStroke);
            }
        }
    }
    
    // B. Final QUOTE Low-Opacity Fill in front of cutout (over the subject/face)
    if (uQuoteFade > 0.0 && uTransition > 0.0) {
        vec2 quoteUv = (screenCoord - uQuoteBounds.xy) / uQuoteBounds.zw;
        if (quoteUv.x >= 0.0 && quoteUv.x <= 1.0 && quoteUv.y >= 0.0 && quoteUv.y <= 1.0) {
            vec4 quoteOverlay = texture2D(tQuoteOverlay, quoteUv);
            float qoAlpha = quoteOverlay.a * uQuoteFade;
            if (qoAlpha > 0.0) {
                finalColor = mix(finalColor, quoteOverlay.rgb, qoAlpha);
            }
        }
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const sequenceTexture = new THREE.Texture();
sequenceTexture.wrapS = THREE.ClampToEdgeWrapping;
sequenceTexture.wrapT = THREE.ClampToEdgeWrapping;
sequenceTexture.minFilter = THREE.LinearFilter;
sequenceTexture.magFilter = THREE.LinearFilter;
sequenceTexture.generateMipmaps = false;

const cutoutTexture = new THREE.Texture();
cutoutTexture.wrapS = THREE.ClampToEdgeWrapping;
cutoutTexture.wrapT = THREE.ClampToEdgeWrapping;
cutoutTexture.minFilter = THREE.LinearFilter;
cutoutTexture.magFilter = THREE.LinearFilter;
cutoutTexture.generateMipmaps = false;

const finalMaterial = new THREE.ShaderMaterial({
  vertexShader: finalVertexShader,
  fragmentShader: finalFragmentShader,
  uniforms: {
    tOriginal: { value: null },
    tCyber: { value: null },
    tFluid: { value: null },
    tSequence: { value: sequenceTexture },
    tCutout: { value: cutoutTexture },
    tTextFilled: { value: null },
    tTextStroke: { value: null },
    uTextBounds: { value: new THREE.Vector4(0, 0, 1, 1) },
    uHasText: { value: 0.0 },
    tQuoteFilled: { value: null },
    tQuoteOverlay: { value: null },
    uQuoteBounds: { value: new THREE.Vector4(0, 0, 1, 1) },
    uQuoteFade: { value: 0.0 },
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
// 6. Memory-Conscious Priority Frame & Cutout Manager (Stage 2)
// -------------------------------------------------------------
const TOTAL_FRAMES = 285;
const MAX_CACHE_SIZE = 35;
const frameCache = new Map();
const cutoutCache = new Map();
let lastLoadedFrame = null;
let lastLoadedCutout = null;

function getFrameUrl(index) {
  const num = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${num}.jpg`;
}

function getCutoutUrl(index) {
  const num = String(index).padStart(3, '0');
  return `/cutout_frames/ezgif-frame-${num}.jpg`;
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

function loadCutoutImage(index) {
  if (cutoutCache.has(index)) {
    return cutoutCache.get(index);
  }

  const img = new Image();
  img.src = getCutoutUrl(index);
  img.onload = () => {
    img._loaded = true;
  };
  cutoutCache.set(index, img);
  return img;
}

function pruneCache(centerIndex) {
  if (frameCache.size <= MAX_CACHE_SIZE) return;

  const entries = Array.from(frameCache.keys()).sort((a, b) => {
    return Math.abs(b - centerIndex) - Math.abs(a - centerIndex);
  });

  while (frameCache.size > MAX_CACHE_SIZE && entries.length > 0) {
    const evictIdx = entries.shift();
    if (evictIdx !== 1) {
      const img = frameCache.get(evictIdx);
      if (img) img.src = '';
      frameCache.delete(evictIdx);

      const cImg = cutoutCache.get(evictIdx);
      if (cImg) cImg.src = '';
      cutoutCache.delete(evictIdx);
    }
  }
}

function updatePreloadWindow(targetIndex, scrollDirection) {
  const forwardAhead = scrollDirection >= 0 ? 25 : 10;
  const backwardAhead = scrollDirection <= 0 ? 20 : 8;

  const start = Math.max(1, targetIndex - backwardAhead);
  const end = Math.min(TOTAL_FRAMES, targetIndex + forwardAhead);

  for (let i = start; i <= end; i++) {
    loadFrameImage(i);
    loadCutoutImage(i);
  }

  pruneCache(targetIndex);
}

function getNearestAvailableFrame(targetIndex) {
  const exact = frameCache.get(targetIndex);
  if (exact && exact._loaded && exact.naturalWidth > 0) {
    return exact;
  }

  for (let radius = 1; radius < 40; radius++) {
    const left = frameCache.get(targetIndex - radius);
    if (left && left._loaded && left.naturalWidth > 0) return left;
    const right = frameCache.get(targetIndex + radius);
    if (right && right._loaded && right.naturalWidth > 0) return right;
  }

  return lastLoadedFrame || frameCache.get(1);
}

function getNearestAvailableCutout(targetIndex) {
  const exact = cutoutCache.get(targetIndex);
  if (exact && exact._loaded && exact.naturalWidth > 0) {
    return exact;
  }

  for (let radius = 1; radius < 40; radius++) {
    const left = cutoutCache.get(targetIndex - radius);
    if (left && left._loaded && left.naturalWidth > 0) return left;
    const right = cutoutCache.get(targetIndex + radius);
    if (right && right._loaded && right.naturalWidth > 0) return right;
  }

  return lastLoadedCutout || cutoutCache.get(1);
}

const frame1 = loadFrameImage(1);
frame1.onload = () => {
  frame1._loaded = true;
  lastLoadedFrame = frame1;
  sequenceTexture.image = frame1;
  sequenceTexture.needsUpdate = true;
};

const cutout1 = loadCutoutImage(1);
cutout1.onload = () => {
  cutout1._loaded = true;
  lastLoadedCutout = cutout1;
  cutoutTexture.image = cutout1;
  cutoutTexture.needsUpdate = true;
};

// -------------------------------------------------------------
// 7. Asset Loading & Texture Management (Stage 1)
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

let textTextureFilled = null;
let textTextureStroke = null;

function updateTextTextures() {
  const heading = document.getElementById('projects-heading');
  if (!heading) return;

  const text = heading.textContent.trim() || 'PROJECTS';
  const style = window.getComputedStyle(heading);
  const fontSizeStr = style.fontSize;
  const fontFamily = style.fontFamily;
  const fontWeight = style.fontWeight;
  const letterSpacing = style.letterSpacing;

  // Use a high-resolution offscreen canvas
  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvasF = document.createElement('canvas');
  const canvasS = document.createElement('canvas');
  const ctxF = canvasF.getContext('2d');
  const ctxS = canvasS.getContext('2d');

  // Base font sizing
  const fontStr = `${fontWeight} ${fontSizeStr} ${fontFamily}`;
  ctxF.font = fontStr;

  // We'll give it generous padding in logical pixels to avoid clipping the stroke or large text
  const padding = 20;
  const metrics = ctxF.measureText(text);
  const logicalWidth = Math.ceil(metrics.width) + padding * 2;
  const logicalHeight = Math.ceil(parseFloat(fontSizeStr) * 1.5) + padding * 2; // Approximating height safely

  canvasF.width = logicalWidth * dpr;
  canvasF.height = logicalHeight * dpr;
  canvasS.width = logicalWidth * dpr;
  canvasS.height = logicalHeight * dpr;

  ctxF.scale(dpr, dpr);
  ctxS.scale(dpr, dpr);

  // Reset font after scale/resize
  ctxF.font = fontStr;
  ctxS.font = fontStr;
  ctxF.textBaseline = 'middle';
  ctxS.textBaseline = 'middle';
  ctxF.textAlign = 'center';
  ctxS.textAlign = 'center';

  if (letterSpacing !== 'normal') {
    ctxF.letterSpacing = letterSpacing;
    ctxS.letterSpacing = letterSpacing;
  }

  const cx = logicalWidth / 2;
  const cy = logicalHeight / 2;

  ctxF.fillStyle = '#ffffff';
  ctxF.fillText(text, cx, cy);

  ctxS.strokeStyle = '#ffffff';
  ctxS.lineWidth = 10.0; // Double width because we'll erase the inner half
  ctxS.strokeText(text, cx, cy);
  
  // Erase the inside of the text to remove overlapping internal font paths
  ctxS.globalCompositeOperation = 'destination-out';
  ctxS.fillStyle = '#ffffff';
  ctxS.fillText(text, cx, cy);
  ctxS.globalCompositeOperation = 'source-over';

  if (textTextureFilled) textTextureFilled.dispose();
  if (textTextureStroke) textTextureStroke.dispose();

  textTextureFilled = new THREE.CanvasTexture(canvasF);
  textTextureStroke = new THREE.CanvasTexture(canvasS);

  textTextureFilled.minFilter = THREE.LinearFilter;
  textTextureStroke.minFilter = THREE.LinearFilter;
  textTextureFilled.generateMipmaps = false;
  textTextureStroke.generateMipmaps = false;

  finalMaterial.uniforms.tTextFilled.value = textTextureFilled;
  finalMaterial.uniforms.tTextStroke.value = textTextureStroke;
  finalMaterial.uniforms.uHasText.value = 1.0;

  // Store logical dimensions for UV mapping in animate loop
  heading._textLogicalWidth = logicalWidth;
  heading._textLogicalHeight = logicalHeight;
}

let textTextureQuoteFilled = null;
let textTextureQuoteOverlay = null;
let quoteLogicalWidth = 0;
let quoteLogicalHeight = 0;

function updateQuoteTexture() {
  if (!QUOTE_CONTENT) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const isMobile = vw < 768;

  const cfg = isMobile && QUOTE_CONTENT.mobile ? { ...QUOTE_CONTENT, ...QUOTE_CONTENT.mobile } : QUOTE_CONTENT;
  const lines = cfg.lines || [
    "THE BEST WAY TO PREDICT",
    "THE FUTURE IS TO CREATE IT."
  ];

  const cw = vw;
  const ch = vh;

  const fontSize = (cfg.fontSizeVw / 100) * vw;
  const fontStr = `${cfg.fontWeight || '900'} ${fontSize}px ${cfg.fontFamily || "'Anton', 'Impact', 'Bebas Neue', sans-serif"}`;
  const lineHeight = fontSize * (cfg.lineHeight || 1.15);
  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = (vh / 2) + ((cfg.yOffsetVh || 0) / 100) * vh - (totalHeight / 2);

  // 1. Render Solid Filled Quote Text (Behind Subject / Layer 2) - NO STROKES
  const canvasF = document.createElement('canvas');
  const ctxF = canvasF.getContext('2d');
  canvasF.width = cw * dpr;
  canvasF.height = ch * dpr;
  ctxF.scale(dpr, dpr);

  ctxF.font = fontStr;
  if (cfg.letterSpacing && cfg.letterSpacing !== "normal") {
    ctxF.letterSpacing = cfg.letterSpacing;
  }
  ctxF.fillStyle = cfg.color || '#ffffff';
  ctxF.textAlign = 'center';
  ctxF.textBaseline = 'middle';

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctxF.fillText(line, cw / 2, y);
  });

  // 2. Render Low-Opacity Filled Quote Text (In Front of Subject / Over Face / Layer 4) - NO STROKES
  const canvasOverlay = document.createElement('canvas');
  const ctxOverlay = canvasOverlay.getContext('2d');
  canvasOverlay.width = cw * dpr;
  canvasOverlay.height = ch * dpr;
  ctxOverlay.scale(dpr, dpr);

  ctxOverlay.font = fontStr;
  if (cfg.letterSpacing && cfg.letterSpacing !== "normal") {
    ctxOverlay.letterSpacing = cfg.letterSpacing;
  }
  ctxOverlay.fillStyle = cfg.overlayColor || 'rgba(255, 255, 255, 0.22)';
  ctxOverlay.textAlign = 'center';
  ctxOverlay.textBaseline = 'middle';

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctxOverlay.fillText(line, cw / 2, y);
  });

  if (textTextureQuoteFilled) textTextureQuoteFilled.dispose();
  if (textTextureQuoteOverlay) textTextureQuoteOverlay.dispose();

  textTextureQuoteFilled = new THREE.CanvasTexture(canvasF);
  textTextureQuoteOverlay = new THREE.CanvasTexture(canvasOverlay);

  textTextureQuoteFilled.minFilter = THREE.LinearFilter;
  textTextureQuoteOverlay.minFilter = THREE.LinearFilter;
  textTextureQuoteFilled.generateMipmaps = false;
  textTextureQuoteOverlay.generateMipmaps = false;

  finalMaterial.uniforms.tQuoteFilled.value = textTextureQuoteFilled;
  finalMaterial.uniforms.tQuoteOverlay.value = textTextureQuoteOverlay;
  
  const qc = document.getElementById('quote-container');
  if (qc) {
    qc.style.width = `${cw}px`;
    qc.style.height = `${ch}px`;
  }
  quoteLogicalWidth = cw;
  quoteLogicalHeight = ch;
}

function resize() {
  updateTextTextures();
  updateQuoteTexture();
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  rtA.setSize(w, h);
  rtB.setSize(w, h);

  fluidMaterial.uniforms.uAspect.value = w / h;
  fluidMaterial.uniforms.uTexelSize.value.set(1 / w, 1 / h);
  finalMaterial.uniforms.uTexelSize.value.set(1 / w, 1 / h);

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

// Ensure text textures are perfectly re-rendered once custom web fonts are fully loaded
document.fonts.ready.then(() => {
  resize();
});

// -------------------------------------------------------------
// 8. Interactive Pointer & Scroll Tracking
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
// 8.5. Cinematic Section Transition Coordinator (Stage 2)
// -------------------------------------------------------------
const secAbout = document.getElementById('section-about');
const secProjects = document.getElementById('section-projects');
const secSkills = document.getElementById('section-skills');
const secContact = document.getElementById('section-contact');
const secQuote = document.getElementById('section-quote');
const quoteContainerEl = document.getElementById('quote-container');

function calcSectionPresence(el, vh, isLastSection = false) {
  if (!el) return { opacity: 0, translateY: 0, scale: 1, presence: 0 };
  const rect = el.getBoundingClientRect();

  // 1. Smooth Enter Curve (Starts at 0.95*vh, fully present at 0.25*vh)
  const enterRange = vh * 0.70;
  const rawEnter = Math.min(Math.max((vh * 0.95 - rect.top) / enterRange, 0.0), 1.0);
  const smoothEnter = 0.5 - 0.5 * Math.cos(rawEnter * Math.PI);

  // 2. Smooth Exit Curve (Stays 1.0 until bottom reaches 0.75*vh, fades to 0.0 at 0.05*vh)
  let smoothExit = 1.0;
  if (!isLastSection) {
    const exitRange = vh * 0.70;
    const rawExit = Math.min(Math.max((rect.bottom - vh * 0.05) / exitRange, 0.0), 1.0);
    smoothExit = 0.5 - 0.5 * Math.cos(rawExit * Math.PI);
  }

  const presence = smoothEnter * smoothExit;

  // Subtle vertical float: enters from +30px down, exits floating -25px up
  const ty = (1.0 - smoothEnter) * 30 - (1.0 - smoothExit) * 25;

  // Subtle depth scale: 0.975 -> 1.000 -> 0.975
  const scale = 0.975 + 0.025 * presence;

  return {
    opacity: presence,
    translateY: ty,
    scale: scale,
    presence: presence
  };
}

function updateSectionTransitions() {
  const vh = window.innerHeight;
  if (!vh) return;

  // 1. ABOUT SECTION (Entire section as one visual composition)
  if (secAbout) {
    const t = calcSectionPresence(secAbout, vh, false);
    secAbout.style.opacity = t.opacity.toFixed(3);
    secAbout.style.transform = `translate3d(0, ${t.translateY.toFixed(1)}px, 0) scale(${t.scale.toFixed(3)})`;
  }

  // 2. PROJECTS SECTION (Entire section + WebGL title in sync)
  if (secProjects) {
    const t = calcSectionPresence(secProjects, vh, false);
    secProjects.style.opacity = t.opacity.toFixed(3);
    secProjects.style.transform = `translate3d(0, ${t.translateY.toFixed(1)}px, 0) scale(${t.scale.toFixed(3)})`;
    finalMaterial.uniforms.uHasText.value = t.presence;
  }

  // 3. SKILLS SECTION (Entire section as one visual composition)
  if (secSkills) {
    const t = calcSectionPresence(secSkills, vh, false);
    secSkills.style.opacity = t.opacity.toFixed(3);
    secSkills.style.transform = `translate3d(0, ${t.translateY.toFixed(1)}px, 0) scale(${t.scale.toFixed(3)})`;
  }

  // 4. CONTACT SECTION (Entire section as one visual composition)
  if (secContact) {
    const t = calcSectionPresence(secContact, vh, false);
    secContact.style.opacity = t.opacity.toFixed(3);
    secContact.style.transform = `translate3d(0, ${t.translateY.toFixed(1)}px, 0) scale(${t.scale.toFixed(3)})`;
  }

  // 5. QUOTE SECTION (Entire section + WebGL Quote composition in sync)
  if (secQuote) {
    const t = calcSectionPresence(secQuote, vh, true);
    secQuote.style.opacity = t.opacity.toFixed(3);
    secQuote.style.transform = `translate3d(0, ${t.translateY.toFixed(1)}px, 0) scale(${t.scale.toFixed(3)})`;
    finalMaterial.uniforms.uQuoteFade.value = t.presence;
  }
}

// -------------------------------------------------------------
// 9. Coordinated High-Performance Render Loop
// -------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  // 1. Smooth Scroll Interpolation
  smoothScrollProgress += (rawScrollProgress - smoothScrollProgress) * 0.12;
  const scrollDelta = smoothScrollProgress - lastScrollProgress;
  lastScrollProgress = smoothScrollProgress;

  // 2. Hero Editorial Typography Fade on Scroll
  if (heroEditorialEl) {
    const textOpacity = Math.max(0.0, 1.0 - smoothScrollProgress * 15.0);
    const textTranslate = smoothScrollProgress * -40.0;
    heroEditorialEl.style.opacity = textOpacity.toFixed(3);
    heroEditorialEl.style.transform = `translateY(${textTranslate.toFixed(1)}px)`;
  }

  // 3. Timeline Mapping & Seamless Handoff
  const handoffRange = 0.04;
  const sequenceEnd = 0.82;
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
    const seqProg = Math.min(1.0, (smoothScrollProgress - handoffRange) / (sequenceEnd - handoffRange));
    targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + seqProg * (TOTAL_FRAMES - 1))));
  }

  // Update Shader Uniforms
  finalMaterial.uniforms.uTransition.value = transitionVal;
  fluidMaterial.uniforms.uStage1Active.value = Math.max(0.0, 1.0 - transitionVal * 1.5);

  // 4. Stage 2 Frame & Cutout Texture Update
  if (transitionVal > 0.0 || smoothScrollProgress > 0.0) {
    updatePreloadWindow(targetFrame, Math.sign(scrollDelta));
    const activeImg = getNearestAvailableFrame(targetFrame);
    if (activeImg && activeImg._loaded && sequenceTexture.image !== activeImg) {
      sequenceTexture.image = activeImg;
      sequenceTexture.needsUpdate = true;
      lastLoadedFrame = activeImg;
    }

    const activeCutout = getNearestAvailableCutout(targetFrame);
    if (activeCutout && activeCutout._loaded && cutoutTexture.image !== activeCutout) {
      cutoutTexture.image = activeCutout;
      cutoutTexture.needsUpdate = true;
      lastLoadedCutout = activeCutout;
    }
  }

  // 4.5. Text Tracking for WebGL Rendering
  if (projectsHeadingEl && projectsHeadingEl._textLogicalWidth) {
    const rect = projectsHeadingEl.getBoundingClientRect();
    const tw = projectsHeadingEl._textLogicalWidth;
    const th = projectsHeadingEl._textLogicalHeight;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const glLeft = cx - tw / 2;
    const glBottom = window.innerHeight - (cy + th / 2);
    finalMaterial.uniforms.uTextBounds.value.set(glLeft, glBottom, tw, th);
  }

  // 4.6. Final Quote Bounds Tracking for WebGL Rendering
  if (quoteContainerEl) {
    const rect = quoteContainerEl.getBoundingClientRect();
    const tw = quoteLogicalWidth;
    const th = quoteLogicalHeight;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const glLeft = cx - tw / 2;
    const glBottom = window.innerHeight - (cy + th / 2);
    finalMaterial.uniforms.uQuoteBounds.value.set(glLeft, glBottom, tw, th);
  }

  // 4.7. Update Cinematic Section Transitions (Stage 2)
  updateSectionTransitions();

  // 5. Smooth Pointer Tracking with Inertia
  fluidMaterial.uniforms.uPrevMouse.value.copy(mouse);
  mouse.lerp(targetMouse, CONFIG.pointerSmoothing);
  fluidMaterial.uniforms.uMouse.value.copy(mouse);

  // 6. GPU Fluid Simulation Pass (Render to rtB)
  fluidMaterial.uniforms.tFluid.value = rtA.texture;
  renderer.setRenderTarget(rtB);
  renderer.render(fluidScene, camera);

  // 7. Ping-Pong Buffer Swap
  const temp = rtA;
  rtA = rtB;
  rtB = temp;

  // 8. Final Scene Render (Render to Screen)
  finalMaterial.uniforms.tFluid.value = rtA.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

animate();
