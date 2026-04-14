"""
Gemini-powered archetype clustering pipeline.

Queries athlete biometric distributions from BigQuery, sends them to Gemini
for analysis, and writes refined archetype centroids back to BigQuery.

Usage:
    python -m data.scripts.cluster
"""

import json
import os

from google.cloud import bigquery, aiplatform
from vertexai.generative_models import GenerativeModel

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
DATASET = "kifani"


def get_sport_biometric_distributions() -> list[dict]:
    """Query aggregated biometric data per sport from BigQuery."""
    client = bigquery.Client(project=PROJECT_ID)

    query = f"""
        SELECT
            sport,
            games_type,
            COUNT(*) as athlete_count,
            AVG(height_cm) as avg_height,
            STDDEV(height_cm) as std_height,
            AVG(weight_kg) as avg_weight,
            STDDEV(weight_kg) as std_weight,
            AVG(weight_kg / POW(height_cm / 100, 2)) as avg_bmi
        FROM `{PROJECT_ID}.{DATASET}.athletes`
        WHERE height_cm IS NOT NULL AND weight_kg IS NOT NULL
        GROUP BY sport, games_type
        HAVING COUNT(*) >= 5
        ORDER BY athlete_count DESC
    """

    results = client.query(query).result()
    return [dict(row) for row in results]


def run_gemini_clustering(distributions: list[dict]) -> list[dict]:
    """Use Gemini to analyze distributions and define/refine archetypes."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    model = GenerativeModel("gemini-2.5-pro")

    prompt = f"""Analyze these Team USA athlete biometric distributions by sport and define 5-7 body-type-driven archetypes.

Data (aggregated by sport, includes both Olympic 'O' and Paralympic 'P' athletes):
{json.dumps(distributions, indent=2, default=str)}

Requirements:
- Archetypes must be based on PHYSICAL BUILD patterns, not sport categories
- Olympic and Paralympic athletes MUST be clustered together (unified clustering)
- Each archetype needs: name, description, mean_height_cm, mean_weight_kg, mean_bmi, list of Olympic sports, list of Paralympic sports
- Use evocative but descriptive names (e.g., "Powerhouse", "Aerobic Engine")
- Explain which biometric features define each cluster

Return valid JSON array of archetype objects:
```json
[
  {{
    "name": "Archetype Name",
    "description": "2-3 sentence description of the physical build pattern.",
    "mean_height_cm": 180.0,
    "mean_weight_kg": 85.0,
    "mean_bmi": 26.2,
    "sports_olympic": ["Sport1", "Sport2"],
    "sports_paralympic": ["Para Sport1", "Para Sport2"]
  }}
]
```"""

    response = model.generate_content(prompt)
    text = response.text

    # Extract JSON from response
    if "```json" in text:
        json_str = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        json_str = text.split("```")[1].split("```")[0].strip()
    else:
        json_str = text.strip()

    return json.loads(json_str)


def write_centroids_to_bigquery(archetypes: list[dict]):
    """Write archetype centroids to BigQuery table."""
    client = bigquery.Client(project=PROJECT_ID)
    table_ref = f"{PROJECT_ID}.{DATASET}.archetype_centroids"

    with open("data/schemas/archetype_centroids.json") as f:
        schema_def = json.load(f)

    bq_schema = [
        bigquery.SchemaField(s["name"], s["type"], mode=s.get("mode", "NULLABLE"))
        for s in schema_def
    ]

    job_config = bigquery.LoadJobConfig(
        schema=bq_schema,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )

    job = client.load_table_from_json(archetypes, table_ref, job_config=job_config)
    job.result()
    print(f"Wrote {len(archetypes)} archetype centroids to BigQuery.")


def main():
    print("Fetching sport biometric distributions...")
    distributions = get_sport_biometric_distributions()
    print(f"Got {len(distributions)} sport distributions.")

    print("Running Gemini clustering analysis...")
    archetypes = run_gemini_clustering(distributions)
    print(f"Gemini defined {len(archetypes)} archetypes.")

    print("Writing centroids to BigQuery...")
    write_centroids_to_bigquery(archetypes)

    print("Done. Archetypes:")
    for a in archetypes:
        print(f"  - {a['name']}: {a['description'][:80]}...")


if __name__ == "__main__":
    main()
