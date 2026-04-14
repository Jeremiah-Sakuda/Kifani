"""
Cloud Function: Preprocessing trigger for athlete data pipeline.

Triggered by Cloud Storage upload — processes raw CSV files and ingests them into BigQuery.
"""

import json
import uuid
import functions_framework
import pandas as pd
from google.cloud import bigquery, storage


PROJECT_ID = "your-gcp-project-id"  # Set via env in Cloud Function config
DATASET = "kifani"
TABLE = "athletes"


def classify_era(year: int) -> str:
    if year < 1950:
        return "pre-1950"
    elif year <= 1980:
        return "1950-1980"
    elif year <= 2000:
        return "1980-2000"
    else:
        return "2000+"


@functions_framework.cloud_event
def process_athlete_data(cloud_event):
    """Triggered by a Cloud Storage event when a new CSV is uploaded."""
    data = cloud_event.data
    bucket_name = data["bucket"]
    file_name = data["name"]

    if not file_name.endswith(".csv"):
        print(f"Skipping non-CSV file: {file_name}")
        return

    print(f"Processing {file_name} from {bucket_name}...")

    # Download file from GCS
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    content = blob.download_as_text()

    # Parse CSV
    from io import StringIO
    df = pd.read_csv(StringIO(content))

    # Normalize columns
    col_map = {
        "Height": "height_cm",
        "Weight": "weight_kg",
        "Sport": "sport",
        "Event": "event",
        "Year": "year",
        "Sex": "sex",
        "Age": "age",
        "Team": "team",
        "NOC": "noc",
    }
    df.rename(columns={k: v for k, v in col_map.items() if k in df.columns}, inplace=True)

    # Filter to US athletes
    if "team" in df.columns:
        df = df[df["team"].str.contains("United States|USA", case=False, na=False)]
    elif "noc" in df.columns:
        df = df[df["noc"] == "USA"]

    # Add fields
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    df["games_type"] = "P" if "paralympic" in file_name.lower() else "O"
    df["classification"] = None
    if "year" in df.columns:
        df["era"] = df["year"].apply(classify_era)

    final_cols = ["id", "height_cm", "weight_kg", "sport", "event", "year", "games_type", "classification", "sex", "age", "era"]
    for col in final_cols:
        if col not in df.columns:
            df[col] = None
    df = df[final_cols].dropna(subset=["height_cm", "weight_kg"])

    # Upload to BigQuery
    bq_client = bigquery.Client(project=PROJECT_ID)
    table_ref = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
    )
    job = bq_client.load_table_from_dataframe(df, table_ref, job_config=job_config)
    job.result()

    print(f"Loaded {job.output_rows} rows from {file_name}.")
