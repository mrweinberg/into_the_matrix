import fs from 'node:fs';

const filePath = 'MTG INTO THE MATRIX.txt';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Type Line Hyphens ( - -> — )
// Matches "Creature - Type" or "Legendary Creature - Type"
// We look for types followed by " - " and replace with " — "
const typeRegex = /^((?:Legendary |Basic )?(?:Creature|Enchantment|Artifact|Land|Instant|Sorcery)(?: \/\/ (?:Creature|Enchantment|Artifact|Land|Instant|Sorcery))?) - /gm;
let fixed = content.replace(typeRegex, "$1 — ");

// Fix cases where it didn't catch specific combos or second half of DFC
fixed = fixed.replace(/( \/\/ (?:Legendary )?(?:Creature|Enchantment|Artifact|Land)) - /g, "$1 — ");

// 2. Fix "damage to target creature or player" -> "damage to any target"
// (Be careful only to change if it explicitly says creature OR player)
fixed = fixed.replace(/deals (\d+) damage to target creature or player/gi, "deals $1 damage to any target");

// 3. Fix "enters the battlefield" -> "enters" (Modern)
fixed = fixed.replace(/enters the battlefield/g, "enters");

// 4. Fix "shuffle his or her library" -> "shuffle" (or "shuffle their library")
// Modern phrasing for "Search your library... then shuffle your library" is "Search your library... then shuffle."
fixed = fixed.replace(/shuffle your library/g, "shuffle"); // simplistic, check context
// Wait, "shuffle your library" is sometimes valid if it's the only action, but usually "shuffle."
// Example: "Search ..., reveal it, put it into your hand, then shuffle."
// If I blindly replace "shuffle your library" with "shuffle", "shuffle your library" at end of sentence becomes "shuffle." -> correct.

// 5. Fix "his or her" -> "their"
fixed = fixed.replace(/his or her/g, "their");
fixed = fixed.replace(/he or she/g, "they");

fs.writeFileSync(filePath, fixed);
console.log("Syntax fixed!");
