---
name: set-review
description: Perform a comprehensive "Nuts and Bolts" set review based on Mark Rosewater's design principles.
---

# Set Review Skill

This skill provides a structured methodology for evaluating a Magic: The Gathering set using the "Nuts and Bolts" framework.

## Methodology

### 1. Set Skeleton Audit
Evaluate the distribution of cards by color, rarity, and type.
- **Target (Modern Play Boosters)**: 81 Commons / 100 Uncommons.
- **Creature Ratio**: Target ~50-60%.
- **Color Parity**: Ensure roughly equal distribution across WUBRG.

### 2. Mana Curve Analysis
Examine the Mana Curve for each color at Common/Uncommon.
- Look for "gluts" (too many cards at one CMC) or "deserts" (missing slots).
- Average CMC should typically be around 3.0 for a standard limited set.

### 3. Mechanical Pillar Identification
Identify 3-5 core mechanics.
- Evaluate mechanical density (ASFAN).
- Assess "Lenticular Design": Are cards simple for beginners but deep for experts?
- check for parasitism vs. broad applicability.

### 4. Draft Archetype Evaluation
Map the 10 dual-color pairs to specific archetypes.
- Identify "Signpost Uncommons".
- Verify that each color pair has clear "Enablers" and "Payoffs".

### 5. Interaction Density (The "Interaction Audit")
Evaluate the "Safety Valve" of the environment.
- **Removal ASFAN**: How many interaction spells per pack? (Target ~2.0-2.5 at Common).
- **Efficiency**: Are there clean answers to the set's major threats (e.g., "EMP" effects for Robots)?

### 6. Evasion Profiles
Digital is the unique pillar, but other keywords must exist to provide balance.
- **Keyword Distribution**: Audit Flying vs. Menace vs. Digital.
- **Blocking Density**: How many "Reach" or "Digital-blocking" effects exist to prevent non-interactive board states?

### 7. Card Flow & Consistency
Ensures games don't end in "top-deck" wars too early.
- **Selection**: Count Scry, Surveil, Looting, and Rummaging.
- **Raw Advantage**: Count cards that provide +1 or more in card parity.

### 8. Splashability & Fixation
Determines if 3+ color decks are viable.
- **Fixers**: Audit common dual lands, mana rocks, and green mana dorks.

### 9. Mechanical Parasitism Score
- **Isolated vs. Integrated**: How many mechanics work without "mechanical support"? (e.g., Energy is high-parasitism; Flash is low-parasitism).

## How to use this skill
1.  Run `scripts/generate_metrics.py` to extract automated data.
2.  Perform a manual "Sample Hand" audit to check for NWO board stalls.
3.  Write a report focusing on:
    - **Victories**: Thematic wins and structural balance.
    - **Growth Opportunities**: Curve corrections and interaction gaps.
    - **Pillar Stability**: Are the 3-5 mechanics supporting the draft archetypes effectively?
