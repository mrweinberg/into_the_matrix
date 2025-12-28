import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import 'dotenv/config';

// ==========================================
// 1. CONFIGURATION
// ==========================================

const API_KEY = process.env.GEMINI_API_KEY;

// Using the Gemini 3 model for image generation
const MODEL_ID = "gemini-3-pro-image-preview"; 

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
    this.isBackFace = false;
    this.hasBackFace = false; 
  }

  /**
   * Returns the color of the MAGIC or SUBJECT.
   */
  getSubjectColor() {
    const colors = [];
    if (this.cost && this.cost.includes("{W}")) colors.push("Golden White");
    if (this.cost && this.cost.includes("{U}")) colors.push("Electric Blue");
    if (this.cost && this.cost.includes("{B}")) colors.push("Dark Purple/Black");
    if (this.cost && this.cost.includes("{R}")) colors.push("Fiery Red");
    if (this.cost && this.cost.includes("{G}")) colors.push("Neon Green");
    
    // Check text for Color Indicators (common on back faces)
    const fullText = this.text.join(" ");
    if (fullText.includes("Color Indicator: White")) colors.push("Golden White");
    if (fullText.includes("Color Indicator: Blue")) colors.push("Electric Blue");
    if (fullText.includes("Color Indicator: Black")) colors.push("Dark Purple/Black");
    if (fullText.includes("Color Indicator: Red")) colors.push("Fiery Red");
    if (fullText.includes("Color Indicator: Green")) colors.push("Neon Green");

    if (colors.length === 0) {
        if (this.type.toLowerCase().includes("land")) return "Environmental Colors";
        return "Steel Grey and Chrome";
    }
    return colors.join(" and ");
  }

  /**
   * STRICT CHECK: Does this card have the Digital keyword ability?
   */
  hasDigitalKeyword() {
    // Regex matches "Digital" at start of line, or after a comma/space.
    const digitalRegex = /(?:^|[\s,])Digital(?:[\s,.]|$)/i;
    return this.text.some(line => digitalRegex.test(line));
  }

  /**
   * STRICT SETTING RULE:
   * 1. Creature + Digital = THE MATRIX
   * 2. Creature + !Digital = THE REAL WORLD
   * 3. Non-Creature = Heuristic
   */
  getWorldContext() {
    const nameLower = this.name.toLowerCase();
    const typeLower = this.type.toLowerCase();
    const textLower = this.text.join(" ").toLowerCase();

    // === CREATURE LOGIC (HARD RULES) ===
    if (typeLower.includes("creature")) {
        if (this.hasDigitalKeyword()) {
            // ---> INSIDE THE MATRIX
            if (textLower.includes("kung fu") || textLower.includes("monk")) {
                 return { setting: "A Japanese Dojo Simulation", tone: "Warm Wood, Rice Paper, Clean Light" };
            }
            if (nameLower.includes("construct") || nameLower.includes("loading")) {
                return { setting: "The Construct Loading Program", tone: "Stark Infinite White Void" };
            }
            if (nameLower.includes("agent") || typeLower.includes("agent")) {
                return { setting: "Corporate Government Building", tone: "Sterile, Bureaucratic, Impersonal" };
            }
            // Standard Matrix
            return { setting: "1999 Urban Cityscape (Simulated Reality)", tone: "Slightly Desaturated, High Contrast, Concrete and Glass" };

        } else {
            // ---> THE REAL WORLD
            if (nameLower.includes("machine city") || nameLower.includes("01")) {
                 return { setting: "The Machine City (01)", tone: "Oppressive Black metal and Orange sky" };
            }
            if (nameLower.includes("zion") || textLower.includes("citizen") || nameLower.includes("dock")) {
                return { setting: "Zion (The Last City) - Can be open cavernous docks or industrial walkways", tone: "Warm Incandescent light, Molten metal, Stone" };
            }
            // Standard Real World
            return { setting: "The Real World (Ruins of the Surface, Sewers, or Hovercraft Interior)", tone: "Cold Blues, Dark Greys, Rusted Metal" };
        }
    }

    // === NON-CREATURE LOGIC (HEURISTICS) ===
    
    // Matrix Spells/Enchantments
    if (
        nameLower.includes("code") || 
        nameLower.includes("virtual") || 
        nameLower.includes("download") ||
        nameLower.includes("blue screen") ||
        typeLower.includes("saga")
    ) {
        return { setting: "Abstract Visualization of Data Streams", tone: "Surreal, Neon, Digital" };
    }

    // Real World Artifacts
    if (
        typeLower.includes("vehicle") || 
        nameLower.includes("emp") || 
        nameLower.includes("scrap") || 
        nameLower.includes("battery")
    ) {
         return { setting: "The Real World (Industrial)", tone: "Cold Blue and Rust" };
    }
    
    // Lands
    if (typeLower.includes("land")) {
         if (nameLower.includes("simulated") || nameLower.includes("skyline")) return { setting: "Matrix Cityscape", tone: "Simulated Daylight" };
         return { setting: "The Real World Surface", tone: "Dark, Stormy, Scorched" };
    }

    // Default Fallback
    return { setting: "The Matrix Universe", tone: "Cinematic Sci-Fi Noir" };
  }

  /**
   * Selects an art style based on type and location.
   */
  getArtStyle() {
    const world = this.getWorldContext();
    const typeLower = this.type.toLowerCase();

    // 1. Instants/Sorceries
    if (typeLower.includes("instant") || typeLower.includes("sorcery") || typeLower.includes("enchantment")) {
        return "Abstract Surrealism or Dynamic Action Illustration. Represent the manipulation of reality.";
    }

    // 2. Real World (Gritty)
    if (world.setting.includes("Real World") || world.setting.includes("Zion")) {
        return "Gritty Impasto Realism. Heavy texture, emphasis on rust, sweat, and fabric. Classical oil painting vibe.";
    }

    // 3. Matrix / Construct (Clean)
    if (world.setting.includes("Matrix") || world.setting.includes("Construct") || world.setting.includes("City")) {
        return "Sleek, High-Fidelity Realism. Sharp edges, polished surfaces, clear lighting. Resembles 90s sci-fi concept art.";
    }

    // 4. Default
    return "Official Magic: The Gathering House Style. A balance of realism and painterly expression.";
  }

  generatePrompt() {
    const world = this.getWorldContext();
    const subjectColor = this.getSubjectColor();
    const artStyle = this.getArtStyle();
    
    let visualContext = this.flavor.length > 0 ? this.flavor : this.text.join(" ");
    
    // FIXED REGEX BLOCK
    const descriptiveText = visualContext
        .replace(/\{[^}]+\}/g, "") // Remove {W}, {1}, etc.
        .replace(/Digital|Jack-in|Eject|Override|Scry|Ward/g, "")
        .replace(/\(Color Indicator: .*?\)/g, "")
        .replace(/\\/g, "") 
        .substring(0, 300);

    return `
      Generate an image.
      
      MANDATORY: NO TEXT. Do not render the card title, mana cost, or text box. This is an illustration ONLY.
      
      Subject: An illustration for a Magic: The Gathering card named "${this.name}". 
      Universe: The Matrix.
      Type: ${this.type}
      
      SETTING & TONE:
      - Location: ${world.setting}.
      - Color Palette/Mood: ${world.tone}.
      - Note: If in the Matrix, keep it clean and urban. If in the Real World, keep it dirty and industrial.
      
      SUBJECT DETAILS:
      - The main focus (Character/Object) should feature **${subjectColor}** accents.
      - Contrast the subject against the background.
      
      ACTION DESCRIPTION: "${descriptiveText}"
      
      ART STYLE: ${artStyle}
      - Use dramatic lighting and strong composition.
      
      Aspect Ratio: 5:4.
    `.trim();
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
}

// ==========================================
// 3. PARSING LOGIC
// ==========================================

function parseDesignBible(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const cards = [];
  let currentCard = null;

  // Regex to match 
  const sourceTagRegex = /\\/g;
  
  // Regex to match Card ID [C01]
  const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;

  lines.forEach(line => {
    // 1. Clean the line of source tags
    let cleanLine = line.replace(sourceTagRegex, '').trim();
    if (!cleanLine) return;

    // 2. CHECK FOR SPLIT / TRANSFORM (//)
    if (cleanLine === '//') {
        if (currentCard) {
            // Mark Front Face
            currentCard.hasBackFace = true;
            cards.push(currentCard);

            // Create Back Face
            const oldId = currentCard.id;
            currentCard = new Card();
            currentCard.id = oldId;
            currentCard.isBackFace = true;
            return;
        }
    }

    // 3. CHECK FOR NEW CARD ID
    const idMatch = cleanLine.match(idTagRegex);
    if (idMatch) {
      if (currentCard) cards.push(currentCard);
      
      currentCard = new Card();
      currentCard.id = idMatch[1];
      currentCard.name = idMatch[2].trim();
      currentCard.cost = idMatch[3] || "";
      return;
    }

    if (!currentCard) return;

    // 4. POPULATE CARD DETAILS
    if (!currentCard.name && currentCard.isBackFace) {
        currentCard.name = cleanLine.replace(/\(Color Indicator: .*?\)/, '').trim();
        if (cleanLine.includes("Color Indicator")) {
            currentCard.text.push(cleanLine);
        }
    } else if (!currentCard.type) {
      currentCard.type = cleanLine;
    } else if (cleanLine.startsWith("“") || cleanLine.startsWith('"')) {
      currentCard.flavor += " " + cleanLine;
    } else {
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

  // Console Logging for Debugging
  const world = card.getWorldContext();
  const isDigital = card.hasDigitalKeyword();
  
  console.log(`\n🎨 Generating: ${card.name} (${card.isBackFace ? "BACK" : "FRONT"})`);
  console.log(`   🔍 Digital: ${isDigital} -> ${isDigital ? "MATRIX" : "REAL WORLD"}`);
  console.log(`   🌍 Setting: ${world.setting}`);
  console.log(`   ✨ Subject Color: ${card.getSubjectColor()}`);

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
  console.log("   MATRIX SET ART GENERATOR (V7 - Fixed Regex)");
  console.log("------------------------------------------");
  
  const allCards = parseDesignBible(INPUT_FILE);
  
  const cardsToProcess = allCards.filter(card => {
    const fullPath = path.join(OUTPUT_DIR, card.getFileName());
    return !fs.existsSync(fullPath);
  });

  console.log(`   Found ${allCards.length} total card faces.`);
  console.log(`   📝 Processing ${cardsToProcess.length} remaining faces.`);

  if (cardsToProcess.length === 0) {
    console.log("✅ All cards are already generated! Exiting.");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  for (let i = 0; i < cardsToProcess.length; i++) {
    await generateArtForCard(ai, cardsToProcess[i]);
    // Safety sleep
    await new Promise(r => setTimeout(r, 500));
  }
}

main();