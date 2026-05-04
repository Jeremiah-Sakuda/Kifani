# FORGED — Find Your Team USA Archetype

**Team USA x Google Cloud Hackathon 2026 — Challenge 4: Athlete Archetype Agent**

A Gemini-powered fan engagement tool that matches users to Team USA Olympic and Paralympic athlete archetypes through multimodal input (photo, voice, or form), featuring structural Paralympic parity and an Imagen-generated "Digital Mirror" as its centerpiece.

> *"Forged from 120 years of Team USA excellence"*

---

## Live Demo

*URLs will be populated after Cloud Run deployment. Run `gcloud builds submit --config=cloudbuild.yaml` to deploy.*

- **Frontend:** `https://forged-frontend-<PROJECT_HASH>.run.app`
- **Backend API:** `https://forged-backend-<PROJECT_HASH>.run.app`

---

## Challenge Alignment

This project addresses **Challenge 4: Athlete Archetype Agent** — a clustering tool matching users to historical athlete body types.

| Requirement | Implementation |
|-------------|----------------|
| Gemini API for analysis/generation | Gemini 2.5 Pro (agent orchestration), Gemini 2.0 Flash (validation, multimodal analysis) |
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
│  Gemini/Imagen│    │ 16K athletes │      │   Sessions   │
└──────────────┘     └──────────────┘      └──────────────┘
```

---

## Google Cloud Integration

| Service | Usage |
|---------|-------|
| **Vertex AI — Gemini 2.5 Pro** | Agent orchestration with 4-tool function calling |
| **Vertex AI — Gemini 2.0 Flash** | Photo analysis, voice transcription, conditional language validation |
| **Vertex AI — Imagen 3.0** | Non-photorealistic archetype portrait generation |
| **BigQuery** | 16,065 athlete records (14,218 Olympic + 2,847 Paralympic) |
| **Firestore** | Session persistence for multi-turn conversations |
| **Cloud Run** | Serverless deployment (auto-scaling 0-10 instances) |
| **Cloud Build** | CI/CD pipeline (8-step build and deploy) |
| **Cloud Logging** | Observability and debugging |

---

## Key Differentiators

### 1. Structural Paralympic Parity
Not a checkbox feature — Paralympic athletes are weighted 1.15x in clustering to ensure equal representation despite smaller dataset. Two archetypes (Adaptive Power, Adaptive Endurance) are Paralympic-first. 30+ classification codes documented with full explanations.

### 2. Real Agentic Orchestration
Gemini 2.5 Pro with function calling orchestrates 4 specialized tools. Server-Sent Events stream the reasoning trace in real-time. Not simulated loading spinners — actual tool execution visible to users.

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
│   │   ├── main.py              # FastAPI application
│   │   ├── models/
│   │   │   ├── archetypes.py    # 8 archetype definitions
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── routers/             # API endpoints
│   │   ├── services/
│   │   │   ├── adk_agent.py     # Gemini 2.5 Pro orchestration
│   │   │   ├── clustering.py    # K-means matching
│   │   │   ├── imagen_service.py # Portrait generation
│   │   │   └── ...
│   │   └── tools/               # ADK tool implementations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.tsx
│   │   │   ├── Processing.tsx   # SSE streaming UI
│   │   │   ├── Results.tsx
│   │   │   ├── DigitalMirror.tsx # D3 visualization
│   │   │   └── ...
│   │   ├── services/api.ts
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── cloudbuild.yaml              # Cloud Build CI/CD
├── docker-compose.yml           # Local development
└── LICENSE                      # Apache 2.0
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
| `GET` | `/api/stream/match` | Streaming match with SSE |
| `POST` | `/api/chat` | Follow-up conversation |
| `POST` | `/api/analyze/photo/base64` | Photo analysis |
| `POST` | `/api/analyze/voice/base64` | Voice analysis |
| `POST` | `/api/imagen/portrait` | Generate archetype portrait |
| `GET` | `/health` | Health check |

---

## Judging Criteria Alignment

| Criteria | Weight | How We Address It |
|----------|--------|-------------------|
| **Impact** | 40% | Fan-centric archetype discovery with inspiring Paralympic representation; solves "where do I fit in Team USA history?" |
| **Technical Depth** | 30% | 4-tool Gemini agent, multimodal input (photo/voice/form), Imagen integration, BigQuery data layer, real-time SSE streaming |
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
