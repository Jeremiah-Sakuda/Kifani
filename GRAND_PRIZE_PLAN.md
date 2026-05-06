# FORGED — Grand Prize Improvement Plan

**Current Status:** Strong Challenge 4 contender with excellent technical foundation
**Target:** Grand Prize ($15K) — requires scoring highest across ALL challenges
**Deadline:** May 11, 2026 @ 5:00 PM PT

---

## Executive Summary

FORGED is already a top-tier submission with real agentic architecture, structural Paralympic parity, and multimodal input. However, Grand Prize requires being **the most memorable submission** that judges discuss after reviewing 200+ entries. This plan focuses on **high-impact, low-effort improvements** that maximize judging criteria scores.

### Judging Criteria Breakdown

| Criterion | Weight | Current Score | Target | Gap |
|-----------|--------|---------------|--------|-----|
| **Impact** | 40% | 85/100 | 95/100 | +10 |
| **Technical Depth** | 30% | 90/100 | 95/100 | +5 |
| **Presentation** | 30% | 80/100 | 95/100 | +15 |

**Biggest opportunity: Presentation Quality** — the demo video and "wow factor" moments.

---

## Priority 1: CRITICAL (Must Complete Before Submission)

### 1.1 Demo Video Production (Presentation: +15 points)

The 3-minute demo video is **the single most important deliverable**. Judges will watch 200+ videos — yours must be memorable in the first 30 seconds.

**Video Structure (3:00 max):**

| Time | Section | Content |
|------|---------|---------|
| 0:00-0:15 | Hook | "Every Team USA fan wonders: Where would I fit?" + dramatic FORGED logo reveal |
| 0:15-0:45 | Problem | Show the gap — Paralympic athletes treated as afterthoughts in sports tools |
| 0:45-1:30 | Live Demo | Full user flow: input → processing (show SSE trace!) → archetype reveal → Imagen Mirror |
| 1:30-2:00 | Paralympic Parity | Show Paralympic Explorer, side-by-side comparisons, dedicated archetypes |
| 2:00-2:30 | Technical Stack | Quick Google Cloud console tour: Vertex AI, BigQuery, Cloud Run |
| 2:30-2:50 | Era Time Machine | Show D3 visualization of 120 years of evolution |
| 2:50-3:00 | Closing | "FORGED — See yourself in 120 years of Team USA excellence" + URL |

**Video Production Requirements:**
- [ ] Professional-quality screen recording (1080p minimum, 60fps preferred)
- [ ] Voice-over with clear audio (no background noise)
- [ ] Background music (royalty-free, subtle)
- [ ] Animated transitions between sections
- [ ] **Show the SSE reasoning trace** — this is your technical differentiator
- [ ] **Show Imagen portrait generation** — this is your memorable moment
- [ ] Ensure Paralympic content appears within first 60 seconds

**Tools:** OBS Studio for recording, DaVinci Resolve for editing (both free)

### 1.2 Shareable Results Card (Presentation: +5 points, Impact: +5 points)

Judges look for "viral potential." Add a downloadable/shareable results image.

**Implementation:**
```typescript
// frontend/src/components/ShareCard.tsx
// Generate an image card users can download/share showing:
// - Archetype name with golden forge styling
// - Confidence percentage
// - "Matched with 120 years of Team USA data"
// - FORGED logo
// - No athlete names/NIL — just archetype
```

**Action Items:**
- [ ] Create `ShareCard.tsx` component using html2canvas
- [ ] Add "Share Your Archetype" button to Results page
- [ ] Generate image with archetype name, confidence, and FORGED branding
- [ ] Add copy-to-clipboard functionality for results summary

### 1.3 Mobile Experience Polish (Presentation: +3 points)

Judges will likely test on phones. Currently functional but not optimized.

**Quick Wins:**
- [ ] Ensure D3 visualizations are touch-friendly and responsive
- [ ] Test all input modes on mobile (camera capture especially)
- [ ] Add touch gestures for archetype carousel
- [ ] Ensure Processing page SSE events display properly on narrow screens
- [ ] Test Imagen portrait reveal animation on mobile

### 1.4 Compliance Audit (Avoid Disqualification)

One compliance violation = immediate disqualification. Do a final sweep.

**Terminology Checklist:**
- [ ] All references use "LA28 Games" or "LA28 Olympic and Paralympic Games" (not "LA 2028 Olympics")
- [ ] All historical references use "Olympic Games [City] [Year]" format
- [ ] No "former Olympian/Paralympian" — always "Olympian/Paralympian"
- [ ] No IOC intellectual property (rings, torch, agitos)
- [ ] No athlete names anywhere in UI, code comments, or datasets
- [ ] No finish times or specific scores in data
- [ ] Sport names use official terminology (e.g., "swimming" not "USA Swimming")

**Code/Data Audit:**
- [ ] Search entire codebase for athlete names: `grep -r "Simone|Phelps|Biles|Ledecky|Bolt"`
- [ ] Search for IOC IP: `grep -r "Olympic rings|torch|agitos"`
- [ ] Verify dataset contains no timing data
- [ ] Verify all Imagen prompts avoid photorealistic humans

---

## Priority 2: HIGH IMPACT (Complete if Time Permits)

### 2.1 Enhanced Paralympic Visibility (Impact: +5 points)

Paralympic parity is structurally good but could be **more visible** to judges scanning quickly.

**Quick Wins:**
- [ ] Add Paralympic icon/badge to landing page hero section
- [ ] Show "2 Paralympic-First Archetypes" prominently before input
- [ ] Add Paralympic athlete count (2,847) next to Olympic count (14,218) on landing
- [ ] Ensure Paralympic sports appear with equal visual weight in Results grid (currently side-by-side, which is good)

### 2.2 Loading State Enhancement (Presentation: +3 points)

The Processing page shows SSE events, but make it more theatrical.

**Improvements:**
- [ ] Add "forge" sound effects (anvil strikes) at key moments (optional, user can mute)
- [ ] Show progress bar: "Analyzing build → Matching archetype → Generating portrait"
- [ ] Add micro-animations: spark particles when tools complete
- [ ] Show Google Cloud service badges as each is called (Gemini, BigQuery, Firestore)

### 2.3 Comparison Mode (Impact: +3 points)

Let users compare themselves to different archetype builds.

**Implementation:**
- [ ] Add "What if I were taller/heavier?" slider on Results page
- [ ] Show how archetype would change with ±10cm height or ±10kg weight
- [ ] Demonstrates the clustering algorithm visually
- [ ] Engages users to explore more

### 2.4 Performance Optimization (Technical: +2 points)

Reduce latency to make demo smoother.

**Quick Wins:**
- [ ] Pre-warm Cloud Run instances before recording demo video
- [ ] Cache archetype centroid data in-memory (already in BigQuery, but query on first request)
- [ ] Optimize Imagen prompts for faster generation (shorter, more constrained)
- [ ] Add skeleton loading states instead of spinners

---

## Priority 3: NICE TO HAVE (Only if Ahead of Schedule)

### 3.1 Voice Mode Enhancement

- [ ] Add real-time voice waveform visualization
- [ ] Show transcription appearing word-by-word
- [ ] Add voice confirmation: "I heard you say 5 foot 10..."

### 3.2 Expanded Archetypes

- [ ] Add 2 more archetypes (total 10) for finer granularity
- [ ] Document sport-specific sub-archetypes (e.g., "Distance Runner" vs "Sprinter")

### 3.3 Regional Context Visualization

- [ ] Add map showing where archetypes cluster geographically in USA
- [ ] BigQuery already has regional data — just need visualization

### 3.4 Accessibility Audit

- [ ] Run axe-core automated accessibility tests
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Add high-contrast mode toggle
- [ ] Ensure all animations respect `prefers-reduced-motion`

---

## Implementation Timeline

### Days 1-2: Critical Path (May 6-7)

| Task | Time | Owner |
|------|------|-------|
| Compliance audit (search for prohibited content) | 2 hours | — |
| Terminology fixes in UI | 1 hour | — |
| ShareCard component implementation | 3 hours | — |
| Mobile responsive testing + fixes | 2 hours | — |
| Video script writing | 2 hours | — |

### Days 3-4: Demo Video Production (May 8-9)

| Task | Time | Owner |
|------|------|-------|
| Screen recording (multiple takes) | 3 hours | — |
| Voice-over recording | 1 hour | — |
| Video editing | 4 hours | — |
| Add music, transitions, captions | 2 hours | — |
| Review and iterate | 2 hours | — |

### Day 5: Final Polish (May 10)

| Task | Time | Owner |
|------|------|-------|
| Deploy final version to Cloud Run | 1 hour | — |
| Test deployed version end-to-end | 2 hours | — |
| Update DEVPOST.md with final URLs | 1 hour | — |
| Complete Devpost submission form | 2 hours | — |
| Final video upload to YouTube (unlisted) | 30 min | — |

### Day 6: Buffer (May 11, deadline 5PM PT)

| Task | Time | Owner |
|------|------|-------|
| Final review and submission | 2 hours | — |
| Buffer for unexpected issues | 4 hours | — |

---

## Demo Video Script (Draft)

### Opening (0:00-0:15)
**[Visual: Dark screen, golden particles forming]**
**[VO]:** "Every Olympic and Paralympic fan asks the same question..."
**[Visual: FORGED logo reveals with forge fire effect]**
**[VO]:** "Where would I fit in Team USA history?"

### Problem (0:15-0:45)
**[Visual: Generic sports tools, Paralympic section hidden in footer]**
**[VO]:** "Most tools treat Paralympic athletes as an afterthought. A checkbox. A footnote."
**[Visual: Cut to FORGED landing page]**
**[VO]:** "FORGED is different. We built Paralympic parity from the ground up."
**[Visual: Highlight "2 Paralympic-First Archetypes" and "30+ Classification Codes"]**

### Live Demo (0:45-1:30)
**[Visual: User entering height/weight]**
**[VO]:** "Enter your build — through photo, voice, or form."
**[Visual: Processing page with SSE events streaming]**
**[VO]:** "Watch as Gemini 2.5 Pro orchestrates four specialized tools in real-time."
**[Visual: Archetype reveal with golden animation]**
**[VO]:** "Discover your archetype — matched from 120 years of Team USA data."
**[Visual: Imagen portrait reveal]**
**[VO]:** "And see yourself in a unique portrait generated by Imagen."

### Paralympic Parity (1:30-2:00)
**[Visual: Paralympic Explorer page]**
**[VO]:** "Explore 30 Paralympic classification codes with full explanations."
**[Visual: Side-by-side Olympic/Paralympic comparison]**
**[VO]:** "See Olympic and Paralympic sports with equal analytical depth."
**[Visual: Adaptive Power archetype card]**
**[VO]:** "Two archetypes exist only in Paralympic space — Adaptive Power and Adaptive Endurance."

### Technical Stack (2:00-2:30)
**[Visual: Google Cloud Console tour]**
**[VO]:** "Built entirely on Google Cloud."
**[Visual: Quick cuts — Vertex AI, BigQuery query, Cloud Run logs]**
**[VO]:** "Gemini 2.5 Pro for agentic orchestration. BigQuery for 16,000 athlete records. Imagen 3.0 for portrait generation. Deployed on Cloud Run."

### Era Time Machine (2:30-2:50)
**[Visual: D3 timeline visualization]**
**[VO]:** "Explore how each archetype has evolved across four eras of American sports."
**[Visual: Animation showing body type changes over time]**

### Closing (2:50-3:00)
**[Visual: FORGED logo with URL]**
**[VO]:** "FORGED. See yourself in 120 years of Team USA excellence."
**[Visual: Team USA x Google Cloud Hackathon badge]**

---

## Technical Improvements Checklist

### Frontend
- [ ] Add ShareCard component with html2canvas export
- [ ] Add "Download Your Results" button
- [ ] Improve mobile touch interactions for D3 visualizations
- [ ] Add loading skeleton states
- [ ] Add subtle anvil sound effects on SSE events (optional)
- [ ] Add Google Cloud service badges during processing
- [ ] Test and fix any responsive issues on iPhone/Android

### Backend
- [ ] Add endpoint for shareable results image generation
- [ ] Cache archetype centroids on startup (reduce first-request latency)
- [ ] Add request timing logs for demo video (show <2s response times)
- [ ] Ensure Imagen prompts are optimized for speed

### DevOps
- [ ] Pre-warm Cloud Run instances before demo recording
- [ ] Ensure environment variables are set correctly in cloudbuild.yaml
- [ ] Test deployment pipeline end-to-end
- [ ] Set up monitoring alerts for errors during judging period

### Documentation
- [ ] Update DEVPOST.md with:
  - [ ] Final deployed URLs
  - [ ] YouTube video link (unlisted)
  - [ ] Accurate feature list
  - [ ] Accurate tech stack
- [ ] Update README.md with final deployment instructions
- [ ] Ensure GitHub repo is public and has Apache 2.0 license visible

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Demo video quality insufficient | Medium | High | Start video production early; plan multiple takes |
| Cloud Run cold start delays demo | Medium | Medium | Pre-warm instances; record multiple takes |
| Compliance issue found late | Low | Critical | Complete audit on Day 1 |
| Imagen API rate limited | Low | Medium | Pre-generate archetype portraits; cache results |
| Devpost submission fails | Low | Critical | Submit 24 hours early; keep local backup |
| Mobile experience broken | Medium | Medium | Test on real devices early |

---

## Success Metrics

**Before submission, verify:**

- [ ] Demo video is under 3:00, shows live demo, shows Google Cloud console
- [ ] Video thumbnail is compliant (no athlete faces, no IOC IP)
- [ ] All terminology follows hackathon rules exactly
- [ ] Deployed site loads in <5 seconds
- [ ] All 8 archetypes match correctly
- [ ] Paralympic sports have classification codes displayed
- [ ] Imagen portraits generate successfully
- [ ] Chat follow-ups work with context
- [ ] Mobile experience is smooth
- [ ] GitHub repo is public with Apache 2.0 license
- [ ] Devpost submission is complete with all required fields

---

## Competitive Analysis

**Expected competition weaknesses:**
1. Form-only input (no multimodal)
2. Single Gemini call (no agentic architecture)
3. Paralympic as afterthought (checkbox feature)
4. No memorable visual moment (no Imagen)
5. Simulated loading (no real SSE trace)
6. Generic UI (no distinctive brand)

**FORGED advantages:**
1. Three input modes with graceful fallback
2. 4-tool agentic orchestration with visible reasoning
3. Structural Paralympic parity with dedicated archetypes
4. Imagen Digital Mirror as signature moment
5. Real-time SSE streaming (judges see actual execution)
6. "Refined Industrial" aesthetic with forge theme

**To win Grand Prize:**
- Be the submission judges remember after 200+ entries
- Be the submission with zero compliance issues
- Be the submission with the best demo video

---

## Final Notes

**Key Insight:** Grand Prize is not just about technical excellence — it's about being **memorable**. The Imagen Mirror reveal, the visible SSE reasoning trace, and the "forged from 120 years" narrative create emotional resonance that technical features alone cannot.

**Mantra:** "If a judge remembers one submission tomorrow, it should be FORGED."

---

*Plan created: May 6, 2026*
*Last updated: May 6, 2026*
