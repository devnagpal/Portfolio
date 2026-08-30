export const personalKnowledgeBase = {
  identity: {
    name: "Dev Nagpal",
    role: "Computer Science Student & Developer",
    current_status: "2nd Year CSE (Computer Science Engineering) student"
  },
  professional_summary: "Product-focused AI & Machine Learning Engineering student (B.Tech, Class of 2029) with a strong foundation in full-stack development and practical AI integration. Experienced in building end-to-end applications including RAG pipelines, terminal-based AI utilities, and scalable web platforms. Hands-on with modern stacks (Next.js, FastAPI, Vector Databases) and comfortable owning a problem from architecture to execution, bridging the gap between front-end user experience and backend logic. Interested in software engineering, AI systems, agentic applications and scalable web products. Actively developing skills in DSA, full-stack development, machine learning and modern AI technologies through projects, hackathons and continuous learning.",
  education: [
    {
      degree: "B.Tech in Computer Science Engineering (CSE)",
      year: "2nd Year",
      status: "Currently pursuing"
    }
  ],
  other_projects: [
    {
      name: "TRINETRA",
      description: "AI-powered, Offline-First Cognitive Infrastructure Platform designed to improve safety, efficiency, and operational intelligence of large-scale religious gatherings and pilgrimage ecosystems (Digital Twin approach).",
      links: ["https://github.com/devnagpal/TRINETRA"]
    },
    {
      name: "MediVerse",
      description: "Digital Health Records Platform building a unified health data system linking patients, doctors, and hospitals through secure Health ID (ABHA) and HPR ID.",
      technologies: ["React 18.2"],
      links: ["https://github.com/devnagpal/MediVerse", "https://mediverse.vercel.app"]
    }
  ],
  experience: [
    // Add verified internships or roles here
  ],
  achievements: [
    // Add verified achievements here
  ],
  hackathons: [
    // Add hackathon participation/wins here
  ],
  certifications: [
    // Add meaningful certifications here
  ],
  open_source: [
    // Note: Project-specific open source contributions (like Digital Literacy) are covered in the Projects data.
    // Add other major PRs or org contributions here.
  ],
  interests: [
    "Building strong professional digital presences",
    "Human-centered design and interactive digital experiences",
    "Software engineering and AI systems integration",
    "Cinematic web experiences and WebGL"
  ],
  goals: [
    "Learning advanced coding and software architecture",
    "Improving teamwork and collaborative development",
    "Building a strong professional digital presence",
    "Creating seamless, 'invisible' interfaces rather than generic UI patterns"
  ],
  links: {
    github: "https://github.com/devnagpal",
    linkedin: "https://www.linkedin.com/in/devnagpal"
  },
  contact_preferences: "I prefer to be contacted via email or through the contact form on this portfolio."
};

export const systemPromptBase = `
You are an AI representing Dev Nagpal. You are having a quiet, personal, and human conversation with a visitor to Dev's portfolio.
Keep answers conversational, relatively concise, and very natural. Do not act like a generic AI assistant.

STRICT RULES:
1. ONLY use the information provided in the knowledge base or the portfolio data provided below.
2. If the user asks about something NOT in the data (like unknown experience or hackathons), simply and politely say that Dev hasn't provided that information yet, or you don't have that context.
3. NEVER invent facts, guess, or fabricate experience, projects, skills, or achievements.
4. DO NOT use your general model knowledge to construct personal facts about Dev. Do not infer expertise just from an interest.
5. Answer in the first person ("I am...", "My projects include...").
6. You have access to Dev's About, Projects, and Skills data below. Use them as the single source of truth for his technical capabilities.
`;
