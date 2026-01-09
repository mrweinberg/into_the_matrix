const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const INPUT_FILENAME = 'MTG INTO THE MATRIX.txt';
const OUTPUT_FILENAME = 'MTG_INTO_THE_MATRIX_REORGANIZED.txt';

// --- CONSTANTS ---
const SECTION_ORDER = [
    "WHITE", "BLUE", "BLACK", "RED", "GREEN", 
    "MULTICOLOR", "ARTIFACTS & COLORLESS", "LANDS"
];

const RARITY_MAP = {
    'C': "COMMONS",
    'U': "UNCOMMONS",
    'R': "RARES",
    'M': "MYTHICS"
};

const RARITY_ORDER = ["COMMONS", "UNCOMMONS", "RARES", "MYTHICS"];

// --- PATTERNS ---
// Matches card start: [Letter+Number] Name {Cost} (Cost is optional for lands)
// Group 1: Rarity Code (C, U, R, M)
// Group 2: Name
// Group 3: Mana Cost (Optional)
const CARD_HEADER_REGEX = /^\[([CURM])\d+\]\s+(.*?)(?:\s+(\{.*\})\s*)?$/;

// Matches existing headers to ignore them
const IGNORE_HEADER_REGEX = /^(=+|-+)\s/;

function main() {
    const inputPath = path.join(__dirname, INPUT_FILENAME);
    const outputPath = path.join(__dirname, OUTPUT_FILENAME);

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Error: '${INPUT_FILENAME}' not found.`);
        return;
    }

    console.log(`Reading ${INPUT_FILENAME}...`);
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    // 1. Parse File into a Flat List
    const { introLines, cards } = parseCards(lines);
    console.log(`\nFound ${cards.length} cards.`);

    // 2. Assign Sections & Rarities
    const organizedCards = categorizeCards(cards);

    // 3. Apply Fixes (Magma-Code Brawler)
    const finalCards = applyFixes(organizedCards);

    // 4. Write File
    writeOutput(outputPath, introLines, finalCards);
}

// --- PARSING ---
function parseCards(lines) {
    const cards = [];
    const introLines = [];
    let currentCard = null;
    let isIntro = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check for Card Header
        const match = trimmed.match(CARD_HEADER_REGEX);
        
        if (match) {
            // If we were building a card, save it
            if (currentCard) cards.push(currentCard);
            
            isIntro = false;
            
            // Start New Card
            currentCard = {
                rarityCode: match[1], // 'C', 'U', 'R', 'M'
                name: match[2].trim(),
                cost: match[3] || "", // "{1}{W}" or empty
                lines: [line],
                typeLine: "" // Will grab next line
            };
        } 
        // If it's a section header (===) or rarity header (---), ignore it
        else if (IGNORE_HEADER_REGEX.test(trimmed)) {
            continue; 
        }
        // Content Lines
        else {
            if (isIntro) {
                // Only save non-empty intro lines
                if (trimmed) introLines.push(line);
            } else if (currentCard) {
                currentCard.lines.push(line);
                
                // Try to grab type line (usually the 2nd line of a card)
                if (currentCard.lines.length === 2 && trimmed) {
                    currentCard.typeLine = trimmed;
                }
            }
        }
    }
    // Push last card
    if (currentCard) cards.push(currentCard);

    return { introLines, cards };
}

// --- CATEGORIZATION ---
function categorizeCards(cards) {
    return cards.map(card => {
        // 1. Determine Rarity
        const rarity = RARITY_MAP[card.rarityCode] || "UNKNOWN";

        // 2. Determine Section (Color)
        let section = "UNKNOWN";
        const colors = getColors(card.cost);

        if (colors.length === 0) {
            // No colors? Check if it's a Land or Artifact
            if (card.typeLine.toLowerCase().includes("land")) {
                section = "LANDS";
            } else {
                section = "ARTIFACTS & COLORLESS";
            }
        } else if (colors.length === 1) {
            section = colors[0]; // WHITE, BLUE, etc.
        } else {
            section = "MULTICOLOR";
        }

        return { ...card, section, rarity };
    });
}

// --- FIXES ---
function applyFixes(cards) {
    return cards.map(card => {
        // Fix: Magma-Code Brawler
        if (card.lines[0].includes('[C103]')) {
            console.log(`   🛠  Patching [C103] Magma-Code Brawler`);
            return {
                ...card,
                lines: [
                    "[C103] Magma-Code Brawler {2}{R}",
                    "Creature — Program Warrior (3/1)",
                    "Digital, haste",
                    ""
                ]
            };
        }
        return card;
    });
}

// --- WRITING ---
function writeOutput(outputPath, introLines, cards) {
    const stream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

    // Write Intro
    if (introLines.length > 0) {
        stream.write(introLines.join('\n') + '\n');
    }

    SECTION_ORDER.forEach(section => {
        // Get cards for this section
        const sectionCards = cards.filter(c => c.section === section);
        const count = sectionCards.length;

        stream.write(`\n========== ${section} (${count} Cards) ==========\n\n`);

        RARITY_ORDER.forEach(rarity => {
            const rarityCards = sectionCards.filter(c => c.rarity === rarity);
            if (rarityCards.length === 0) return;

            stream.write(`--- ${rarity} ---\n\n`);

            rarityCards.forEach(card => {
                // Trim trailing empty lines from the card to keep it clean
                while (card.lines.length > 0 && !card.lines[card.lines.length - 1].trim()) {
                    card.lines.pop();
                }
                stream.write(card.lines.join('\n') + '\n\n');
            });
        });
    });

    stream.end(() => {
        console.log(`\n✅ Success! File saved to: ${OUTPUT_FILENAME}`);
        
        // Print Stats
        const stats = {};
        cards.forEach(c => {
            stats[c.section] = (stats[c.section] || 0) + 1;
        });
        console.table(stats);
    });
}

// --- HELPERS ---
function getColors(cost) {
    const c = [];
    if (!cost) return c;
    if (cost.includes('W')) c.push("WHITE");
    if (cost.includes('U')) c.push("BLUE");
    if (cost.includes('B')) c.push("BLACK");
    if (cost.includes('R')) c.push("RED");
    if (cost.includes('G')) c.push("GREEN");
    return c;
}

main();