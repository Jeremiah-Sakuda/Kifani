# FORGED — Devpost Submission

*Use this as a template for your Devpost submission text.*

---

## Inspiration

Every fan watching the Olympics or Paralympics wonders: "Where would I fit?" We wanted to create a tool that answers that question — not by guessing, but by analyzing 120 years of Team USA athlete data to find genuine body-type patterns.

We were also inspired by the need for true Paralympic parity. Most sports tools treat Paralympic athletes as an afterthought. FORGED integrates them from the ground up, with dedicated archetypes and equal analytical depth.

## What it does

FORGED matches fans to one of 8 Team USA athlete archetypes based on their physical build:

1. **Upload a photo, record your voice, or fill out a form** — Gemini analyzes your body proportions through any input method
2. **Discover your archetype** — See which body-type pattern you share with historical Team USA athletes
3. **Explore the Digital Mirror** — An interactive visualization showing where you land among 120 years of Olympic and Paralympic champions
4. **Get your stylized portrait** — Imagen generates a non-photorealistic artistic portrait representing your archetype
5. **Ask follow-up questions** — Continue the conversation with our Gemini-powered agent

**Beyond Personal Matching:**
- **Paralympic Spotlight** — Explore 30+ classification codes, see side-by-side Olympic/Paralympic parity comparisons, and discover Paralympic-first archetypes
- **Era Time Machine** — D3.js visualization of how each archetype's body type has evolved across 4 eras (1896–1950, 1950–1980, 1980–2000, 2000+)

The 8 archetypes include 2 Paralympic-first categories (Adaptive Power, Adaptive Endurance) ensuring Paralympic athletes aren't just included — they're featured.

## How we built it

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS, with D3.js for the Digital Mirror visualization and Framer Motion for animations.

**Backend:** FastAPI (Python 3.12) with a Gemini 2.5 Pro agent orchestrating 4 specialized tools via function calling.

**Google Cloud Stack:**
- **Vertex AI Gemini 2.5 Pro** — Agent orchestration with function calling
- **Vertex AI Gemini 2.0 Flash** — Photo/voice analysis + conditional language validation
- **Vertex AI Imagen 3.0** — Non-photorealistic archetype portraits
- **BigQuery** — 16,065 athlete records (14,218 Olympic + 2,847 Paralympic)
- **Firestore** — Session persistence for multi-turn conversations
- **Cloud Run** — Serverless deployment with auto-scaling
- **Cloud Build** — CI/CD pipeline

**Key Technical Features:**
- Real-time streaming via Server-Sent Events (SSE)
- K-means clustering with Paralympic sample weighting (1.15x)
- Conditional language validation layer ensuring "could align with" phrasing
- Multimodal input (photo, voice, form)

## Challenges we ran into

1. **Paralympic parity** — The Paralympic dataset is smaller. We solved this with inverse sample weighting (1.15x) so Paralympic archetypes appear with equal probability despite fewer data points.

2. **Conditional language** — The rules require avoiding definitive claims. We built a separate Gemini Flash validation pass that rewrites any "you would" statements to "you could" before display.

3. **IOC IP compliance** — We had to carefully avoid any Olympic rings, torch imagery, or protected terminology throughout the application.

4. **Multimodal reliability** — Photo and voice analysis can be noisy. We implemented a confidence-based fallback chain: try photo → try voice → always offer form.

## Accomplishments that we're proud of

- **Structural Paralympic parity** — Not a checkbox feature. 2 dedicated Paralympic-first archetypes, 30+ classification code explainers, side-by-side parity comparisons, and 1.15x weighted clustering.
- **Era Time Machine** — D3.js visualization of 120 years of athlete evolution with per-archetype statistics across 4 historical eras.
- **Real agentic architecture** — 4 specialized tools with visible reasoning trace, not simulated loading spinners.
- **Imagen Digital Mirror** — The stylized portrait reveal creates a memorable moment.
- **Conditional language compliance** — Built-in validation layer that rewrites any definitive claims to hedged phrasing.
- **Full accessibility** — ARIA labels, keyboard navigation, screen reader support, WCAG-compliant focus states.
- **Data compliance** — Zero prohibited data (no times, no NIL, no IOC IP).

## What we learned

- Gemini's function calling is powerful enough for real agentic workflows
- Server-Sent Events create a much better UX than polling for AI responses
- Paralympic sports classification is fascinating and deserves more visibility
- Imagen's non-photorealistic mode produces surprisingly artistic results

## What's next for FORGED

1. **Squad Mode** — Let friend groups discover their collective archetype mix with Firestore-backed room state
2. **Live Voice** — Real-time voice interaction using Gemini Live Voice API
3. **AR Mirror** — Use ARCore to project the archetype portrait onto the user's camera feed
4. **More archetypes** — Expand from 8 to 12+ with sport-specific variants
5. **Training recommendations** — Partner with trainers to suggest archetype-appropriate workouts

---

## Built With

- React
- TypeScript
- Python
- FastAPI
- Tailwind CSS
- D3.js
- Framer Motion
- Google Cloud Run
- Google Cloud Build
- Vertex AI
- Gemini
- Imagen
- BigQuery
- Firestore

---

## Try It Out

- **Live Demo:** <!-- TODO: Add deployed frontend URL before submission -->
- **GitHub:** https://github.com/Jeremiah-Sakuda/Kifani
- **Video:** <!-- TODO: Add unlisted YouTube video URL before submission -->
