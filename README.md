# Cinematic Personal Portfolio & Conversational AI

A high-performance, interactive personal portfolio built with vanilla JavaScript, Three.js, and Vercel Serverless functions. It features a cinematic scroll experience and a secure, AI-powered conversational interface.

## Key Features

* **Stage 1: Interactive WebGL** - A custom ping-pong fluid simulation rendered in Three.js that responds to mouse/touch interactions.
* **Stage 2: Cinematic Scroll** - A hyper-optimized 300-frame image sequence that scrubs smoothly tied to the user's scroll. Uses intelligent chunk-based preloading and dynamic GPU culling to preserve mobile battery.
* **Stage 3: Conversational AMA** - An editorial chat interface powered by an LLM, allowing visitors to ask questions about the portfolio.
* **Secure AI Backend** - Serverless architecture routing through OpenRouter. Completely hides API keys from the browser.
* **Strict Cost Protection** - Integrates Upstash Redis for strict IP-based rate limiting (burst and daily limits) to prevent abuse and runaway API costs.
* **Zero-Hallucination Knowledge** - The AI is strictly fenced to answer ONLY from an approved, editable local knowledge base.

## Tech Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Vite
* **3D/Graphics**: Three.js (Custom GLSL Shaders)
* **Backend**: Vercel Serverless Functions (`/api/chat.js`)
* **AI Provider**: OpenRouter (Configurable models)
* **Rate Limiting**: Upstash Redis