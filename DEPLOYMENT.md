# FORGED - Cloud Run Deployment Guide

> Gemini-powered athlete archetype matching for Team USA x Google Cloud Hackathon

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **APIs Enabled:**
   - Cloud Run API
   - Cloud Build API
   - Container Registry API
   - Vertex AI API
   - Artifact Registry API

3. **gcloud CLI** installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Quick Deploy (Recommended)

### One-Command Deployment

```bash
gcloud builds submit --config=cloudbuild.yaml
```

This will:
1. Build backend Docker image
2. Deploy backend to Cloud Run
3. Build frontend with backend URL injected
4. Deploy frontend to Cloud Run
5. Print both service URLs

### Manual Deployment

If you prefer step-by-step:

#### 1. Set Environment Variables

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1
```

#### 2. Deploy Backend

```bash
# Build and push backend
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/forged-backend

# Deploy to Cloud Run
gcloud run deploy forged-backend \
  --image gcr.io/$PROJECT_ID/forged-backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GCP_LOCATION=$REGION,DEV_MODE=false"

# Get backend URL
export BACKEND_URL=$(gcloud run services describe forged-backend --region=$REGION --format='value(status.url)')
echo "Backend: $BACKEND_URL"
```

#### 3. Deploy Frontend

```bash
# Build with backend URL
cd ../frontend
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/forged-frontend \
  --build-arg VITE_API_URL=$BACKEND_URL/api

# Deploy to Cloud Run
gcloud run deploy forged-frontend \
  --image gcr.io/$PROJECT_ID/forged-frontend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi

# Get frontend URL
export FRONTEND_URL=$(gcloud run services describe forged-frontend --region=$REGION --format='value(status.url)')
echo "Frontend: $FRONTEND_URL"
```

## Environment Variables

### Backend (`backend/.env` or Cloud Run env vars)

| Variable | Description | Required |
|----------|-------------|----------|
| `GCP_PROJECT_ID` | Google Cloud project ID | Yes |
| `GCP_LOCATION` | Vertex AI region (e.g., us-central1) | Yes |
| `DEV_MODE` | Set to `false` for production | Yes |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | No |

### Frontend (build-time)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Cloud Run     │     │   Cloud Run     │
│   (Frontend)    │────▶│   (Backend)     │
│   React + Nginx │     │   FastAPI       │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Gemini   │ │ Imagen   │ │ BigQuery │
              │ 2.5 Pro  │ │ 3.0      │ │ (Data)   │
              └──────────┘ └──────────┘ └──────────┘
```

## Costs

Estimated monthly costs for low-to-moderate traffic:

| Service | Estimated Cost |
|---------|----------------|
| Cloud Run (backend) | ~$5-20 |
| Cloud Run (frontend) | ~$1-5 |
| Vertex AI (Gemini) | Pay per request |
| Vertex AI (Imagen) | Pay per image |

Cloud Run scales to zero when not in use.

## Monitoring

View logs and metrics:

```bash
# Backend logs
gcloud run services logs read forged-backend --region=$REGION

# Frontend logs
gcloud run services logs read forged-frontend --region=$REGION
```

## Troubleshooting

### CORS Errors

Update `ALLOWED_ORIGINS` in backend Cloud Run settings:

```bash
gcloud run services update forged-backend \
  --region=$REGION \
  --set-env-vars "ALLOWED_ORIGINS=https://forged-frontend-xxx.run.app"
```

### Vertex AI Permissions

Ensure Cloud Run service account has Vertex AI User role:

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Image Generation Not Working

Verify Imagen API is enabled and region supports it:

```bash
gcloud services enable aiplatform.googleapis.com
```

## CI/CD with Cloud Build Triggers

Set up automatic deployments on push:

1. Go to Cloud Build > Triggers
2. Create trigger connected to your GitHub repo
3. Set trigger to run on push to `main`
4. Use `cloudbuild.yaml` as config

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
DEV_MODE=true uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

## License

Apache License 2.0 - See [LICENSE](LICENSE)
