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
    
    // Color indicators for back faces (often have no mana cost)
    if (this.text.join(" ").includes("(Color Indicator: White)")) colors.push("Golden White");
    if (this.text.join(" ").includes("(Color Indicator: Blue)")) colors.push("Electric Blue");
    if (this.text.join(" ").includes("(Color Indicator: Black)")) colors.push("Dark Purple/Black");
    if (this.text.join(" ").includes("(Color Indicator: Red)")) colors.push("Fiery Red");
    if (this.text.join(" ").includes("(Color Indicator: Green)")) colors.push("Neon Green");

    if (colors.length === 0) {
        if (this.type.toLowerCase().includes("land")) return "Environmental Colors";
        return "Steel Grey and Chrome";
    }
    return colors.join(" and ");
  }

  /**
   * Returns true ONLY if the card explicitly has the Digital keyword ability.
   * Avoids false positives like "Target creature with Digital".
   */
  hasDigitalKeyword() {
    // Regex matches "Digital" at start of line, or after a comma, 
    // ensuring it's part of a keyword list (e.g. "Flash, Digital").
    const digitalRegex = /(^|,\s*)Digital(,\s*|$)/i;
    return this.text.some(line => digitalRegex.test(line));
  }

  /**
   * Returns the BACKGROUND setting based on the strict User Rule.
   */
  getWorldContext() {
    const nameLower = this.name.toLowerCase();
    const typeLower = this.type.toLowerCase();
    const textLower = this.text.join(" ").toLowerCase();

    // =========================================================
    // STRICT RULE: CREATURES
    // =========================================================
    if (typeLower.includes("creature")) {
        if (this.hasDigitalKeyword()) {
            // ---> IT IS IN THE MATRIX
            
            // Sub-setting flavor:
            if (textLower.includes("kung fu") || textLower.includes("monk")) {
                 return { setting: "A Japanese Dojo inside the Matrix", tone: "Warm Wood tones with subtle Green digital haze" };
            }
            if (nameLower.includes("construct") || nameLower.includes("loading")) {
                return { setting: "The Construct Loading Program", tone: "Stark Infinite White" };
            }
            if (nameLower.includes("agent") || typeLower.includes("agent")) {
                return { setting: "Corporate Office or City Street", tone: "Sterile Green and Grey" };
            }
            // Default Matrix
            return { setting: "Urban Matrix Cityscape", tone: "Desaturated Reality with a sickly Green tint" };

        } else {
            // ---> IT IS IN THE REAL WORLD
            
            // Sub-setting flavor:
            if (nameLower.includes("machine city") || nameLower.includes("01")) {
                 return { setting: "The Machine City (01)", tone: "Oppressive Black metal and Orange sky" };
            }
            if (nameLower.includes("zion") || textLower.includes("citizen") || nameLower.includes("dock")) {
                return { setting: "Zion (Underground Industrial City)", tone: "Warm Incandescent light, Molten metal, Earth tones" };
            }
            // Default Real World
            return { setting: "The Real World (Ruins / Sewers / Hovercraft Interior)", tone: "Cold Blues, Dark Greys, and Rusted Brown" };
        }
    }

    // =========================================================
    // NON-CREATURES (Fallback to heuristics)
    // =========================================================
    
    // 1. Matrix Spells/Enchantments
    if (
        nameLower.includes("code") || 
        nameLower.includes("virtual") || 
        nameLower.includes("download") ||
        nameLower.includes("blue screen") ||
        typeLower.includes("saga") // Sagas are usually historical/abstract, but let's default to Matrix for "The Machine War" etc unless specified.
    ) {
        return { setting: "Visualized Code / The Matrix", tone: "Digital Green and Black" };
    }

    // 2. Real World Artifacts/Spells
    if (
        typeLower.includes("vehicle") || 
        nameLower.includes("emp") ||
        nameLower.includes("scrap") ||
        nameLower.includes("battery")
    ) {
         return { setting: "The Real World (Industrial)", tone: "Cold Blue and Rust" };
    }
    
    // 3. Fallback for others (Lands, ambiguity)
    if (typeLower.includes("land")) {
         if (nameLower.includes("simulated") || nameLower.includes("skyline")) return { setting: "Matrix Cityscape", tone: "Green Tinted Day" };
         return { setting: "The Real World Surface", tone: "Scorched Earth" };
    }

    // Default Fallback
    return { setting: "Cinematic Matrix Universe", tone: "High Contrast Noir" };
  }

  generatePrompt() {
    const world = this.getWorldContext();
    const subjectColor = this.getSubjectColor();
    const visualContext = this.flavor.length > 0 ? this.flavor : this.text.join(" ");
    
    // Clean up text
    const descriptiveText = visualContext
        .replace(/\{.\}/g, "") 
        .replace(/Digital|Jack-in|Eject|Override|Scry|Ward/g, "")
        .replace(/\(Color Indicator: .*?\)/g, "")
        .substring(0, 300);

    return `
      Generate an image.
      Subject: A detailed illustration for a Magic: The Gathering card named "${this.name}". 
        It is set in the "Matrix" universe, use elements from the Matrix movies and aesthetic.
      Type: ${this.type}
      
      VISUAL COMPOSITION STRATEGY:
      1. THE BACKGROUND (Setting): ${world.setting}. 
         - Background Color Palette: ${world.tone}. 
         - Keep the background true to this location (e.g., if Matrix, keep it urban/greenish; if Real World, keep it cold/industrial).
      
      2. THE SUBJECT (Motif): The central character, spell effect, or object.
         - Subject Color Accent (highlights, not necessarily dominant colors): **${subjectColor}**.
      
      Description of Action/Mood: "${descriptiveText}"
      
      Art Style: Official Magic: The Gathering house style. 
      - A painterly illustration. 
      - Detailed textures (rust, cloth, digital rain, metal).
      - NOT a movie screenshot. NOT a vector graphic.
      - Do not include elements of a magic card frame, text box, or mana symbols. Only the illustration.
      
      Aspect Ratio: 5:4.
    `.trim();
  }

  getFileName() {
    let safeName = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let safeId = this.id;
    
    // Append suffix for back faces to avoid overwriting and ensure sorting
    if (this.isBackFace) {
        safeName += "_back";
        safeId += "b"; // Virtual ID for sorting
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

  const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;

  lines.forEach(line => {
    // Remove source tags
    let cleanLine = line.replace(/\\/g, '').trim();
    if (!cleanLine) return;

    // CHECK FOR SPLIT / TRANSFORM (//)
    if (cleanLine === '//') {
        if (currentCard) {
            // Mark the current card as having a back face
            currentCard.hasBackFace = true;
            cards.push(currentCard);

            // Clone ID, create new card for the Back Face
            const oldId = currentCard.id;
            currentCard = new Card();
            currentCard.id = oldId; // Same ID, getFileName handles the suffix
            currentCard.isBackFace = true;
            // The next line in the file will be the Name, so we leave currentCard.name empty
            // to be caught by the general logic below.
            return;
        }
    }

    // CHECK FOR NEW CARD ID
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

    // POPULATE CARD DETAILS
    if (!currentCard.name && currentCard.isBackFace) {
        // Special case: The first line after // is the name of the back face
        // It might look like: "Digital Avatar (Color Indicator: White)"
        // We strip the color indicator for the name field
        currentCard.name = cleanLine.replace(/\(Color Indicator: .*?\)/, '').trim();
        // We might want to store the color indicator in text to help color logic
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

  console.log(`\n🎨 Generating: ${card.name} (${card.isBackFace ? "BACK" : "FRONT"})`);
  const world = card.getWorldContext();
  console.log(`   🌍 Background: ${world.setting} (${world.tone})`);
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
  console.log("   MATRIX SET ART GENERATOR (V4 - Flip Cards & Strict Rules)");
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