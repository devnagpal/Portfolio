import * as THREE from 'three';
import { HERO_CONTENT, ABOUT_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT, CONTACT_CONTENT, QUOTE_CONTENT, STAGE3_CONTENT } from './content.js';

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
// 1d. Populate Stage 3 (Conversational Interface)
// -------------------------------------------------------------
const chatHeaderEl = document.getElementById('chat-header');
const chatGreetingEl = document.getElementById('chat-greeting');
const chatSubEl = document.getElementById('chat-sub');
const chatSuggestedEl = document.getElementById('chat-suggested');
const chatHistoryEl = document.getElementById('chat-history');
const chatInputEl = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send');

if (STAGE3_CONTENT) {
  if (chatGreetingEl) chatGreetingEl.textContent = STAGE3_CONTENT.greeting;
  if (chatSubEl) chatSubEl.textContent = STAGE3_CONTENT.subtext;
  if (chatInputEl) chatInputEl.placeholder = STAGE3_CONTENT.inputPlaceholder;

  if (chatSuggestedEl && STAGE3_CONTENT.suggestedQuestions) {
    let suggestedHtml = '';
    STAGE3_CONTENT.suggestedQuestions.forEach(q => {
      suggestedHtml += `<button class="suggested-q">${q}</button>`;
    });
    chatSuggestedEl.innerHTML = suggestedHtml;

    // Add basic interaction foundation (Visuals only, no LLM logic)
    const suggestedBtns = chatSuggestedEl.querySelectorAll('.suggested-q');
    suggestedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const questionText = btn.textContent;
        processUserMessage(questionText);
      });
    });
  }

  if (chatSendBtn && chatInputEl) {
    chatSendBtn.addEventListener('click', () => {
      const val = chatInputEl.value.trim();
      if (val) {
        processUserMessage(val);
        chatInputEl.value = '';
      }
    });

    chatInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const val = chatInputEl.value.trim();
        if (val) {
          processUserMessage(val);
          chatInputEl.value = '';
        }
      }
    });
  }

  const stage3BackBtn = document.getElementById('stage3-back');

  // Initially hide the back button since we're already at the start
  if (stage3BackBtn) {
    stage3BackBtn.addEventListener('click', () => {
      // Reset the conversation UI state immediately (no scrolling)
      if (chatHeaderEl) chatHeaderEl.classList.remove('is-hidden');
      if (chatSuggestedEl) chatSuggestedEl.classList.remove('is-hidden');
      if (chatHistoryEl) chatHistoryEl.innerHTML = '';
      if (chatInputEl) chatInputEl.value = '';
      
      // Clear conversation context
      conversationHistory = [];
      
      // Hide back button again
      stage3BackBtn.classList.remove('is-visible');
    });
  }
}
// State for conversational history
let conversationHistory = [];

// Handle real conversation logic
async function processUserMessage(questionText) {
  // Hide the initial intro elements
  if (chatHeaderEl) chatHeaderEl.classList.add('is-hidden');
  if (chatSuggestedEl) chatSuggestedEl.classList.add('is-hidden');

  // Show the back button so user can reset
  const stage3BackBtn = document.getElementById('stage3-back');
  if (stage3BackBtn) {
    stage3BackBtn.classList.add('is-visible');
  }

  // Create unique ID for this response so we can update it later
  const responseId = 'msg-' + Date.now();

  // Add the exchange to history with a loading state
  const exchangeHtml = `
    <div class="chat-exchange">
      <div class="chat-q">${questionText}</div>
      <div class="chat-a" id="${responseId}">
        <span style="opacity: 0.5;">Thinking...</span>
      </div>
    </div>
  `;

  if (chatHistoryEl) {
    chatHistoryEl.innerHTML += exchangeHtml;
    // Auto-scroll to bottom of history
    setTimeout(() => {
      chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
    }, 50);
  }

  const responseEl = document.getElementById(responseId);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: questionText,
        history: conversationHistory
      })
    });

    if (res.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    if (!res.ok) {
      throw new Error('API response was not ok');
    }

    const data = await res.json();

    // Update UI with response
    if (responseEl) {
      responseEl.innerHTML = formatResponseText(data.response);
    }

    // Append to local history for context on next turn
    conversationHistory.push({ role: 'user', content: questionText });
    conversationHistory.push({ role: 'assistant', content: data.response });

  } catch (error) {
    console.error('Conversation Error:', error);
    // Graceful, human-readable error fallback
    if (responseEl) {
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        responseEl.innerHTML = "You've reached the current question limit. Please come back later.";
      } else {
        responseEl.innerHTML = "I'm having a little trouble connecting right now. Please try again or reach out via the contact section.";
      }
    }
  }

  // Final scroll adjustment after response loads
  setTimeout(() => {
    if (chatHistoryEl) chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
  }, 100);
}

// Helper to convert simple markdown/newlines to HTML
function formatResponseText(text) {
  if (!text) return "";
  return text
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
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
// 6. Progressive Asynchronous Frame & Cutout Engine (Stage 2)
// -------------------------------------------------------------
const TOTAL_FRAMES = 300;
const frameImages = new Array(TOTAL_FRAMES + 1);
const cutoutImages = new Array(TOTAL_FRAMES + 1);

let lastLoadedFrame = null;
let lastLoadedCutout = null;
let currentRenderedFrame = null;
let currentRenderedCutout = null;

function getFrameUrl(index) {
  const num = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${num}.jpg`;
}

function getCutoutUrl(index) {
  const num = String(index).padStart(3, '0');
  return `/cutout_frames/ezgif-frame-${num}.jpg`;
}

function loadFrame(index, decode = false) {
  if (index < 1 || index > TOTAL_FRAMES) return null;
  if (!frameImages[index]) {
    const img = new Image();
    img._loaded = false;
    img.src = getFrameUrl(index);
    if (decode && img.decode) {
      img.decode().then(() => {
        img._loaded = true;
        if (!lastLoadedFrame) lastLoadedFrame = img;
        if (!sequenceTexture.image) {
          sequenceTexture.image = img;
          sequenceTexture.needsUpdate = true;
          currentRenderedFrame = img;
        }
      }).catch(() => { img._loaded = true; });
    } else {
      img.onload = () => { img._loaded = true; };
    }
    frameImages[index] = img;
  } else if (decode && frameImages[index]._loaded === false && frameImages[index].decode) {
    // If it was just HTTP loaded, decode it now that it's near
    frameImages[index].decode().catch(() => {});
  }
  return frameImages[index];
}

function loadCutout(index, decode = false) {
  if (index < 1 || index > TOTAL_FRAMES) return null;
  if (!cutoutImages[index]) {
    const img = new Image();
    img._loaded = false;
    img.src = getCutoutUrl(index);
    if (decode && img.decode) {
      img.decode().then(() => {
        img._loaded = true;
        if (!lastLoadedCutout) lastLoadedCutout = img;
        if (!cutoutTexture.image) {
          cutoutTexture.image = img;
          cutoutTexture.needsUpdate = true;
          currentRenderedCutout = img;
        }
      }).catch(() => { img._loaded = true; });
    } else {
      img.onload = () => { img._loaded = true; };
    }
    cutoutImages[index] = img;
  } else if (decode && cutoutImages[index]._loaded === false && cutoutImages[index].decode) {
    cutoutImages[index].decode().catch(() => {});
  }
  return cutoutImages[index];
}

function updatePreloadWindow(targetIndex, scrollDirection) {
  const forwardAhead = scrollDirection >= 0 ? 30 : 15;
  const backwardAhead = scrollDirection <= 0 ? 25 : 10;
  const start = Math.max(1, targetIndex - backwardAhead);
  const end = Math.min(TOTAL_FRAMES, targetIndex + forwardAhead);

  for (let i = start; i <= end; i++) {
    loadFrame(i, true);
    loadCutout(i, true);
  }
}

function getNearestAvailableFrame(targetIndex) {
  if (frameImages[targetIndex] && frameImages[targetIndex]._loaded) {
    return frameImages[targetIndex];
  }

  // Scan outward in both directions to find the closest decoded frame across the entire sequence
  for (let r = 1; r <= TOTAL_FRAMES; r++) {
    const left = targetIndex - r;
    if (left >= 1 && frameImages[left] && frameImages[left]._loaded) {
      return frameImages[left];
    }
    const right = targetIndex + r;
    if (right <= TOTAL_FRAMES && frameImages[right] && frameImages[right]._loaded) {
      return frameImages[right];
    }
  }

  return frameImages[1] || lastLoadedFrame || null;
}

function getNearestAvailableCutout(targetIndex) {
  if (cutoutImages[targetIndex] && cutoutImages[targetIndex]._loaded) {
    return cutoutImages[targetIndex];
  }

  for (let r = 1; r <= TOTAL_FRAMES; r++) {
    const left = targetIndex - r;
    if (left >= 1 && cutoutImages[left] && cutoutImages[left]._loaded) {
      return cutoutImages[left];
    }
    const right = targetIndex + r;
    if (right <= TOTAL_FRAMES && cutoutImages[right] && cutoutImages[right]._loaded) {
      return cutoutImages[right];
    }
  }

  return cutoutImages[1] || lastLoadedCutout || null;
}

// Progressive background preloader: HTTP fetches all frames in chunks without decoding them into RAM yet
function startProgressivePreload() {
  // 1. Immediate Tier: Start sequence frames (decode to guarantee fast start)
  for (let i = 1; i <= 5; i++) {
    loadFrame(i, true);
    loadCutout(i, true);
  }

  // 2. Progressive Background Tier: Remaining frames just fetch via HTTP to cache (decode = false)
  let nextChunkStart = 6;
  const chunkSize = 20;

  function preloadNextChunk() {
    if (nextChunkStart > TOTAL_FRAMES) return;
    const chunkEnd = Math.min(TOTAL_FRAMES, nextChunkStart + chunkSize - 1);
    for (let i = nextChunkStart; i <= chunkEnd; i++) {
      loadFrame(i, false);
      loadCutout(i, false);
    }
    nextChunkStart += chunkSize;
    // Space out the chunks slightly more to prioritize scrolling performance
    setTimeout(preloadNextChunk, 150);
  }

  setTimeout(preloadNextChunk, 300);
}

startProgressivePreload();

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

// -------------------------------------------------------------
// 8. Cached Layout Measurements (Zero Layout Thrashing)
// -------------------------------------------------------------
const secAbout = document.getElementById('section-about');
const secProjects = document.getElementById('section-projects');
const secSkills = document.getElementById('section-skills');
const secContact = document.getElementById('section-contact');
const secQuote = document.getElementById('section-quote');
const quoteContainerEl = document.getElementById('quote-container');
const scrollContentEl = document.getElementById('scroll-content');
let stage2MaxScroll = 1;

const sectionLayouts = {
  about: { docTop: 0, height: 0, lastOpacity: -1, lastTY: -999, lastScale: -1 },
  projects: { docTop: 0, height: 0, lastOpacity: -1, lastTY: -999, lastScale: -1 },
  skills: { docTop: 0, height: 0, lastOpacity: -1, lastTY: -999, lastScale: -1 },
  contact: { docTop: 0, height: 0, lastOpacity: -1, lastTY: -999, lastScale: -1 },
  quote: { docTop: 0, height: 0, lastOpacity: -1, lastTY: -999, lastScale: -1 },
  projectsHeading: { docTop: 0, docLeft: 0, width: 0, height: 0 },
  quoteContainer: { docTop: 0, docLeft: 0, width: 0, height: 0 }
};

function measureLayouts() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  if (scrollContentEl) {
    stage2MaxScroll = Math.max(1, scrollContentEl.offsetHeight - window.innerHeight);
  }
  if (secAbout) {
    const currentTY = (sectionLayouts.about.lastTY !== -999) ? sectionLayouts.about.lastTY : 0;
    sectionLayouts.about.docTop = secAbout.getBoundingClientRect().top + scrollY - currentTY;
    sectionLayouts.about.height = secAbout.offsetHeight || secAbout.getBoundingClientRect().height;
  }
  if (secProjects) {
    const currentTY = (sectionLayouts.projects.lastTY !== -999) ? sectionLayouts.projects.lastTY : 0;
    sectionLayouts.projects.docTop = secProjects.getBoundingClientRect().top + scrollY - currentTY;
    sectionLayouts.projects.height = secProjects.offsetHeight || secProjects.getBoundingClientRect().height;
  }
  if (secSkills) {
    const currentTY = (sectionLayouts.skills.lastTY !== -999) ? sectionLayouts.skills.lastTY : 0;
    sectionLayouts.skills.docTop = secSkills.getBoundingClientRect().top + scrollY - currentTY;
    sectionLayouts.skills.height = secSkills.offsetHeight || secSkills.getBoundingClientRect().height;
  }
  if (secContact) {
    const currentTY = (sectionLayouts.contact.lastTY !== -999) ? sectionLayouts.contact.lastTY : 0;
    sectionLayouts.contact.docTop = secContact.getBoundingClientRect().top + scrollY - currentTY;
    sectionLayouts.contact.height = secContact.offsetHeight || secContact.getBoundingClientRect().height;
  }
  if (secQuote) {
    const currentTY = (sectionLayouts.quote.lastTY !== -999) ? sectionLayouts.quote.lastTY : 0;
    sectionLayouts.quote.docTop = secQuote.getBoundingClientRect().top + scrollY - currentTY;
    sectionLayouts.quote.height = secQuote.offsetHeight || secQuote.getBoundingClientRect().height;
  }
  if (projectsHeadingEl) {
    const r = projectsHeadingEl.getBoundingClientRect();
    const currentTY = (sectionLayouts.projects.lastTY !== -999) ? sectionLayouts.projects.lastTY : 0;
    sectionLayouts.projectsHeading.docTop = r.top + scrollY - currentTY;
    sectionLayouts.projectsHeading.docLeft = r.left;
    sectionLayouts.projectsHeading.width = r.width;
    sectionLayouts.projectsHeading.height = r.height;
  }
  if (quoteContainerEl) {
    const r = quoteContainerEl.getBoundingClientRect();
    const currentTY = (sectionLayouts.quote.lastTY !== -999) ? sectionLayouts.quote.lastTY : 0;
    sectionLayouts.quoteContainer.docTop = r.top + scrollY - currentTY;
    sectionLayouts.quoteContainer.docLeft = r.left;
    sectionLayouts.quoteContainer.width = r.width;
    sectionLayouts.quoteContainer.height = r.height;
  }
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

  measureLayouts();
}

window.addEventListener('resize', resize, { passive: true });

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

// Ensure text textures and layout coordinates are perfectly updated once custom web fonts are fully loaded
document.fonts.ready.then(() => {
  resize();
});

// Initial layout measurement
setTimeout(measureLayouts, 100);

// -------------------------------------------------------------
// 8.5. Interactive Pointer & Scroll Tracking
// -------------------------------------------------------------
const mouse = new THREE.Vector2(-10, -10);
const targetMouse = new THREE.Vector2(-10, -10);

window.addEventListener('mousemove', (e) => {
  targetMouse.x = e.clientX / window.innerWidth;
  targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
}, { passive: true });

window.addEventListener('mouseleave', () => {
  targetMouse.set(-10, -10);
}, { passive: true });

let rawScrollProgress = 0.0;
let smoothScrollProgress = 0.0;
let lastScrollProgress = 0.0;
let lastHeroProgress = -1;

function onScroll() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  if (stage2MaxScroll > 0) {
    rawScrollProgress = Math.min(Math.max(scrollY / stage2MaxScroll, 0.0), 1.0);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// -------------------------------------------------------------
// 8.6. Cinematic Section Transition Coordinator (Zero Reflow)
// -------------------------------------------------------------
function calcSectionPresenceFromDoc(docTop, height, vh, scrollY, isLastSection = false) {
  const top = docTop - scrollY;
  const bottom = top + height;

  // 1. Smooth Enter Curve (Starts at 0.95*vh, fully present at 0.25*vh)
  const enterRange = vh * 0.70;
  const rawEnter = Math.min(Math.max((vh * 0.95 - top) / enterRange, 0.0), 1.0);
  const smoothEnter = 0.5 - 0.5 * Math.cos(rawEnter * Math.PI);

  // 2. Smooth Exit Curve (Stays 1.0 until bottom reaches 0.75*vh, fades to 0.0 at 0.05*vh)
  let smoothExit = 1.0;
  if (!isLastSection) {
    const exitRange = vh * 0.70;
    const rawExit = Math.min(Math.max((bottom - vh * 0.05) / exitRange, 0.0), 1.0);
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

function applySectionStyle(el, state, layoutState) {
  if (!el) return;
  const opDiff = Math.abs(state.opacity - layoutState.lastOpacity);
  const tyDiff = Math.abs(state.translateY - layoutState.lastTY);
  const scDiff = Math.abs(state.scale - layoutState.lastScale);

  if (opDiff > 0.0005 || tyDiff > 0.05 || scDiff > 0.0005) {
    el.style.opacity = state.opacity.toFixed(3);
    el.style.transform = `translate3d(0, ${state.translateY.toFixed(1)}px, 0) scale(${state.scale.toFixed(3)})`;
    layoutState.lastOpacity = state.opacity;
    layoutState.lastTY = state.translateY;
    layoutState.lastScale = state.scale;

    if (state.opacity <= 0.001) {
      el.style.pointerEvents = 'none';
      el.style.visibility = 'hidden';
    } else {
      el.style.pointerEvents = 'auto';
      el.style.visibility = 'visible';
    }
  }
}

function updateSectionTransitions() {
  const vh = window.innerHeight;
  if (!vh) return;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  // 1. ABOUT SECTION
  if (secAbout) {
    const t = calcSectionPresenceFromDoc(sectionLayouts.about.docTop, sectionLayouts.about.height, vh, scrollY, false);
    applySectionStyle(secAbout, t, sectionLayouts.about);
  }

  // 2. PROJECTS SECTION
  if (secProjects) {
    const t = calcSectionPresenceFromDoc(sectionLayouts.projects.docTop, sectionLayouts.projects.height, vh, scrollY, false);
    applySectionStyle(secProjects, t, sectionLayouts.projects);
    finalMaterial.uniforms.uHasText.value = t.presence;
  }

  // 3. SKILLS SECTION
  if (secSkills) {
    const t = calcSectionPresenceFromDoc(sectionLayouts.skills.docTop, sectionLayouts.skills.height, vh, scrollY, false);
    applySectionStyle(secSkills, t, sectionLayouts.skills);
  }

  // 4. CONTACT SECTION
  if (secContact) {
    const t = calcSectionPresenceFromDoc(sectionLayouts.contact.docTop, sectionLayouts.contact.height, vh, scrollY, false);
    applySectionStyle(secContact, t, sectionLayouts.contact);
  }

  // 5. QUOTE SECTION (Locks gracefully when Stage 3 takes over)
  if (secQuote) {
    const clampedQuoteScroll = Math.min(scrollY, stage2MaxScroll);
    const t = calcSectionPresenceFromDoc(sectionLayouts.quote.docTop, sectionLayouts.quote.height, vh, clampedQuoteScroll, true);
    applySectionStyle(secQuote, t, sectionLayouts.quote);
    finalMaterial.uniforms.uQuoteFade.value = t.presence;
  }
}

// -------------------------------------------------------------
// 9. Coordinated High-Performance Render Loop
// -------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  const vh = window.innerHeight;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  // 1. Smooth Scroll Interpolation
  smoothScrollProgress += (rawScrollProgress - smoothScrollProgress) * 0.12;
  const scrollDelta = smoothScrollProgress - lastScrollProgress;
  lastScrollProgress = smoothScrollProgress;

  // 2. Hero Editorial Typography Fade on Scroll
  if (heroEditorialEl && Math.abs(smoothScrollProgress - lastHeroProgress) > 0.0002) {
    const textOpacity = Math.max(0.0, 1.0 - smoothScrollProgress * 15.0);
    const textTranslate = smoothScrollProgress * -40.0;
    heroEditorialEl.style.opacity = textOpacity.toFixed(3);
    heroEditorialEl.style.transform = `translateY(${textTranslate.toFixed(1)}px)`;
    heroEditorialEl.style.visibility = textOpacity <= 0.001 ? 'hidden' : 'visible';
    lastHeroProgress = smoothScrollProgress;
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
  const stage1Active = Math.max(0.0, 1.0 - transitionVal * 1.5);
  fluidMaterial.uniforms.uStage1Active.value = stage1Active;

  // 4. Stage 2 Frame & Cutout Texture Update
  if (transitionVal > 0.0 || smoothScrollProgress > 0.0 || !currentRenderedFrame) {
    updatePreloadWindow(targetFrame, Math.sign(scrollDelta));

    const activeImg = getNearestAvailableFrame(targetFrame);
    if (activeImg && activeImg !== currentRenderedFrame) {
      sequenceTexture.image = activeImg;
      sequenceTexture.needsUpdate = true;
      currentRenderedFrame = activeImg;
      lastLoadedFrame = activeImg;
    }

    const activeCutout = getNearestAvailableCutout(targetFrame);
    if (activeCutout && activeCutout !== currentRenderedCutout) {
      cutoutTexture.image = activeCutout;
      cutoutTexture.needsUpdate = true;
      currentRenderedCutout = activeCutout;
      lastLoadedCutout = activeCutout;
    }
  }

  // 4.5. Update Cinematic Section Transitions (Stage 2)
  updateSectionTransitions();

  // 4.6. Text Tracking for WebGL Rendering (Calculated from cached offsets + current translateY, 0 reflow)
  if (projectsHeadingEl && projectsHeadingEl._textLogicalWidth) {
    const tw = projectsHeadingEl._textLogicalWidth;
    const th = projectsHeadingEl._textLogicalHeight;
    const currentTY = (sectionLayouts.projects.lastTY !== -999) ? sectionLayouts.projects.lastTY : 0;
    const top = sectionLayouts.projectsHeading.docTop - scrollY + currentTY;
    const cx = sectionLayouts.projectsHeading.docLeft + sectionLayouts.projectsHeading.width / 2;
    const cy = top + sectionLayouts.projectsHeading.height / 2;
    const glLeft = cx - tw / 2;
    const glBottom = vh - (cy + th / 2);
    finalMaterial.uniforms.uTextBounds.value.set(glLeft, glBottom, tw, th);
  }

  // 4.7. Final Quote Bounds Tracking for WebGL Rendering (Calculated from cached offsets + current translateY, 0 reflow)
  if (quoteContainerEl) {
    const tw = quoteLogicalWidth || 1;
    const th = quoteLogicalHeight || 1;
    const currentTY = (sectionLayouts.quote.lastTY !== -999) ? sectionLayouts.quote.lastTY : 0;
    const clampedQuoteScroll = Math.min(scrollY, stage2MaxScroll);
    const top = sectionLayouts.quoteContainer.docTop - clampedQuoteScroll + currentTY;
    const cx = sectionLayouts.quoteContainer.docLeft + sectionLayouts.quoteContainer.width / 2;
    const cy = top + sectionLayouts.quoteContainer.height / 2;
    const glLeft = cx - tw / 2;
    const glBottom = vh - (cy + th / 2);
    finalMaterial.uniforms.uQuoteBounds.value.set(glLeft, glBottom, tw, th);
  }

  // Determine if Stage 3 fully obscures the WebGL canvas
  const isStage3Active = (rawScrollProgress > (stage2MaxScroll + vh * 0.5));

  // 5. Stage 1 Pointer Tracking & Fluid Simulation Pass
  if (!isStage3Active && (stage1Active > 0.001 || transitionVal < 1.0)) {
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

    finalMaterial.uniforms.tFluid.value = rtA.texture;
  }

  // 8. Final Scene Render (Render to Screen)
  // Completely skip GPU output if Stage 3 covers the viewport (saves massive battery on mobile during chat)
  if (!isStage3Active) {
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }
}

animate();
