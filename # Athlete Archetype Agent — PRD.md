# Athlete Archetype Agent — PRD

**Hackathon:** Team USA x Google Cloud Hackathon (Challenge 4)
**Deadline:** May 11, 2026 @ 5:00 PM PT
---

## Problem

120 years of Team USA Olympic and Paralympic data exists, but fans have no way to see themselves in it. The data sits in spreadsheets and databases — never translated into something personal, interactive, or emotionally resonant. Paralympic data in particular gets treated as secondary when it appears at all.

## Solution

A fan-facing web app powered by a Gemini-backed agent that does two things:

1. **Clusters** 120 years of US Olympic and Paralympic athlete data into body-type-driven archetypes (e.g., "Powerhouse," "Aerobic Engine," "Precision Athlete," "Explosive Mover").
2. **Matches** a user's self-reported physical traits to those archetypes — returning a personalized result that spans both Olympic and Paralympic sports with equal analytical depth.

The agent uses conditional phrasing throughout ("your build could align with…") and never identifies specific private individuals. Paralympic classifications are explained with the same rigor as Olympic event categories.

---

## User Flow

1. User lands on the app. Sees a clean prompt: *"Find your Team USA archetype."*
2. User inputs height, weight, and optionally arm span, age range, and activity preference.
3. Gemini agent processes inputs against the archetype clusters.
4. Results screen shows:
   - Primary archetype with description and historical context
   - Olympic sports aligned with this archetype
   - Paralympic sports aligned with this archetype (with classification explainers)
   - A "Digital Mirror" visualization — the user's traits overlaid on the archetype distribution
5. User can ask follow-up questions via a conversational interface: "What about swimming specifically?" or "How has this archetype changed over 120 years?"

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), deployed on Cloud Run |
| Backend API | Python (FastAPI), deployed on Cloud Run |
| AI/Agent | Gemini 2.5 Pro via Vertex AI |
| Database | BigQuery (athlete dataset), Firestore (session state) |
| Data Pipeline | Cloud Functions for preprocessing and clustering |
| Deployment | Cloud Run, Cloud Build CI/CD |

### Data Pipeline

**Input Sources (public only):**
- teamusa.com athlete profiles and results data
- Open-source Olympic/Paralympic datasets filtered to US athletes only
- No finish times or scoring results (prohibited)
- No athlete NIL in outputs

**Preprocessing:**
1. Ingest raw CSV/JSON datasets into BigQuery
2. Normalize physical trait fields (height, weight, sport, event, era, Olympic/Paralympic designation)
3. Run clustering via Gemini — generate archetype definitions with descriptions
4. Store archetype centroids and metadata in BigQuery
5. Build a lookup index for real-time matching

### Agent Design

The Gemini agent operates in two modes:

**Match Mode:** Takes user biometric input, computes similarity against archetype centroids, returns top matches with narrative context. Gemini generates the narrative — not a template. Each response integrates Olympic and Paralympic results for the matched archetype.

**Conversational Mode:** User asks follow-up questions. Agent has access to the full archetype dataset via function calling (BigQuery tool) and generates responses grounded in data. Agent maintains session context via Firestore.

**Paralympic Parity Implementation:**
- Archetypes are constructed from the unified dataset — Olympic and Paralympic athletes clustered together, not separately
- When presenting a match, the agent explains relevant Paralympic classifications (e.g., T44 for below-knee amputee sprinters) with the same depth it explains Olympic event distinctions
- The UI never separates Olympic and Paralympic into different tabs or sections — they coexist in every view

---

## Submission Deliverables

| Requirement | Plan |
|---|---|
| Gemini API usage | Core agent logic, narrative generation, data analysis, archetype clustering |
| Google Cloud deployment | Cloud Run (frontend + backend), BigQuery, Firestore, Cloud Functions |
| Hosted URL | Cloud Run public endpoint |
| Public repo (Apache 2.0) | GitHub, license in repo About section |
| Demo video (≤3 min, unlisted YouTube) | Live demo + Cloud Console walkthrough + code snippets |
| Text description | Features, tech stack, data sources, findings |

---

## Judging Alignment

**Impact (40%):**
- Fan-centric: users literally see themselves in Team USA history
- Paralympic parity is architectural, not cosmetic — unified clustering, integrated UI, classification explainers
- Conditional phrasing baked into Gemini system prompt

**Technical Depth (30%):**
- Gemini used for clustering, narrative generation, and conversational agent — not just a wrapper
- Function calling for live BigQuery queries
- Full Cloud Run deployment with CI/CD
- Session persistence via Firestore

**Presentation (30%):**
- The "Digital Mirror" moment is the demo hook — user inputs their stats, sees their archetype materialize
- Three-minute structure: problem (30s) → live demo (2m) → Cloud Console walkthrough (30s)

---

## Scope Control

**In scope:**
- Archetype clustering from historical biometric data
- User matching with narrative output
- Conversational follow-ups via Gemini agent
- Paralympic classification explainers
- Cloud Run deployment
- Demo video

**Out of scope (cut if time-constrained):**
- Historical trend visualizations ("how archetypes shifted across eras")
- Social sharing / result cards
- Mobile-responsive polish beyond functional

---

## Timeline

**Week 1 (Apr 13–19): Data + Architecture**
- Source and clean datasets (BigQuery ingestion)
- Define archetype clustering approach
- Set up Cloud Run project, Vertex AI credentials
- Scaffold FastAPI backend and React frontend

**Week 2 (Apr 20–26): Core Agent**
- Implement Gemini-powered clustering pipeline
- Build match mode: input → archetype result with narrative
- Integrate Paralympic classification data
- Connect BigQuery function calling for conversational mode

**Week 3 (Apr 27–May 3): UI + Integration**
- Build results screen with Digital Mirror visualization
- Wire conversational interface
- End-to-end testing on Cloud Run
- Refine Gemini system prompts for conditional phrasing and parity

**Week 4 (May 4–11): Polish + Submit**
- Record demo video (live demo + console walkthrough)
- Write text description
- Final repo cleanup, Apache 2.0 license
- Submit by May 11

---

## Risks

| Risk | Mitigation |
|---|---|
| Paralympic biometric data is sparse in public datasets | Supplement with classification-level aggregates rather than individual records; Gemini can generate informed narratives from smaller samples |
| Clustering quality depends on data completeness | Start with a simpler archetype taxonomy (5-7 types) and expand only if data supports it |
| Gemini rate limits during development | Use Vertex AI quota, apply for hackathon credits by Apr 17 deadline |
| Compressed timeline with competing commitments | Week 1 is lighter (data sourcing); heavy build starts Week 2 |

---

## Open Questions

1. What public datasets have the most complete biometric data for US Paralympic athletes? Need to audit before committing to archetype granularity.
2. Should the conversational mode support voice input (Gemini multimodal), or is text sufficient for the demo? Voice is flashier but adds scope.
3. Does the hackathon provide any pre-curated datasets, or is sourcing entirely on participants? Check the Resources tab.