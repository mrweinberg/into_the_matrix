import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = 'MTG INTO THE MATRIX.txt';

// Read the file
const filePath = path.join(__dirname, INPUT_FILE);
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split(/\r?\n/);

// Track all IDs and detect duplicates
const idMap = new Map(); // id -> [{ lineNum, line }]
const cardIdRegex = /^\[([CURM]\d+[ab]?)\]/;

lines.forEach((line, idx) => {
    const match = line.match(cardIdRegex);
    if (match) {
        const id = match[1];
        if (!idMap.has(id)) {
            idMap.set(id, []);
        }
        idMap.get(id).push({ lineNum: idx, line });
    }
});

// Find duplicates
const duplicates = [];
idMap.forEach((occurrences, id) => {
    if (occurrences.length > 1) {
        duplicates.push({ id, occurrences });
    }
});

if (duplicates.length === 0) {
    console.log('✅ No duplicate IDs found!');
    process.exit(0);
}

console.log(`Found ${duplicates.length} duplicate ID groups:\n`);
duplicates.forEach(({ id, occurrences }) => {
    console.log(`[${id}] appears ${occurrences.length} times:`);
    occurrences.forEach(({ lineNum, line }) => {
        // Extract card name from line
        const nameMatch = line.match(/^\[[^\]]+\]\s+(.+?)\s+\{/);
        const name = nameMatch ? nameMatch[1] : line.substring(0, 60);
        console.log(`   Line ${lineNum + 1}: ${name}`);
    });
    console.log();
});

// Create renumbering plan
// Strategy: Keep first occurrence, renumber subsequent ones with suffix
const renumberPlan = [];
const usedIds = new Set([...idMap.keys()]);

// Find the max number for each prefix (C, U, R, M)
const maxByPrefix = { C: 0, U: 0, R: 0, M: 0 };
idMap.forEach((_, id) => {
    const prefix = id[0];
    const numMatch = id.match(/(\d+)/);
    if (numMatch) {
        const num = parseInt(numMatch[1]);
        maxByPrefix[prefix] = Math.max(maxByPrefix[prefix], num);
    }
});

console.log('Current max IDs:', maxByPrefix);
console.log('\n--- RENUMBERING PLAN ---\n');

duplicates.forEach(({ id, occurrences }) => {
    const prefix = id[0];
    // Keep first occurrence as-is, renumber the rest
    for (let i = 1; i < occurrences.length; i++) {
        maxByPrefix[prefix]++;
        const newId = `${prefix}${maxByPrefix[prefix].toString().padStart(2, '0')}`;

        // Handle back faces (e.g., R003b -> R170b)
        const oldIdFull = occurrences[i].line.match(/^\[([^\]]+)\]/)[1];
        const suffix = oldIdFull.endsWith('a') ? 'a' : (oldIdFull.endsWith('b') ? 'b' : '');
        const finalNewId = newId + suffix;

        renumberPlan.push({
            lineNum: occurrences[i].lineNum,
            oldId: oldIdFull,
            newId: finalNewId,
            line: occurrences[i].line
        });

        usedIds.add(finalNewId);

        const nameMatch = occurrences[i].line.match(/^\[[^\]]+\]\s+(.+?)\s+\{/);
        const name = nameMatch ? nameMatch[1] : '(unknown)';
        console.log(`[${oldIdFull}] -> [${finalNewId}] : ${name}`);
    }
});

// Apply changes
console.log('\n--- APPLYING CHANGES ---\n');

renumberPlan.forEach(({ lineNum, oldId, newId }) => {
    lines[lineNum] = lines[lineNum].replace(`[${oldId}]`, `[${newId}]`);
});

// Write back
fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

console.log(`✅ Updated ${renumberPlan.length} card IDs in ${INPUT_FILE}`);
console.log('\nNew max IDs:', maxByPrefix);
console.log('\nRun `npm run generate-data` to regenerate the JSON.');
