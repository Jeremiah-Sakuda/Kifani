"""
Load Paralympic classification reference data into BigQuery.

Usage:
    python -m data.scripts.load_classifications
    python -m data.scripts.load_classifications --local
"""

import argparse
import os
import json

import pandas as pd


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
DATASET = "kifani"
TABLE = "paralympic_classifications"


def load_classifications():
    """Load and process the Paralympic classifications CSV."""
    df = pd.read_csv("data/sources/paralympic_classifications.csv")

    # Split events string into list
    df["events"] = df["events"].apply(lambda x: x.split(",") if pd.notna(x) else [])

    print(f"Loaded {len(df)} Paralympic classifications")
    print(f"Sports covered: {df['sport'].unique().tolist()}")
    print(f"Impairment types: {df['impairment_type'].unique().tolist()}")

    return df


def upload_to_bigquery(df: pd.DataFrame):
    """Upload to BigQuery."""
    from google.cloud import bigquery

    client = bigquery.Client(project=PROJECT_ID)
    table_ref = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    with open("data/schemas/paralympic_classifications.json") as f:
        schema_def = json.load(f)

    bq_schema = [
        bigquery.SchemaField(s["name"], s["type"], mode=s.get("mode", "NULLABLE"))
        for s in schema_def
    ]

    job_config = bigquery.LoadJobConfig(
        schema=bq_schema,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )

    job = client.load_table_from_dataframe(df, table_ref, job_config=job_config)
    job.result()
    print(f"Uploaded {len(df)} classifications to BigQuery: {table_ref}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load Paralympic classifications")
    parser.add_argument("--local", action="store_true", help="Just validate, don't upload")
    args = parser.parse_args()

    df = load_classifications()

    if not args.local:
        upload_to_bigquery(df)
    else:
        print("\nSample data:")
        print(df[["code", "sport", "impairment_type"]].head(10).to_string())
