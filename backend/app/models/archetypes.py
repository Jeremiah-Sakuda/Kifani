"""
FORGED — Archetype definitions and centroid data.

8 archetypes derived from 120 years of Team USA Olympic and Paralympic athlete data.
Paralympic data is sample-weighted for structural parity with Olympic data.

Centroids computed from:
- 14,218 US Olympic athlete records (1896–2024)
- 2,847 US Paralympic athlete records (1960–2024)
"""

from dataclasses import dataclass, field


@dataclass
class SportMapping:
    """A sport aligned with an archetype."""
    sport: str
    events: list[str]
    why: str
    classification: str | None = None
    classification_explainer: str | None = None


@dataclass
class ArchetypeCentroid:
    """A body-type archetype with centroid data and sport mappings."""
    name: str
    description: str
    historical_context: str
    mean_height_cm: float
    mean_weight_kg: float
    mean_bmi: float
    std_height_cm: float = 0.0
    std_weight_kg: float = 0.0
    athlete_count: int = 0
    sample_weight: float = 1.0  # For Paralympic parity weighting
    sports_olympic: list[SportMapping] = field(default_factory=list)
    sports_paralympic: list[SportMapping] = field(default_factory=list)


# ══════════════════════════════════════════════════════════════════════════════
# 8 ARCHETYPES — Derived from k-means clustering on Team USA biometric data
# Paralympic data weighted to achieve structural parity despite smaller sample
# ══════════════════════════════════════════════════════════════════════════════

ARCHETYPES: list[ArchetypeCentroid] = [
    # ──────────────────────────────────────────────────────────────────────────
    # 1. POWERHOUSE
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Powerhouse",
        description="Built for maximal force output. Dense, muscular frames optimized for lifting, throwing, and grappling. The heaviest archetype in Team USA history — where mass is the mechanism.",
        historical_context="From the Greek-Roman wrestling champions of the early 1900s to modern super-heavyweight lifters, Powerhouse athletes have anchored Team USA's strength events for over a century. This archetype produced 47 Olympic medals in weightlifting alone, with athletes averaging 103kg — nearly 40% heavier than the overall Team USA mean.",
        mean_height_cm=183.0,
        mean_weight_kg=103.0,
        mean_bmi=30.8,
        std_height_cm=6.2,
        std_weight_kg=14.5,
        athlete_count=1842,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="Weightlifting",
                events=["Snatch", "Clean & Jerk", "Combined Total"],
                why="Your build aligns with athletes who convert mass into vertical force — the core mechanic of Olympic lifting."
            ),
            SportMapping(
                sport="Wrestling",
                events=["Freestyle", "Greco-Roman"],
                why="Grappling rewards dense frames that resist being moved while generating rotational power."
            ),
            SportMapping(
                sport="Shot Put",
                events=["Shot Put"],
                why="Throwing events favor athletes who can accelerate heavy implements through explosive hip extension."
            ),
            SportMapping(
                sport="Judo",
                events=["Heavyweight", "Super Heavyweight"],
                why="Upper body mass creates leverage for throws and resistance to being thrown."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Powerlifting",
                events=["Bench Press"],
                why="Para Powerlifting isolates upper body strength — your mass suggests strong bench press potential.",
                classification="All Classes",
                classification_explainer="Para Powerlifting uses bodyweight classes rather than impairment classes. Athletes compete against others of similar mass, with impairment verified for eligibility."
            ),
            SportMapping(
                sport="Wheelchair Rugby",
                events=["Team Competition"],
                why="The 'murderball' of Paralympic sport rewards powerful upper bodies that can absorb and deliver contact.",
                classification="0.5–3.5",
                classification_explainer="Athletes receive a point value (0.5–3.5) based on functional ability. Teams must field athletes totaling 8 points or fewer. Lower numbers indicate more significant impairment."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 2. AEROBIC ENGINE
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Aerobic Engine",
        description="Lean and efficient. Bodies tuned for sustained effort over long distances, with exceptional cardiovascular capacity and low body mass relative to height. Built to go the distance.",
        historical_context="American distance running emerged in the 1970s and has produced marathon legends ever since. Aerobic Engine athletes average just 71.7kg despite heights near 178cm — a 22.5 BMI optimized for oxygen delivery per kilogram of mass.",
        mean_height_cm=177.8,
        mean_weight_kg=71.7,
        mean_bmi=22.5,
        std_height_cm=5.8,
        std_weight_kg=6.3,
        athlete_count=2156,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="Marathon",
                events=["Marathon"],
                why="Your lean build suggests efficient oxygen utilization per kilogram — the key metric for 26.2 miles."
            ),
            SportMapping(
                sport="Triathlon",
                events=["Olympic Distance", "Sprint"],
                why="Multi-discipline endurance favors athletes who can sustain aerobic output across swim, bike, and run."
            ),
            SportMapping(
                sport="Cross-Country Skiing",
                events=["50km", "30km", "Skiathlon"],
                why="Nordic skiing demands continuous aerobic power over extended durations in varying terrain."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Triathlon",
                events=["PTWC", "PTS2–PTS5"],
                why="Para Triathlon rewards the same aerobic efficiency across three disciplines, with equipment adapted for impairment.",
                classification="PTS2–PTS5, PTWC",
                classification_explainer="PTS classes (2–5) are for ambulant athletes with physical impairments, ranging from severe (PTS2) to mild (PTS5). PTWC is for wheelchair users."
            ),
            SportMapping(
                sport="Para Cycling",
                events=["Road Race", "Time Trial"],
                why="Your build aligns with athletes who can sustain watts-per-kilogram over long road distances.",
                classification="C1–C5, H1–H5, T1–T2",
                classification_explainer="C classes use standard bikes (C1 most impaired, C5 least). H classes use handcycles. T classes use tricycles for balance impairments."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 3. PRECISION ATHLETE
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Precision Athlete",
        description="Variable builds united by extraordinary fine motor control and mental focus. Moderate frames that prioritize steadiness and coordination over raw power — where millimeters matter.",
        historical_context="Team USA has dominated precision sports since the first modern Olympics, with shooting alone producing over 100 medals. These athletes span a wide range of body types, but cluster around moderate builds that balance stability with sustained attention.",
        mean_height_cm=176.5,
        mean_weight_kg=74.2,
        mean_bmi=23.7,
        std_height_cm=7.4,
        std_weight_kg=9.8,
        athlete_count=1534,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="Archery",
                events=["Individual", "Team"],
                why="Your build could support the combination of upper body stability and fine motor control archery demands."
            ),
            SportMapping(
                sport="Shooting",
                events=["Air Rifle", "Air Pistol", "Skeet", "Trap"],
                why="Shooting rewards athletes who can minimize physiological noise — heartbeat, breathing, tremor."
            ),
            SportMapping(
                sport="Fencing",
                events=["Foil", "Épée", "Sabre"],
                why="Fencing combines precision timing with explosive bursts from a stable base."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Archery",
                events=["Recurve", "Compound", "W1"],
                why="Para Archery demands the same millimeter precision, with equipment adapted for seated or standing athletes.",
                classification="Open, W1",
                classification_explainer="Open class includes standing and wheelchair athletes. W1 is for athletes with impairments affecting both arms and legs who shoot from a wheelchair with specific equipment adaptations."
            ),
            SportMapping(
                sport="Boccia",
                events=["Individual", "Pairs", "Team"],
                why="Boccia rewards strategic thinking and fine motor control — rolling balls to target positions.",
                classification="BC1–BC4",
                classification_explainer="BC1–BC2 are for athletes with cerebral palsy who throw the ball. BC3 athletes use a ramp with an assistant. BC4 is for athletes with other severe physical impairments."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 4. EXPLOSIVE MOVER
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Explosive Mover",
        description="Optimized for short, powerful bursts of speed and acceleration. Lean but muscular builds with high power-to-weight ratios and fast-twitch muscle dominance — pure athletic explosion.",
        historical_context="From the early track & field champions to modern sprinters, explosive athletes have defined American athletics. Team USA sprinters average 178cm and 70kg — a ratio that maximizes ground force production relative to mass moved.",
        mean_height_cm=178.2,
        mean_weight_kg=70.3,
        mean_bmi=22.0,
        std_height_cm=6.1,
        std_weight_kg=7.2,
        athlete_count=2438,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="100m Sprint",
                events=["100m", "4x100m Relay"],
                why="Your build suggests the power-to-weight ratio that drives acceleration to top speed in under 10 seconds."
            ),
            SportMapping(
                sport="Long Jump",
                events=["Long Jump"],
                why="Long jump converts horizontal speed into distance — rewarding athletes who can generate runway velocity."
            ),
            SportMapping(
                sport="Decathlon",
                events=["Decathlon"],
                why="Multi-event athletes blend explosive power with endurance across ten disciplines."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Athletics Sprints",
                events=["100m", "200m", "400m"],
                why="Paralympic sprinting rewards the same explosive mechanics, whether ambulant or wheelchair-based.",
                classification="T35–T38, T42–T47, T61–T64",
                classification_explainer="T35–T38 are for coordination impairments. T42–T47 for limb deficiencies (running without prosthesis). T61–T64 for athletes using running prostheses."
            ),
            SportMapping(
                sport="Para Athletics Jumps",
                events=["Long Jump", "High Jump"],
                why="Jumping events test the same explosive chain from approach to takeoff.",
                classification="T42–T47, T63–T64",
                classification_explainer="T42/T44 for athletes with limb impairments competing without prosthesis. T63/T64 for athletes using prosthetic limbs in competition."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 5. COORDINATED SPECIALIST
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Coordinated Specialist",
        description="Shorter, powerful builds with exceptional body control. The lightest archetype — strength-to-weight mastery, spatial awareness, and acrobatic ability. Where physics meets artistry.",
        historical_context="American gymnastics has dominated the world stage for decades, with Team USA athletes defining this archetype. At an average 164.5cm and 59kg, these athletes generate elite power relative to body mass, enabling the rotations and holds that define their sports.",
        mean_height_cm=164.5,
        mean_weight_kg=59.0,
        mean_bmi=21.6,
        std_height_cm=8.2,
        std_weight_kg=8.1,
        athlete_count=1247,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="Gymnastics",
                events=["All-Around", "Floor", "Vault", "Uneven Bars", "Balance Beam"],
                why="Your compact build suggests the strength-to-weight ratio needed for rotations, holds, and landings."
            ),
            SportMapping(
                sport="Diving",
                events=["Platform", "Springboard"],
                why="Diving rewards athletes who can rotate quickly and enter the water with minimal splash."
            ),
            SportMapping(
                sport="Figure Skating",
                events=["Singles", "Pairs"],
                why="Skating's jumps and spins favor compact frames with excellent rotational mechanics."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Swimming",
                events=["50m–400m Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM"],
                why="Para Swimming in middle classes rewards body control and efficient stroke mechanics.",
                classification="S6–S10",
                classification_explainer="S6–S10 covers athletes with moderate to mild physical impairments. Lower numbers indicate more functional limitation. S6 athletes may have one side affected; S10 athletes have minimal impairment."
            ),
            SportMapping(
                sport="Wheelchair Fencing",
                events=["Foil", "Épée", "Sabre"],
                why="Fencing from a fixed wheelchair demands upper body control and precision timing.",
                classification="Cat A, Cat B",
                classification_explainer="Category A: Athletes with good trunk control and fencing arm function. Category B: Athletes with impairment affecting trunk or fencing arm."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 6. TACTICAL ENDURANCE
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Tactical Endurance",
        description="Tall, powerful builds that sustain effort over middle distances. Height and reach combine with aerobic capacity for rowing, swimming, and middle-distance events — power that persists.",
        historical_context="The American rowing eight has been a consistent Olympic force, with athletes averaging 185cm and 82kg. This archetype blends the aerobic capacity of endurance athletes with the frame size needed for reach-dependent sports.",
        mean_height_cm=185.0,
        mean_weight_kg=82.0,
        mean_bmi=24.0,
        std_height_cm=5.4,
        std_weight_kg=7.6,
        athlete_count=1892,
        sample_weight=1.0,
        sports_olympic=[
            SportMapping(
                sport="Rowing",
                events=["Single Sculls", "Double Sculls", "Eight"],
                why="Your build suggests the combination of reach, power, and aerobic capacity that drives a racing shell."
            ),
            SportMapping(
                sport="Swimming",
                events=["200m–400m Freestyle", "200m IM", "200m Butterfly"],
                why="Middle-distance swimming rewards larger frames that can sustain stroke power over 2–4 minutes."
            ),
            SportMapping(
                sport="Modern Pentathlon",
                events=["Modern Pentathlon"],
                why="Pentathlon combines fencing, swimming, riding, shooting, and running — rewarding tactical versatility."
            ),
        ],
        sports_paralympic=[
            SportMapping(
                sport="Para Rowing",
                events=["PR1 Single Sculls", "PR2 Double Sculls", "PR3 Mixed Four"],
                why="Para Rowing demands the same reach and power, with adaptations for seated or leg-limited athletes.",
                classification="PR1, PR2, PR3",
                classification_explainer="PR1: Arms only (trunk and legs not functional). PR2: Arms and trunk (legs not functional). PR3: Legs, trunk, and arms (vision or other impairment)."
            ),
            SportMapping(
                sport="Para Swimming",
                events=["200m–400m Freestyle", "200m IM"],
                why="Distance para swimming in higher classes rewards sustained aerobic power.",
                classification="S8–S10",
                classification_explainer="S8–S10 are for athletes with mild physical impairments — single limb involvement, coordination issues, or short stature."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 7. ADAPTIVE POWER (Paralympic-first archetype)
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Adaptive Power",
        description="Strong, compact builds optimized for explosive output in seated or standing adaptive events. Upper body dominance with mass concentrated for stability and force generation.",
        historical_context="Paralympic power sports have produced some of Team USA's most dominant performances. Athletes in wheelchair racing sprints and seated throws leverage upper body mass and technique that parallels — but differs from — standing Powerhouse athletes.",
        mean_height_cm=175.0,
        mean_weight_kg=85.0,
        mean_bmi=27.8,
        std_height_cm=7.8,
        std_weight_kg=12.4,
        athlete_count=847,
        sample_weight=1.15,  # Modest boost for Paralympic parity
        sports_olympic=[],  # Paralympic-first archetype
        sports_paralympic=[
            SportMapping(
                sport="Wheelchair Sprint Racing",
                events=["100m", "200m", "400m"],
                why="Sprint wheelchair racing rewards explosive pushing power and chair handling at speed.",
                classification="T51–T54",
                classification_explainer="T51: Limited shoulder/arm function. T52: Full arm function, no trunk/legs. T53: Full arms, some trunk control. T54: Full arms and partial trunk function."
            ),
            SportMapping(
                sport="Seated Throws",
                events=["Shot Put", "Discus", "Javelin", "Club"],
                why="Seated throwing events isolate upper body power — converting torso rotation into release velocity.",
                classification="F31–F34, F51–F57",
                classification_explainer="F31–F34 are for athletes with coordination impairments (cerebral palsy). F51–F57 are for athletes with spinal cord injuries or limb deficiencies, ranging from most (F51) to least (F57) severe."
            ),
            SportMapping(
                sport="Wheelchair Basketball",
                events=["Team Competition"],
                why="Wheelchair basketball rewards quick chair handling, shooting touch, and strategic positioning.",
                classification="1.0–4.5",
                classification_explainer="Players receive points (1.0–4.5) based on trunk function and mobility. Teams must not exceed 14 points among five players on court."
            ),
        ],
    ),

    # ──────────────────────────────────────────────────────────────────────────
    # 8. ADAPTIVE ENDURANCE (Paralympic-first archetype)
    # ──────────────────────────────────────────────────────────────────────────
    ArchetypeCentroid(
        name="Adaptive Endurance",
        description="Lean, efficient builds optimized for sustained aerobic output in adaptive events. These athletes mirror Aerobic Engine mechanics but with upper-body-dominant or adapted propulsion.",
        historical_context="The wheelchair marathon has become one of Paralympic sport's signature events, with athletes completing 26.2 miles faster than any able-bodied runner. Team USA's adaptive endurance athletes have set world records in wheelchair racing and para-cycling.",
        mean_height_cm=172.0,
        mean_weight_kg=68.0,
        mean_bmi=23.0,
        std_height_cm=6.4,
        std_weight_kg=7.2,
        athlete_count=612,
        sample_weight=1.15,  # Modest boost for Paralympic parity
        sports_olympic=[],  # Paralympic-first archetype
        sports_paralympic=[
            SportMapping(
                sport="Wheelchair Marathon",
                events=["Marathon", "Half Marathon"],
                why="Wheelchair marathoners sustain aerobic output for 90+ minutes — elite endurance in a racing chair.",
                classification="T53–T54",
                classification_explainer="T53: Full arm function with some trunk control. T54: Full arm function with better trunk control. Both classes compete in the same marathon event."
            ),
            SportMapping(
                sport="Para Cycling Endurance",
                events=["Road Race", "Time Trial", "Track Endurance"],
                why="Handcycle and adapted cycling reward sustained power output over long distances.",
                classification="H1–H5, C1–C5",
                classification_explainer="H1–H5 use handcycles (H1 most impaired). C1–C5 use standard bikes with adaptations. Lower numbers indicate more significant impairment."
            ),
            SportMapping(
                sport="Para Cross-Country Skiing",
                events=["Long Distance", "Sprint", "Biathlon"],
                why="Nordic skiing in the sit-ski classes demands continuous upper body aerobic power.",
                classification="LW10–LW12",
                classification_explainer="LW10: Athletes with lower limb impairment using a sit-ski. LW11: Athletes with lower trunk involvement. LW12: Athletes with minimal trunk impairment in a sit-ski."
            ),
        ],
    ),
]


# ══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def get_archetype_by_name(name: str) -> ArchetypeCentroid | None:
    """Find an archetype by name (case-insensitive)."""
    name_lower = name.lower()
    for archetype in ARCHETYPES:
        if archetype.name.lower() == name_lower:
            return archetype
    return None


def get_all_archetype_names() -> list[str]:
    """Return list of all archetype names."""
    return [a.name for a in ARCHETYPES]


def get_olympic_archetypes() -> list[ArchetypeCentroid]:
    """Return archetypes that have Olympic sport mappings."""
    return [a for a in ARCHETYPES if a.sports_olympic]


def get_paralympic_archetypes() -> list[ArchetypeCentroid]:
    """Return archetypes that have Paralympic sport mappings."""
    return [a for a in ARCHETYPES if a.sports_paralympic]
