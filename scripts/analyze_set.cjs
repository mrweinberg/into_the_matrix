const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

const analysis = {
    totalCards: cards.length,
    rarity: {},
    colors: { W: 0, U: 0, B: 0, R: 0, G: 0, M: 0, C: 0, L: 0 },
    types: {},
    creatureTypes: {},
    cmcHisto: {},
    keywords: {
        Digital: 0,
        'Jack-in': 0,
        Eject: 0,
        Champion: 0,
        Harvest: 0,
        Energy: 0 // rough check
    }
};

const uniqueCards = new Map(); // Handle double-faced cards (same ID)

cards.forEach(card => {
    if (card.isBackFace) return; // Skip back faces for main counts usually
    uniqueCards.set(card.id, card);
});

const mainCards = Array.from(uniqueCards.values());
analysis.uniqueCount = mainCards.length;

mainCards.forEach(card => {
    // Rarity
    analysis.rarity[card.rarity] = (analysis.rarity[card.rarity] || 0) + 1;

    // Color
    let color = 'C';
    if (!card.cost) {
        if (card.colorIndicator) color = card.colorIndicator.toUpperCase();
        else if (card.type.includes('Land')) color = 'L';
    } else {
        const cost = card.cost || "";
        const hasW = cost.includes('{W}');
        const hasU = cost.includes('{U}');
        const hasB = cost.includes('{B}');
        const hasR = cost.includes('{R}');
        const hasG = cost.includes('{G}');
        const colorCount = [hasW, hasU, hasB, hasR, hasG].filter(Boolean).length;

        if (colorCount > 1) color = 'M';
        else if (hasW) color = 'W';
        else if (hasU) color = 'U';
        else if (hasB) color = 'B';
        else if (hasR) color = 'R';
        else if (hasG) color = 'G';
        else if (card.type.includes('Land')) color = 'L';
    }
    analysis.colors[color] = (analysis.colors[color] || 0) + 1;

    // CMC (Rough calc)
    const matches = (card.cost || "").match(/\{(\d+|[WUBRG])\}/g);
    let cmc = 0;
    if (matches) {
        matches.forEach(m => {
            if (/\d/.test(m)) cmc += parseInt(m.match(/\d+/)[0]);
            else cmc += 1;
        });
    }
    analysis.cmcHisto[cmc] = (analysis.cmcHisto[cmc] || 0) + 1;

    // Types
    const typeLine = card.type.split('—')[0].trim();
    const types = typeLine.split(' ');
    types.forEach(t => analysis.types[t] = (analysis.types[t] || 0) + 1);

    // Creature Types
    if (card.type.includes('Creature')) {
        const subTypes = card.type.split('—')[1] ? card.type.split('—')[1].split('(')[0].trim().split(' ') : [];
        subTypes.forEach(t => analysis.creatureTypes[t] = (analysis.creatureTypes[t] || 0) + 1);
    }

    // Keywords (Check text)
    const text = card.text.join('\n');
    if (text.includes('Digital')) analysis.keywords.Digital++;
    if (text.includes('Jack-in')) analysis.keywords['Jack-in']++;
    if (text.includes('Eject')) analysis.keywords.Eject++;
    if (text.includes('Champion')) analysis.keywords.Champion++;
    if (text.includes('Harvest')) analysis.keywords.Harvest++;
    if (text.includes('{E}')) analysis.keywords.Energy++;
});

console.log(JSON.stringify(analysis, null, 2));
