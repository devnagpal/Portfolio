import { personalKnowledgeBase, systemPromptBase } from '../../knowledge.js';
import { ABOUT_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT } from '../../content.js';

/**
 * Dynamically builds the strict system prompt by combining the base rules
 * with the externalized personal knowledge and portfolio data sources.
 */
export function buildSystemPrompt() {
  return `
${systemPromptBase}

--- PERSONAL KNOWLEDGE BASE ---
${JSON.stringify(personalKnowledgeBase, null, 2)}

--- PORTFOLIO ABOUT ---
${JSON.stringify(ABOUT_CONTENT, null, 2)}

--- PORTFOLIO PROJECTS ---
${JSON.stringify(PROJECTS_CONTENT, null, 2)}

--- PORTFOLIO SKILLS ---
${JSON.stringify(SKILLS_CONTENT, null, 2)}
  `;
}
