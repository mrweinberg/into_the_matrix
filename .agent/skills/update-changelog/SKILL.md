---
name: update-changelog
description: Analyze recent set bible changes and update the in-app card changelog with properly dated entries.
---

# Update Changelog Skill

Updates `public/card_changelog.md` with all card changes from the set bible (`MTG INTO THE MATRIX.txt`) that occurred since the last recorded changelog entry.

## Process

### 1. Determine the last recorded date
Read the top of `public/card_changelog.md` and extract the date of the most recent entry.

### 2. Find unrecorded commits
Run:
```bash
git log --format="%H %ai %s" --since="<last_recorded_date>" -- "MTG INTO THE MATRIX.txt"
```
If no commits are found, report that the changelog is already up to date and stop.

### 3. Analyze diffs per date
Group commits by date. For each date, run:
```bash
git diff <first_commit_of_day>^..<last_commit_of_day> -- "MTG INTO THE MATRIX.txt"
```
This produces one consolidated diff per day, showing the net change regardless of how many intermediate commits occurred.

### 4. Categorize changes
For each day's diff, classify every change into one of these sections:

- **Card Redesigns** — Cards whose identity fundamentally changed (new abilities, new card type, renamed, completely reworked)
- **Cards Removed** — Cards deleted from the set
- **Card Slot Swaps** — Cards that traded slot numbers
- **Mana Cost / Stats Changes** — Changes to mana cost, power/toughness, or rarity
- **Ability & Text Changes** — Wording changes, trigger adjustments, keyword additions/removals
- **Mechanic Changes** — Changes to set-wide mechanics or token definitions

Omit any section that has no entries for that day. Only include sections that are relevant.

### 5. Write changelog entries
For each date (newest first), prepend an entry to `public/card_changelog.md` in this format:

```markdown
## <Month> <Day>, <Year> — <Short Theme Description>

**Theme:** <One sentence describing the overall thrust of changes.>

### <Section Name>
- **[<ID>] <Card Name>**: <Description of change.>

---
```

### 6. Formatting rules
- Use the card's ID in brackets: `[C001]`, `[U024]`, `[R067]`, etc.
- Bold the card name after the ID.
- For cost changes use mana symbol notation: `{1}{W}`, `{E}{E}`, etc.
- For stat changes use the format: `(P/T) → (P/T)`.
- If a card changed multiple times across commits on the same day, report only the net change (initial state → final state).
- Group all changes for a single date under one heading, not per-commit.
- Each date gets its own `## ` heading, separated by `---`.
- Ignore changes that are purely formatting (e.g., italic marker `*( )` vs `( )` on reminder text) — only log functional card changes.
