"""
Ingest raw Olympic/Paralympic CSV datasets into BigQuery.

Handles the Kaggle "120 Years of Olympic History" dataset format:
  Columns: ID, Name, Sex, Age, Height, Weight, Team, NOC, Games, Year, Season, City, Sport, Event, Medal

Usage:
    python -m data.scripts.ingest --source data/sources/athlete_events.csv
    python -m data.scripts.ingest --source data/sources/athlete_events.csv --local
"""

import argparse
import os
import uuid

import pandas as pd


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
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


def load_and_clean(filepath: str) -> pd.DataFrame:
    """Load CSV, filter to US athletes, normalize columns."""
    df = pd.read_csv(filepath)
    print(f"Raw rows: {len(df)}, columns: {list(df.columns)}")

    # Standardize column names to lowercase
    df.columns = df.columns.str.strip().str.lower()

    # Filter to US athletes only (NOC == USA or Team contains United States)
    if "noc" in df.columns:
        df = df[df["noc"] == "USA"]
    elif "team" in df.columns:
        df = df[df["team"].str.contains("United States|USA", case=False, na=False)]
    else:
        print("WARNING: No team/NOC column found. Cannot filter to US athletes.")
        return pd.DataFrame()

    print(f"US athletes: {len(df)} rows")

    # Rename columns to match our schema
    rename_map = {
        "height": "height_cm",
        "weight": "weight_kg",
        "sport": "sport",
        "event": "event",
        "year": "year",
        "sex": "sex",
        "age": "age",
        "medal": "medal",
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    # Generate unique IDs (strip athlete Name for NIL compliance)
    df["id"] = [str(uuid.uuid4()) for _ in range(len(df))]

    # Set games type
    df["games_type"] = "O"  # Olympic by default

    # No classification for Olympic athletes
    df["classification"] = None

    # Compute era
    if "year" in df.columns:
        df["era"] = df["year"].apply(lambda y: classify_era(int(y)) if pd.notna(y) else None)

    # Drop rows without biometric data
    before = len(df)
    df = df.dropna(subset=["height_cm", "weight_kg"])
    print(f"Dropped {before - len(df)} rows missing height/weight. Remaining: {len(df)}")

    # Remove obvious outliers
    df = df[(df["height_cm"] >= 100) & (df["height_cm"] <= 230)]
    df = df[(df["weight_kg"] >= 30) & (df["weight_kg"] <= 200)]
    print(f"After outlier removal: {len(df)}")

    # Remove prohibited data: finish times and scoring results are NOT in this dataset
    # but ensure we only keep permitted fields
    # Medal (placement) IS permitted per hackathon rules

    # Select final columns (exclude Name and other identifying info)
    final_cols = ["id", "height_cm", "weight_kg", "sport", "event", "year",
                  "games_type", "classification", "sex", "age", "era"]
    for col in final_cols:
        if col not in df.columns:
            df[col] = None

    return df[final_cols]


def save_local(df: pd.DataFrame, output: str):
    """Save cleaned data locally as CSV."""
    df.to_csv(output, index=False)
    print(f"Saved {len(df)} rows to {output}")


def upload_to_bigquery(df: pd.DataFrame):
    """Upload cleaned data to BigQuery."""
    from google.cloud import bigquery
    import json

    client = bigquery.Client(project=PROJECT_ID)
    table_ref = f"{PROJECT_ID}.{DATASET}.{TABLE}"

    with open("data/schemas/athletes.json") as f:
        schema_def = json.load(f)

    bq_schema = [
        bigquery.SchemaField(s["name"], s["type"], mode=s.get("mode", "NULLABLE"))
        for s in schema_def
    ]

    job_config = bigquery.LoadJobConfig(
        schema=bq_schema,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
    )

    job = client.load_table_from_dataframe(df, table_ref, job_config=job_config)
    job.result()
    print(f"Uploaded {job.output_rows} rows to BigQuery: {table_ref}")


def print_stats(df: pd.DataFrame):
    """Print summary statistics for the cleaned dataset."""
    print("\n=== Dataset Summary ===")
    print(f"Total rows: {len(df)}")
    print(f"Unique sports: {df['sport'].nunique()}")
    print(f"Year range: {df['year'].min()} – {df['year'].max()}")
    print(f"Gender split: {df['sex'].value_counts().to_dict()}")
    print(f"\nHeight: mean={df['height_cm'].mean():.1f} cm, std={df['height_cm'].std():.1f}")
    print(f"Weight: mean={df['weight_kg'].mean():.1f} kg, std={df['weight_kg'].std():.1f}")
    print(f"\nEra distribution:")
    for era, count in df["era"].value_counts().sort_index().items():
        print(f"  {era}: {count}")
    print(f"\nTop 10 sports by athlete count:")
    for sport, count in df["sport"].value_counts().head(10).items():
        print(f"  {sport}: {count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Olympic/Paralympic data")
    parser.add_argument("--source", required=True, help="Path to CSV file")
    parser.add_argument("--local", action="store_true", help="Save locally instead of uploading to BigQuery")
    parser.add_argument("--output", default="data/sources/athletes_cleaned.csv", help="Local output path")
    args = parser.parse_args()

    df = load_and_clean(args.source)

    if df.empty:
        print("No data to process.")
    else:
        print_stats(df)
        if args.local:
            save_local(df, args.output)
        else:
            upload_to_bigquery(df)
