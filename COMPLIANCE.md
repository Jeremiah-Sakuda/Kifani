# Compliance Declaration — Kifani (FORGED)

**Team USA x Google Cloud Hackathon 2026 — Challenge 4: Athlete Archetype Agent**

This document certifies compliance with all hackathon rules. Each section maps to a specific rule and documents how the project complies.

---

## 1. NIL (Name, Image, Likeness) Compliance ✓

**Rule:** No athlete names, images, or likenesses may be used.

**Implementation:**
- No athlete names appear anywhere in the codebase
- System prompt explicitly forbids naming athletes:
  > "NEVER name specific athletes or use identifying information"
- Data ingestion strips names and generates anonymous UUIDs
- All prompts use archetype/sport/era language, never individual references
- No "athletes like X" or few-shot examples naming people

**Verification:**
```bash
# Run these commands to verify - should return 0 matches
grep -rn "Simone Biles\|Michael Phelps\|Usain Bolt" backend/ frontend/
grep -rn "like \w+ \w+" backend/app/prompts/  # No "like [Name]" patterns
```

---

## 2. Image Generation Compliance ✓

**Rule:** Generated images must be clearly illustrative/stylized, not photorealistic.

**Implementation:**
- Imagen 3.0 configured with `person_generation="dont_allow"`
- Prompts explicitly require non-photorealistic output:
  > "NOT a photograph of a real person. Abstract and symbolic representation."
  > "Must be clearly artistic/stylized, NOT photorealistic"
  > "No specific face features - abstract or silhouette"
- All 8 archetype portraits use consistent illustrated style
- Geometric backgrounds, motion blur, and artistic elements enforced

**File Reference:** `backend/app/services/imagen_service.py` (lines 76-92, 151)

---

## 3. US-Only Data Filter ✓

**Rule:** Only Team USA athlete data may be used.

**Implementation:**
- BigQuery queries filter to `NOC = 'USA'` at ingestion
- No international athlete data stored or queried
- Filter documented in code comments for transparency

**File Reference:** `backend/app/services/bigquery_service.py`
```python
# COMPLIANCE: Filter to Team USA athletes only (NOC='USA')
# Required per hackathon rules - no international athlete data
WHERE noc = 'USA'
```

---

## 4. Terminology Compliance ✓

**Rule:** No "former Olympian/Paralympian," NGB names as sports, or incorrect Games format.

**Implementation:**
- No instances of "former Olympian" or "past Paralympian" in codebase
- Sports referenced by name only (e.g., "Swimming" not "USA Swimming")
- Historical references use era-based language ("Pioneer Era," "Golden Era")
- Games references follow required format ("Olympic Games," "Paralympic Games," "LA28 Games")

**Verification:**
```bash
grep -rn "former Olympian\|past Paralympian\|former athlete" backend/ frontend/
grep -rn "USA Swimming\|USA Track\|USA Gymnastics" backend/ frontend/
```

---

## 5. IOC Intellectual Property Compliance ✓

**Rule:** No Olympic rings, torch, Agitos, or Paralympic Movement marks.

**Implementation:**
- Zero instances of rings, torch, or Agitos imagery
- No IOC or IPC trademarks referenced
- Brand identity uses Google Cloud assets only
- Explicitly documented in About page

**File Reference:** `frontend/src/components/About.tsx`
> "No IOC intellectual property (rings, torch, etc.)"

**Verification:**
```bash
grep -rn "rings\|torch\|agitos\|olympic logo" backend/ frontend/ public/
```

---

## 6. Conditional Language Compliance ✓

**Rule:** All athlete comparisons must use hedged, conditional phrasing.

**Implementation:**
- Dedicated validation layer using Gemini 2.0 Flash
- All narratives pass through `conditional_validator.py` before display
- Definitive phrases automatically rewritten:
  - "you would be good at" → "could align with"
  - "you are a" → "your profile suggests"
  - "your body is built for" → "your build shares characteristics with"
- Confidence-tiered language automatically applied based on match score
- Validation trace logged for audit transparency

**File Reference:** `backend/app/services/conditional_validator.py`

**Blocked Phrases:**
- "you would be"
- "you are destined"
- "perfect for you"
- "ideal for you"
- "you will succeed"
- "your body is built for"

---

## 7. Commit Window Compliance ✓

**Rule:** No project content before March 24, 2026.

**Verification:**
```bash
git log --oneline --before="2026-03-24" | wc -l
# Should return 0 or only show scaffolding commits
```

All substantive project code committed after March 24, 2026.

---

## 8. Sharing Posture Compliance ✓

**Rule:** Repository must be public; no external sharing of project content.

**Implementation:**
- Repository is public at: https://github.com/Jeremiah-Sakuda/Kifani
- No project screenshots, demos, or write-ups posted to:
  - LinkedIn
  - X/Twitter
  - YouTube (except unlisted submission video)
  - Medium or other blogs
- Submission video will be unlisted per requirements

---

## 9. Permitted Data Sources ✓

**Data Used:**
- ✓ Finish placement (1st, 2nd, 3rd medals)
- ✓ Public Team USA athlete data (height, weight, sport, event, year)
- ✓ IPC historical results (Paralympic athletes 1960-2024)
- ✓ Public census data (regional aggregation only)

**Data NOT Used:**
- ✗ Finish times or specific scores
- ✗ Athlete names, images, or likenesses
- ✗ International athlete data
- ✗ Non-public or proprietary data

---

## 10. Paralympic Structural Parity ✓

**Rule:** Paralympic integration must be substantive, not superficial.

**Implementation:**
- 2 dedicated Paralympic-first archetypes (Adaptive Power, Adaptive Endurance)
- 2,847 Paralympic athlete records in dataset
- 30+ Paralympic classification codes with detailed explanations
- Sample weighting (1.15x) ensures fair representation despite smaller dataset
- Paralympic sports receive equal analytical depth in narratives
- Paralympic Discovery Mode foregrounds Para sports in results

---

## Compliance Certification

This project has been reviewed for compliance with all Team USA x Google Cloud Hackathon 2026 rules.

**Last Verified:** [DATE]
**Verified By:** [TEAM MEMBER]

---

## Quick Verification Commands

```bash
# NIL Check
grep -rn "Simone\|Phelps\|Bolt\|Biles\|Ledecky" .

# Terminology Check
grep -rn "former Olympian\|past Paralympian" .
grep -rn "USA Swimming\|USA Track" .

# IOC IP Check
grep -rn "rings\|torch\|agitos" .

# Conditional Language Check (should find validator, not violations)
grep -rn "you would be\|you are destined\|perfect for you" backend/app/prompts/

# Commit Window Check
git log --oneline --before="2026-03-24"
```

All checks should return empty or show only compliant references (e.g., the validator that catches violations).
