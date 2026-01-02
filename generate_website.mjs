import fs from "node:fs";
import path from "node:path";

// ==========================================
// 1. CONFIGURATION
// ==========================================

const INPUT_FILE = "MTG INTO THE MATRIX.txt";
const IMAGE_DIR = "matrix_art_output";    
const OUTPUT_DIR = ".";  
const OUTPUT_FILE = "index.html";

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
        const isNewMechanic = mechanicKeywords.some(k => cleanLine.startsWith(k));
        
        if (isNewMechanic) {
            if (currentMechanic) setInfo.mechanics.push(currentMechanic);
            currentMechanic = { name: cleanLine, text: [], notes: [] };
        } else if (currentMechanic) {
            if (cleanLine.startsWith("Design Note:")) {
                currentMechanic.notes.push(cleanLine.replace("Design Note:", "").trim());
            } else {
                currentMechanic.text.push(cleanLine);
            }
        }
    }
    else if (parsingMode === "cards") {
        if (sectionHeaderRegex.test(cleanLine) || noteRegex.test(cleanLine)) return;

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
// 3. HTML GENERATION
// ==========================================

function replaceSymbols(text) {
    if (!text) return "";
    return text
        .replace(/{([WUBRG])\/([WUBRG])}/gi, (match, c1, c2) => `<i class="ms ms-${c1.toLowerCase()}${c2.toLowerCase()} ms-cost"></i>`)
        .replace(/{([WUBRG])\/P}/gi, (match, c1) => `<i class="ms ms-p${c1.toLowerCase()} ms-cost"></i>`)
        .replace(/{2\/([WUBRG])}/gi, (match, c1) => `<i class="ms ms-2${c1.toLowerCase()} ms-cost"></i>`)
        .replace(/{W}/g, '<i class="ms ms-w ms-cost"></i>')
        .replace(/{U}/g, '<i class="ms ms-u ms-cost"></i>')
        .replace(/{B}/g, '<i class="ms ms-b ms-cost"></i>')
        .replace(/{R}/g, '<i class="ms ms-r ms-cost"></i>')
        .replace(/{G}/g, '<i class="ms ms-g ms-cost"></i>')
        .replace(/{C}/g, '<i class="ms ms-c ms-cost"></i>')
        .replace(/{E}/g, '<i class="ms ms-e ms-cost"></i>')
        .replace(/{T}/g, '<i class="ms ms-tap ms-cost"></i>')
        .replace(/{Q}/g, '<i class="ms ms-untap ms-cost"></i>')
        .replace(/{S}/g, '<i class="ms ms-s ms-cost"></i>')
        .replace(/{X}/g, '<i class="ms ms-x ms-cost"></i>')
        .replace(/{(\d+)}/g, '<i class="ms ms-$1 ms-cost"></i>');
}

function generateHTML(data) {
    const { setInfo, cards } = data;

    const mechanicsHTML = setInfo.mechanics.map(mech => `
        <div class="mechanic-entry">
            <span class="mech-name">${replaceSymbols(mech.name)}</span>
            <div class="mech-text">${mech.text.map(l => replaceSymbols(l)).join(' ')}</div>
            ${mech.notes && mech.notes.length > 0 ? `
                <div class="mech-notes">
                    <strong>Design Note:</strong> ${mech.notes.map(n => replaceSymbols(n)).join(' ')}
                </div>` : ''
            }
        </div>
    `).join('');

    const cardsForJson = cards.map(c => ({ ...c, fileName: c.getFileName() }));
    const cardsJsonString = JSON.stringify(cardsForJson);
    const notesJsonString = JSON.stringify(setInfo.designNotes.join('\n\n'));

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MTG: ${setInfo.title}</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.min.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    
    <style>
        :root {
            --matrix-green: #00FF41;
            --dark-bg: #0d0d0d;
            --card-bg: #151515;
            --text-color: #e0e0e0;
            --border-color: #333;
            --rarity-common: #000;
            --rarity-uncommon: #707883;
            --rarity-rare: #b8860b;
            --rarity-mythic: #ff4500;
            --rarity-land: #a52a2a;
        }
        body {
            background-color: var(--dark-bg);
            color: var(--text-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background-image: linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        h1 {
            text-align: center;
            color: var(--matrix-green);
            text-shadow: 0 0 10px var(--matrix-green);
            margin-bottom: 20px;
            font-size: 2.5rem;
            text-transform: uppercase;
            letter-spacing: 5px;
            font-family: 'Courier New', Courier, monospace;
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto 50px auto;
            border: 1px solid var(--matrix-green);
            background: rgba(0, 255, 65, 0.05);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 255, 65, 0.1);
        }
        .dashboard h2 {
            border-bottom: 1px solid var(--matrix-green);
            padding-bottom: 5px;
            margin-top: 0;
            color: #fff;
            font-size: 1.2rem;
            text-transform: uppercase;
        }
        
        .filter-section {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #333;
        }
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-width: 200px;
        }
        .filter-label {
            font-size: 0.9em;
            color: var(--matrix-green);
            font-weight: bold;
            text-transform: uppercase;
        }
        .search-input, .filter-select {
            background: #000;
            border: 1px solid var(--matrix-green);
            color: #fff;
            padding: 10px;
            border-radius: 4px;
            font-family: inherit;
        }
        .color-toggles {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        .color-btn {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 2px solid #555;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            background: #222;
            color: #aaa;
            transition: 0.2s;
            font-size: 1.3em; 
        }
        .color-btn i { margin: 0; }
        .color-btn.active { border-color: #fff; box-shadow: 0 0 8px #fff; }
        .cb-w.active { background: #f8e7b9; color: #000; }
        .cb-u.active { background: #0e68ab; color: #fff; }
        .cb-b.active { background: #150b00; color: #fff; }
        .cb-r.active { background: #d3202a; color: #fff; }
        .cb-g.active { background: #00733e; color: #fff; }
        .cb-gold.active { background: #d4af37; color: #000; }
        .cb-art.active { background: #7d7d7d; color: #000; }
        .cb-land.active { background: #bfa586; color: #000; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .btn-generate {
            background: var(--matrix-green);
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 15px;
            width: 100%;
            transition: 0.3s;
            box-shadow: 0 0 10px var(--matrix-green);
        }
        .btn-generate:hover { background: #fff; box-shadow: 0 0 20px #fff; }
        .btn-notes { background: #333; color: #fff; border: 1px solid var(--matrix-green); font-size: 0.9em; margin-top: 10px; }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 999;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
        }
        .modal-content {
            background: #111;
            border: 2px solid var(--matrix-green);
            width: 90%;
            max-width: 1400px;
            padding: 20px;
            border-radius: 10px;
            position: relative;
            max-height: 95vh;
            overflow-y: auto;
            transition: all 0.3s ease;
        }
        
        #packModal.draft-mode .modal-content {
            margin-right: 270px; 
            width: auto;
            max-width: calc(100% - 300px);
        }

        .close-modal {
            position: absolute;
            top: 10px; right: 20px;
            font-size: 2rem;
            color: #fff;
            cursor: pointer;
            z-index: 100;
        }
        
        .pack-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            margin-top: 20px;
            justify-content: center;
        }
        .single-view {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 20px;
            margin-top: 20px;
            width: 100%;
            flex-wrap: wrap; 
        }
        .single-view .card { max-width: 700px; width: 100%; font-size: 1.1em; cursor: default; }
        .single-view .dfc-wrapper { display: flex; gap: 20px; width: 100%; justify-content: center; border: none; background: transparent; }
        .single-view .card:hover { transform: none; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }

        .mechanics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 15px; }
        .mechanic-entry { background: rgba(0,0,0,0.3); padding: 10px; border-left: 3px solid var(--matrix-green); }
        .mech-name { display: block; font-weight: bold; color: var(--matrix-green); margin-bottom: 4px; }
        .mech-text { font-size: 0.9em; color: #ccc; line-height: 1.4; }
        .mech-notes { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #444; font-style: italic; color: #888; font-size: 0.85em; }
        .mech-notes strong { color: #aaa; font-style: normal; }

        .markdown-body { 
            color: #e0e0e0; padding: 20px; line-height: 1.6; 
            white-space: normal;
            overflow-wrap: break-word;
            word-wrap: break-word;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: var(--matrix-green); border-bottom: 1px solid #333; padding-bottom: 5px; }
        .markdown-body ul { list-style: square; color: #aaa; }
        .markdown-body strong { color: #fff; }
        .markdown-body img { max-width: 100%; }

        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 40px; max-width: 1600px; margin: 0 auto; }
        
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            border-top: 5px solid #444; 
            height: 100%;
            position: relative;
            cursor: pointer;
        }
        .card[data-color="W"] { border-top-color: #F0F2C0; }
        .card[data-color="U"] { border-top-color: #0E68AB; }
        .card[data-color="B"] { border-top-color: #150B00; }
        .card[data-color="R"] { border-top-color: #D3202A; }
        .card[data-color="G"] { border-top-color: #00733E; }
        .card[data-color="Gold"] { border-top-color: #D4AF37; }
        .card[data-color="Land"] { border-top-color: #bfa586; }
        .gallery .card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(0, 255, 65, 0.3); border-color: var(--matrix-green); }

        .card-header { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); border-bottom: 1px solid #333; gap: 10px; }
        .card-name { font-weight: 700; font-size: 1.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mana-cost { flex-shrink: 0; white-space: nowrap; display: flex; align-items: center; font-size: 1.1em; gap: 2px; }

        .art-container { width: 100%; height: auto; min-height: 150px; overflow: hidden; background: #000; position: relative; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #333; }
        .art-container img { width: 100%; height: auto; display: block; z-index: 1; }
        .art-missing { color: #444; text-align: center; font-size: 0.8em; position: absolute; z-index: 0; padding: 20px; }

        .type-line { padding: 8px 12px; font-size: 0.9em; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; font-weight: 600; background: rgba(255,255,255,0.03); z-index: 2; }
        
        .text-box { padding: 14px; font-size: 0.92em; line-height: 1.45; flex-grow: 1; display: flex; flex-direction: column; }
        .oracle-text p { margin: 0 0 8px 0; }
        .flavor-separator { width: 90%; height: 1px; background: #444; margin: 8px auto 8px auto; }
        .flavor-text { font-style: italic; font-family: 'Times New Roman', Times, serif; color: #999; font-size: 0.95em; }

        .pt-box { background: #222; padding: 4px 10px; border-radius: 8px; font-weight: bold; border: 1px solid #555; font-size: 1.1em; position: absolute; bottom: 10px; right: 10px; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); }
        .card[data-pt="yes"] .text-box { padding-bottom: 45px; }

        .dfc-wrapper { grid-column: span 2; display: flex; gap: 15px; align-items: stretch; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px dashed #444; }
        .dfc-wrapper .card { flex: 1; }
        .transform-icon { font-size: 2em; color: var(--matrix-green); align-self: center; }
        
        i.ms { vertical-align: baseline; margin: 0 1px; }
        i.ms-tap { font-size: 0.9em; }

        .rarity-symbol { font-size: 0.75em; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-left: auto; border: 1px solid rgba(255,255,255,0.2); box-shadow: 1px 1px 3px rgba(0,0,0,0.5); font-family: sans-serif; background: #000; }
        .rarity-Common { color: #fff; background: var(--rarity-common); }
        .rarity-Uncommon { color: #fff; background: var(--rarity-uncommon); border-color: #a0a0a0; }
        .rarity-Rare { color: #222; background: var(--rarity-rare); border-color: #ffd700; }
        .rarity-Mythic { color: #fff; background: var(--rarity-mythic); border-color: #ff6347; }
        .rarity-Land { color: #fff; background: var(--rarity-land); }

        .draft-pool-sidebar { 
            position: fixed; right: 0; top: 0; bottom: 0; width: 250px; 
            background: #111; border-left: 2px solid var(--matrix-green); 
            padding: 20px; overflow-y: auto; z-index: 1000; display: none;
        }
        .draft-pool-sidebar.active { display: block; }
        .pool-list { list-style: none; padding: 0; font-size: 0.9em; }
        .pool-list li { margin-bottom: 5px; cursor: pointer; }
        .pool-list li:hover { color: var(--matrix-green); }
        
        #hoverPreview {
            position: fixed;
            right: 270px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1100;
            display: none;
            pointer-events: none;
            width: 300px;
        }
        #hoverPreview .card { width: 100%; box-shadow: 0 0 20px #000; background: #1a1a1a; }
        #hoverPreview .dfc-wrapper { flex-direction: column; width: 100%; }

        @media (max-width: 900px) {
            .dfc-wrapper { flex-direction: column; grid-column: span 1; }
            .transform-icon { transform: rotate(90deg); margin: 10px 0; }
            .info-grid { grid-template-columns: 1fr; }
            
            #packModal.draft-mode .modal-content {
                margin-right: 0;
                max-width: 90%;
            }
            .draft-pool-sidebar {
                top: auto; bottom: 0; left: 0; right: 0; 
                width: 100%; height: 150px;
                border-left: none; border-top: 2px solid var(--matrix-green);
            }
            #hoverPreview { display: none !important; }
        }
    </style>
</head>
<body>

    <div id="packModal" class="modal-overlay">
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <h2 id="modalTitle" style="text-align:center; color: var(--matrix-green);">BOOSTER PACK UNLOCKED</h2>
            <div id="packContainer" class="pack-grid"></div>
        </div>
    </div>

    <div id="notesModal" class="modal-overlay">
        <div class="modal-content">
            <span class="close-modal" onclick="closeNotes()">&times;</span>
            <h2 style="text-align:center; color: var(--matrix-green);">DESIGN NOTES & ARCHETYPES</h2>
            <div id="notesContent" class="markdown-body"></div>
        </div>
    </div>

    <div id="draftSidebar" class="draft-pool-sidebar">
        <h3>YOUR POOL (<span id="poolCount">0</span>)</h3>
        <ul id="poolList" class="pool-list"></ul>
    </div>
    
    <div id="hoverPreview"></div>

    <h1>${setInfo.title}</h1>

    <div class="dashboard">
        <div class="info-grid">
            <div class="stat-box">
                <h2>System Stats</h2>
                <p><strong>Visible Cards:</strong> <span id="visibleCount">${setInfo.cardCount}</span></p>
                <p><strong>System Version:</strong> v3.3.0 (Revert & Restore)</p>
                <button class="btn-generate" onclick="openBoosterPack()">Open Simulation Pack</button>
                <button class="btn-generate" onclick="startDraft()">Start Draft Simulator</button>
                <button class="btn-generate btn-notes" onclick="openNotes()">View Design Notes</button>
            </div>
            <div>
                <h2>Set Mechanics</h2>
                <div class="mechanics-grid">
                    ${mechanicsHTML}
                </div>
            </div>
        </div>

        <div class="filter-section">
            <div class="filter-group">
                <label class="filter-label">General Search</label>
                <input type="text" id="searchInput" class="search-input" placeholder="Name, text, etc..." onkeyup="applyFilters()">
            </div>
            <div class="filter-group">
                <label class="filter-label">Rarity</label>
                <select id="rarityInput" class="filter-select" onchange="applyFilters()">
                    <option value="All">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Mythic">Mythic</option>
                    <option value="Land">Basic Land</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Type / Subtype</label>
                <input type="text" id="typeInput" class="search-input" placeholder="e.g. Artifact, Human, Vehicle" onkeyup="applyFilters()">
            </div>
            <div class="filter-group">
                <label class="filter-label">Color</label>
                <div class="color-toggles">
                    <div class="color-btn cb-w" onclick="toggleColor('W', this)"><i class="ms ms-w ms-cost"></i></div>
                    <div class="color-btn cb-u" onclick="toggleColor('U', this)"><i class="ms ms-u ms-cost"></i></div>
                    <div class="color-btn cb-b" onclick="toggleColor('B', this)"><i class="ms ms-b ms-cost"></i></div>
                    <div class="color-btn cb-r" onclick="toggleColor('R', this)"><i class="ms ms-r ms-cost"></i></div>
                    <div class="color-btn cb-g" onclick="toggleColor('G', this)"><i class="ms ms-g ms-cost"></i></div>
                    <div class="color-btn cb-gold" onclick="toggleColor('Gold', this)"><i class="ms ms-multicolored ms-cost"></i></div>
                    <div class="color-btn cb-art" onclick="toggleColor('Artifact', this)"><i class="ms ms-artifact ms-cost"></i></div>
                    <div class="color-btn cb-land" onclick="toggleColor('Land', this)"><i class="ms ms-land ms-cost"></i></div>
                </div>
            </div>
        </div>
    </div>

    <div id="filterStatus" style="text-align: center; margin: 20px 0; color: var(--matrix-green); font-family: 'Courier New', monospace; font-size: 1.2em;"></div>

    <div id="galleryContainer" class="gallery">
        </div>

    <script>
        const ALL_CARDS = ${cardsJsonString};
        const DESIGN_NOTES = ${notesJsonString};
        
        let activeColor = null;
        let currentPack = [];
        let viewingCardFromPack = false;

        let draftState = {
            active: false,
            round: 1, // 1, 2, 3
            pick: 1,  // 1-15
            packs: [], 
            pool: [],  
            isReviewingPool: false
        };

        const rarityWeights = { "Mythic": 4, "Rare": 3, "Uncommon": 2, "Common": 1, "Land": 0 };
        const raritySort = { "Mythic": 0, "Rare": 1, "Uncommon": 2, "Common": 3, "Land": 4 };

        // --- SHARED FUNCTIONS ---
        function replaceSymbols(text) {
            if (!text) return "";
            return text
                .replace(/{([WUBRG])\\/([WUBRG])}/gi, (match, c1, c2) => \`<i class="ms ms-\${c1.toLowerCase()}\${c2.toLowerCase()} ms-cost"></i>\`)
                .replace(/{([WUBRG])\\/P}/gi, (match, c1) => \`<i class="ms ms-p\${c1.toLowerCase()} ms-cost"></i>\`)
                .replace(/{2\\/([WUBRG])}/gi, (match, c1) => \`<i class="ms ms-2\${c1.toLowerCase()} ms-cost"></i>\`)
                .replace(/{W}/g, '<i class="ms ms-w ms-cost"></i>')
                .replace(/{U}/g, '<i class="ms ms-u ms-cost"></i>')
                .replace(/{B}/g, '<i class="ms ms-b ms-cost"></i>')
                .replace(/{R}/g, '<i class="ms ms-r ms-cost"></i>')
                .replace(/{G}/g, '<i class="ms ms-g ms-cost"></i>')
                .replace(/{C}/g, '<i class="ms ms-c ms-cost"></i>')
                .replace(/{E}/g, '<i class="ms ms-e ms-cost"></i>')
                .replace(/{T}/g, '<i class="ms ms-tap ms-cost"></i>')
                .replace(/{Q}/g, '<i class="ms ms-untap ms-cost"></i>')
                .replace(/{S}/g, '<i class="ms ms-s ms-cost"></i>')
                .replace(/{X}/g, '<i class="ms ms-x ms-cost"></i>')
                .replace(/{(\\d+)}/g, '<i class="ms ms-$1 ms-cost"></i>');
        }

        function determineColorClass(card) {
            let colorsFound = 0;
            if (card.cost.includes("{W}")) colorsFound++;
            if (card.cost.includes("{U}")) colorsFound++;
            if (card.cost.includes("{B}")) colorsFound++;
            if (card.cost.includes("{R}")) colorsFound++;
            if (card.cost.includes("{G}")) colorsFound++;
            
            if (card.type.toLowerCase().includes("land")) return "Land";
            if (colorsFound > 1) return "Gold";
            if (colorsFound === 0) return "Artifact"; 

            if (card.cost.includes("{W}")) return "W";
            if (card.cost.includes("{U}")) return "U";
            if (card.cost.includes("{B}")) return "B";
            if (card.cost.includes("{R}")) return "R";
            if (card.cost.includes("{G}")) return "G";
            
            return "Artifact";
        }

        function calculateCMC(cost) {
            if (!cost) return 0;
            let cmc = 0;
            const symbols = cost.match(/{[^{}]+}/g) || [];
            symbols.forEach(sym => {
                const inner = sym.replace(/[{}]/g, '');
                if (!isNaN(parseInt(inner))) { cmc += parseInt(inner); } 
                else if (inner.includes('X')) { cmc += 0; } 
                else { cmc += 1; }
            });
            return cmc;
        }

        function renderCardJS(card, onClickOverride = null) {
            const imagePath = \`${IMAGE_DIR}/\${card.fileName}\`;
            const colorClass = determineColorClass(card);
            const hasPt = card.pt ? "yes" : "no";
            
            const textLines = card.text.map(l => \`<p>\${replaceSymbols(l)}</p>\`).join('');
            let textBoxContent = \`<div class="oracle-text">\${textLines}</div>\`;
            if (card.flavor) {
                textBoxContent += \`<div class="flavor-separator"></div><div class="flavor-text">\${replaceSymbols(card.flavor)}</div>\`;
            }

            const cleanId = card.id.replace(/[\[\]]/g, '');
            let typeLineContent = \`<span>\${card.displayType}</span>\`;
            if (card.colorIndicator) {
                typeLineContent = \`<span><i class="ms ms-ci ms-ci-\${card.colorIndicator}"></i> \${card.displayType}</span>\`;
            }

            const clickAction = onClickOverride ? onClickOverride : \`viewCard('\${card.id}')\`;

            return \`
            <div class="card" data-color="\${colorClass}" data-pt="\${hasPt}" onclick="\${clickAction}">
                <div class="card-header">
                    <span class="card-name">\${card.name}</span>
                    <span class="mana-cost">\${replaceSymbols(card.cost)}</span>
                </div>
                <div class="art-container">
                    <div class="art-missing">Loading...<br>\${card.fileName}</div>
                    <img src="\${imagePath}" alt="\${card.name}" loading="lazy" onload="this.style.zIndex='2'" onerror="this.style.display='none'">
                </div>
                <div class="type-line">
                    \${typeLineContent}
                    <span class="rarity-symbol rarity-\${card.rarity}" title="\${card.rarity}">\${cleanId}</span>
                </div>
                <div class="text-box">
                    \${textBoxContent}
                </div>
                \${card.pt ? \`<div class="pt-box">\${card.pt}</div>\` : ''}
            </div>
            \`;
        }

        function getCardHTML_WithDFC(card, onClickOverride = null) {
            let cardHtml = renderCardJS(card, onClickOverride);
            if (card.hasBackFace) {
                const backFace = ALL_CARDS.find(c => c.id === card.id && c.isBackFace);
                if (backFace) {
                    return \`
                    <div class="dfc-wrapper">
                        \${renderCardJS(card, onClickOverride)}
                        <div class="transform-icon">⇄</div>
                        \${renderCardJS(backFace, onClickOverride)}
                    </div>
                    \`;
                }
            }
            return cardHtml;
        }

        // --- GENERATION LOGIC ---
        function generateBoosterPackData() {
            const lands = ALL_CARDS.filter(c => c.rarity === "Land" && !c.isBackFace);
            const commons = ALL_CARDS.filter(c => c.rarity === "Common" && !c.isBackFace);
            const uncommons = ALL_CARDS.filter(c => c.rarity === "Uncommon" && !c.isBackFace);
            const rares = ALL_CARDS.filter(c => c.rarity === "Rare" && !c.isBackFace);
            const mythics = ALL_CARDS.filter(c => c.rarity === "Mythic" && !c.isBackFace);
            
            const pack = [];
            if (lands.length) pack.push(...getRandom(lands, 1));
            if (commons.length) pack.push(...getRandom(commons, 7));
            if (uncommons.length) pack.push(...getRandom(uncommons, 3));
            
            if (Math.random() > 0.87 && mythics.length > 0) pack.push(...getRandom(mythics, 1));
            else if (rares.length > 0) pack.push(...getRandom(rares, 1));

            const wildcardRoll = Math.random();
            if (wildcardRoll > 0.95 && mythics.length > 0) pack.push(...getRandom(mythics, 1));
            else if (wildcardRoll > 0.85 && rares.length > 0) pack.push(...getRandom(rares, 1));
            else if (wildcardRoll > 0.60 && uncommons.length > 0) pack.push(...getRandom(uncommons, 1));
            else if (commons.length > 0) pack.push(...getRandom(commons, 1));

            return pack;
        }

        // --- DRAFT LOGIC ---
        function startDraft() {
            draftState = {
                active: true,
                round: 1,
                pick: 1,
                packs: [],
                pool: [],
                isReviewingPool: false
            };
            
            for (let i = 0; i < 8; i++) {
                draftState.packs.push(generateBoosterPackData());
            }

            updateDraftUI();
            const modal = document.getElementById("packModal");
            modal.classList.add("draft-mode"); 
            modal.style.display = "flex";
            document.getElementById("draftSidebar").classList.add("active");
        }

        function pickCard(cardId) {
            const packIndex = 0; 
            const cardIndex = draftState.packs[0].findIndex(c => c.id === cardId);
            if (cardIndex === -1) return;

            draftState.pool.push(draftState.packs[0][cardIndex]);
            draftState.packs[0].splice(cardIndex, 1);

            for (let i = 1; i < 8; i++) {
                if (draftState.packs[i].length > 0) {
                    const randomIdx = Math.floor(Math.random() * draftState.packs[i].length);
                    draftState.packs[i].splice(randomIdx, 1);
                }
            }

            if (draftState.round === 2) {
                const last = draftState.packs.pop();
                draftState.packs.unshift(last);
            } else {
                const first = draftState.packs.shift();
                draftState.packs.push(first);
            }

            draftState.pick++;

            if (draftState.packs[0].length === 0) {
                if (draftState.round === 3) {
                    endDraft();
                    return;
                } else {
                    draftState.round++;
                    draftState.pick = 1;
                    draftState.packs = [];
                    for (let i = 0; i < 8; i++) {
                        draftState.packs.push(generateBoosterPackData());
                    }
                }
            }

            updateDraftUI();
        }

        function updateDraftUI() {
            const container = document.getElementById("packContainer");
            container.className = "pack-grid";
            container.innerHTML = "";
            
            document.getElementById("modalTitle").innerText = \`DRAFT: PACK \${draftState.round} / PICK \${draftState.pick}\`;
            
            draftState.packs[0].forEach(card => {
                const html = getCardHTML_WithDFC(card, \`pickCard('\${card.id}')\`);
                container.insertAdjacentHTML('beforeend', html);
            });

            document.getElementById("poolCount").innerText = draftState.pool.length;
            const poolList = document.getElementById("poolList");
            poolList.innerHTML = draftState.pool.map(c => \`<li onmouseenter="showDraftHover('\${c.id}')" onmouseleave="hideDraftHover()">\${c.name}</li>\`).join('');
        }

        function showDraftHover(id) {
            const card = ALL_CARDS.find(c => c.id === id); 
            if (!card) return;
            const preview = document.getElementById("hoverPreview");
            preview.innerHTML = getCardHTML_WithDFC(card, ''); 
            preview.style.display = "block";
        }

        function hideDraftHover() {
            document.getElementById("hoverPreview").style.display = "none";
        }

        function endDraft() {
            draftState.active = false;
            draftState.isReviewingPool = true;
            
            // HIDE SIDEBAR SO RESULTS DON'T GET CUT OFF
            document.getElementById("draftSidebar").classList.remove("active");
            
            const container = document.getElementById("packContainer");
            const modal = document.getElementById("packModal");
            
            modal.classList.remove("draft-mode");
            
            container.className = "pack-grid"; 
            container.innerHTML = "";
            
            document.getElementById("modalTitle").innerHTML = "DRAFT COMPLETE - DECK BUILDER <br><button onclick='downloadDeck()' style='font-size:0.6em; padding:5px 10px; cursor:pointer;'>Download List</button>";

            draftState.pool.sort((a, b) => {
                const cmcA = calculateCMC(a.cost);
                const cmcB = calculateCMC(b.cost);
                if (cmcA !== cmcB) return cmcA - cmcB;
                return determineColorClass(a).localeCompare(determineColorClass(b));
            });

            draftState.pool.forEach(card => {
                const html = getCardHTML_WithDFC(card, \`viewCard('\${card.id}')\`);
                container.insertAdjacentHTML('beforeend', html);
            });
        }

        function downloadDeck() {
            const text = draftState.pool.map(c => \`1 \${c.name}\`).join('\\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'matrix-draft-deck.txt';
            a.click();
        }

        // --- STANDARD VIEWS ---
        function toggleColor(color, btn) {
            if (activeColor === color) {
                activeColor = null;
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                activeColor = color;
                btn.classList.add('active');
            }
            applyFilters();
        }

        function applyFilters() {
            const searchText = document.getElementById('searchInput').value.toLowerCase();
            const rarity = document.getElementById('rarityInput').value;
            const typeText = document.getElementById('typeInput').value.toLowerCase();

            const filtered = ALL_CARDS.filter(card => {
                if (card.isBackFace) return false;
                const matchSearch = card.name.toLowerCase().includes(searchText) || card.text.join(' ').toLowerCase().includes(searchText);
                const matchRarity = rarity === 'All' || card.rarity === rarity;
                const matchType = typeText === '' || card.type.toLowerCase().includes(typeText);
                const cardColor = determineColorClass(card);
                const matchColor = activeColor ? cardColor === activeColor : true;
                return matchSearch && matchRarity && matchType && matchColor;
            });
            renderGallery(filtered);
        }

        function renderGallery(cards) {
            const container = document.getElementById('galleryContainer');
            const totalCards = ALL_CARDS.filter(c => !c.isBackFace).length;
            const visibleCount = cards.length;
            document.getElementById('visibleCount').innerText = visibleCount;
            document.getElementById('filterStatus').innerHTML = \`SHOWING <strong>\${visibleCount}</strong> / \${totalCards} DATA ENTRIES\`;
            
            if (cards.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:50px; color:#555;">NO CARDS FOUND IN THE MATRIX</div>';
                return;
            }
            const html = cards.map(card => getCardHTML_WithDFC(card)).join('');
            container.innerHTML = html;
        }

        function viewCard(id) {
            if (draftState.active && !draftState.isReviewingPool) return; 

            const modal = document.getElementById("packModal");
            const isOpen = modal.style.display === "flex";
            if (isOpen && !draftState.isReviewingPool) viewingCardFromPack = true;
            else viewingCardFromPack = false;

            const card = ALL_CARDS.find(c => c.id === id && !c.isBackFace);
            if (!card) return;

            const container = document.getElementById("packContainer");
            container.className = "single-view";
            container.innerHTML = getCardHTML_WithDFC(card);
            
            document.getElementById("modalTitle").innerText = "CARD VIEW";
            modal.classList.remove("draft-mode"); 
            modal.style.display = "flex";
        }

        function openBoosterPack() {
            draftState.active = false;
            draftState.isReviewingPool = false;
            viewingCardFromPack = false; 
            currentPack = generateBoosterPackData();
            
            currentPack.sort((a, b) => rarityWeights[b.rarity] - rarityWeights[a.rarity]);

            renderPackView();
            const modal = document.getElementById("packModal");
            modal.classList.remove("draft-mode"); 
            modal.style.display = "flex";
            document.getElementById("draftSidebar").classList.remove("active");
        }

        function renderPackView() {
            const container = document.getElementById("packContainer");
            container.className = "pack-grid";
            container.innerHTML = "";
            currentPack.forEach(card => {
                const html = getCardHTML_WithDFC(card);
                container.insertAdjacentHTML('beforeend', html);
            });
            document.getElementById("modalTitle").innerText = "BOOSTER PACK UNLOCKED";
        }

        function getRandom(arr, count) {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        function closeModal() {
            if (draftState.active) {
                document.getElementById("packModal").style.display = "none";
                return;
            }
            if (viewingCardFromPack && !draftState.isReviewingPool) {
                renderPackView();
                viewingCardFromPack = false;
            } else if (draftState.isReviewingPool && viewingCardFromPack) {
                 endDraft(); 
                 viewingCardFromPack = false;
            } else {
                document.getElementById("packModal").style.display = "none";
                document.getElementById("draftSidebar").classList.remove("active");
                document.getElementById("packModal").classList.remove("draft-mode");
            }
        }

        function openNotes() {
            document.getElementById('notesContent').innerHTML = marked.parse(DESIGN_NOTES);
            document.getElementById('notesModal').style.display = "flex";
        }
        function closeNotes() { document.getElementById('notesModal').style.display = "none"; }
        
        window.onclick = function(event) {
            if (event.target == document.getElementById("packModal")) closeModal();
            if (event.target == document.getElementById("notesModal")) closeNotes();
        }

        sortCards(ALL_CARDS);
        renderGallery(ALL_CARDS.filter(c => !c.isBackFace));

        // Sorting Helpers
        function getCardColorIdentity(card) {
            if (card.type.toLowerCase().includes('land')) return 7; 
            let w = card.cost.includes('{W}') || (card.colorIndicator && card.colorIndicator.includes('w'));
            let u = card.cost.includes('{U}') || (card.colorIndicator && card.colorIndicator.includes('u'));
            let b = card.cost.includes('{B}') || (card.colorIndicator && card.colorIndicator.includes('b'));
            let r = card.cost.includes('{R}') || (card.colorIndicator && card.colorIndicator.includes('r'));
            let g = card.cost.includes('{G}') || (card.colorIndicator && card.colorIndicator.includes('g'));
            
            if(card.cost.match(/{[WUBRG]\\/[WUBRG]}/)) {
                if(card.cost.includes('W')) w = true;
                if(card.cost.includes('U')) u = true;
                if(card.cost.includes('B')) b = true;
                if(card.cost.includes('R')) r = true;
                if(card.cost.includes('G')) g = true;
            }
            let count = (w?1:0) + (u?1:0) + (b?1:0) + (r?1:0) + (g?1:0);
            if (count > 1) return 5; if (count === 0) return 6; 
            if (w) return 0; if (u) return 1; if (b) return 2; if (r) return 3; if (g) return 4;
            return 6;
        }
        function sortCards(cards) {
            return cards.sort((a, b) => {
                const cA = getCardColorIdentity(a); const cB = getCardColorIdentity(b);
                if (cA !== cB) return cA - cB;
                const rA = raritySort[a.rarity] || 3; const rB = raritySort[b.rarity] || 3;
                if (rA !== rB) return rA - rB;
                const mvA = calculateCMC(a.cost); const mvB = calculateCMC(b.cost);
                if (mvA !== mvB) return mvA - mvB;
                return a.name.localeCompare(b.name);
            });
        }

    </script>

</body>
</html>
    `;
}

// ==========================================
// 4. MAIN EXECUTION
// ==========================================

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Could not find ${INPUT_FILE}`);
    process.exit(1);
  }
  
  const data = parseDesignBible(INPUT_FILE);
  console.log("------------------------------------------");
  console.log("   MATRIX SET WEBSITE GENERATOR (V33 - Restored)");
  console.log("------------------------------------------");
  console.log(`   Found ${data.cards.length} card faces.`);
  
  const htmlContent = generateHTML(data);
  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  fs.writeFileSync(outputPath, htmlContent);
  
  console.log(`   ✅ Website generated at: ${outputPath}`);
}

main();