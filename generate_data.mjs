import fs from "node:fs";
import path from "node:path";

// ==========================================
// 1. CONFIGURATION
// ==========================================

const INPUT_FILE = "MTG INTO THE MATRIX.txt";

// ==========================================
// 2. DATA PARSING
// ==========================================

class Card {
    constructor() {
        this.id = "";
        this.name = "";
        this.cost = "";
        this.type = "";
        this.displayType = "";
        this.text = [];
        this.flavor = "";
        this.rarity = "Common";
        this.isBackFace = false;
        this.hasBackFace = false;
        this.pt = "";
        this.colorIndicator = null;
    }

    getFileName() {
        let safeName = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        let safeId = this.id;

        if (this.isBackFace) {
            safeName += "_back";
            safeId += "b";
        } else if (this.hasBackFace) {
            safeName += "_front";
            safeId += "a";
        }

        return this.id ? `${safeId}_${safeName}.png` : `${safeName}.png`;
    }

    extractStats() {
        if (!this.type) return;
        const ptRegex = /\(([^)]+)\)$/;
        const match = this.type.match(ptRegex);
        if (match) {
            this.pt = match[1];
            this.displayType = this.type.replace(ptRegex, '').trim();
        } else {
            this.displayType = this.type;
        }
    }

    detectFlavor() {
        if (this.text.length === 0) return;
        const lastLine = this.text[this.text.length - 1];

        if (lastLine.startsWith('"') || lastLine.startsWith('“')) {
            this.flavor = lastLine;
            this.text.pop();
            return;
        }

        const narrativeStarters = ["The ", "A ", "An ", "It ", "They ", "We ", "He ", "She ", "Knowledge ", "Peace ", "War ", "Ignorance "];
        const mechanicalTerms = ["target", "damage", "counter", "token", "battlefield", "graveyard", "exile", "library", "hand", "mana", "cost", "life", "draw", "discard", "sacrifice"];

        const startsWithNarrative = narrativeStarters.some(s => lastLine.startsWith(s));
        const hasMechanics = mechanicalTerms.some(t => lastLine.toLowerCase().includes(t));

        if (startsWithNarrative && !hasMechanics) {
            this.flavor = lastLine;
            this.text.pop();
        }
    }

    deriveRarity() {
        if (this.type.toLowerCase().includes("land")) {
            this.rarity = "Land";
        } else if (this.id.startsWith("M")) {
            this.rarity = "Mythic";
        } else if (this.id.startsWith("R")) {
            this.rarity = "Rare";
        } else if (this.id.startsWith("U")) {
            this.rarity = "Uncommon";
        } else {
            this.rarity = "Common";
        }
    }
}

function parseDesignBible(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const setInfo = {
        title: "Unknown Set",
        cardCount: "0",
        mechanics: [],
        designNotes: []
    };

    const cards = [];
    let currentCard = null;
    let parsingMode = "header";
    let currentMechanic = null;

    const sourceTagRegex = /\\/gi;
    const citationRegex = /\\/gi;
    const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;
    const sectionHeaderRegex = /^[A-Z\s&]+\(\d+\s+Cards\)$/;
    const noteRegex = /^\(Includes\s+.*\)$/;
    const mechanicKeywords = ["Digital", "Jack-in", "Eject", "Override", "Energy", "Gun Token"];

    const parseIndicator = (line) => {
        const match = line.match(/\(Color Indicator: (.*?)\)/i);
        if (!match) return null;
        const colors = match[1].toLowerCase();
        let code = "";
        if (colors.includes("white") || colors.includes("w")) code += "w";
        if (colors.includes("blue") || colors.includes("u")) code += "u";
        if (colors.includes("black") || colors.includes("b")) code += "b";
        if (colors.includes("red") || colors.includes("r")) code += "r";
        if (colors.includes("green") || colors.includes("g")) code += "g";
        return code;
    };

    lines.forEach(line => {
        let cleanLine = line.replace(sourceTagRegex, '').replace(citationRegex, '').trim();
        if (!cleanLine) return;

        if (cleanLine.includes("1. Mechanics & Glossary")) {
            parsingMode = "mechanics";
            return;
        }
        if (cleanLine.includes("2. Card Gallery")) {
            parsingMode = "cards";
            if (currentMechanic) setInfo.mechanics.push(currentMechanic);
            return;
        }
        if (cleanLine.toLowerCase().includes("0. design notes") || cleanLine.toLowerCase().includes("draft archetypes")) {
            parsingMode = "notes";
            setInfo.designNotes.push(`## ${cleanLine}`);
            return;
        }

        if (parsingMode === "header") {
            if (cleanLine.includes("Set Design Document")) {
                setInfo.title = cleanLine.split("-")[0].trim();
            }
            if (cleanLine.startsWith("Total Card Count:")) {
                setInfo.cardCount = cleanLine.split(":")[1].trim();
            }
        }
        else if (parsingMode === "notes") {
            if (/^[A-Z]{2,}:/.test(cleanLine)) {
                setInfo.designNotes.push(`**${cleanLine}**`);
            } else {
                setInfo.designNotes.push(cleanLine);
            }
        }
        else if (parsingMode === "mechanics") {
            // CHANGED: Smarter detection to avoid duplicates
            const matchedKeyword = mechanicKeywords.find(k => cleanLine.startsWith(k));

            if (matchedKeyword) {
                // If we are already inside this mechanic, treat this line as text/explanation
                if (currentMechanic && currentMechanic.name.startsWith(matchedKeyword)) {
                    if (cleanLine.startsWith("Design Note:")) {
                        currentMechanic.notes.push(cleanLine.replace("Design Note:", "").trim());
                    } else {
                        currentMechanic.text.push(cleanLine);
                    }
                } else {
                    // It's a new mechanic
                    if (currentMechanic) setInfo.mechanics.push(currentMechanic);
                    currentMechanic = { name: cleanLine, text: [], notes: [] };
                }
            } else if (currentMechanic) {
                // No keyword match, just text
                if (cleanLine.startsWith("Design Note:")) {
                    currentMechanic.notes.push(cleanLine.replace("Design Note:", "").trim());
                } else {
                    currentMechanic.text.push(cleanLine);
                }
            }
        }
        else if (parsingMode === "cards") {
            if (cleanLine.startsWith("=") || cleanLine.startsWith("---") || sectionHeaderRegex.test(cleanLine) || noteRegex.test(cleanLine)) return;

            if (cleanLine === '//') {
                if (currentCard) {
                    currentCard.extractStats();
                    currentCard.detectFlavor();
                    currentCard.deriveRarity();
                    currentCard.hasBackFace = true;
                    cards.push(currentCard);

                    const oldId = currentCard.id;
                    currentCard = new Card();
                    currentCard.id = oldId;
                    currentCard.isBackFace = true;
                    return;
                }
            }

            const idMatch = cleanLine.match(idTagRegex);
            if (idMatch) {
                if (currentCard) {
                    currentCard.extractStats();
                    currentCard.detectFlavor();
                    currentCard.deriveRarity();
                    cards.push(currentCard);
                }

                currentCard = new Card();
                currentCard.id = idMatch[1];
                currentCard.name = idMatch[2].trim();
                currentCard.cost = idMatch[3] || "";
                return;
            }

            if (!currentCard) return;

            if (!currentCard.name && currentCard.isBackFace) {
                const indicatorCode = parseIndicator(cleanLine);
                if (indicatorCode) {
                    currentCard.colorIndicator = indicatorCode;
                    currentCard.name = cleanLine.replace(/\s*\(Color Indicator:.*?\)/gi, '').trim();
                } else {
                    currentCard.name = cleanLine;
                }
            } else if (!currentCard.type) {
                currentCard.type = cleanLine;
            } else if (cleanLine.startsWith("“") || cleanLine.startsWith('"')) {
                currentCard.flavor += " " + cleanLine;
            } else {
                const indicatorCode = parseIndicator(cleanLine);
                if (indicatorCode && !currentCard.colorIndicator) {
                    currentCard.colorIndicator = indicatorCode;
                } else {
                    currentCard.text.push(cleanLine);
                }
            }
        }
    });

    if (currentCard) {
        currentCard.extractStats();
        currentCard.detectFlavor();
        currentCard.deriveRarity();
        cards.push(currentCard);
    }

    return { setInfo, cards };
}

// ==========================================
// 3. STATISTICS GENERATION
// ==========================================

function generateSetStats(cards) {
    // Filter to front faces only for most stats
    const frontFaces = cards.filter(c => !c.isBackFace);

    // Helper functions
    const getCardColors = (card) => {
        const colors = [];
        if (card.cost.includes('{W}') || (card.colorIndicator && card.colorIndicator.includes('w'))) colors.push('W');
        if (card.cost.includes('{U}') || (card.colorIndicator && card.colorIndicator.includes('u'))) colors.push('U');
        if (card.cost.includes('{B}') || (card.colorIndicator && card.colorIndicator.includes('b'))) colors.push('B');
        if (card.cost.includes('{R}') || (card.colorIndicator && card.colorIndicator.includes('r'))) colors.push('R');
        if (card.cost.includes('{G}') || (card.colorIndicator && card.colorIndicator.includes('g'))) colors.push('G');
        // Check for hybrid mana
        const hybridMatch = card.cost.match(/{([WUBRG])\/([WUBRG])}/gi);
        if (hybridMatch) {
            hybridMatch.forEach(m => {
                const [, c1, c2] = m.match(/{([WUBRG])\/([WUBRG])}/i);
                if (!colors.includes(c1.toUpperCase())) colors.push(c1.toUpperCase());
                if (!colors.includes(c2.toUpperCase())) colors.push(c2.toUpperCase());
            });
        }
        return colors;
    };

    const getColorIdentity = (card) => {
        const colors = getCardColors(card);
        if (card.type.toLowerCase().includes('land')) return 'Land';
        if (colors.length === 0) return 'Colorless';
        if (colors.length > 1) return colors.sort().join('');
        return colors[0];
    };

    const calculateCMC = (cost) => {
        if (!cost) return 0;
        let cmc = 0;
        const symbols = cost.match(/{[^{}]+}/g) || [];
        symbols.forEach(sym => {
            const inner = sym.replace(/[{}]/g, '');
            if (!isNaN(parseInt(inner))) cmc += parseInt(inner);
            else if (!inner.includes('X')) cmc += 1;
        });
        return cmc;
    };

    const getMainType = (card) => {
        const type = card.type.toLowerCase();
        if (type.includes('creature')) return 'Creature';
        if (type.includes('instant')) return 'Instant';
        if (type.includes('sorcery')) return 'Sorcery';
        if (type.includes('enchantment')) return 'Enchantment';
        if (type.includes('artifact')) return 'Artifact';
        if (type.includes('land')) return 'Land';
        if (type.includes('planeswalker')) return 'Planeswalker';
        return 'Other';
    };

    // 1. Cards per color combination
    const colorCombinations = {};
    frontFaces.forEach(card => {
        const identity = getColorIdentity(card);
        colorCombinations[identity] = (colorCombinations[identity] || 0) + 1;
    });

    // 2. Cards per rarity
    const rarityBreakdown = {};
    frontFaces.forEach(card => {
        rarityBreakdown[card.rarity] = (rarityBreakdown[card.rarity] || 0) + 1;
    });

    // 3. Cards per type
    const typeBreakdown = {};
    frontFaces.forEach(card => {
        const mainType = getMainType(card);
        typeBreakdown[mainType] = (typeBreakdown[mainType] || 0) + 1;
    });

    // 4. Mana curve by color (only non-land cards)
    const manaCurveByColor = {};
    const colorOrder = ['W', 'U', 'B', 'R', 'G', 'Multicolor', 'Colorless'];
    colorOrder.forEach(c => manaCurveByColor[c] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 });

    frontFaces.filter(c => !c.type.toLowerCase().includes('land')).forEach(card => {
        const colors = getCardColors(card);
        let colorKey;
        if (colors.length === 0) colorKey = 'Colorless';
        else if (colors.length > 1) colorKey = 'Multicolor';
        else colorKey = colors[0];

        const cmc = calculateCMC(card.cost);
        const cmcKey = cmc >= 6 ? '6+' : cmc.toString();
        manaCurveByColor[colorKey][cmcKey]++;
    });

    // 5. Mana curve within rarity
    const manaCurveByRarity = {};
    ['Mythic', 'Rare', 'Uncommon', 'Common'].forEach(r => {
        manaCurveByRarity[r] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };
    });

    frontFaces.filter(c => !c.type.toLowerCase().includes('land')).forEach(card => {
        if (manaCurveByRarity[card.rarity]) {
            const cmc = calculateCMC(card.cost);
            const cmcKey = cmc >= 6 ? '6+' : cmc.toString();
            manaCurveByRarity[card.rarity][cmcKey]++;
        }
    });

    // 6. Creature stats
    const creatures = frontFaces.filter(c => c.type.toLowerCase().includes('creature'));
    const creatureStats = {
        total: creatures.length,
        byRarity: {},
        averagePT: { power: 0, toughness: 0 },
        powerDistribution: {},
        toughnessDistribution: {}
    };

    let totalPower = 0, totalToughness = 0, ptCount = 0;
    creatures.forEach(card => {
        creatureStats.byRarity[card.rarity] = (creatureStats.byRarity[card.rarity] || 0) + 1;

        if (card.pt) {
            const [power, toughness] = card.pt.split('/').map(v => {
                const num = parseInt(v);
                return isNaN(num) ? 0 : num;
            });
            if (!isNaN(power) && !isNaN(toughness)) {
                totalPower += power;
                totalToughness += toughness;
                ptCount++;

                const pKey = power >= 5 ? '5+' : power.toString();
                const tKey = toughness >= 5 ? '5+' : toughness.toString();
                creatureStats.powerDistribution[pKey] = (creatureStats.powerDistribution[pKey] || 0) + 1;
                creatureStats.toughnessDistribution[tKey] = (creatureStats.toughnessDistribution[tKey] || 0) + 1;
            }
        }
    });

    if (ptCount > 0) {
        creatureStats.averagePT.power = Math.round((totalPower / ptCount) * 10) / 10;
        creatureStats.averagePT.toughness = Math.round((totalToughness / ptCount) * 10) / 10;
    }

    // 7. Keyword/mechanic frequency
    const keywords = {};
    const keywordPatterns = [
        'flying', 'first strike', 'double strike', 'deathtouch', 'lifelink',
        'vigilance', 'trample', 'haste', 'reach', 'menace', 'flash',
        'defender', 'hexproof', 'indestructible', 'ward', 'digital',
        'jack-in', 'eject', 'override'
    ];

    frontFaces.forEach(card => {
        const cardText = (card.text.join(' ') + ' ' + card.type).toLowerCase();
        keywordPatterns.forEach(kw => {
            if (cardText.includes(kw)) {
                const kwTitle = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                keywords[kwTitle] = (keywords[kwTitle] || 0) + 1;
            }
        });
    });

    // 8. Transform/DFC cards count
    const dfcCards = frontFaces.filter(c => c.hasBackFace);

    // 9. Instant/Sorcery ratio
    const instants = frontFaces.filter(c => c.type.toLowerCase().includes('instant')).length;
    const sorceries = frontFaces.filter(c => c.type.toLowerCase().includes('sorcery')).length;

    // 10. Average CMC (non-land)
    const nonLands = frontFaces.filter(c => !c.type.toLowerCase().includes('land'));
    const totalCMC = nonLands.reduce((sum, c) => sum + calculateCMC(c.cost), 0);
    const averageCMC = nonLands.length > 0 ? Math.round((totalCMC / nonLands.length) * 100) / 100 : 0;

    // 11. Cards with specific abilities
    const cardsWithAbilities = {
        cardDraw: frontFaces.filter(c => c.text.join(' ').toLowerCase().includes('draw')).length,
        removal: frontFaces.filter(c => {
            const text = c.text.join(' ').toLowerCase();
            return text.includes('destroy') || text.includes('exile') || text.includes('damage') || text.includes('-x/-x');
        }).length,
        counterspells: frontFaces.filter(c => c.text.join(' ').toLowerCase().includes('counter target')).length,
        tokenCreators: frontFaces.filter(c => c.text.join(' ').toLowerCase().includes('create')).length,
        energyCards: frontFaces.filter(c => c.text.join(' ').includes('{E}')).length
    };

    // 12. Rarity within each color
    const rarityByColor = {};
    colorOrder.forEach(c => rarityByColor[c] = { Mythic: 0, Rare: 0, Uncommon: 0, Common: 0 });

    frontFaces.filter(c => !c.type.toLowerCase().includes('land')).forEach(card => {
        const colors = getCardColors(card);
        let colorKey;
        if (colors.length === 0) colorKey = 'Colorless';
        else if (colors.length > 1) colorKey = 'Multicolor';
        else colorKey = colors[0];

        if (rarityByColor[colorKey] && rarityByColor[colorKey][card.rarity] !== undefined) {
            rarityByColor[colorKey][card.rarity]++;
        }
    });

    return {
        totalCards: frontFaces.length,
        colorCombinations,
        rarityBreakdown,
        typeBreakdown,
        manaCurveByColor,
        manaCurveByRarity,
        creatureStats,
        keywords,
        dfcCount: dfcCards.length,
        instantSorceryRatio: {
            instants,
            sorceries,
            ratio: sorceries > 0 ? Math.round((instants / sorceries) * 100) / 100 : instants
        },
        averageCMC,
        cardsWithAbilities,
        rarityByColor
    };
}

// ==========================================
// 4. HTML GENERATION
// ==========================================


// ==========================================
// 5. MAIN EXECUTION
// ==========================================

function main() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: Could not find ${INPUT_FILE}`);
        process.exit(1);
    }

    const data = parseDesignBible(INPUT_FILE);
    console.log("------------------------------------------");
    console.log("   MATRIX SET DATA GENERATOR");
    console.log("------------------------------------------");
    console.log(`   Found ${data.cards.length} card faces.`);

    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const cardsForJson = data.cards.map(c => ({ ...c, fileName: c.getFileName() }));

    fs.writeFileSync(
        path.join(dataDir, 'cards.json'),
        JSON.stringify(cardsForJson, null, 2)
    );

    fs.writeFileSync(
        path.join(dataDir, 'notes.json'),
        JSON.stringify(data.setInfo.designNotes.join('\n\n'))
    );

    // Generate comprehensive stats
    const stats = generateSetStats(cardsForJson);

    fs.writeFileSync(
        path.join(dataDir, 'setInfo.json'),
        JSON.stringify({
            title: data.setInfo.title,
            cardCount: data.setInfo.cardCount,
            mechanics: data.setInfo.mechanics,
            stats
        }, null, 2)
    );

    console.log(`   ✅ JSON data files generated in src/data/`);
    console.log(`   📊 Set statistics included in setInfo.json`);
}

main();
