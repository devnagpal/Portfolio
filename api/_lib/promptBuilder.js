import { personalKnowledgeBase, systemPromptBase } from '../../knowledge.js';
import { ABOUT_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT } from '../../content.js';

/**
 * Dynamically builds the strict system prompt by combining the base rules
 * with the externalized personal knowledge and portfolio data sources.
 * STRIPS visual content (SVGs, Image URLs) to drastically save LLM tokens.
 */
export function buildSystemPrompt() {
  // 1. Strip visual data (massive SVG strings/URLs) from Skills
  const cleanSkills = SKILLS_CONTENT.categories.map(cat => ({
    category: cat.label,
    skills: cat.skills.map(s => s.name)
  }));

  // 2. Strip large image URLs and icon tags from Projects
  const cleanProjects = PROJECTS_CONTENT.items.map(p => ({
    title: p.title,
    description: p.description,
    tags: p.tags,
    links: p.links?.map(l => ({ label: l.label, url: l.url }))
  }));

  // 3. Strip empty placeholder arrays from Knowledge Base
  const cleanKnowledge = {};
  for (const [key, value] of Object.entries(personalKnowledgeBase)) {
    if (Array.isArray(value) && value.length === 0) continue;
    cleanKnowledge[key] = value;
  }

  return `
${systemPromptBase}

--- PERSONAL KNOWLEDGE BASE ---
${JSON.stringify(cleanKnowledge, null, 2)}

--- PORTFOLIO ABOUT ---
${JSON.stringify(ABOUT_CONTENT, null, 2)}

--- PORTFOLIO PROJECTS ---
${JSON.stringify(cleanProjects, null, 2)}

--- PORTFOLIO SKILLS ---
${JSON.stringify(cleanSkills, null, 2)}
  `;
}
