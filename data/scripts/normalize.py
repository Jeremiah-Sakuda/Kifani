"""
Normalize and clean athlete data already in BigQuery.

Handles unit conversions, missing data, and field standardization.

Usage:
    python -m data.scripts.normalize
"""

from google.cloud import bigquery

PROJECT_ID = "your-gcp-project-id"  # TODO: set via env
DATASET = "kifani"


def normalize():
    client = bigquery.Client(project=PROJECT_ID)

    # Fix height values that appear to be in inches (< 100)
    client.query(f"""
        UPDATE `{PROJECT_ID}.{DATASET}.athletes`
        SET height_cm = height_cm * 2.54
        WHERE height_cm < 100 AND height_cm > 0
    """).result()

    # Fix weight values that appear to be in pounds (> 200 and height suggests metric)
    client.query(f"""
        UPDATE `{PROJECT_ID}.{DATASET}.athletes`
        SET weight_kg = weight_kg * 0.453592
        WHERE weight_kg > 200 AND height_cm > 100
    """).result()

    # Backfill era from year
    client.query(f"""
        UPDATE `{PROJECT_ID}.{DATASET}.athletes`
        SET era = CASE
            WHEN year < 1950 THEN 'pre-1950'
            WHEN year <= 1980 THEN '1950-1980'
            WHEN year <= 2000 THEN '1980-2000'
            ELSE '2000+'
        END
        WHERE era IS NULL AND year IS NOT NULL
    """).result()

    # Remove outliers (likely data errors)
    client.query(f"""
        DELETE FROM `{PROJECT_ID}.{DATASET}.athletes`
        WHERE height_cm < 100 OR height_cm > 230
           OR weight_kg < 30 OR weight_kg > 200
    """).result()

    print("Normalization complete.")


if __name__ == "__main__":
    normalize()
