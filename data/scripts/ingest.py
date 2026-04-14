"""
Ingest raw Olympic/Paralympic CSV datasets into BigQuery.

Usage:
    python -m data.scripts.ingest --source data/sources/athletes.csv
"""

import argparse
import json
import uuid

import pandas as pd
from google.cloud import bigquery


PROJECT_ID = "your-gcp-project-id"  # TODO: set via env
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


def ingest_csv(filepath: str):
    """Read a CSV, normalize fields, and upload to BigQuery."""
    df = pd.read_csv(filepath)

    # ── Normalize column names ──
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

    # Filter to US athletes only
    if "team" in df.columns:
        df = df[df["team"].str.contains("United States|USA", case=False, na=False)]
    elif "noc" in df.columns:
        df = df[df["noc"] == "USA"]

    # Add missing columns
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]
    df["games_type"] = "O"  # Default to Olympic; override for Paralympic sources
    df["classification"] = None

    if "year" in df.columns:
        df["era"] = df["year"].apply(classify_era)

    # Select and clean final columns
    final_cols = ["id", "height_cm", "weight_kg", "sport", "event", "year", "games_type", "classification", "sex", "age", "era"]
    for col in final_cols:
        if col not in df.columns:
            df[col] = None

    df = df[final_cols]

    # Drop rows without biometric data
    df = df.dropna(subset=["height_cm", "weight_kg"])

    print(f"Ingesting {len(df)} rows into BigQuery...")

    # Upload to BigQuery
    client = bigquery.Client(project=PROJECT_ID)
    table_ref = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    with open("data/schemas/athletes.json") as f:
        schema = json.load(f)

    bq_schema = [
        bigquery.SchemaField(s["name"], s["type"], mode=s.get("mode", "NULLABLE"))
        for s in schema
    ]

    job_config = bigquery.LoadJobConfig(
        schema=bq_schema,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
    )

    job = client.load_table_from_dataframe(df, table_ref, job_config=job_config)
    job.result()
    print(f"Loaded {job.output_rows} rows.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Path to CSV file")
    args = parser.parse_args()
    ingest_csv(args.source)
