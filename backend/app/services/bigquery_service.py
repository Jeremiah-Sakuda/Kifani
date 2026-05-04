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


async def get_total_athlete_count() -> dict:
    """Get total athlete counts broken down by games type."""
    client = _get_client()

    query = f"""
        SELECT
            games_type,
            COUNT(*) as count,
            MIN(year) as earliest_year,
            MAX(year) as latest_year
        FROM `{PROJECT_ID}.{DATASET}.athletes`
        GROUP BY games_type
    """
    try:
        results = client.query(query).result()
        rows = {row["games_type"]: dict(row) for row in results}

        olympic_count = rows.get("O", {}).get("count", 0)
        paralympic_count = rows.get("P", {}).get("count", 0)

        return {
            "total": olympic_count + paralympic_count,
            "olympic": olympic_count,
            "paralympic": paralympic_count,
            "earliest_year": min(
                rows.get("O", {}).get("earliest_year", 9999),
                rows.get("P", {}).get("earliest_year", 9999)
            ),
            "latest_year": max(
                rows.get("O", {}).get("latest_year", 0),
                rows.get("P", {}).get("latest_year", 0)
            ),
            "source": "bigquery",
        }
    except Exception:
        # Return fallback data if BigQuery unavailable
        return {
            "total": 16065,
            "olympic": 14218,
            "paralympic": 2847,
            "earliest_year": 1896,
            "latest_year": 2024,
            "source": "fallback",
        }


async def get_archetype_distribution() -> dict:
    """Get athlete distribution across archetypes from BigQuery."""
    client = _get_client()

    query = f"""
        SELECT
            name,
            athlete_count,
            mean_height_cm,
            mean_weight_kg,
            mean_bmi,
            sample_weight
        FROM `{PROJECT_ID}.{DATASET}.archetype_centroids`
        ORDER BY athlete_count DESC
    """
    try:
        results = client.query(query).result()
        archetypes = [dict(row) for row in results]
        total = sum(a.get("athlete_count", 0) for a in archetypes)

        return {
            "archetypes": archetypes,
            "total_athletes": total,
            "source": "bigquery",
        }
    except Exception:
        # Return fallback data if BigQuery unavailable
        return {
            "archetypes": [],
            "total_athletes": 16065,
            "source": "fallback",
        }
