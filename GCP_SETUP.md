# Google Cloud Setup for Automated Deployment

This guide walks you through setting up automated deployment to Google Cloud Run via GitHub Actions.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed locally
- GitHub repository admin access

## Step 1: Create a GCP Project

```bash
# Set your project ID (must be globally unique)
export PROJECT_ID="forged-hackathon"

# Create project
gcloud projects create $PROJECT_ID --name="FORGED Hackathon"

# Set as default
gcloud config set project $PROJECT_ID

# Link billing account (get your billing account ID from console)
gcloud billing accounts list
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

## Step 2: Enable Required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  firestore.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com
```

## Step 3: Set Up Workload Identity Federation

This allows GitHub Actions to authenticate without storing service account keys.

```bash
# Create a Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create a Workload Identity Provider for GitHub
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

## Step 4: Create a Service Account

```bash
# Create service account
gcloud iam service-accounts create "github-actions" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Deployer"

# Grant required roles
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Cloud Run Admin (to deploy services)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Storage Admin (for Container Registry)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Service Account User (to act as the Cloud Run runtime account)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Vertex AI User (for Gemini API)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user"

# BigQuery Data Viewer
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/bigquery.dataViewer"

# Firestore User
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/datastore.user"
```

## Step 5: Allow GitHub to Impersonate the Service Account

Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual values:

```bash
export GITHUB_REPO="YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"  # e.g., Jeremiah-Sakuda/Kifani

# Get the Workload Identity Pool ID
export WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)")

# Allow the GitHub repo to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_ID}/attribute.repository/${GITHUB_REPO}"
```

## Step 6: Get Values for GitHub Secrets

Run these commands to get the values you'll need:

```bash
# Workload Identity Provider
echo "WIF_PROVIDER:"
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"

# Service Account Email
echo "WIF_SERVICE_ACCOUNT:"
echo "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Project ID
echo "GCP_PROJECT_ID:"
echo "${PROJECT_ID}"
```

## Step 7: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `WIF_PROVIDER` | Output from Step 6 (looks like `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider`) |
| `WIF_SERVICE_ACCOUNT` | `github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com` |
| `GCP_PROJECT_ID` | Your project ID (e.g., `forged-hackathon`) |

## Step 8: Initialize Data (Optional)

If you need to set up BigQuery tables:

```bash
# Create dataset
bq mk --dataset ${PROJECT_ID}:forged

# Load archetype data (if you have CSV files)
# bq load --source_format=CSV ${PROJECT_ID}:forged.archetypes data/archetypes.csv
```

## Step 9: Test Deployment

Push a commit to `main` branch. GitHub Actions will:
1. Run all tests
2. Build Docker images
3. Deploy backend to Cloud Run
4. Deploy frontend to Cloud Run
5. Print the deployment URLs

## Troubleshooting

### "Permission denied" errors
- Ensure all required APIs are enabled
- Verify the service account has the correct roles
- Check that the GitHub repo is correctly bound in Step 5

### Build failures
- Check Cloud Build logs in GCP Console
- Ensure Dockerfiles build correctly locally first

### Deployment failures
- Check Cloud Run logs for runtime errors
- Verify environment variables are set correctly

## Cost Estimate

For hackathon-level traffic (~100 requests/day):
- **Cloud Run:** ~$0-5/month (free tier covers light usage)
- **Vertex AI (Gemini):** ~$5-20/month depending on usage
- **BigQuery:** ~$0-1/month (1TB free per month)
- **Container Registry:** ~$1-2/month

**Total:** ~$10-30/month during hackathon

## Quick Deploy (Manual)

If you prefer manual deployment instead of GitHub Actions:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

This uses Cloud Build to run all steps from `cloudbuild.yaml`.
