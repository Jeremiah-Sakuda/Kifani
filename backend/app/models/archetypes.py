"""
Archetype definitions and centroid data.

These initial archetypes are starting points — the Gemini clustering pipeline
will validate and refine them against actual athlete biometric distributions.
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


# Initial archetype definitions (to be refined by clustering pipeline)
ARCHETYPES: list[ArchetypeCentroid] = [
    ArchetypeCentroid(
        name="Powerhouse",
        description="Built for maximal force output. Dense, muscular frames optimized for lifting, throwing, and grappling.",
        mean_height_cm=180.0,
        mean_weight_kg=100.0,
        mean_bmi=30.9,
        sports_olympic=["Weightlifting", "Wrestling", "Shot Put", "Judo"],
        sports_paralympic=["Para Powerlifting", "Wheelchair Rugby", "Para Judo"],
    ),
    ArchetypeCentroid(
        name="Aerobic Engine",
        description="Lean and efficient. Bodies tuned for sustained effort over long distances, with exceptional cardiovascular capacity.",
        mean_height_cm=175.0,
        mean_weight_kg=65.0,
        mean_bmi=21.2,
        sports_olympic=["Marathon", "Distance Running", "Road Cycling", "Triathlon"],
        sports_paralympic=["Para Athletics (T46 Marathon)", "Para Cycling", "Para Triathlon"],
    ),
    ArchetypeCentroid(
        name="Precision Athlete",
        description="Variable builds united by extraordinary fine motor control and mental focus. Steady hands, steady minds.",
        mean_height_cm=172.0,
        mean_weight_kg=72.0,
        mean_bmi=24.3,
        sports_olympic=["Archery", "Shooting", "Fencing", "Table Tennis"],
        sports_paralympic=["Para Archery", "Para Shooting", "Boccia", "Para Table Tennis"],
    ),
    ArchetypeCentroid(
        name="Explosive Mover",
        description="Optimized for short, violent bursts of speed and power. High power-to-weight ratio and fast-twitch dominance.",
        mean_height_cm=178.0,
        mean_weight_kg=77.0,
        mean_bmi=24.3,
        sports_olympic=["100m Sprint", "Long Jump", "110m Hurdles"],
        sports_paralympic=["Para Athletics (T44 100m)", "Para Athletics (T64 Long Jump)"],
    ),
    ArchetypeCentroid(
        name="Towering Reach",
        description="Height and wingspan as competitive advantages. Long levers, aerial dominance, and reach-dependent technique.",
        mean_height_cm=195.0,
        mean_weight_kg=90.0,
        mean_bmi=23.7,
        sports_olympic=["Basketball", "Volleyball", "Swimming", "High Jump"],
        sports_paralympic=["Wheelchair Basketball", "Sitting Volleyball", "Para Swimming"],
    ),
    ArchetypeCentroid(
        name="Compact Dynamo",
        description="Shorter, powerful builds with exceptional body control. Strength-to-weight mastery and spatial awareness.",
        mean_height_cm=162.0,
        mean_weight_kg=58.0,
        mean_bmi=22.1,
        sports_olympic=["Gymnastics", "Diving", "Wrestling (lighter classes)", "Boxing (lighter classes)"],
        sports_paralympic=["Para Swimming (S6-S8)", "Wheelchair Fencing", "Para Badminton"],
    ),
]
