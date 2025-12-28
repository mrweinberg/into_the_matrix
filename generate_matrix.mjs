import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import 'dotenv/config';

// ==========================================
// 1. CONFIGURATION
// ==========================================

const API_KEY = process.env.GEMINI_API_KEY;

// Using the Gemini 3 model for image generation
const MODEL_ID = "gemini-3-pro-image-preview"; // Or "gemini-3-pro-image-preview" if available to you

const INPUT_FILE = "MTG INTO THE MATRIX.txt";
const OUTPUT_DIR = "matrix_art_output";

// ==========================================
// 2. CLASS DEFINITION
// ==========================================

class Card {
  constructor() {
    this.id = "";
    this.name = "";
    this.cost = "";
    this.type = "";
    this.text = [];
    this.flavor = "";
  }

  getColors() {
    const colors = [];
    if (this.cost && this.cost.includes("{W}")) colors.push("White");
    if (this.cost && this.cost.includes("{U}")) colors.push("Blue");
    if (this.cost && this.cost.includes("{B}")) colors.push("Black");
    if (this.cost && this.cost.includes("{R}")) colors.push("Red");
    if (this.cost && this.cost.includes("{G}")) colors.push("Green");
    return colors;
  }

  /**
   * determines if the card exists in the Simulation (Matrix) 
   * or the Real World based on keywords and types.
   */
  getMatrixContext() {
    const nameLower = this.name.toLowerCase();
    const textLower = this.text.join(" ").toLowerCase();
    const typeLower = this.type.toLowerCase();
    
    // --- 1. THE SIMULATION (The Matrix) ---
    // Programs, Agents, and Digital entities exist inside the code.
    if (
        textLower.includes("digital") || 
        typeLower.includes("program") || 
        typeLower.includes("agent") ||
        typeLower.includes("avatar") ||
        nameLower.includes("matrix") ||
        nameLower.includes("code") ||
        nameLower.includes("virtual")
    ) {
        if (typeLower.includes("agent") || nameLower.includes("agent")) return "The Matrix - Corporate Urban";
        if (textLower.includes("kung fu") || textLower.includes("monk")) return "The Matrix - Dojo / Sparring Program";
        if (nameLower.includes("construct")) return "The Construct (White Void)";
        return "The Matrix - Green Tinted Simulation";
    }

    // --- 2. THE MACHINE CITY (01) ---
    // Source of the machines, heavy industrial, red skies, lightning.
    if (
        nameLower.includes("machine city") || 
        nameLower.includes("source") ||
        nameLower.includes("deus ex") ||
        nameLower.includes("01")
    ) {
        return "01 - The Machine City";
    }

    // --- 3. THE REAL WORLD (The Desert of the Real) ---
    // Hovercrafts, Sentinels (Robots), Ruins, Sewers.
    if (
        typeLower.includes("robot") || 
        typeLower.includes("vehicle") || 
        textLower.includes("vehicle") ||
        typeLower.includes("pilot") || 
        nameLower.includes("sentinel") ||
        nameLower.includes("squiddy") ||
        nameLower.includes("hovercraft") ||
        nameLower.includes("emp")
    ) {
        return "The Real World - Scorched Earth Ruins";
    }

    // --- 4. ZION (The Last City) ---
    // Underground, industrial, human population, sweat, metal.
    if (
        nameLower.includes("zion") || 
        nameLower.includes("dock") || 
        nameLower.includes("council") ||
        textLower.includes("citizen")
    ) {
        return "Zion - The Underground City";
    }

    // --- 5. FALLBACKS BASED ON COLOR ---
    // If no specific keyword is found, guess based on MTG color philosophy mapping to Matrix.
    const colors = this.getColors();
    
    if (colors.includes("Green")) return "The Matrix - Streaming Code Rain"; // Green is often the code itself
    if (colors.includes("Artifact") || this.type.includes("Artifact")) return "The Real World - Machinery";
    
    return "The Matrix Universe (General Cyberpunk)";
  }

  getVisualKeywords() {
    const context = this.getMatrixContext();
    
    if (context.includes("Simulation") || context.includes("Matrix")) {
        return "green hue, digital artifacts, glossy textures, wireframe elements, urban decay, business suits, sunglasses, bullet time motion blur";
    }
    if (context.includes("Real World")) {
        return "cold blue lighting, grime, rusted metal, heavy industrial machinery, post-apocalyptic, dark tunnels, bioluminescence";
    }
    if (context.includes("Zion")) {
        return "lava lamps, industrial piping, catwalks, sweaty skin, rags, warm underground lighting, cavernous spaces";
    }
    if (context.includes("Machine City")) {
        return "black sky, red lightning, endless towers, insectoid robots, polished black metal, orange glowing eyes";
    }
    return "cyberpunk, sci-fi noir";
  }

  generatePrompt() {
    const context = this.getMatrixContext();
    const visualStyle = this.getVisualKeywords();
    const visualContext = this.flavor.length > 0 ? this.flavor : this.text.join(" ");
    
    // Clean up text for the prompt (remove mechanics)
    const descriptiveText = visualContext
        .replace(/\{.\}/g, "") // Remove mana symbols
        .replace(/Digital|Jack-in|Eject|Override/g, "") // Remove keywords
        .substring(0, 300); // Truncate

    return `
      Generate an image.
      Subject: A high-fidelity cinematic illustration for a Magic: The Gathering card named "${this.name}".
      Type: ${this.type}
      
      Setting: ${context}.
      
      Visual Description & Mood: "${descriptiveText}"
      
      Art Style: Official Magic: The Gathering art style mixed with 1999 Cyberpunk Sci-Fi Noir. 
      Specific Visual Cues: ${visualStyle}.
      
      Directives:
      - Do not include card frames, text boxes, or mana symbols.
      - Do not include "+1/+1" counters or UI elements.
      - Focus on dramatic lighting and composition.
      - If the subject is inside the Matrix, emphasize the "unreality" or green tint.
      - If the subject is in the Real World, emphasize the grit, darkness, and "tech-rot".
      
      Aspect Ratio: 5:4.
    `.trim();
  }

  getFileName() {
    const safeName = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    // Filename includes ID (Rarity + Number) if available
    return this.id ? `${this.id}_${safeName}.png` : `${safeName}.png`;
  }
}

// ==========================================
// 3. PARSING LOGIC
// ==========================================

function parseDesignBible(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const cards = [];
  let currentCard = null;

  // Matches [C01], [U12], [R05], etc.
  const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;

  lines.forEach(line => {
    // 1. Clean the line: remove tags entirely
    let cleanLine = line.replace(/\//g, '').trim();
    
    if (!cleanLine) return;

    // 2. Check for new card start
    const idMatch = cleanLine.match(idTagRegex);
    
    if (idMatch) {
      // Save previous card if it exists
      if (currentCard) cards.push(currentCard);
      
      currentCard = new Card();
      currentCard.id = idMatch[1];
      currentCard.name = idMatch[2].trim();
      currentCard.cost = idMatch[3] || "";
      return;
    }

    // 3. Add details to current card
    if (!currentCard) return;

    // If type isn't set, the first line after the ID is usually the type
    if (!currentCard.type) {
      currentCard.type = cleanLine;
    } else if (cleanLine.startsWith("“") || cleanLine.startsWith('"')) {
      // It's flavor text
      currentCard.flavor += " " + cleanLine;
    } else {
      // It's rules text
      currentCard.text.push(cleanLine);
    }
  });

  if (currentCard) cards.push(currentCard);
  return cards;
}

// ==========================================
// 4. API INTERACTION
// ==========================================

async function generateArtForCard(aiClient, card) {
  const prompt = card.generatePrompt();
  const outputPath = path.join(OUTPUT_DIR, card.getFileName());

  if (fs.existsSync(outputPath)) {
    console.log(`[SKIP] ${card.getFileName()} already exists.`);
    return;
  }

  console.log(`\n🎨 Generating: ${card.name}`);
  console.log(`   📍 Location: ${card.getMatrixContext()}`);

  try {
    const response = await aiClient.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
    });

    let imageBase64 = null;
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (imageBase64) {
      fs.writeFileSync(outputPath, imageBase64, 'base64');
      console.log(`   ✅ Saved.`);
    } else {
      console.error(`   ❌ Failed: No image data returned.`);
    }

  } catch (error) {
    console.error(`   ❌ API Error: ${error.message}`);
  }
}

// ==========================================
// 5. MAIN EXECUTION
// ==========================================

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Could not find ${INPUT_FILE}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  console.log("------------------------------------------");
  console.log("   MATRIX SET ART GENERATOR");
  console.log("------------------------------------------");
  console.log("📖 Parsing Design Bible...");
  
  const allCards = parseDesignBible(INPUT_FILE);
  
  // Filter out existing cards
  const cardsToProcess = allCards.filter(card => {
    const fullPath = path.join(OUTPUT_DIR, card.getFileName());
    return !fs.existsSync(fullPath);
  });

  console.log(`   Found ${allCards.length} total cards.`);
  console.log(`   📝 Processing ${cardsToProcess.length} remaining cards.`);

  if (cardsToProcess.length === 0) {
    console.log("✅ All cards are already generated! Exiting.");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  for (let i = 0; i < cardsToProcess.length; i++) {
    await generateArtForCard(ai, cardsToProcess[i]);
    // Safety sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
}

main();