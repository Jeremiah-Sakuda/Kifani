# FORGED — Product Requirements Document

**Project:** FORGED
**Tagline:** Forged from 120 years of Team USA.
**Hackathon:** Team USA x Google Cloud (Challenge 4 — Athlete Archetype Agent)
**Deadline:** May 11, 2026 @ 5:00 PM PT
**Target:** Grand Prize ($15K) or Challenge 4 Winner ($8K)

---

## 1. Vision

Every fan watching Team USA carries a body. That body has a history. Somewhere across 120 years of Olympic and Paralympic competition, an athlete with a similar build trained, competed, and represented the United States. FORGED makes that connection visible.

The product is a Gemini-powered agent that clusters historical Team USA athlete data into body-type archetypes, then matches fans to those archetypes through multimodal input. The output is personal, visual, and equally weighted across Olympic and Paralympic disciplines.

## 2. Problem

Three gaps in current fan engagement.

*The data gap.* 120 years of athlete data is locked in databases and PDFs. Fans have no entry point that translates numbers into personal context.

*The Paralympic visibility gap.* Public-facing Olympic narratives outpace Paralympic narratives by an order of magnitude. Paralympic classifications get explained as exceptions when they're explained at all.

*The recognition gap.* Most fans never see themselves in athletic data. Pro athletes feel like a separate species. Without a bridge between casual physicality and elite competition, the through-line of "Team USA represents us" thins.

## 3. Target Users

Primary: US sports fans aged 18 to 45 who follow Olympic and Paralympic competition casually and would interact with a fan engagement tool during a Games window or LA28 buildup.

Secondary: educators using Team USA history as a teaching tool, adaptive sports advocates looking for visibility platforms, and youth athletes exploring sport selection.

## 4. User Flow

Hero screen: "Find your archetype. See yourself in 120 years of Team USA."

User chooses input mode: photo, voice, or form. All three work. The demo opens with photo to showcase multimodality.

*Photo path.* User uploads or captures a casual full-body image. Gemini Vision extracts posture and proportional signal. Output passes to the clustering layer.

*Voice path.* User describes themselves in 30 seconds. Gemini Live transcribes and extracts physical descriptors. Output passes to the clustering layer.

*Form path.* Height, weight, optionally arm span, age range, activity preference.

Processing screen streams the agent's reasoning trace via SSE. The user watches Gemini call the matcher tool, then the Paralympic classifier tool, then the regional context tool. Real agentic flow, visible, no fake loading spinner.

Results screen displays:
1. Primary archetype name and description
2. Olympic sports aligned with the archetype, conditional phrasing throughout
3. Paralympic sports aligned with the archetype, with classification explainers at equal depth
4. Imagen-generated abstract portrait of the user-as-archetype
5. Regional context (archetype prevalence in the user's stated region, no individual identification)

Conversational extension lets users ask follow-ups. "Why this sport and not that one?" "What about endurance events specifically?" "What classification would I look up if I had a leg amputation?"

## 5. Core Features

### 5.1 Multimodal Input
Photo, voice, and form. Gemini Vision processes images for body proportion. Gemini Live handles voice. Form is the deterministic fallback for accessibility and demo reliability.

### 5.2 Archetype Clustering
Eight archetypes derived from 120 years of Olympic and Paralympic biometric and event data:

1. Powerhouse (heavy throwers, weightlifters)
2. Aerobic Engine (endurance runners, triathletes, distance swimmers)
3. Precision Athlete (shooters, archers, divers)
4. Explosive Mover (sprinters, jumpers, sprint cyclists)
5. Coordinated Specialist (gymnasts, freestyle skiers)
6. Tactical Endurance (rowers, middle-distance, modern pentathletes)
7. Adaptive Power (Paralympic seated throws, wheelchair sprints, clustered with structural parity)
8. Adaptive Endurance (Paralympic distance, wheelchair marathons, para-cycling)

Clustering uses k-means on normalized biometric vectors with Paralympic data weighted equally despite smaller sample size. The agent explains this weighting choice when prompted.

### 5.3 Multi-Tool Agent
ADK-orchestrated agent with four tools:

- `match_archetype(traits)` returns ranked archetype probabilities
- `classify_paralympic(archetype, classification_context)` returns Paralympic sport mappings with classification depth
- `regional_context(archetype, region)` returns aggregated regional patterns without individual identification
- `generate_followups(session_context)` produces user-specific next-step questions

The agent loop continues until the user ends the session or explicitly requests handoff to deeper analysis.

### 5.4 Imagen Mirror
After results, Imagen 4 generates a stylized abstract portrait representing the user's archetype. Non-photorealistic, no individual likeness reproduction, no athletic gear that implies endorsement. The visual is the demo's centerpiece.

### 5.5 Conditional Language Layer
Every output runs through a final Gemini Flash pass that enforces conditional phrasing per challenge rules. Output reads "your build could align with" rather than "you would be good at." This is a separate validation step, not just prompt instruction, so judges can verify it in the code.

## 6. Technical Architecture

**Frontend:** React, Tailwind, Framer Motion. Dark mode with a Team USA-adjacent palette that avoids restricted IP elements.

**Backend:** FastAPI on Cloud Run.

**AI layer:**
- Gemini 2.5 Pro for primary reasoning and tool orchestration
- Gemini 2.5 Flash for the conditional language validation layer
- Gemini Vision for photo input processing
- Gemini Live for voice input
- Imagen 4 for the Mirror
- ADK for agent orchestration

**Data layer:**
- BigQuery for the cleaned 120-year archetype dataset
- Firestore for session state
- Cloud Storage for Imagen outputs and uploaded photos with 1-hour auto-deletion

**Streaming:** Server-Sent Events for the live reasoning trace.

**Deployment:** Cloud Run, containerized, CI/CD via Cloud Build.

**Observability:** Cloud Logging and Cloud Trace. Vertex AI usage dashboards surfaced during the demo.

**License:** Apache 2.0, declared at the top of the repo About section.

## 7. Data Strategy

### Sources
Olympedia public dataset for Olympic athlete biometrics (1900 onward). IPC Historical Results database for Paralympic athlete data (1960 onward). USOPC public profiles for current Team USA roster context. Public regional census data for hometown geography aggregation.

### Pipeline
An ingestion script pulls from public sources, normalizes biometric units, aligns event categories across eras, and loads to BigQuery. The clustering pipeline runs offline. Results cache in BigQuery as the archetype reference table the agent queries.

### Privacy
No individual identification at the user-output level. Archetype results are aggregated patterns. Uploaded photos are processed in-memory for proportion analysis, optionally cached in Cloud Storage for one hour for follow-up sessions, then deleted.

## 8. Paralympic Parity Architecture

Parity is structural, not cosmetic.

*Equal data weighting.* Clustering uses sample-weighted distance metrics so Paralympic data influence is proportional to category coverage, not raw count. The decision is documented in the README and called out in the demo.

*Classification depth.* Paralympic results explain classification (T54, T11, S6, S10) with the same analytical rigor as Olympic event categorization. The classifier tool generates these explanations on demand.

*Surface order.* When both Olympic and Paralympic sports align with an archetype, Paralympic alignments surface first if the user indicates any disability context, equally otherwise.

*Adaptive archetype dimension.* Two of the eight archetypes are explicitly adaptive rather than treating Paralympic athletes as variants of "primary" archetypes. This reflects how Paralympic competition is actually structured.

## 9. Demo Video Plan (3:00 maximum)

| Timestamp | Beat |
|-----------|------|
| 0:00 to 0:18 | Cold open. Wheelchair racer footage (royalty-free or original). Voiceover: "120 years of Team USA. 30,000 athletes. One question: where do you fit?" Title card. |
| 0:18 to 0:40 | Live photo input. Gemini Vision processing visible. Brief code overlay showing the Vision API call. |
| 0:40 to 1:10 | Agent processing. SSE stream visible. Quick toggle to Vertex AI console showing live Gemini calls. |
| 1:10 to 1:50 | Results reveal. Archetype name, Olympic alignments, Paralympic alignments. Imagen Mirror generates and reveals. |
| 1:50 to 2:20 | Paralympic parity demonstration. Voice query: "What sports could a T54 athlete with my build train toward?" Voice response. |
| 2:20 to 2:45 | Technical proof. ADK agent code, Apache 2.0 license, Cloud Run dashboard. |
| 2:45 to 3:00 | Vision close. "FORGED isn't a recommendation engine. It's a mirror. See yourself in Team USA." |

## 10. Judging Alignment

| Criterion | Weight | How FORGED Scores |
|-----------|--------|-------------------|
| Impact (fan-centric, Paralympic representation) | 40% | Structural parity, multimodal accessibility, fan-emotional through-line |
| Technical Depth (Gemini capabilities, real engineering) | 30% | Vision + Live + Imagen + Pro + Flash, ADK agent orchestration, four-tool loop, conditional language validation layer |
| Presentation (demo quality, story, UX) | 30% | Scripted 3-minute demo, polished frontend, signature Imagen Mirror, Paralympic-led opening |

## 11. Differentiation vs. Expected Field

Most Challenge 4 submissions will use a single Gemini API call for matching, build text-only input, treat Paralympic data as a checkbox, open the demo with an Olympic sprinter, and skip multimodality entirely.

FORGED differentiates on every dimension above. The Imagen Mirror is the most likely "competitors don't have this" element judges will remember after watching 30 submissions.

## 12. Risk Register

| Risk | Mitigation |
|------|-----------|
| Public Paralympic data is sparse or inconsistent across eras | Document gaps explicitly in README, weight clustering to compensate, surface data-quality awareness in the demo |
| Gemini Vision proportion extraction is unreliable on casual photos | Form fallback always available, validation step flags low-confidence extractions |
| Imagen occasionally generates off-brand imagery | Pre-defined prompt template, safety filters, manual review of demo Mirror outputs |
| Vertex AI quota exhaustion during judging window | Pre-warm quota, billing alerts, cache common archetype outputs |
| Demo runs long | Script to 2:50, leave 10-second buffer |

## 13. Success Metrics

Submission-day criteria: all eight archetypes produce coherent matches across the validation set. Three input modalities work in the deployed environment. Demo video runs under 3:00 with English captions. Repo is public, Apache 2.0 visible, README complete.

Post-judging targets: top 10 finish minimum, featured by Google Cloud social channels, coffee with the Google team member converts to ongoing relationship.

## 14. Open Questions

1. Does the hackathon Resources tab provide pre-curated datasets, or is sourcing entirely on the participant?
2. Is Imagen 4 available in AI Studio for the project's region, or does the workflow need Vertex AI exclusively?
3. Are there NIL or content restrictions on royalty-free Paralympic imagery in the demo opening?
4. What's the latency profile of Gemini Vision plus Imagen 4 chained calls in Cloud Run cold-start scenarios?

---
