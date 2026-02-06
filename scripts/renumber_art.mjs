import fs from "node:fs";
import path from "node:path";

// ==========================================
// CONFIGURATION
// ==========================================

const NEW_CARD_FILE = "MTG INTO THE MATRIX.txt"; // The file containing the NEW codes
const OUTPUT_DIR = "public/cards";     // Your images folder

// ==========================================
// 1. HELPER CLASSES & PARSING
// ==========================================

class CardPlaceholder {
    constructor() {
        this.id = "";
        this.name = "";
        this.isBackFace = false;
        this.hasBackFace = false;
    }

    // Identical logic to your generate_matrix.mjs to ensure names match exactly
    getSafeNameComponents() {
        let safeName = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        let idSuffix = "";
        let nameSuffix = "";

        if (this.isBackFace) {
            nameSuffix = "_back";
            idSuffix = "b";
        } else if (this.hasBackFace) {
            nameSuffix = "_front";
            idSuffix = "a";
        }

        return { safeName, nameSuffix, idSuffix };
    }
}

function parseNewBible(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: Could not find '${filePath}'. Please save the renumbered text file first.`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const cards = [];
    let currentCard = null;

    const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;

    lines.forEach(line => {
        let cleanLine = line.replace(/\\/g, '').trim();
        if (!cleanLine) return;

        // Detect Back Face
        if (cleanLine === '//') {
            if (currentCard) {
                currentCard.hasBackFace = true;
                cards.push(currentCard);

                // Create the back face object
                const parentId = currentCard.id;
                currentCard = new CardPlaceholder();
                currentCard.id = parentId;
                currentCard.isBackFace = true;
                return;
            }
        }

        // Detect ID Line
        const idMatch = cleanLine.match(idTagRegex);
        if (idMatch) {
            if (currentCard) cards.push(currentCard);

            currentCard = new CardPlaceholder();
            currentCard.id = idMatch[1];
            currentCard.name = idMatch[2].trim();
            return;
        }

        // Detect Back Face Name (if not caught by ID line)
        if (currentCard && currentCard.isBackFace && !currentCard.name && !cleanLine.startsWith("(") && !cleanLine.startsWith("[")) {
            // Usually the line after // or a color indicator line
            if (!cleanLine.includes("Color Indicator")) {
                currentCard.name = cleanLine.trim();
            }
        }

        // Handle "Name (Color Indicator)" lines common in DFC back faces
        if (currentCard && currentCard.isBackFace && !currentCard.name && cleanLine.includes("Color Indicator")) {
            currentCard.name = cleanLine.replace(/\(Color Indicator: .*?\)/, '').trim();
        }
    });

    if (currentCard) cards.push(currentCard);
    return cards;
}

// ==========================================
// 2. MAIN EXECUTION
// ==========================================

function main() {
    console.log("------------------------------------------");
    console.log("   🔄 MATRIX ART RENUMBERING TOOL");
    console.log("------------------------------------------");

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.error(`❌ Error: Directory '${OUTPUT_DIR}' does not exist.`);
        return;
    }

    // 1. Load the NEW card definitions
    console.log(`   📂 Reading new codes from ${NEW_CARD_FILE}...`);
    const newCards = parseNewBible(NEW_CARD_FILE);
    console.log(`   ✅ Loaded ${newCards.length} card definitions.`);

    // 2. Read existing files
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".png"));
    console.log(`   📂 Found ${existingFiles.length} images in output directory.`);

    let renameCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    // 3. Match and Rename
    newCards.forEach(card => {
        const { safeName, nameSuffix, idSuffix } = card.getSafeNameComponents();

        // The unique part of the filename that shouldn't change is the name part
        // Format: [CODE][ab]_[safeName][suffix].png
        // We look for a file that ENDS WITH: _[safeName][suffix].png

        const expectedEnd = `_${safeName}${nameSuffix}.png`;
        const expectedNewFilename = `${card.id}${idSuffix}${expectedEnd}`;

        // Find a file that matches the name part
        const matchingFile = existingFiles.find(file => file.endsWith(expectedEnd));

        if (matchingFile) {
            if (matchingFile !== expectedNewFilename) {
                // Rename needed!
                const oldPath = path.join(OUTPUT_DIR, matchingFile);
                const newPath = path.join(OUTPUT_DIR, expectedNewFilename);

                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`   ✏️  Renamed: ${matchingFile} -> ${expectedNewFilename}`);
                    renameCount++;
                } catch (err) {
                    console.error(`   ❌ Error renaming ${matchingFile}: ${err.message}`);
                    errorCount++;
                }
            } else {
                // Name is already correct
                // console.log(`   🆗 Checked: ${matchingFile} (Correct)`);
                skipCount++;
            }
        } else {
            // console.warn(`   ⚠️  Missing image for: [${card.id}] ${card.name}`);
        }
    });

    console.log("------------------------------------------");
    console.log(`   🎉 COMPLETE`);
    console.log(`   Renamed: ${renameCount}`);
    console.log(`   Skipped (Already Correct): ${skipCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log("------------------------------------------");
}

main();