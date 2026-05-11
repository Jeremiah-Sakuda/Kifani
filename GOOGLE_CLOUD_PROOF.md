# Google Cloud Deployment & Services Proof

This document provides proof that FORGED is deployed and running on Google Cloud, utilizing multiple Google Cloud services and APIs.

---

## 1. Cloud Run Deployment

**Backend Service:** `forged-backend`
**Frontend Service:** `forged-frontend`
**Region:** `us-central1`

### CI/CD Pipeline
The application is automatically deployed to Google Cloud Run via GitHub Actions using Workload Identity Federation.

**File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

```yaml
# Lines 130-191: Cloud Run Deployment
deploy:
  runs-on: ubuntu-latest
  needs: [integration-check]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'

  steps:
    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
        service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

    - name: Deploy Backend to Cloud Run
      run: |
        gcloud run deploy forged-backend \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/forged-backend:${{ github.sha }} \
          --region us-central1 \
          --platform managed
```

### Dockerfile (Cloud Run Optimized)
**File:** [`backend/Dockerfile`](backend/Dockerfile)

```dockerfile
# Cloud Run uses PORT env variable
ENV PORT=8080

# Cloud Run expects port 8080
EXPOSE 8080

# Run with uvicorn - Cloud Run sets PORT env var
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

---

## 2. Vertex AI - Gemini API

Multiple services use Gemini models via Vertex AI for AI-powered features.

### Dependencies
**File:** [`backend/requirements.txt`](backend/requirements.txt)

```
google-cloud-aiplatform==1.90.0
google-genai==1.0.0
```

### Gemini 2.5 Flash - Photo Analysis
**File:** [`backend/app/services/photo_analysis.py`](backend/app/services/photo_analysis.py)

```python
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part, Image

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.5-flash"

def _get_model() -> GenerativeModel:
    """Initialize Gemini Vision model."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(MODEL_NAME)
```

### Gemini 2.5 Flash - Voice Analysis
**File:** [`backend/app/services/voice_analysis.py`](backend/app/services/voice_analysis.py)

```python
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part

MODEL_NAME = "gemini-2.5-flash"
```

### Gemini 2.5 Flash - Conditional Language Validator
**File:** [`backend/app/services/conditional_validator.py`](backend/app/services/conditional_validator.py)

```python
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, GenerationConfig

MODEL_NAME = "gemini-2.5-flash"
```

### Gemini Agent - Narrative Generation
**File:** [`backend/app/services/gemini_agent.py`](backend/app/services/gemini_agent.py)

```python
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel
```

---

## 3. Imagen API - Abstract Art Generation

**File:** [`backend/app/services/imagen_service.py`](backend/app/services/imagen_service.py)

```python
from google import genai
from google.genai import types

def _get_client() -> genai.Client:
    """Initialize Gemini client for Vertex AI."""
    return genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION,
    )

# Generate image using Imagen
response = client.models.generate_images(
    model="imagen-3.0-fast-generate-001",
    prompt=prompt,
    config=types.GenerateImagesConfig(
        number_of_images=1,
        output_mime_type="image/jpeg",
    ),
)
```

---

## 4. BigQuery - Athlete Data Analytics

**File:** [`backend/app/services/bigquery_service.py`](backend/app/services/bigquery_service.py)

```python
from google.cloud import bigquery

def get_client() -> bigquery.Client:
    """Get BigQuery client."""
    return bigquery.Client(project=PROJECT_ID)
```

**File:** [`backend/app/services/bqml_service.py`](backend/app/services/bqml_service.py)

```python
from google.cloud import bigquery
```

---

## 5. Cloud Firestore - Session Storage

**File:** [`backend/app/services/firestore_service.py`](backend/app/services/firestore_service.py)

```python
from google.cloud import firestore

def get_client() -> firestore.Client:
    """Get Firestore client."""
    return firestore.Client(project=PROJECT_ID)
```

---

## 6. Google Search Grounding

**File:** [`backend/app/tools/search_grounding.py`](backend/app/tools/search_grounding.py)

```python
from google.cloud import aiplatform
from vertexai.generative_models import (
    GenerativeModel,
    Tool as VertexTool,
    grounding,
)

# Use Gemini 2.5 Flash for grounding
model = GenerativeModel("gemini-2.5-flash")
```

---

## Summary of Google Cloud Services Used

| Service | Purpose | Files |
|---------|---------|-------|
| **Cloud Run** | Backend & Frontend hosting | `ci.yml`, `Dockerfile` |
| **Vertex AI (Gemini 2.5 Flash)** | Photo analysis, voice analysis, narrative generation, validation | `photo_analysis.py`, `voice_analysis.py`, `gemini_agent.py`, `conditional_validator.py` |
| **Imagen 3.0** | Abstract archetype art generation | `imagen_service.py` |
| **BigQuery** | Athlete data analytics and queries | `bigquery_service.py`, `bqml_service.py` |
| **Cloud Firestore** | Session and user data storage | `firestore_service.py` |
| **Google Search Grounding** | Real-time sports news grounding | `search_grounding.py` |
| **Workload Identity Federation** | Secure CI/CD authentication | `ci.yml` |
| **Container Registry (GCR)** | Docker image storage | `ci.yml` |

---

## Environment Configuration

The backend reads Google Cloud configuration from environment variables:

```python
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
```

These are set during Cloud Run deployment via the CI/CD pipeline.
