-- ============================================================================
-- BQML K-Means Archetype Clustering
-- Kifani (FORGED) - Team USA x Google Cloud Hackathon 2026
-- ============================================================================
-- This replaces expert-defined centroids with data-driven ML clustering.
-- Run these queries in BigQuery Console or via bq command line.
-- ============================================================================

-- Step 1: Create training dataset with engineered features
-- ============================================================================
CREATE OR REPLACE TABLE `kifani-hackathon.forged_dataset.athlete_features` AS
SELECT
  athlete_id,
  height_cm,
  weight_kg,
  -- Derived: BMI
  ROUND(weight_kg / POW(height_cm / 100, 2), 2) AS bmi,

  -- Categorical: Sport family (one-hot encoded as numeric)
  CASE
    WHEN sport IN ('Weightlifting', 'Wrestling', 'Judo', 'Boxing', 'Powerlifting') THEN 1
    WHEN sport IN ('Athletics', 'Cycling', 'Swimming', 'Triathlon', 'Rowing', 'Canoeing') THEN 2
    WHEN sport IN ('Shooting', 'Archery', 'Fencing', 'Equestrian') THEN 3
    WHEN sport IN ('Gymnastics', 'Diving', 'Figure Skating', 'Synchronized Swimming') THEN 4
    WHEN sport IN ('Basketball', 'Volleyball', 'Handball', 'Water Polo') THEN 5
    ELSE 6  -- Other/mixed
  END AS sport_family,

  -- Categorical: Era bucket
  CASE
    WHEN year < 1960 THEN 1  -- Pioneer Era
    WHEN year < 1990 THEN 2  -- Golden Era
    WHEN year < 2010 THEN 3  -- Modern Era
    ELSE 4                   -- Current Era
  END AS era_bucket,

  -- Binary: Paralympic indicator (for weighting)
  IF(games_type = 'Paralympic', 1.0, 0.0) AS is_paralympic,

  -- Binary: Medal indicator (performance signal)
  IF(medal IS NOT NULL, 1.0, 0.0) AS has_medal,

  -- Original metadata (not used in clustering, for join back)
  sport,
  event,
  games_type,
  year

FROM `kifani-hackathon.forged_dataset.athletes`
WHERE height_cm IS NOT NULL
  AND weight_kg IS NOT NULL
  AND height_cm BETWEEN 140 AND 220  -- Filter outliers
  AND weight_kg BETWEEN 35 AND 180   -- Filter outliers
  AND noc = 'USA';  -- COMPLIANCE: Team USA only


-- Step 2: Train K-Means model
-- ============================================================================
-- Uses 8 clusters to match existing archetype count
-- Standardizes features automatically
-- Euclidean distance for interpretability

CREATE OR REPLACE MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`
OPTIONS (
  model_type = 'KMEANS',
  num_clusters = 8,
  distance_type = 'EUCLIDEAN',
  standardize_features = TRUE,
  kmeans_init_method = 'KMEANS++',  -- Better initialization
  max_iterations = 100,
  early_stop = TRUE,
  min_rel_progress = 0.001
) AS
SELECT
  height_cm,
  weight_kg,
  bmi,
  sport_family,
  era_bucket,
  -- Weight Paralympic data higher to ensure representation
  is_paralympic * 1.5 AS paralympic_weight
FROM `kifani-hackathon.forged_dataset.athlete_features`;


-- Step 3: Evaluate model quality
-- ============================================================================
-- Check Davies-Bouldin Index (lower is better, <2 is good)
-- Check silhouette score (higher is better, >0.3 is decent)

SELECT *
FROM ML.EVALUATE(MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`);


-- Step 4: Extract cluster centroids
-- ============================================================================
-- These replace the hard-coded centroids in archetypes.py

SELECT
  centroid_id,
  feature,
  numerical_value,
  category
FROM ML.CENTROIDS(MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`)
ORDER BY centroid_id, feature;


-- Step 5: Analyze cluster composition
-- ============================================================================
-- Understand what each cluster represents (for naming/mapping)

WITH predictions AS (
  SELECT
    *,
    (SELECT centroid_id FROM UNNEST(ML.PREDICT(MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`,
      (SELECT height_cm, weight_kg, bmi, sport_family, era_bucket, is_paralympic * 1.5 AS paralympic_weight
       FROM `kifani-hackathon.forged_dataset.athlete_features` AS f
       WHERE f.athlete_id = af.athlete_id)).nearest_centroids_distance) LIMIT 1) AS cluster_id
  FROM `kifani-hackathon.forged_dataset.athlete_features` AS af
)
SELECT
  cluster_id,
  COUNT(*) AS athlete_count,
  ROUND(AVG(height_cm), 1) AS avg_height_cm,
  ROUND(AVG(weight_kg), 1) AS avg_weight_kg,
  ROUND(AVG(bmi), 1) AS avg_bmi,
  ROUND(AVG(is_paralympic) * 100, 1) AS paralympic_pct,
  ARRAY_AGG(DISTINCT sport LIMIT 5) AS top_sports,
  ROUND(AVG(has_medal) * 100, 1) AS medal_rate_pct
FROM predictions
GROUP BY cluster_id
ORDER BY cluster_id;


-- Step 6: Create prediction function for API
-- ============================================================================
-- Use this query pattern in your Python service

-- Example: Predict archetype for a new user
SELECT
  centroid_id AS predicted_archetype,
  distance AS cluster_distance
FROM ML.PREDICT(
  MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`,
  (SELECT
    180.0 AS height_cm,
    75.0 AS weight_kg,
    23.1 AS bmi,          -- 75 / (1.80^2)
    2 AS sport_family,    -- Endurance preference
    4 AS era_bucket,      -- Current era
    0.0 AS paralympic_weight
  )
).nearest_centroids_distance
ORDER BY distance
LIMIT 3;


-- Step 7: Create stored procedure for API calls
-- ============================================================================
-- Callable from Python via BigQuery client

CREATE OR REPLACE PROCEDURE `kifani-hackathon.forged_dataset.predict_archetype`(
  IN user_height FLOAT64,
  IN user_weight FLOAT64,
  IN user_sport_preference INT64,
  OUT primary_centroid INT64,
  OUT primary_distance FLOAT64,
  OUT secondary_centroid INT64,
  OUT secondary_distance FLOAT64
)
BEGIN
  DECLARE bmi FLOAT64;
  SET bmi = user_weight / POW(user_height / 100, 2);

  -- Get top 2 predictions
  CREATE TEMP TABLE predictions AS
  SELECT
    centroid_id,
    distance
  FROM ML.PREDICT(
    MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`,
    (SELECT
      user_height AS height_cm,
      user_weight AS weight_kg,
      bmi AS bmi,
      user_sport_preference AS sport_family,
      4 AS era_bucket,
      0.0 AS paralympic_weight
    )
  ).nearest_centroids_distance
  ORDER BY distance
  LIMIT 2;

  -- Extract primary
  SET (primary_centroid, primary_distance) = (
    SELECT AS STRUCT centroid_id, distance
    FROM predictions
    ORDER BY distance
    LIMIT 1
  );

  -- Extract secondary
  SET (secondary_centroid, secondary_distance) = (
    SELECT AS STRUCT centroid_id, distance
    FROM predictions
    ORDER BY distance
    LIMIT 1 OFFSET 1
  );
END;


-- Step 8: Create cluster-to-archetype mapping table
-- ============================================================================
-- After analyzing cluster composition, manually map to archetype names

CREATE OR REPLACE TABLE `kifani-hackathon.forged_dataset.cluster_archetype_mapping` AS
SELECT * FROM UNNEST([
  STRUCT(0 AS centroid_id, 'Powerhouse' AS archetype_name,
         'Built for maximal force output. Weightlifting, wrestling, throwing.' AS description),
  STRUCT(1, 'Aerobic Engine',
         'Optimized for sustained cardiovascular performance. Distance running, cycling, swimming.'),
  STRUCT(2, 'Precision Athlete',
         'Fine motor control and spatial awareness. Shooting, archery, fencing.'),
  STRUCT(3, 'Explosive Mover',
         'Maximum power in minimal time. Sprinting, jumping, short-distance swimming.'),
  STRUCT(4, 'Coordinated Specialist',
         'Body control and spatial awareness. Gymnastics, diving, figure skating.'),
  STRUCT(5, 'Tactical Endurance',
         'Combines endurance with strategic decision-making. Rowing, water polo, modern pentathlon.'),
  STRUCT(6, 'Adaptive Power',
         'Paralympic-first archetype for strength-based adaptive sports. Wheelchair rugby, powerlifting.'),
  STRUCT(7, 'Adaptive Endurance',
         'Paralympic-first archetype for endurance-based adaptive sports. Wheelchair racing, para-cycling.')
]);

-- Note: After running Step 5 (cluster composition analysis), you may need to
-- reorder this mapping based on actual cluster characteristics. The centroid_id
-- assignments from K-Means are arbitrary - match them by looking at avg_height,
-- avg_weight, and top_sports for each cluster.


-- Step 9: Silhouette score analysis (model quality)
-- ============================================================================

SELECT
  centroid_id,
  COUNT(*) as cluster_size,
  AVG(distance) as avg_intra_cluster_distance
FROM ML.PREDICT(
  MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`,
  TABLE `kifani-hackathon.forged_dataset.athlete_features`
), UNNEST(nearest_centroids_distance) WITH OFFSET AS pos
WHERE pos = 0
GROUP BY centroid_id
ORDER BY centroid_id;


-- ============================================================================
-- USAGE FROM PYTHON
-- ============================================================================
--
-- from google.cloud import bigquery
--
-- client = bigquery.Client()
--
-- def predict_archetype(height_cm: float, weight_kg: float, sport_family: int = 6):
--     query = """
--     SELECT centroid_id, distance
--     FROM ML.PREDICT(
--       MODEL `kifani-hackathon.forged_dataset.archetype_kmeans_v2`,
--       (SELECT @height AS height_cm, @weight AS weight_kg,
--        @bmi AS bmi, @sport AS sport_family, 4 AS era_bucket, 0.0 AS paralympic_weight)
--     ).nearest_centroids_distance
--     ORDER BY distance LIMIT 3
--     """
--
--     job_config = bigquery.QueryJobConfig(
--         query_parameters=[
--             bigquery.ScalarQueryParameter("height", "FLOAT64", height_cm),
--             bigquery.ScalarQueryParameter("weight", "FLOAT64", weight_kg),
--             bigquery.ScalarQueryParameter("bmi", "FLOAT64", weight_kg / ((height_cm/100)**2)),
--             bigquery.ScalarQueryParameter("sport", "INT64", sport_family),
--         ]
--     )
--
--     results = client.query(query, job_config=job_config).result()
--     return [{"centroid_id": r.centroid_id, "distance": r.distance} for r in results]
-- ============================================================================
