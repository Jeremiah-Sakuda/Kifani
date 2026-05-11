# FORGED Development Log

**Internal Document — Team USA x Google Cloud Hackathon 2026**

---

## Project Overview

| Metric | Value |
|--------|-------|
| Total Commits | 85 |
| Development Period | April 13 – May 10, 2026 |
| Backend Files | 45 Python files |
| Frontend Files | 31 TypeScript/TSX files |
| Backend LOC | ~9,000 lines |
| Frontend LOC | ~6,000 lines |
| Total LOC | ~15,000 lines |

---

## Development Timeline

### Phase 1: Foundation (April 13, 2026)

**Initial Scaffold** (`0028f3e`)
- Created full project structure for "Kifani" (later renamed FORGED)
- FastAPI backend + React/Vite frontend
- Basic archetype matching concept

**Core Features Built:**
- Dev mode with mock endpoints (`149f8c8`)
- Paralympic classification reference data (`f22c334`)
- Real Team USA biometric centroids (`f0f4903`)
- D3.js Digital Mirror visualization with animated clouds (`f8d9804`)
- Staggered animations and confidence meter (`1d9aa5e`)

**Key Decision:** Started with Paralympic data from day one, not as an afterthought.

---

### Phase 2: ADK Agent Architecture (April 27, 2026)

**Major Architectural Shift** — Moved from simple API to agentic orchestration.

**SSE Streaming** (`2cdec3f`, `07643d5`)
- Implemented Server-Sent Events for real-time reasoning trace
- Users see actual tool execution, not fake loading spinners
- Frontend integration with useStreamMatch hook

**8 Archetypes with Paralympic Parity** (`b522568`)
- Expanded from initial 4 archetypes to 8
- Added 2 Paralympic-first archetypes: Adaptive Power, Adaptive Endurance
- Sample weighting to balance Olympic/Paralympic representation

**Visual Redesign** (`e4bea72`)
- "Refined Industrial" aesthetic (Forge, Metal, Olympic Gold)
- Custom Tailwind theme with forge-* color palette
- Syne + Instrument Serif typography

**Multimodal Input** (`49ec09f`)
- Gemini Vision for photo analysis
- Gemini Audio for voice transcription
- Fallback to manual form entry

**Imagen Integration** (`b1ea5cc`)
- Imagen 3.0 portrait generation
- Archetype-specific prompts with Team USA poster aesthetic
- Non-photorealistic, abstract representations

**Conditional Language Layer** (`19bdd21`)
- All outputs use hedged phrasing ("could align with")
- Separate Gemini Flash validation pass
- Compliance with hackathon rules

---

### Phase 3: Deployment & CI/CD (April 27-28, 2026)

**Cloud Run Deployment** (`6e33d8e`, `f91b8c2`)
- Containerized frontend and backend
- Auto-scaling 0-10 instances
- Fixed python-multipart and TypeScript errors

**CI/CD Pipeline** (`3f3fd76`, `bd21989`)
- GitHub Actions workflow
- Ruff linting, mypy type checking
- Jest/Vitest tests
- Automated deployment to Cloud Run on push to main

**Challenges:**
- CORS issues between frontend/backend (`f20c560`)
- TypeScript strict mode catching errors (`f2900f5`)
- 224MB artifact accidentally committed (`f50bf56`)

---

### Phase 4: Compliance Hardening (April 29 – May 4, 2026)

**Critical compliance fixes to avoid disqualification.**

**IOC IP Removal** (`269a270`)
- Removed Olympic rings and torch references from Imagen prompts
- Replaced with abstract athletic imagery

**NIL Compliance** (`309af5d`, `dc26b77`, `39c7de7`)
- Removed all individual athlete names from archetype descriptions
- Frank Shorter, Jesse Owens, Usain Bolt, Mary Lou Retton, Simone Biles
- Replaced with aggregate historical references

**Language Softening** (`d8d0f71`)
- Added banned phrase tests
- "You would be great at" → "Your build could align with"
- Automated compliance testing in CI

**Testing** (`a4d0231`)
- Comprehensive tests for compliance-critical services
- Conditional language validator tests
- Archetype content compliance tests

---

### Phase 5: Feature Expansion (May 4, 2026)

**Paralympic Spotlight Mode** (`05f499e`)
- Browse 30+ Paralympic classification codes
- Detailed eligibility explanations
- First-class Paralympic exploration

**Era Time Machine** (`bce75dc`)
- D3.js visualization of archetype evolution
- Four historical eras: 1896–1950, 1950–1980, 1980–2000, 2000+
- Shows how body types changed over 120 years

**About & Methodology** (`7f23396`)
- Data sources and methodology explanation
- Privacy and ethical considerations
- Hackathon compliance documentation

**Shareable Result Card** (`417b7ed`)
- LA28 branding elements
- Viral potential for social sharing

---

### Phase 6: Advanced Gemini Features (May 9, 2026)

**Paralympic Discovery Mode** (`8ce5609`, `0b43ade`)
- Toggle to surface Paralympic sports first
- Archetype insights for enhanced discovery

**Validation Trace** (`2154936`, `c7da236`)
- "Gemini auditing Gemini" transparency
- Shows modification history and latency
- Expandable panel in Results UI

**Secondary Archetypes** (`84db5db`, `10d0c5b`)
- Shows 2nd and 3rd best matches
- Delta percentage from primary
- Paralympic-first badge

**BQML Service** (`6977409`)
- BigQuery ML integration for data-driven matching
- SQL-based K-means clustering script

---

### Phase 7: Hackathon Polish (May 10, 2026)

**Five Major Gemini Capabilities Added:**

1. **Search Grounding** (`41dc1ca`, `85f027e`)
   - Google Search integration via Vertex AI
   - Finds current Team USA athletes in recommended sports
   - Real-time relevance

2. **Thinking Traces** (`825fb6c`, `bd2c771`)
   - Gemini 2.5 Pro reasoning streamed live
   - Users see HOW the agent decides
   - SSE event type: "reasoning"

3. **Context Caching** (`bc291fd`)
   - 120-year archetype corpus cached in Vertex AI
   - 1-hour TTL for efficient reuse
   - Reduces token costs

4. **Semantic Matching** (`4e279cb`, `22e6d30`)
   - text-embedding-005 parallel matching
   - Dual-signal results: K-means + semantic
   - Confidence boost when signals agree

5. **Enhanced Share Card** (`b2748f4`)
   - Portrait slot integration
   - Sport tags
   - Paralympic-first indicator

**Accessibility** (`efb9cb3`)
- ARIA labels throughout
- Keyboard navigation
- Screen reader descriptions for D3 visualizations
- Skip-to-content link

**How It Works Page** (`ddd3561`)
- Agent architecture diagram
- 5-tool documentation
- Data statistics

**Bug Fixes:**
- CORS with ALLOWED_ORIGINS (`7124cfe`)
- ConfidenceMeter width collapse (`8f6f506`)
- Markdown rendering for narrative (`a2a49b6`)
- Imagen error handling (`208b93a`)

---

## Technical Challenges & Solutions

### Challenge 1: CORS on Cloud Run
**Problem:** Frontend couldn't reach backend API after deployment.
**Solution:** Added `ALLOWED_ORIGINS` environment variable to backend deployment, configured CORS middleware to accept specific origins.

### Challenge 2: ConfidenceMeter Width Collapse
**Problem:** Component squished to ~4px inside `text-center` parent.
**Solution:** Explicit `display: block` and `width: 100%` inline styles, plus `min-w-0` to prevent flex shrinking.

### Challenge 3: Markdown Not Rendering
**Problem:** Narrative contained `**bold**` and `###` headings displayed as raw text.
**Solution:** Installed `react-markdown` and `@tailwindcss/typography`, replaced `<p>` with `<ReactMarkdown>` component.

### Challenge 4: Imagen Generation Failures
**Problem:** Portrait generation failing silently in production.
**Solution:** Added detailed error logging with traceback, improved UI to show actual error message with Skip button.

### Challenge 5: NIL Compliance
**Problem:** Initially included athlete names which violates hackathon rules.
**Solution:** Systematic removal of all individual athlete references, replaced with aggregate historical descriptions.

### Challenge 6: Paralympic Parity
**Problem:** Most sports apps treat Paralympic as afterthought.
**Solution:** Built Paralympic-first archetypes from day one, 30+ classification codes, sample weighting, discovery mode toggle.

---

## Architecture Decisions

### Why ADK Agent Pattern?
- Judges want to see real agentic behavior, not scripted flows
- SSE streaming shows actual reasoning, builds trust
- 5-tool orchestration demonstrates Gemini capabilities

### Why 8 Archetypes?
- K-means elbow analysis showed optimal clustering
- 6 general + 2 Paralympic-first provides balance
- Enough variety without overwhelming users

### Why Dual-Signal Matching?
- K-means alone can miss nuance
- Semantic embeddings capture self-description
- Agreement boosts confidence, disagreement flags exploration

### Why Context Caching?
- 120-year corpus is ~50K tokens
- Repeated sessions would be expensive
- 1-hour cache reduces costs by 90%+

---

## Metrics & Stats

### Codebase
- 85 commits over 27 days
- 76 source files (45 Python, 31 TypeScript)
- ~15,000 lines of code

### Data
- 14,218 Olympic athlete records (1896–2024)
- 2,847 Paralympic athlete records (1960–2024)
- 30+ Paralympic classification codes
- 8 archetypes with biometric centroids

### Google Cloud Services Used
- Vertex AI (Gemini 2.5 Pro, Gemini 2.5 Flash, Imagen 3.0)
- Vertex AI Embeddings (text-embedding-005)
- Vertex AI Context Caching
- Google Search Grounding
- Cloud Run (frontend + backend)
- Cloud Build (CI/CD)
- BigQuery (athlete data)
- Firestore (session persistence)

---

## Remaining Known Issues

1. **Imagen API Access** — May fail if Vertex AI API not enabled or service account lacks permissions. Now shows detailed error message.

2. **DEV_MODE Default** — Defaults to `true` in code, must be explicitly set to `false` in production deployment.

3. **Mobile Touch** — Some D3 interactions may need touch event handling for mobile.

---

## Lessons Learned

1. **Compliance First** — Should have automated NIL/IOC checks from day one
2. **Error Visibility** — Silent failures hurt debugging; always surface errors
3. **Progressive Enhancement** — Fallbacks (abstract viz, manual entry) improve UX
4. **Test Early** — CI caught many issues before they reached production
5. **Paralympic Parity** — Building it in from the start was much easier than retrofitting

---

## Contributors

- Development: Solo developer
- Duration: ~4 weeks
- Tools: Claude Code, VS Code, GitHub Copilot

---

*Last updated: May 10, 2026*
