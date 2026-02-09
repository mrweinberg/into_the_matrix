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

### 5. New World Order (NWO) Audit
Check Common-level complexity.
- Limit bookkeeping (tokens, counters).
- Avoid "board state complexity" gluts.

## How to use this skill
1.  Run `scripts/generate_metrics.py` (if available) to extract data from `src/data/setInfo.json`.
2.  Compare the results against the targets listed above.
3.  Write a report focusing on "Victories" (what works) and "Growth Opportunities" (what to fix).
