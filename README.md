# Kifani — Find Your Team USA Archetype

A fan-facing web app powered by a Gemini-backed agent that clusters 120 years of US Olympic and Paralympic athlete data into body-type-driven archetypes and matches users to their closest athletic profile.

**Team USA x Google Cloud Hackathon — Challenge 4**

## Features

- **Archetype Matching** — Enter your height, weight, and optional traits to discover which Team USA athlete archetype aligns with your build
- **Digital Mirror** — Interactive visualization plotting your traits against historical archetype distributions
- **Paralympic Parity** — Olympic and Paralympic athletes clustered together with equal analytical depth; classification explainers included
- **Conversational Follow-ups** — Ask Gemini-powered follow-up questions grounded in 120 years of data
- **Conditional Phrasing** — All results use language like "your build could align with" — never definitive claims

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Backend API | Python (FastAPI) |
| AI/Agent | Gemini 2.5 Pro via Vertex AI |
| Database | BigQuery (athlete data), Firestore (session state) |
| Data Pipeline | Cloud Functions for preprocessing |
| Deployment | Cloud Run, Cloud Build CI/CD |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Google Cloud project with Vertex AI, BigQuery, Firestore enabled

### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env      # Edit with your GCP project ID
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up
```

## Data Sources

- Public Olympic datasets (Kaggle 120 Years of Olympic History)
- IPC public results data
- teamusa.com public athlete profiles

**No finish times, scoring results, or athlete NIL used.**

## License

Apache 2.0 — see [LICENSE](LICENSE)
