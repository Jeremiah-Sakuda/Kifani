"""
BigQuery service for querying athlete data.
"""

import os
from google.cloud import bigquery

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
DATASET = os.getenv("BQ_DATASET", "kifani")


def _get_client() -> bigquery.Client:
    return bigquery.Client(project=PROJECT_ID)


async def query_athletes_by_sport(
    sport: str,
    era: str | None = None,
    games_type: str | None = None,
) -> dict:
    """Query athlete biometric data by sport, era, and games type."""
    client = _get_client()

    query = f"""
        SELECT sport, event, games_type, year,
               AVG(height_cm) as avg_height,
               AVG(weight_kg) as avg_weight,
               COUNT(*) as athlete_count
        FROM `{PROJECT_ID}.{DATASET}.athletes`
        WHERE LOWER(sport) LIKE LOWER(@sport)
    """
    params = [bigquery.ScalarQueryParameter("sport", "STRING", f"%{sport}%")]

    if era:
        era_ranges = {
            "pre-1950": ("1896", "1949"),
            "1950-1980": ("1950", "1980"),
            "1980-2000": ("1981", "2000"),
            "2000+": ("2001", "2030"),
        }
        if era in era_ranges:
            start, end = era_ranges[era]
            query += " AND year BETWEEN @start_year AND @end_year"
            params.extend([
                bigquery.ScalarQueryParameter("start_year", "STRING", start),
                bigquery.ScalarQueryParameter("end_year", "STRING", end),
            ])

    if games_type:
        query += " AND games_type = @games_type"
        params.append(bigquery.ScalarQueryParameter("games_type", "STRING", games_type))

    query += " GROUP BY sport, event, games_type, year ORDER BY year"

    job_config = bigquery.QueryJobConfig(query_parameters=params)
    results = client.query(query, job_config=job_config).result()

    rows = [dict(row) for row in results]
    return {"athletes": rows, "count": len(rows)}


async def get_archetype_stats(archetype_name: str) -> dict:
    """Get statistical profile for an archetype from BigQuery."""
    client = _get_client()

    query = f"""
        SELECT *
        FROM `{PROJECT_ID}.{DATASET}.archetype_centroids`
        WHERE name = @name
    """
    params = [bigquery.ScalarQueryParameter("name", "STRING", archetype_name)]
    job_config = bigquery.QueryJobConfig(query_parameters=params)
    results = client.query(query, job_config=job_config).result()

    rows = [dict(row) for row in results]
    return rows[0] if rows else {"error": "Archetype not found"}


async def get_classification_info(classification_code: str) -> dict:
    """Get Paralympic classification details."""
    client = _get_client()

    query = f"""
        SELECT *
        FROM `{PROJECT_ID}.{DATASET}.paralympic_classifications`
        WHERE code = @code
    """
    params = [bigquery.ScalarQueryParameter("code", "STRING", classification_code)]
    job_config = bigquery.QueryJobConfig(query_parameters=params)
    results = client.query(query, job_config=job_config).result()

    rows = [dict(row) for row in results]
    return rows[0] if rows else {"error": "Classification not found"}
