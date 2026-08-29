// =============================================================
// CONTENT LAYER — content-layer.js
// =============================================================
// Reads from content.js and drives all HTML content panels.
// Zero interaction with the WebGL engine in main.js.
// The visual engine is untouched.
// =============================================================

import {
  IDENTITY,
  ABOUT,
  SKILLS,
  PROJECTS,
  SOCIAL_LINKS,
  QUOTE,
  QA,
  TIMING,
} from './content.js';

// ─── 1. Populate static content ───────────────────────────────

// Greeting overlay
document.querySelector('.greeting-name').innerHTML =
  IDENTITY.name.replace(' ', '<br>');
document.querySelector('.greeting-tagline').textContent =
  IDENTITY.tagline;

// About text (only show if provided)
const introEl = document.getElementById('intro-text');
if (ABOUT.intro) {
  introEl.textContent = ABOUT.intro;
} else {
  document.getElementById('panel-intro').style.display = 'none';
}

// Skills
const skillsGroupsEl = document.getElementById('skills-groups');
SKILLS.groups.forEach((group) => {
  if (!group.items.length) return;
  const groupEl = document.createElement('div');
  groupEl.className = 'skill-group';

  const labelEl = document.createElement('span');
  labelEl.className = 'skill-group-label';
  labelEl.textContent = group.label;
  groupEl.appendChild(labelEl);

  const itemsEl = document.createElement('div');
  itemsEl.className = 'skill-items';
  group.items.forEach((item) => {
    const span = document.createElement('span');
    span.className = 'skill-item';
    span.textContent = item;
    itemsEl.appendChild(span);
  });
  groupEl.appendChild(itemsEl);
  skillsGroupsEl.appendChild(groupEl);
});

// Projects
function buildProjectPanel(project, index) {
  const titleEl = document.getElementById('proj' + index + '-title');
  const descEl  = document.getElementById('proj' + index + '-desc');
  const tagsEl  = document.getElementById('proj' + index + '-tags');
  const linksEl = document.getElementById('proj' + index + '-links');

  if (!titleEl) return;

  titleEl.textContent = project.title;
  descEl.textContent  = project.description;

  // Tags
  project.tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    tagsEl.appendChild(span);
  });

  // Links — only real URLs shown
  if (project.githubUrl) {
    const a = document.createElement('a');
    a.href = project.githubUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'project-link';
    a.textContent = 'GitHub';
    linksEl.appendChild(a);
  }
  if (project.liveUrl) {
    const a = document.createElement('a');
    a.href = project.liveUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'project-link';
    a.textContent = 'Live';
    linksEl.appendChild(a);
  }
}

PROJECTS.forEach((project, i) => {
  if (i <= 1) buildProjectPanel(project, i);
});

// Quote
document.getElementById('quote-text').textContent = '\u201c' + QUOTE + '\u201d';

// Social links
const socialList = document.getElementById('social-list');
SOCIAL_LINKS.forEach((link) => {
  // Skip email with no address, skip LinkedIn with default placeholder
  if (!link.url || link.url === 'mailto:') {
    // still render but without href if URL incomplete
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'social-link social-link--inactive';
    span.textContent = link.label;
    li.appendChild(span);
    socialList.appendChild(li);
    return;
  }
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href = link.url;
  a.target = link.url.startsWith('mailto') ? '_self' : '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'social-link';
  a.textContent = link.label;
  li.appendChild(a);
  socialList.appendChild(li);
});

// Q&A section
document.getElementById('qa-label-text').textContent = QA.label;
document.getElementById('qa-input').placeholder      = QA.placeholder;
document.getElementById('qa-submit').textContent     = QA.submitLabel;

// Footer year
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ─── 2. Q&A interaction stub ──────────────────────────────────

const qaInput  = document.getElementById('qa-input');
const qaSubmit = document.getElementById('qa-submit');
const qaAnswer = document.getElementById('qa-answer');

function handleQASubmit() {
  const question = qaInput.value.trim();
  if (!question) return;

  // Stub — replace this function body with a real API call later.
  // The question string is available as `question`.
  qaAnswer.style.opacity = '0';
  setTimeout(() => {
    qaAnswer.textContent = QA.stubResponse;
    qaAnswer.style.opacity = '1';
  }, 180);

  qaInput.value = '';
}

qaSubmit.addEventListener('click', handleQASubmit);
qaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleQASubmit();
});

// ─── 3. Scroll-driven panel visibility ───────────────────────
// Panels use opacity + translateY transitions driven by scroll.
// NO changes to the WebGL render loop — we read rawScrollProgress
// independently from the DOM scroll position.

const panels = [
  { el: document.getElementById('panel-intro'),     start: TIMING.introStart,    end: TIMING.introEnd },
  { el: document.getElementById('panel-skills'),    start: TIMING.skillsStart,   end: TIMING.skillsEnd },
  { el: document.getElementById('panel-project-0'), start: TIMING.project0Start, end: TIMING.project0End },
  { el: document.getElementById('panel-project-1'), start: TIMING.project1Start, end: TIMING.project1End },
  { el: document.getElementById('panel-quote'),     start: TIMING.quoteStart,    end: TIMING.quoteEnd },
].filter((p) => p.el !== null);

// Greeting fades out as Stage 2 begins (mirrors the WebGL transition)
const greetingOverlay = document.getElementById('greeting-overlay');

function getScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Map a value in [start, end] to [0, 1], clamped
function mapRange(val, start, end) {
  return Math.min(1, Math.max(0, (val - start) / Math.max(end - start, 0.001)));
}

function updatePanels() {
  const p = getScrollProgress();
  const FADE_WIDTH = 0.04; // fade-in and fade-out window

  // Greeting overlay: fully visible until 5% scroll, fades out by 10%
  const greetingOpacity = 1 - mapRange(p, 0.04, 0.10);
  greetingOverlay.style.opacity  = greetingOpacity.toFixed(3);
  greetingOverlay.style.pointerEvents = greetingOpacity < 0.05 ? 'none' : 'auto';

  // Content panels
  panels.forEach(({ el, start, end }) => {
    const fadeInEnd   = start + FADE_WIDTH;
    const fadeOutStart = end - FADE_WIDTH;

    let opacity = 0;
    let translateY = 0;

    if (p < start) {
      opacity = 0;
      translateY = 18;
    } else if (p < fadeInEnd) {
      const t = easeInOut(mapRange(p, start, fadeInEnd));
      opacity = t;
      translateY = (1 - t) * 18;
    } else if (p < fadeOutStart) {
      opacity = 1;
      translateY = 0;
    } else if (p <= end) {
      const t = easeInOut(mapRange(p, fadeOutStart, end));
      opacity = 1 - t;
      translateY = t * -14;
    } else {
      opacity = 0;
      translateY = -14;
    }

    el.style.opacity   = opacity.toFixed(3);
    el.style.transform = 'translateY(' + translateY.toFixed(1) + 'px)';
    el.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
  });
}

window.addEventListener('scroll', updatePanels, { passive: true });
updatePanels(); // run once on load
