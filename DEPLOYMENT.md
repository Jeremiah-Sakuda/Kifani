# FORGED — Deployment Guide

Complete guide for deploying FORGED to Google Cloud Run.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deploy](#quick-deploy)
3. [Manual Deployment](#manual-deployment)
4. [Environment Variables](#environment-variables)
5. [Architecture](#architecture)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)
8. [Cost Estimates](#cost-estimates)
9. [CI/CD Setup](#cicd-setup)
10. [Local Development](#local-development)

---

## Prerequisites

### 1. Google Cloud Project

Create or select a Google Cloud project with billing enabled.

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Create Firestore Database

Firestore is required for session persistence and chat history:

```bash
# Create Firestore database in Native mode
gcloud firestore databases create --location=us-central1
```

**Note:** If you see "Cloud Firestore API has not been used" errors, ensure the Firestore database is created before deploying.

### 4. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
```

### 5. Set IAM Permissions

Ensure the Cloud Build and Cloud Run service accounts have necessary permissions:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant Vertex AI access to Cloud Run service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Grant BigQuery access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

# Grant Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

## Quick Deploy

### One-Command Deployment

```bash
gcloud builds submit --config=cloudbuild.yaml
```

This executes an 8-step pipeline:
1. Build backend Docker image
2. Push backend to Container Registry
3. Deploy backend to Cloud Run
4. Get backend URL
5. Build frontend with backend URL injected
6. Push frontend to Container Registry
7. Deploy frontend to Cloud Run
8. Print deployment URLs

**Expected output:**
```
═══════════════════════════════════════════════════════════════
FORGED Deployment Complete!
═══════════════════════════════════════════════════════════════

Backend URL:
https://forged-backend-xxxxxxxxxx-uc.a.run.app

Frontend URL:
https://forged-frontend-xxxxxxxxxx-uc.a.run.app

═══════════════════════════════════════════════════════════════
```

### With Custom Region

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=us-east1
```

---

## Manual Deployment

### Step 1: Set Environment Variables

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1
```

### Step 2: Deploy Backend

```bash
cd backend

# Build and push
gcloud builds submit --tag gcr.io/$PROJECT_ID/forged-backend

# Deploy to Cloud Run
gcloud run deploy forged-backend \
  --image gcr.io/$PROJECT_ID/forged-backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GCP_LOCATION=$REGION,DEV_MODE=false"

# Get backend URL
export BACKEND_URL=$(gcloud run services describe forged-backend \
  --region=$REGION --format='value(status.url)')
echo "Backend: $BACKEND_URL"
```

### Step 3: Deploy Frontend

```bash
cd ../frontend

# Build with backend URL
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL/api \
  -t gcr.io/$PROJECT_ID/forged-frontend .

# Push to registry
docker push gcr.io/$PROJECT_ID/forged-frontend

# Deploy to Cloud Run
gcloud run deploy forged-frontend \
  --image gcr.io/$PROJECT_ID/forged-frontend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get frontend URL
export FRONTEND_URL=$(gcloud run services describe forged-frontend \
  --region=$REGION --format='value(status.url)')
echo "Frontend: $FRONTEND_URL"
```

---

## Environment Variables

### Backend (Cloud Run)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GCP_PROJECT_ID` | Google Cloud project ID | Yes | — |
| `GCP_LOCATION` | Vertex AI region | Yes | `us-central1` |
| `DEV_MODE` | Enable mock responses | Yes | `false` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | No | `*` |

### Frontend (Build-time)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (e.g., `https://forged-backend-xxx.run.app/api`) | Yes |

---

## Architecture

```
                              ┌─────────────────────────────────┐
                              │         Cloud Build             │
                              │    (CI/CD Pipeline)             │
                              └─────────────┬───────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         ┌──────────────────────┐                      ┌──────────────────────┐
         │    Cloud Run         │                      │    Cloud Run         │
         │    FRONTEND          │                      │    BACKEND           │
         ├──────────────────────┤                      ├──────────────────────┤
         │ • React + TypeScript │        HTTPS         │ • FastAPI + Python   │
         │ • Tailwind CSS       │◄─────────────────────│ • Gemini Agent       │
         │ • D3.js + Framer     │                      │ • Imagen Service     │
         │ • Nginx (static)     │                      │ • Uvicorn Server     │
         └──────────────────────┘                      └──────────┬───────────┘
                    │                                             │
                    │                        ┌────────────────────┼────────────────────┐
                    │                        ▼                    ▼                    ▼
                    │              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │              │   Vertex AI      │  │   BigQuery       │  │   Firestore      │
                    │              ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
                    │              │ • Gemini 3.1 Pro │  │ • athletes table │  │ • sessions       │
                    │              │ • Gemini 3.1 Flash│ │ • archetypes     │  │ • chat history   │
                    │              │ • Imagen 3.0     │  │ • classifications│  │                  │
                    │              └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │    Container         │
         │    Registry (GCR)    │
         ├──────────────────────┤
         │ • forged-backend     │
         │ • forged-frontend    │
         └──────────────────────┘
```

### Cloud Run Configuration

| Service | Memory | CPU | Min Instances | Max Instances |
|---------|--------|-----|---------------|---------------|
| forged-backend | 1Gi | 1 | 0 | 10 |
| forged-frontend | 256Mi | 1 | 0 | 10 |

---

## Monitoring & Logging

### View Logs

```bash
# Backend logs
gcloud run services logs read forged-backend --region=$REGION --limit=100

# Frontend logs
gcloud run services logs read forged-frontend --region=$REGION --limit=100

# Stream logs in real-time
gcloud run services logs tail forged-backend --region=$REGION
```

### Cloud Console

- **Cloud Run:** https://console.cloud.google.com/run
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds
- **Vertex AI:** https://console.cloud.google.com/vertex-ai
- **BigQuery:** https://console.cloud.google.com/bigquery

### Metrics

```bash
# View service metrics
gcloud run services describe forged-backend --region=$REGION

# Check request latency and error rates in Cloud Console
```

---

## Troubleshooting

### CORS Errors

If frontend cannot reach backend:

```bash
gcloud run services update forged-backend \
  --region=$REGION \
  --set-env-vars "ALLOWED_ORIGINS=https://forged-frontend-xxx.run.app"
```

### Vertex AI Permission Denied

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Imagen Not Generating Images

1. Verify Imagen API is enabled:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

2. Check region supports Imagen (us-central1 recommended)

3. Check Vertex AI quotas in Cloud Console

### BigQuery Access Denied

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"
```

### Cold Start Latency

If first request is slow, consider setting minimum instances:

```bash
gcloud run services update forged-backend \
  --region=$REGION \
  --min-instances=1
```

Note: This increases costs as instances run continuously.

### Build Failures

1. Check Cloud Build logs:
   ```bash
   gcloud builds list --limit=5
   gcloud builds log BUILD_ID
   ```

2. Verify Dockerfiles are valid:
   ```bash
   docker build -t test ./backend
   docker build -t test ./frontend
   ```

---

## Cost Estimates

### Monthly Costs (Low-Moderate Traffic)

| Service | Estimated Cost | Notes |
|---------|----------------|-------|
| Cloud Run (backend) | $5-20 | Scales to zero |
| Cloud Run (frontend) | $1-5 | Scales to zero |
| Vertex AI (Gemini) | Variable | ~$0.00125 per 1K input tokens |
| Vertex AI (Imagen) | Variable | ~$0.02 per image |
| BigQuery | $0-5 | First 1TB/month free |
| Firestore | $0-5 | First 1GB/month free |
| Container Registry | $0-2 | Storage costs |

### Cost Optimization

1. **Set `min-instances=0`** — Services scale to zero when idle
2. **Use Gemini Flash** for validation (cheaper than Pro)
3. **Cache Imagen results** in Firestore to avoid regeneration
4. **Monitor usage** in Cloud Console Billing

---

## CI/CD Setup

### Automated Deployment via GitHub Actions (Current Setup)

The repository uses GitHub Actions with Workload Identity Federation for secure, keyless authentication to Google Cloud. Deployment is triggered automatically on every push to `main`.

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Google Cloud project ID (e.g., `akili-9d5fe`) |
| `WIF_PROVIDER` | Workload Identity Provider path |
| `WIF_SERVICE_ACCOUNT` | Service account email for deployment |

**Pipeline Steps:**
1. Run backend tests (pytest)
2. Run frontend tests (vitest)
3. Run integration check
4. Build and push Docker images
5. Deploy backend to Cloud Run
6. Deploy frontend to Cloud Run (with backend URL injected)

See [GCP_SETUP.md](GCP_SETUP.md) for complete Workload Identity Federation setup instructions.

### Alternative: Cloud Build Triggers

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect to your GitHub repository
4. Configure:
   - **Event:** Push to branch
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file
   - **Location:** `cloudbuild.yaml`
5. Save trigger

### Manual Deployment

```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run with mock responses (no GCP required)
DEV_MODE=true uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Docker Compose

```bash
docker compose up
```

This starts both services with hot reloading.

### Testing Against Production Backend

```bash
cd frontend
VITE_API_URL=https://forged-backend-xxx.run.app/api npm run dev
```

---

## Security Considerations

1. **CORS:** Restrict `ALLOWED_ORIGINS` to frontend domain only
2. **Authentication:** Currently unauthenticated; add Firebase Auth for user accounts
3. **Rate Limiting:** Consider Cloud Armor or API Gateway for production
4. **Secrets:** Use Secret Manager for sensitive environment variables
5. **Data:** No PII stored; sessions expire after TTL

---

## License

Apache License 2.0 — see [LICENSE](../LICENSE)
