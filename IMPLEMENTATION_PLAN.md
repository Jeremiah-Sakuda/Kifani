# FORGED — Comprehensive Implementation Plan

**Project:** FORGED — Athlete Archetype Agent
**Tagline:** Forged from 120 years of Team USA
**Deadline:** May 11, 2026 @ 5:00 PM PT
**Target:** Grand Prize ($15K) or Challenge 4 Winner ($8K)

---

## Executive Summary

This document outlines the complete transformation of the existing Kifani scaffolding into FORGED — a Gemini-powered agent that matches fans to their Team USA athletic archetype through multimodal input, with structural Paralympic parity and an Imagen-generated "Digital Mirror" as its signature differentiator.

---

## Part 1: Gap Analysis

### Current State (Kifani) vs Target State (FORGED)

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| **Archetypes** | 6 | 8 | Add Adaptive Power, Adaptive Endurance |
| **Input Modalities** | Form only | Photo + Voice + Form | Add 2 multimodal paths |
| **Agent Architecture** | Basic Gemini function calling | ADK with 4 tools + SSE | Full rewrite |
| **Visualization** | D3 scatter plot | + Imagen Mirror portrait | New feature |
| **Language Layer** | Conditional phrasing in prompts | Separate Flash validation | New service |
| **Regional Context** | Not implemented | Tool + display | New feature |
| **Frontend** | Functional prototype | Production-grade, distinctive | Full redesign |

---

## Part 2: Frontend Design Strategy

### Design Thinking Framework

#### 1. Purpose
FORGED solves the **recognition gap** — fans don't see themselves in athletic data. The interface must bridge the gap between casual physicality and elite Olympic/Paralympic competition, making 120 years of Team USA feel personally relevant.

#### 2. Tone: **Refined Industrial**
We commit to a **bold aesthetic direction** that reflects the product's core metaphor — being *forged* like metal, shaped by the heat of competition.

**Primary aesthetic:** Industrial meets Olympic prestige
- Raw, honest materials (metal, forge, heat)
- Precision engineering (data, clustering, AI)
- Golden moments of triumph (accent color)
- Dark foundry atmosphere with moments of brilliant light

**NOT generic AI aesthetics. NOT purple gradients on white. NOT cookie-cutter dashboards.**

#### 3. Constraints
- React 19 + TypeScript + Tailwind CSS 4
- Framer Motion for animation
- D3 for data visualization
- Must work on desktop and mobile
- Accessibility: WCAG 2.1 AA minimum
- Performance: LCP < 2.5s, CLS < 0.1

#### 4. Differentiation: The Imagen Mirror
The **one thing judges will remember** after watching 30 submissions: a stylized AI-generated portrait that transforms the user into their archetype. This is the centerpiece reveal — it must be theatrical.

---

### Visual Design System

#### Typography

**Display Font:** Instrument Serif or Playfair Display
- Headlines, archetype names, dramatic moments
- Weight: 400-700
- Elegant yet strong — reflects Olympic tradition

**Body Font:** Satoshi or Syne
- Interface text, descriptions, form labels
- Clean, modern, slightly industrial
- Weight: 400-600

**Monospace Accent:** JetBrains Mono
- Agent reasoning trace, data points, classifications
- Reinforces technical credibility

**AVOID:** Inter, Space Grotesk, Roboto, system fonts

#### Color Palette

```css
:root {
  /* Forge Core */
  --forge-black: #0a0a0a;
  --forge-charcoal: #141414;
  --forge-steel: #1c1c1e;
  --forge-iron: #2a2a2c;

  /* Heat Gradient */
  --ember-deep: #1a0a00;
  --ember-glow: #ff4500;
  --ember-bright: #ff6b35;

  /* Olympic Gold */
  --gold-deep: #8b6914;
  --gold-core: #d4a012;
  --gold-bright: #ffd700;
  --gold-white: #fff8dc;

  /* Paralympic Pride */
  --para-red: #e31837;
  --para-blue: #0081c8;
  --para-green: #00a651;

  /* Neutral Scale */
  --ash: #6b6b6b;
  --smoke: #a0a0a0;
  --silver: #d4d4d4;
  --platinum: #f5f5f5;
}
```

**Theme:** Dark mode primary. The forge is dark; the gold shines brighter in darkness.

#### Motion Philosophy

**High-Impact Moments:**
1. **Page load:** Staggered fade-up reveals with forge spark effects
2. **Input submission:** Heat ripple emanating from the submit button
3. **Reasoning trace:** Tool calls appear like sparks flying from anvil strikes
4. **Mirror reveal:** Dramatic unveil — metal curtain parts to reveal portrait
5. **Archetype match:** Gold pulse radiates outward

**Micro-interactions:**
- Buttons: Subtle ember glow on hover
- Cards: Lift with golden shadow on focus
- Form fields: Underline ignites on focus

**Animation Library:** Framer Motion for orchestration, CSS for micro-interactions

#### Spatial Composition

**Layout Principles:**
- Asymmetric hero sections
- Overlapping elements (archetype cards overlap Digital Mirror)
- Diagonal flow on results page
- Generous vertical rhythm with dramatic section breaks
- Full-bleed imagery contrasted with contained content areas

**Grid System:**
- 12-column base
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Max content width: 1400px
- Section padding: 80px vertical (desktop), 48px (mobile)

#### Backgrounds & Texture

**Atmospheric Elements:**
- Noise texture overlay (3-5% opacity)
- Subtle gradient mesh in hero (ember tones)
- Radial glow behind the Mirror reveal
- Geometric grid pattern (faint, forge-floor reference)
- Particle effects for reasoning trace (floating sparks)

---

### Component Architecture

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── InputModeSelector.tsx
│   │   ├── PhotoInput.tsx
│   │   ├── VoiceInput.tsx
│   │   └── FormInput.tsx
│   │
│   ├── processing/
│   │   ├── ReasoningTrace.tsx
│   │   ├── ToolCallCard.tsx
│   │   └── ForgeAnimation.tsx
│   │
│   ├── results/
│   │   ├── ResultsPage.tsx
│   │   ├── ArchetypeReveal.tsx
│   │   ├── MirrorReveal.tsx
│   │   ├── DigitalMirror.tsx (D3 visualization)
│   │   ├── SportSection.tsx
│   │   ├── SportCard.tsx
│   │   ├── ClassificationPopover.tsx
│   │   ├── RegionalContext.tsx
│   │   └── HistoricalContext.tsx
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── SuggestedPrompts.tsx
│   │
│   └── shared/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       ├── Tooltip.tsx
│       ├── Modal.tsx
│       └── LoadingDots.tsx
│
├── hooks/
│   ├── useArchetypeMatch.ts
│   ├── useSSEStream.ts
│   ├── useChat.ts
│   ├── usePhotoCapture.ts
│   └── useVoiceRecording.ts
│
├── services/
│   └── api.ts
│
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── animations.css
│
├── types/
│   └── index.ts
│
├── App.tsx
└── main.tsx
```

---

## Part 3: Backend Architecture

### ADK Agent Design

```
backend/app/
├── main.py
├── models/
│   ├── schemas.py
│   ├── archetypes.py (8 archetypes)
│   └── __init__.py
│
├── routers/
│   ├── match.py          # POST /api/match
│   ├── stream.py         # GET /api/match/stream (SSE)
│   ├── photo.py          # POST /api/extract-from-photo
│   ├── voice.py          # POST /api/extract-from-voice
│   ├── mirror.py         # POST /api/generate-mirror
│   ├── chat.py           # POST /api/chat
│   ├── session.py        # GET /api/session/{id}
│   └── __init__.py
│
├── services/
│   ├── adk_agent.py           # ADK orchestration
│   ├── clustering.py          # K-means matching
│   ├── gemini_vision.py       # Photo extraction
│   ├── gemini_live.py         # Voice extraction
│   ├── imagen_service.py      # Imagen 4 generation
│   ├── conditional_validator.py  # Flash validation layer
│   ├── bigquery_service.py    # Athlete data queries
│   ├── firestore_service.py   # Session persistence
│   └── __init__.py
│
├── tools/
│   ├── match_archetype.py
│   ├── classify_paralympic.py
│   ├── regional_context.py
│   └── generate_followups.py
│
├── prompts/
│   ├── system_prompt.py
│   ├── match_prompt.py
│   ├── vision_prompt.py
│   ├── mirror_prompt.py
│   └── validation_prompt.py
│
└── __init__.py
```

### API Endpoints

#### Match Endpoint (Standard)
```
POST /api/match
Content-Type: application/json

Request:
{
  "input_mode": "form" | "photo" | "voice",
  "traits": {
    "height_cm": float,
    "weight_kg": float,
    "arm_span_cm": float | null,
    "age_range": string | null,
    "activity_preferences": string[] | null
  },
  "photo_base64": string | null,
  "audio_base64": string | null,
  "region": string | null
}

Response:
{
  "session_id": uuid,
  "primary_archetype": ArchetypeResult,
  "secondary_archetypes": ArchetypeResult[],
  "olympic_sports": SportMatch[],
  "paralympic_sports": SportMatch[],
  "digital_mirror": MirrorData,
  "regional_context": RegionalContext | null,
  "narrative": string,
  "validation_trace": ValidationTrace
}
```

#### Match Stream Endpoint (SSE)
```
GET /api/match/stream?session_id={uuid}
Accept: text/event-stream

Events:
event: tool_call
data: {"tool": "match_archetype", "status": "calling", "args": {...}}

event: tool_result
data: {"tool": "match_archetype", "status": "complete", "result": {...}}

event: reasoning
data: {"step": 1, "thought": "Analyzing biometric inputs..."}

event: complete
data: {"session_id": "...", "redirect": "/results/..."}
```

#### Photo Extraction
```
POST /api/extract-from-photo
Content-Type: application/json

Request:
{
  "image_base64": string,
  "mime_type": "image/jpeg" | "image/png"
}

Response:
{
  "success": boolean,
  "confidence": float,
  "extracted_traits": {
    "estimated_height_ratio": float,
    "body_proportions": {...},
    "posture_signals": string[]
  },
  "fallback_required": boolean,
  "fallback_reason": string | null
}
```

#### Voice Extraction
```
POST /api/extract-from-voice
Content-Type: application/json

Request:
{
  "audio_base64": string,
  "mime_type": "audio/webm" | "audio/wav"
}

Response:
{
  "success": boolean,
  "transcript": string,
  "extracted_traits": {
    "height_cm": float | null,
    "weight_kg": float | null,
    "descriptors": string[]
  },
  "confidence": float
}
```

#### Mirror Generation
```
POST /api/generate-mirror
Content-Type: application/json

Request:
{
  "session_id": uuid,
  "archetype": string,
  "style_hints": string[] | null
}

Response:
{
  "image_url": string,
  "expires_at": datetime,
  "generation_id": string
}
```

### ADK Tool Definitions

#### Tool 1: match_archetype
```python
@tool
def match_archetype(
    height_cm: float,
    weight_kg: float,
    arm_span_cm: float | None = None,
    activity_preferences: list[str] | None = None
) -> ArchetypeMatchResult:
    """
    Match user traits to the 8 Team USA archetypes.
    Returns ranked probabilities with confidence scores.
    Uses k-means clustering on normalized biometric vectors.
    Paralympic data is sample-weighted for structural parity.
    """
```

#### Tool 2: classify_paralympic
```python
@tool
def classify_paralympic(
    archetype: str,
    classification_context: str | None = None,
    disability_type: str | None = None
) -> ParalympicClassificationResult:
    """
    Generate Paralympic sport mappings with classification depth.
    Explains classification codes (T54, T11, S6, S10, etc.)
    with the same rigor as Olympic event categorization.
    """
```

#### Tool 3: regional_context
```python
@tool
def regional_context(
    archetype: str,
    region: str
) -> RegionalContextResult:
    """
    Return aggregated archetype prevalence patterns for a region.
    No individual identification — patterns only.
    Based on public census + historical Team USA hometown data.
    """
```

#### Tool 4: generate_followups
```python
@tool
def generate_followups(
    session_id: str,
    conversation_history: list[dict]
) -> list[str]:
    """
    Generate personalized follow-up questions based on session context.
    Examples: "Why this sport and not that one?"
    "What about endurance events specifically?"
    """
```

---

## Part 4: Data Architecture

### BigQuery Schema

#### athletes table
```json
{
  "fields": [
    {"name": "athlete_id", "type": "STRING"},
    {"name": "name", "type": "STRING"},
    {"name": "sex", "type": "STRING"},
    {"name": "height_cm", "type": "FLOAT"},
    {"name": "weight_kg", "type": "FLOAT"},
    {"name": "bmi", "type": "FLOAT"},
    {"name": "sport", "type": "STRING"},
    {"name": "event", "type": "STRING"},
    {"name": "year", "type": "INTEGER"},
    {"name": "season", "type": "STRING"},
    {"name": "games_type", "type": "STRING"},
    {"name": "medal", "type": "STRING"},
    {"name": "country", "type": "STRING"},
    {"name": "region", "type": "STRING"},
    {"name": "classification", "type": "STRING"}
  ]
}
```

#### archetype_centroids table
```json
{
  "fields": [
    {"name": "archetype_id", "type": "STRING"},
    {"name": "name", "type": "STRING"},
    {"name": "description", "type": "STRING"},
    {"name": "height_cm_mean", "type": "FLOAT"},
    {"name": "height_cm_std", "type": "FLOAT"},
    {"name": "weight_kg_mean", "type": "FLOAT"},
    {"name": "weight_kg_std", "type": "FLOAT"},
    {"name": "bmi_mean", "type": "FLOAT"},
    {"name": "bmi_std", "type": "FLOAT"},
    {"name": "olympic_sports", "type": "STRING", "mode": "REPEATED"},
    {"name": "paralympic_sports", "type": "STRING", "mode": "REPEATED"},
    {"name": "sample_weight", "type": "FLOAT"}
  ]
}
```

#### paralympic_classifications table
```json
{
  "fields": [
    {"name": "code", "type": "STRING"},
    {"name": "sport", "type": "STRING"},
    {"name": "category", "type": "STRING"},
    {"name": "description", "type": "STRING"},
    {"name": "eligibility", "type": "STRING"},
    {"name": "example_events", "type": "STRING", "mode": "REPEATED"}
  ]
}
```

### 8 Archetypes (Updated)

| # | Archetype | Height (cm) | Weight (kg) | BMI | Olympic Sports | Paralympic Sports |
|---|-----------|-------------|-------------|-----|----------------|-------------------|
| 1 | **Powerhouse** | 183 | 103 | 30.8 | Weightlifting, Wrestling, Shot Put | Para Powerlifting, Wheelchair Rugby |
| 2 | **Aerobic Engine** | 178 | 72 | 22.5 | Marathon, Triathlon, XC Skiing | Para Cycling, Para Triathlon |
| 3 | **Precision Athlete** | 177 | 74 | 23.7 | Archery, Shooting, Fencing | Para Archery, Boccia, Para Shooting |
| 4 | **Explosive Mover** | 178 | 70 | 22.0 | 100m, Long Jump, Decathlon | T44 Sprints, T64 Long Jump |
| 5 | **Coordinated Specialist** | 165 | 59 | 21.6 | Gymnastics, Diving, Figure Skating | Para Swimming (S6-S8), Wheelchair Fencing |
| 6 | **Tactical Endurance** | 185 | 82 | 24.0 | Rowing, Modern Pentathlon, 800m | Para Rowing, Middle Distance |
| 7 | **Adaptive Power** | 175 | 85 | 27.8 | — | Seated Throws, Wheelchair Sprints, Wheelchair Basketball |
| 8 | **Adaptive Endurance** | 172 | 68 | 23.0 | — | Wheelchair Marathon, Para Cycling, Para XC Skiing |

---

## Part 5: Implementation Phases

### Phase 1: Foundation (Days 1-3)
**Priority: Critical**

- [ ] Update `archetypes.py` with 8 archetypes and new centroids
- [ ] Re-run k-means clustering on full dataset with Paralympic weighting
- [ ] Update BigQuery schemas and upload new centroid data
- [ ] Update clustering service for 8-archetype model
- [ ] Write archetype descriptions and historical context
- [ ] Add Paralympic classification explainers

**Deliverables:**
- 8 working archetypes in backend
- Clustering API returns all 8 with correct probabilities
- Unit tests for clustering logic

---

### Phase 2: ADK Agent (Days 4-7)
**Priority: Critical**

- [ ] Install and configure Google ADK
- [ ] Implement `match_archetype` tool
- [ ] Implement `classify_paralympic` tool
- [ ] Implement `regional_context` tool
- [ ] Implement `generate_followups` tool
- [ ] Create ADK agent orchestrator with tool loop
- [ ] Implement SSE streaming endpoint
- [ ] Add reasoning trace events
- [ ] Test multi-turn agent conversation

**Deliverables:**
- ADK agent callable with all 4 tools
- SSE endpoint streams tool calls in real-time
- Agent loop continues until user ends session

---

### Phase 3: Multimodal Input (Days 8-11)
**Priority: Critical**

- [ ] Implement Gemini Vision photo extraction service
- [ ] Create photo proportion analysis prompt
- [ ] Add confidence threshold and fallback logic
- [ ] Implement Gemini Live voice transcription service
- [ ] Create voice descriptor extraction prompt
- [ ] Build fallback chain: Photo → Voice → Form
- [ ] Add Cloud Storage for temporary photo/audio (1-hour TTL)

**Deliverables:**
- Photo input extracts body proportions with confidence score
- Voice input transcribes and extracts physical descriptors
- Graceful fallback to form when confidence is low

---

### Phase 4: Imagen Mirror (Days 12-14)
**Priority: High — Differentiator**

- [ ] Configure Imagen 4 API access (Vertex AI)
- [ ] Design archetype-specific prompt templates
- [ ] Implement mirror generation service
- [ ] Add safety filters and content moderation
- [ ] Store generated images in Cloud Storage with TTL
- [ ] Create regeneration endpoint for variations

**Deliverables:**
- Imagen generates non-photorealistic archetype portraits
- No individual likeness, no athletic gear
- Images cached with 1-hour expiration

---

### Phase 5: Conditional Language Layer (Days 15-16)
**Priority: High**

- [ ] Create conditional validator service using Gemini Flash
- [ ] Define validation rules (could/might/may phrasing)
- [ ] Add validation as final pass on all outputs
- [ ] Log validation traces for demo proof
- [ ] Add judge-visible code comments

**Deliverables:**
- All outputs pass Flash validation
- Trace logged in session for demo
- Code clearly shows separate validation step

---

### Phase 6: Frontend Redesign (Days 17-23)
**Priority: Critical**

#### 6.1 Design System Setup (Day 17)
- [ ] Configure Tailwind with new color palette
- [ ] Import Instrument Serif, Satoshi, JetBrains Mono
- [ ] Create CSS custom properties for tokens
- [ ] Build noise texture overlay
- [ ] Create animation utilities

#### 6.2 Shared Components (Day 18)
- [ ] Button (primary, secondary, ghost variants)
- [ ] Card (glass, solid variants)
- [ ] Input, Select, Badge
- [ ] ProgressBar, Tooltip, Modal
- [ ] LoadingDots, ForgeAnimation

#### 6.3 Landing Page (Days 19-20)
- [ ] Hero section with dramatic typography
- [ ] Input mode selector (Photo/Voice/Form tabs)
- [ ] Photo input with camera/upload
- [ ] Voice input with recording UI
- [ ] Form input (refined from existing)
- [ ] Animated background with ember gradient

#### 6.4 Processing Page (Day 21)
- [ ] Reasoning trace component
- [ ] Tool call cards with live status
- [ ] Forge animation (sparks, heat effects)
- [ ] SSE hook for real-time updates

#### 6.5 Results Page (Days 22-23)
- [ ] Archetype reveal with staggered animation
- [ ] Mirror reveal with theatrical unveil
- [ ] Digital Mirror D3 visualization (enhanced)
- [ ] Olympic sports section
- [ ] Paralympic sports section with classification popovers
- [ ] Regional context display
- [ ] Historical context section
- [ ] Chat interface with suggested prompts

**Deliverables:**
- Complete frontend redesign
- Distinctive, production-grade aesthetic
- All animations smooth and intentional
- Mobile-responsive

---

### Phase 7: Integration & Polish (Days 24-26)
**Priority: High**

- [ ] Connect frontend to all backend endpoints
- [ ] End-to-end testing of all 3 input paths
- [ ] Error handling and fallback UI
- [ ] Loading states throughout
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (LCP < 2.5s)
- [ ] Cross-browser testing

**Deliverables:**
- Fully integrated application
- All paths working end-to-end
- Error states graceful and informative

---

### Phase 8: Demo & Deployment (Days 27-28)
**Priority: Critical**

- [ ] Deploy to Cloud Run
- [ ] Configure Cloud Build CI/CD
- [ ] Set up Cloud Logging and Trace
- [ ] Create Vertex AI usage dashboard
- [ ] Pre-warm quota and set billing alerts
- [ ] Cache common archetype outputs
- [ ] Record 3-minute demo video
- [ ] Write README with parity documentation
- [ ] Ensure Apache 2.0 license visible

**Deliverables:**
- Production deployment on Cloud Run
- Demo video < 3:00 with captions
- README complete with parity architecture
- Apache 2.0 visible in repo About

---

## Part 6: Demo Video Script (3:00)

| Timestamp | Beat | Visual |
|-----------|------|--------|
| 0:00-0:18 | Cold open. Wheelchair racer footage. VO: "120 years of Team USA. 30,000 athletes. One question: where do you fit?" | Dramatic montage → Title card |
| 0:18-0:40 | Live photo input. Gemini Vision processing visible. Brief code overlay. | Phone camera → Upload → Vision API call |
| 0:40-1:10 | Agent processing. SSE stream visible. Vertex AI console toggle. | Reasoning trace → Console view |
| 1:10-1:50 | Results reveal. Archetype, sports, Mirror generation. | Staggered reveal → Mirror unveil |
| 1:50-2:20 | Paralympic parity demo. Voice: "What sports could a T54 athlete with my build train toward?" | Voice input → Classification response |
| 2:20-2:45 | Technical proof. ADK code, license, Cloud Run dashboard. | Code view → Dashboard |
| 2:45-3:00 | Vision close. "FORGED isn't a recommendation engine. It's a mirror. See yourself in Team USA." | Final Mirror shot → Logo |

---

## Part 7: Risk Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini Vision unreliable on casual photos | Medium | High | Confidence threshold → form fallback |
| Imagen generates off-brand imagery | Medium | Medium | Fixed prompt template + safety filters + pre-review |
| Vertex AI quota exhaustion | Low | Critical | Pre-warm, billing alerts, response caching |
| SSE complexity causes bugs | Medium | Medium | Graceful degradation to polling |
| Demo runs long | Medium | Medium | Script to 2:50, leave 10-second buffer |
| Paralympic data sparse | High | Medium | Document gaps, weight clustering, surface in demo |

---

## Part 8: Success Criteria

### Submission Day Checklist
- [ ] All 8 archetypes produce coherent matches
- [ ] All 3 input modalities work in production
- [ ] Imagen Mirror generates for each archetype
- [ ] SSE streaming shows real agent reasoning
- [ ] Paralympic parity is structural (equal weighting, classification depth)
- [ ] Conditional language validated on all outputs
- [ ] Demo video < 3:00 with English captions
- [ ] Repo public, Apache 2.0 visible, README complete

### Judging Criteria Alignment

| Criterion | Weight | FORGED Approach |
|-----------|--------|-----------------|
| **Impact** | 40% | Structural Paralympic parity, multimodal accessibility, personal emotional connection |
| **Technical Depth** | 30% | Vision + Live + Imagen + Pro + Flash, ADK 4-tool agent, SSE streaming, separate validation |
| **Presentation** | 30% | Distinctive industrial aesthetic, theatrical Mirror reveal, Paralympic-led opening |

---

## Part 9: File Inventory

### New Files to Create

**Backend:**
- `backend/app/routers/stream.py`
- `backend/app/routers/photo.py`
- `backend/app/routers/voice.py`
- `backend/app/routers/mirror.py`
- `backend/app/services/adk_agent.py`
- `backend/app/services/gemini_vision.py`
- `backend/app/services/gemini_live.py`
- `backend/app/services/imagen_service.py`
- `backend/app/services/conditional_validator.py`
- `backend/app/tools/match_archetype.py`
- `backend/app/tools/classify_paralympic.py`
- `backend/app/tools/regional_context.py`
- `backend/app/tools/generate_followups.py`
- `backend/app/prompts/vision_prompt.py`
- `backend/app/prompts/mirror_prompt.py`
- `backend/app/prompts/validation_prompt.py`

**Frontend (Complete Redesign):**
- All files in new component architecture (see Part 2)
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/animations.css`
- `frontend/src/hooks/useSSEStream.ts`
- `frontend/src/hooks/usePhotoCapture.ts`
- `frontend/src/hooks/useVoiceRecording.ts`

### Files to Modify

- `backend/app/models/archetypes.py` — Add 2 archetypes
- `backend/app/main.py` — Register new routers
- `backend/app/models/schemas.py` — New request/response models
- `data/schemas/archetype_centroids.json` — 8 archetypes
- `README.md` — Full rewrite with parity documentation
- `frontend/package.json` — New font dependencies
- `frontend/tailwind.config.js` — New color palette

---

## Appendix A: Design Reference Board

### Aesthetic Inspiration
- **Olympic broadcast graphics** (NBC, Omega timing systems)
- **Industrial photography** (foundries, steel mills, forge work)
- **Data visualization** (The Pudding, Reuters Graphics)
- **Typography** (Emigre, House Industries)

### Color Mood
- Dark steel backgrounds
- Golden accent moments
- Ember/heat gradients for transitions
- High contrast typography

### Motion Reference
- Staggered reveals (Apple product pages)
- Particle systems (award show graphics)
- Theatrical unveils (game cinematics)

---

## Appendix B: Accessibility Checklist

- [ ] Color contrast ratio ≥ 4.5:1 for body text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works throughout
- [ ] Screen reader labels on all controls
- [ ] Alt text for Imagen Mirror outputs
- [ ] Reduced motion media query respected
- [ ] Form error messages associated with inputs
- [ ] Photo/voice inputs have form fallback
- [ ] Video captions for demo

---

*Document Version: 1.0*
*Last Updated: April 27, 2026*
*Author: Implementation Team*
