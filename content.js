// -------------------------------------------------------------
// Editorial Content Configuration (Easily Editable)
// -------------------------------------------------------------

export const HERO_CONTENT = {
  greeting: "Hey, I'm",
  nameLine1: "DEV",
  nameLine2: "NAGPAL",
  bio: "Computer Science student focused on building software, AI systems, and interactive digital experiences.",
};

export const ABOUT_CONTENT = {
  heading: "ABOUT",
  leadText: "Computer Science student focused on software, AI, and building interactive digital experiences.",
  subText: "Dedicated to crafting thoughtful digital systems where engineering performance and cinematic visual design meet seamlessly.",
};

export const PROJECTS_CONTENT = {
  heading: "PROJECTS",
  items: [
    {
      title: "EzCA",
      description: "ICAI-aligned AI study assistant for Chartered Accountancy aspirants. Provides intelligent, context-aware guidance for accounting students.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2564&auto=format&fit=crop", // Optional aesthetic placeholder
      tags: ["TypeScript", "AI", "Education", "Next.js"],
      links: [
        { icon: "github", url: "https://github.com/devnagpal/EzCA", label: "GitHub Repository" },
        { icon: "external", url: "https://ezca-two.vercel.app", label: "Live Demo" }
      ]
    },
    {
      title: "PhishNet",
      description: "An advanced security and networking tool designed for phishing detection and threat analysis using Python.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2564&auto=format&fit=crop",
      tags: ["Python", "Security", "Networking", "Analysis"],
      links: [
        { icon: "github", url: "https://github.com/devnagpal/PhishNet", label: "GitHub Repository" }
      ]
    },
    {
      title: "Task-Forge",
      description: "A robust task orchestration and management system built in Python to streamline workflow automation.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      tags: ["Python", "Automation", "Tooling"],
      links: [
        { icon: "github", url: "https://github.com/devnagpal/Task-Forge", label: "GitHub Repository" }
      ]
    },
    {
      title: "Digital Literacy",
      description: "A comprehensive project dedicated to improving digital literacy, accessibility, and fundamental computer education.",
      image: "", // Leaving one blank to show the elegant flex-grow text centering
      tags: ["Education", "Open Source", "Accessibility", "+more"],
      links: [
        { icon: "github", url: "https://github.com/devnagpal/Digital-Literacy-Project", label: "GitHub Repository" }
      ]
    }
  ]
};

// -------------------------------------------------------------
// SKILLS CONTENT — Edit freely. Add / remove / rename / reorder.
//
// icon: URL string  → <img class="skill-icon"> (use devicons/simpleicons CDN URLs)
// icon: SVG string  → inline colored SVG (for techs without an official icon)
// icon: null        → name only, no icon
//
// To add a skill:    add { name, icon } to any category's skills array
// To delete a skill: remove its object
// To add a category: add a new { label, skills: [...] } object
// The visual engine reads this automatically — no other file changes needed.
// -------------------------------------------------------------
export const SKILLS_CONTENT = {
  categories: [
    {
      label: 'Languages',
      skills: [
        {
          name: 'Python',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        },
        {
          name: 'JavaScript',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        },
        {
          name: 'TypeScript',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        },
      ],
    },
    {
      label: 'Graphics & Web',
      skills: [
        {
          name: 'Three.js',
          // devicon threejs-original is black — CSS [data-skill="Three.js"] inverts it to white
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
        },
        {
          name: 'WebGL',
          // No standard devicon — custom orange W mark
          icon: `<svg viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M1 2L5.5 18L9.5 8L14 18L18.5 8L22.5 18L27 2" stroke="#E8632B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        },
        {
          name: 'GLSL',
          // Shader lens — concentric rings
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="12" cy="12" r="9" stroke="#A78BFA" stroke-width="1.6"/><circle cx="12" cy="12" r="5.5" stroke="#C4B5FD" stroke-width="1.6"/><circle cx="12" cy="12" r="2" fill="#DDD6FE"/></svg>`,
        },
        {
          name: 'CSS',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        },
      ],
    },
    {
      label: 'AI & ML',
      skills: [
        {
          name: 'PyTorch',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
        },
        {
          name: 'LLMs',
          // Neural chip icon — cyan
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><rect x="7" y="7" width="10" height="10" rx="2" stroke="#22D3EE" stroke-width="1.6"/><path d="M7 10H3M7 14H3M17 10H21M17 14H21M10 7V3M14 7V3M10 17V21M14 17V21" stroke="#22D3EE" stroke-width="1.6" stroke-linecap="round"/></svg>`,
        },
        {
          name: 'Computer Vision',
          // Eye with pupil — emerald
          icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" stroke="#34D399" stroke-width="1.6"/><circle cx="12" cy="12" r="3.2" stroke="#34D399" stroke-width="1.6"/><circle cx="12" cy="12" r="1.4" fill="#34D399"/></svg>`,
        },
      ],
    },
    {
      label: 'Backend & Tools',
      skills: [
        {
          name: 'FastAPI',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
        },
        {
          name: 'Git',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        },
        {
          name: 'Node.js',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        },
        {
          name: 'Vite',
          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
        },
      ],
    },
  ],
};

// -------------------------------------------------------------
// CONTACT CONTENT
// -------------------------------------------------------------
export const CONTACT_CONTENT = {
  heading: 'CONTACT',
  links: [
    {
      type: 'email',
      label: 'Email',
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=dev024n@gmail.com', // Opens Gmail compose box
      icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' // Official colorful Gmail icon
    },
    {
      type: 'github',
      label: 'GitHub',
      url: 'https://github.com/devnagpal',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg'
    },
    {
      type: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/devnagpal',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg'
    }
  ]
};

// -------------------------------------------------------------
// QUOTE CONTENT (Final Editorial Section)
// -------------------------------------------------------------
export const QUOTE_CONTENT = {
  // Continuous, centered editorial text composition
  lines: [
    "THE BEST WAY TO PREDICT",
    "THE FUTURE IS TO CREATE IT."
  ],
  fontFamily: "'Anton', 'Impact', 'Bebas Neue', sans-serif",
  fontWeight: "900",
  fontSizeVw: 8.8,         // High-impact, chunky typography sizing
  lineHeight: 1.15,        // Tight editorial line spacing
  letterSpacing: "0.02em", // Clean display tracking
  color: "#ffffff",        // Solid fill behind subject (Layer 2)
  overlayColor: "rgba(255, 255, 255, 0.22)", // Low-opacity fill in front of subject / over face (Layer 4)
  yOffsetVh: 0,            // Centered directly across the face
  // Mobile overrides for natural reflow on smaller screens
  mobile: {
    lines: [
      "THE BEST WAY",
      "TO PREDICT",
      "THE FUTURE",
      "IS TO CREATE IT."
    ],
    fontSizeVw: 12.0,
    lineHeight: 1.10,
    yOffsetVh: 0
  }
};

// -------------------------------------------------------------
// STAGE 3 CONTENT (Conversational Interface)
// -------------------------------------------------------------
export const STAGE3_CONTENT = {
  greeting: "YOU CAN ASK ME SOMETHING, AND I'LL ANSWER",
  subtext: "Curious about my projects, design philosophy, background, or what I'm working on?",
  suggestedQuestions: [
    "What is your design philosophy?",
    "Tell me about your background.",
    "Are you open to new roles?",
    "What are you learning right now?"
  ],
  inputPlaceholder: "Ask me anything..."
};
