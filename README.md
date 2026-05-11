# FORGED — Find Your Team USA Archetype

**Team USA x Google Cloud Hackathon 2026 — Challenge 4: Athlete Archetype Agent**

A Gemini-powered fan engagement tool that matches users to Team USA Olympic and Paralympic athlete archetypes through multimodal input (photo, voice, or form), featuring structural Paralympic parity and an Imagen-generated "Digital Mirror" as its centerpiece.

> *"Forged from 120 years of Team USA excellence"*

---

## Live Demo

- **Frontend:** https://forged-frontend-481161735332.us-central1.run.app
- **Backend API:** https://forged-backend-481161735332.us-central1.run.app
- **GitHub:** https://github.com/Jeremiah-Sakuda/Kifani

---

## Challenge Alignment

This project addresses **Challenge 4: Athlete Archetype Agent** — a clustering tool matching users to historical athlete body types.

| Requirement | Implementation |
|-------------|----------------|
| Gemini API for analysis/generation | Gemini 2.5 Pro (agent orchestration), Gemini 2.5 Flash (validation, multimodal analysis) |
| Deployed on Google Cloud | Cloud Run (frontend + backend) |
| Public datasets only | Olympedia, IPC Historical Results, public census data |
| Paralympic parity | 2 dedicated Paralympic-first archetypes, 30+ classification explainers, sample weighting |
| No prohibited data | No finish times, no athlete NIL, no IOC IP |

---

## Features

### Core Experience

- **8 Body-Type Archetypes** — K-means clustering on 120 years of athlete biometrics (height, weight, BMI)
- **Multimodal Input** — Photo (Gemini Vision), voice (Gemini transcription), or form entry
- **Digital Mirror** — D3.js scatter plot + Imagen-generated stylized portrait
- **Paralympic Parity** — Olympic and Paralympic athletes weighted equally; classification depth matches Olympic analysis
- **Conversational Follow-ups** — Multi-turn Gemini agent for deeper exploration
- **Real-time Processing** — Server-Sent Events stream the Gemini thinking traces live
- **Confidence Scoring** — Each match includes a confidence percentage with explanations
- **Search Grounding** — Google Search integration finds current Team USA athletes in your recommended sports
- **Dual-Signal Matching** — K-means clustering + text-embedding-005 semantic similarity for robust results
- **Shareable Results** — LA28-branded share cards with portrait and sport recommendations

### Additional Features

- **Paralympic Spotlight** — Browse 30+ Paralympic classification codes with detailed explanations
- **Era Time Machine** — D3.js visualization showing how archetypes evolved across 4 historical eras (1896–1950, 1950–1980, 1980–2000, 2000+)
- **Parity Comparison** — Side-by-side Olympic/Paralympic sport alignment views
- **Conditional Language** — All outputs use hedged phrasing ("could align with") per hackathon rules

### The 8 Archetypes

| Archetype | Focus | Example Sports |
|-----------|-------|----------------|
| Powerhouse | Strength/mass | Weightlifting, Wrestling, Para Powerlifting |
| Aerobic Engine | Endurance | Marathon, Triathlon, Para Cycling |
| Precision Athlete | Control/accuracy | Archery, Shooting, Boccia |
| Explosive Mover | Speed/power | Sprints, Long Jump, Para Athletics |
| Coordinated Specialist | Agility/grace | Gymnastics, Diving, Para Swimming |
| Tactical Endurance | Versatility | Rowing, Swimming, Para Rowing |
| **Adaptive Power** | Paralympic strength | Wheelchair Rugby, Seated Throws |
| **Adaptive Endurance** | Paralympic endurance | Wheelchair Marathon, Hand Cycling |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│              React 19 + TypeScript + Vite + Tailwind               │
│                    D3.js + Framer Motion                           │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ SSE (Server-Sent Events)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                   │
│                    FastAPI + Python 3.12                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ADK AGENT (Gemini 2.5 Pro)               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │   │
│  │  │ match_       │ │ classify_    │ │ generate_            │ │   │
│  │  │ archetype    │ │ paralympic   │ │ followups            │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Photo        │  │ Voice        │  │ Conditional Language     │  │
│  │ Analysis     │  │ Analysis     │  │ Validation (Flash)       │  │
│  │ (Vision)     │  │ (Live)       │  │ "could align with"       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐      ┌──────────────┐
│   Vertex AI  │     │   BigQuery   │      │  Firestore   │
│  Gemini/Imagen│    │ 14K athletes │      │   Sessions   │
└──────────────┘     └──────────────┘      └──────────────┘
```

---

## Google Cloud Integration

| Service | Usage |
|---------|-------|
| **Vertex AI — Gemini 2.5 Pro** | Agent orchestration with 5-tool function calling + thinking traces |
| **Vertex AI — Gemini 2.5 Flash** | Photo analysis, voice transcription, conditional language validation |
| **Vertex AI — Imagen 3.0** | Non-photorealistic archetype portrait generation |
| **Vertex AI — text-embedding-005** | Semantic similarity matching for dual-signal results |
| **Vertex AI — Context Caching** | Cached archetype corpus for efficient reuse across sessions |
| **Vertex AI — Google Search** | Search grounding for current Team USA athlete relevance |
| **BigQuery** | 14,218 Olympic + 2,847 Paralympic athlete records |
| **Firestore** | Session persistence for multi-turn conversations |
| **Cloud Run** | Serverless deployment (auto-scaling 0-10 instances) |
| **Cloud Build** | CI/CD pipeline (8-step build and deploy) |
| **Cloud Logging** | Observability and debugging |

---

## Key Differentiators

### 1. Structural Paralympic Parity
Not a checkbox feature — Two archetypes (Adaptive Power, Adaptive Endurance) are Paralympic-first, with expert-defined centroids matching Paralympic sport requirements. 30+ classification codes documented with full explanations, providing equal analytical depth to Paralympic sports.

### 2. Real Agentic Orchestration
Gemini 2.5 Pro with function calling orchestrates 5 specialized tools. Thinking traces stream via SSE in real-time. Not simulated loading spinners — actual tool execution and reasoning visible to users.

### 2.5 Dual-Signal Matching
K-means clustering provides biometric matching, while text-embedding-005 enables semantic matching from natural language descriptions. When both signals agree, confidence increases. Google Search grounding connects results to current Team USA athletes.

### 3. Multimodal Input
- **Photo:** Gemini Vision extracts body proportions from full-body images
- **Voice:** 30-second voice description transcribed and parsed for physical traits
- **Form:** Deterministic fallback for accessibility and reliability

### 4. Conditional Language Validation
Separate Gemini Flash pass validates all outputs use "could align with" phrasing, never definitive claims like "you would be good at." Validation trace logged for transparency.

### 5. Imagen Digital Mirror
Each archetype has a unique Imagen-generated stylized portrait. Non-photorealistic, artistic representation. Theatrical reveal animation.

---

## Data Compliance

### Permitted Data Used
- Finish placement and medal data (1st, 2nd, 3rd)
- Public Team USA historical athlete data (height, weight, sport, event, year)
- IPC historical results (Paralympic athletes 1960-2024)
- Public census data (regional aggregation only)

### Prohibited Data Avoided
- No finish times or specific scoring results
- No individual athlete names, images, or likenesses (NIL)
- No IOC intellectual property (rings, torch, etc.)
- No competitor logos or third-party trademarks
- No international data (US athletes only)

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application with CORS
│   │   ├── models/
│   │   │   ├── archetypes.py          # 8 archetype definitions with biometric centroids
│   │   │   └── schemas.py             # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── match.py               # Direct archetype matching
│   │   │   ├── stream.py              # SSE streaming endpoint
│   │   │   ├── chat.py                # Multi-turn conversation
│   │   │   ├── multimodal.py          # Photo/voice analysis
│   │   │   ├── paralympic.py          # Classification exploration
│   │   │   └── era.py                 # Historical era evolution
│   │   ├── services/
│   │   │   ├── adk_agent.py           # Gemini 2.5 Pro orchestration
│   │   │   ├── clustering.py          # K-means matching algorithm
│   │   │   ├── conditional_language.py # Compliance phrasing layer
│   │   │   ├── context_cache.py       # Vertex AI context caching
│   │   │   ├── semantic_match.py      # text-embedding-005 matching
│   │   │   ├── imagen_service.py      # Portrait generation
│   │   │   ├── photo_analysis.py      # Gemini Vision processing
│   │   │   ├── voice_analysis.py      # Audio transcription
│   │   │   ├── firestore_service.py   # Session persistence
│   │   │   └── gemini_agent.py        # Chat agent
│   │   └── tools/                     # ADK tool implementations
│   │       ├── match_archetype.py     # K-means + semantic dual match
│   │       ├── get_archetype_sports.py # Sport recommendations
│   │       ├── classify_paralympic.py # Paralympic classification
│   │       ├── generate_portrait.py   # Imagen portrait
│   │       └── search_grounding.py    # Google Search grounding
│   ├── tests/                         # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.tsx            # Hero + input mode selector
│   │   │   ├── Processing.tsx         # Real-time SSE reasoning trace
│   │   │   ├── Results.tsx            # Archetype reveal + sports
│   │   │   ├── DigitalMirror.tsx      # D3.js scatter plot
│   │   │   ├── MirrorReveal.tsx       # Imagen portrait animation
│   │   │   ├── ConfidenceMeter.tsx    # Match confidence display
│   │   │   ├── ChatInterface.tsx      # Follow-up conversation
│   │   │   ├── ParalympicExplorer.tsx # Classification browser
│   │   │   ├── EraTimeline.tsx        # Historical evolution
│   │   │   ├── ShareCard.tsx          # LA28-branded share cards
│   │   │   └── ...
│   │   ├── pages/
│   │   │   └── HowItWorks.tsx         # Agent architecture documentation
│   │   ├── hooks/
│   │   │   ├── useStreamMatch.ts      # SSE event handling
│   │   │   └── useChat.ts             # Chat state management
│   │   ├── services/api.ts            # Type-safe API client
│   │   └── App.tsx                    # Router configuration
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/ci.yml           # GitHub Actions CI/CD
├── cloudbuild.yaml                    # Cloud Build pipeline
├── docker-compose.yml                 # Local development
├── GCP_SETUP.md                       # Google Cloud setup guide
├── DEPLOYMENT.md                      # Deployment documentation
├── CONTRIBUTING.md                    # Developer guidelines
└── LICENSE                            # Apache 2.0
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Google Cloud project with APIs enabled:
  - Vertex AI API
  - BigQuery API
  - Firestore API
  - Cloud Run API
  - Cloud Build API

### Local Development

```bash
# Clone repository
git clone https://github.com/Jeremiah-Sakuda/Kifani.git
cd Kifani

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
DEV_MODE=true uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Docker Compose

```bash
docker compose up
```

### Deploy to Cloud Run

```bash
gcloud builds submit --config=cloudbuild.yaml
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## Testing

```bash
# Backend tests
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v

# Frontend tests
cd frontend
npm run test

# Type checking
cd backend && mypy app/
cd frontend && npm run typecheck
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/match` | Direct archetype matching |
| `POST` | `/api/stream/match` | Streaming match with SSE (real-time reasoning trace) |
| `POST` | `/api/chat` | Follow-up conversation with Gemini |
| `POST` | `/api/analyze/photo/base64` | Photo analysis via Gemini Vision |
| `POST` | `/api/analyze/voice/base64` | Voice transcription and parsing |
| `POST` | `/api/imagen/portrait` | Generate Imagen archetype portrait |
| `GET` | `/api/paralympic/classifications` | List all Paralympic classification codes |
| `GET` | `/api/paralympic/classifications/{code}` | Get details for specific classification |
| `GET` | `/api/era/list` | List available historical eras |
| `GET` | `/api/era/evolution/{archetype}` | Get archetype evolution across eras |
| `GET` | `/api/session/{session_id}` | Retrieve session results |
| `GET` | `/health` | Health check |

---

## Judging Criteria Alignment

| Criteria | Weight | How We Address It |
|----------|--------|-------------------|
| **Impact** | 40% | Fan-centric archetype discovery with inspiring Paralympic representation; solves "where do I fit in Team USA history?" |
| **Technical Depth** | 30% | 5-tool Gemini agent with thinking traces, context caching, semantic embeddings, search grounding, multimodal input, Imagen integration, real-time SSE streaming |
| **Presentation** | 30% | Theatrical Digital Mirror reveal, visible reasoning trace, polished UI with Framer Motion animations |

---

## Team

Built for the Team USA x Google Cloud Hackathon 2026.

---

## License

Apache License 2.0 — see [LICENSE](LICENSE)

---

## Acknowledgments

- Team USA and USOPC for inspiring this project
- Google Cloud for Vertex AI, BigQuery, and Cloud Run
- Olympedia and IPC for public historical data
