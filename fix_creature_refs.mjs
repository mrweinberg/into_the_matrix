import fs from 'node:fs';

const filePath = 'MTG INTO THE MATRIX.txt';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let currentCard = null;
let newContent = [];

// Helper to check if a card is legendary
function isLegendary(typeLine) {
    return typeLine && typeLine.includes('Legendary');
}

// Helper to get name from card line "[ID] Name {Cost}"
function parseName(line) {
    const match = line.match(/^\[[A-Z0-9]+\] (.+?) \{/);
    return match ? match[1] : null;
}

// Helper to get short name for Legends (e.g. "Morpheus, Seeker of Potential" -> "Morpheus")
function getShortName(fullName) {
    if (!fullName) return null;
    return fullName.split(',')[0];
}

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check for new card definition
    if (line.match(/^\[[A-Z0-9]+\]/)) {
        currentCard = {
            name: parseName(line),
            isLegendary: false,
            typeLine: null
        };
        newContent.push(line);
        continue;
    }

    // Check for Type Line (usually next line, but could be separated by newline if file is messy, but usually strict)
    if (currentCard && !currentCard.typeLine && (line.includes('Creature —') || line.includes('Creature -'))) { // covering earlier - too
        currentCard.typeLine = line;

        // Determine if legendary
        if (line.trim().startsWith('Legendary')) {
            currentCard.isLegendary = true;
        }

        newContent.push(line);
        continue;
    }

    if (currentCard) {
        if (currentCard.isLegendary) {
            // Logic for Legendary: Use Name (No Title)
            // Replace "this creature" with "Name"
            let shortName = getShortName(currentCard.name);
            if (shortName) {
                // If text uses full name, that's fine (or should we enforce short name? User said "refer to themselves by name (but not title)")
                // User said "by name (but not title)" -> implies "Morpheus" not "Morpheus, Seeker..." (?)
                // Or "Morpheus" vs "this creature".
                // I will replace "this creature" with ShortName.
                // And I should probably check if Full Name is used and replace with Short Name?
                // "Morpheus, Seeker of Potential attacks" -> "Morpheus attacks".

                // Replace "this creature" -> ShortName
                line = line.replace(/\bthis creature\b/gi, shortName);

                // Replace FullName -> ShortName (if valid)
                // Be careful not to replace Card Name in the first line (but we aren't processing that here)
                // Also be careful of cases where full name is needed? Usually Shortname is preferred on second mention, but first mention?
                // "Card Name enters the battlefield..." -> "ShortName enters..."
                // Actually, standard is: First mention = Full Name. Subsequent = Short Name.
                // User request: "refer to themselves by name (but not title)" -> This implies ALWAYS Short Name?
                // "If they're legendary, instead they should refer to themselves by name (but not title)"
                // This usually means "Morpheus" instead of "Morpheus, Seeker of Potential".
                // And "Morpheus" instead of "this creature".

                // I will replace Full Name with Short Name.
                if (currentCard.name.includes(',')) {
                    line = line.split(currentCard.name).join(shortName);
                }
            }
        } else {
            // Logic for Non-Legendary: Use "this creature"
            // Replace Name with "this creature"
            // e.g. "Zion Shocktrooper can't block" -> "This creature can't block"
            // Be careful with "When [Name] enters..." -> "When this creature enters..."

            if (currentCard.name) {
                // Replace literal name with "this creature"
                // Use a regex to replace Global matches of Name
                // Escape regex special chars in name
                const escapedName = currentCard.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'g');

                // However, we should preserve Case at start of sentence?
                // "Zion Shocktrooper can't block" -> "This creature can't block"
                // "Target Zion Shocktrooper" -> "Target this creature" (Wait, target this creature is weird?)
                // Usually "Target [Name]" is self-referential? No, "Target [Name]" is rare.
                // "Equipped [Name]" -> "Equipped creature".

                // Standard templating:
                // "[Name] deals 2 damage" -> "This creature deals 2 damage"
                // "When [Name] enters" -> "When this creature enters"
                // "Put a +1/+1 counter on [Name]" -> "... on this creature"

                line = line.replace(nameRegex, "this creature");

                // Capitalize "This creature" if it starts the line
                if (line.startsWith("this creature")) {
                    line = line.charAt(0).toUpperCase() + line.slice(1);
                }
            }
        }
    }

    newContent.push(line);
}

fs.writeFileSync(filePath, newContent.join('\n'));
console.log("Creature references updated!");
