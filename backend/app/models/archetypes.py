"""
Archetype definitions and centroid data.

Centroids derived from 14,218 US Olympic athlete records (1896–2016).
Paralympic sport mappings based on classification-level biometric ranges.
"""

from dataclasses import dataclass


@dataclass
class ArchetypeCentroid:
    name: str
    description: str
    mean_height_cm: float
    mean_weight_kg: float
    mean_bmi: float
    sports_olympic: list[str]
    sports_paralympic: list[str]


# Centroids computed from actual Team USA athlete biometric data
ARCHETYPES: list[ArchetypeCentroid] = [
    ArchetypeCentroid(
        name="Powerhouse",
        description="Built for maximal force output. Dense, muscular frames optimized for lifting, throwing, and grappling. The heaviest archetype in Team USA history.",
        mean_height_cm=183.0,
        mean_weight_kg=103.0,
        mean_bmi=30.8,
        sports_olympic=["Weightlifting", "Wrestling", "Shot Put", "Judo", "Boxing"],
        sports_paralympic=["Para Powerlifting", "Wheelchair Rugby", "Para Judo"],
    ),
    ArchetypeCentroid(
        name="Aerobic Engine",
        description="Lean and efficient. Bodies tuned for sustained effort over long distances, with exceptional cardiovascular capacity and low body mass relative to height.",
        mean_height_cm=177.8,
        mean_weight_kg=71.7,
        mean_bmi=22.5,
        sports_olympic=["Marathon", "Distance Running", "Road Cycling", "Triathlon", "Cross Country Skiing"],
        sports_paralympic=["Para Athletics (T46 Marathon)", "Para Cycling", "Para Triathlon"],
    ),
    ArchetypeCentroid(
        name="Precision Athlete",
        description="Variable builds united by extraordinary fine motor control and mental focus. Moderate frames that prioritize steadiness and coordination over raw power.",
        mean_height_cm=176.5,
        mean_weight_kg=74.2,
        mean_bmi=23.7,
        sports_olympic=["Archery", "Shooting", "Fencing", "Table Tennis", "Curling"],
        sports_paralympic=["Para Archery", "Para Shooting", "Boccia", "Para Table Tennis"],
    ),
    ArchetypeCentroid(
        name="Explosive Mover",
        description="Optimized for short, powerful bursts of speed and acceleration. Lean but muscular builds with high power-to-weight ratios and fast-twitch muscle dominance.",
        mean_height_cm=178.2,
        mean_weight_kg=70.3,
        mean_bmi=22.0,
        sports_olympic=["100m Sprint", "200m Sprint", "Long Jump", "110m Hurdles", "Decathlon"],
        sports_paralympic=["Para Athletics (T44 100m)", "Para Athletics (T64 Long Jump)"],
    ),
    ArchetypeCentroid(
        name="Towering Reach",
        description="Height and wingspan as competitive advantages. The tallest archetype — long levers, aerial dominance, and reach-dependent technique across court and water sports.",
        mean_height_cm=184.5,
        mean_weight_kg=78.1,
        mean_bmi=22.8,
        sports_olympic=["Basketball", "Volleyball", "Swimming", "Water Polo"],
        sports_paralympic=["Wheelchair Basketball", "Sitting Volleyball", "Para Swimming"],
    ),
    ArchetypeCentroid(
        name="Compact Dynamo",
        description="Shorter, powerful builds with exceptional body control. The lightest archetype — strength-to-weight mastery, spatial awareness, and acrobatic ability.",
        mean_height_cm=164.5,
        mean_weight_kg=59.0,
        mean_bmi=21.6,
        sports_olympic=["Gymnastics", "Diving", "Figure Skating", "Freestyle Skiing"],
        sports_paralympic=["Para Swimming (S6-S8)", "Wheelchair Fencing", "Para Badminton"],
    ),
]
