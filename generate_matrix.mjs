import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import 'dotenv/config';

// ==========================================
// 1. CONFIGURATION
// ==========================================

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = "gemini-3-pro-image-preview"; 
const INPUT_FILE = "MTG INTO THE MATRIX.txt";
const OVERRIDE_FILE = "artOverrides.json";
const OUTPUT_DIR = "matrix_art_output";

const SESSION_SEED = Date.now();

const MTG_ARTISTS = [
    "Kev Walker", "John Avon", "Rebecca Guay", "Terese Nielsen", "Christopher Rush",
    "Dan Frazier", "Mark Tedin", "Rob Alexander", "Seb McKinnon", "Chris Rahn",
    "Magali Villeneuve", "Johannes Voss", "Raymond Swanland", "Wayne Reynolds",
    "Steve Argyle", "Jason Chan", "Ryan Pancoast", "Adam Paquette", "Zoltan Boros",
    "Richard Kane Ferguson"
];

let artOverrides = {};
if (fs.existsSync(OVERRIDE_FILE)) {
    try {
        const rawData = fs.readFileSync(OVERRIDE_FILE, 'utf8');
        const parsedData = JSON.parse(rawData);
        if (Array.isArray(parsedData)) {
            parsedData.forEach(item => { if (item.id) artOverrides[item.id] = item; });
        } else if (parsedData.id) {
             artOverrides[parsedData.id] = parsedData;
        }
        console.log(`   📂 Loaded ${Object.keys(artOverrides).length} art overrides.`);
    } catch (e) {
        console.error("   ⚠️ Failed to parse artOverrides.json:", e.message);
    }
}

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

  // --- 1. KEYWORD PARSING (New in V33) ---
  getVisualKeywords() {
    const fullText = this.text.join(" ").toLowerCase();
    let cues = [];

    if (fullText.includes("flying")) cues.push("Subject is AIRBORNE / LEVITATING.");
    if (fullText.includes("haste")) cues.push("Use MOTION BLUR to convey high speed.");
    if (fullText.includes("deathtouch")) cues.push("Subject's attacks trail GREEN CODE GLITCHES or POISON.");
    if (fullText.includes("trample")) cues.push("Subject looks MASSIVE, breaking through obstacles/walls.");
    if (fullText.includes("vigilance")) cues.push("Subject is ALERT, in a defensive martial arts stance.");
    if (fullText.includes("stealth") || fullText.includes("hexproof") || fullText.includes("shroud")) cues.push("Subject is partially obscured by shadows or 'bending' light.");
    if (fullText.includes("flash")) cues.push("Subject is bursting into the scene from code/nothingness.");
    if (fullText.includes("fight")) cues.push("Action shot: Mid-combat impact.");

    return cues.join(" ");
  }

  // --- 2. LIGHTING ENGINE (New in V33) ---
  getLighting() {
    const c = this.getSubjectColor(); // Reusing existing color logic helper
    if (c.includes("White")) return "Lighting: Bright, harsh interrogation lights or 'The Construct' pure white.";
    if (c.includes("Blue")) return "Lighting: Cool blue, CRT monitor glow, rain-slicked reflections.";
    if (c.includes("Black")) return "Lighting: Low-key Noir, heavy shadows, bioluminescent red/pink ambient glow (if Real World).";
    if (c.includes("Red")) return "Lighting: Dynamic, high-contrast, sparks flying, muzzle flashes, emergency red sirens.";
    if (c.includes("Green")) return "Lighting: Iconic 'Matrix Green' tint, fluorescent office flicker, code cascading in shadows.";
    return "Lighting: Cinematic, high contrast.";
  }

  // --- 3. TYPE FRAMING (New in V33) ---
  getFramingInstruction() {
    const t = this.type.toLowerCase();
    if (t.includes("land")) return "Framing: PANORAMIC LANDSCAPE / WIDE SHOT. Focus on the environment.";
    if (t.includes("artifact")) return "Framing: MACRO SHOT / OBJECT STUDY. Focus on the texture and machinery.";
    if (t.includes("instant") || t.includes("sorcery")) return "Framing: DYNAMIC ACTION SHOT. Capture the exact moment the spell's effect occurs.";
    if (t.includes("saga") || t.includes("enchantment")) return "Framing: ABSTRACT or SYMBOLIC. Can include floating code or 'glitch' overlays.";
    if (t.includes("planeswalker")) return "Framing: HEROIC PORTRAIT. Low angle, looking up at the powerful subject.";
    return ""; // Default for creatures handled by getCompositionType
  }

  getSubjectColor() {
    const colors = [];
    if (this.cost && this.cost.includes("{W}")) colors.push("Golden White");
    if (this.cost && this.cost.includes("{U}")) colors.push("Electric Blue");
    if (this.cost && this.cost.includes("{B}")) colors.push("Dark Purple/Black");
    if (this.cost && this.cost.includes("{R}")) colors.push("Fiery Red");
    if (this.cost && this.cost.includes("{G}")) colors.push("Neon Green");
    
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

  hasDigitalKeyword() {
    const strictDigitalRegex = /(?:^|,\s*)Digital(?:\s*,|\s*$)/i;
    return this.text.some(line => strictDigitalRegex.test(line));
  }

  getCharacterDiversity() {
    const typeLower = this.type.toLowerCase();
    const nameLower = this.name.toLowerCase();

    if (!typeLower.includes("creature")) return "";
    if (!typeLower.includes("human") && !typeLower.includes("scout") && !typeLower.includes("soldier") && !typeLower.includes("pilot")) return "";
    if (typeLower.includes("legendary")) return "";

    const knownCharacters = ["neo", "morpheus", "trinity", "smith", "oracle", "seraph", "niobe", "ghost", "merovingian", "persephone", "keymaker", "architect"];
    if (knownCharacters.some(char => nameLower.includes(char))) {
        return ""; 
    }

    if (nameLower.includes("agent") || typeLower.includes("agent")) {
        return "Appearance: Uniform Male Agent, caucasian, identical suit and sunglasses.";
    }

    const uniqueString = this.id + SESSION_SEED;
    let hash = 0;
    for (let i = 0; i < uniqueString.length; i++) {
        hash = uniqueString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    const genders = ["Male", "Female"];
    const ethnicities = [
        "African descent", "Asian descent", "Caucasian", "Latino/Hispanic descent", 
        "Middle Eastern descent", "South Asian descent", "Mixed heritage"
    ];

    const randomGender = genders[seed % genders.length];
    const randomEthnicity = ethnicities[(seed * 3) % ethnicities.length];

    return `Character Appearance: ${randomGender}, ${randomEthnicity}. (Consistent Identity).`;
  }

  getRobotVisuals() {
    const typeLower = this.type.toLowerCase();
    const nameLower = this.name.toLowerCase();

    const isMachine = typeLower.includes("artifact creature") || typeLower.includes("robot") || typeLower.includes("construct") || typeLower.includes("thopter") || typeLower.includes("juggernaut") || typeLower.includes("horror");
    
    if (!isMachine) return "";

    if (nameLower.includes("sentinel") || nameLower.includes("squid") || nameLower.includes("swarm")) {
        return "ROBOT APPEARANCE: Movie-Accurate Sentinel. A floating machine with a central sensory pod (multiple red eyes) and trailing metallic tentacles. NO humanoid legs/arms.";
    }

    return "ROBOT APPEARANCE: NON-HUMANOID. Industrial, insectoid, or arachnid machinery. Use heavy cables, hydraulics, and sensor eyes. Do NOT depict as a human-shaped android or man in a suit.";
  }

  getCompositionType() {
    if (!this.type.toLowerCase().includes("creature")) return "";

    const roll = Math.floor(Math.random() * 100);

    if (roll < 20) {
        return "COMPOSITION: DYNAMIC ACTION. High kinetic energy. Mid-air kick, dodging bullets, or diving while shooting. Use motion blur and Dutch angles.";
    } else if (roll < 40) {
        return "COMPOSITION: HEROIC STANCE. The subject is standing tall, centered, looking cool and collected. Coat billowing in the wind. Iconic movie poster vibe.";
    } else if (roll < 60) {
        return "COMPOSITION: INTENSE CLOSE-UP. Focus on the face, sunglasses reflections, or specific cybernetic details. Shallow depth of field, high emotion or focus.";
    } else if (roll < 75) {
        return "COMPOSITION: IMPOSING LOW ANGLE. The camera looks up at the subject, making them appear powerful and dominant. Noir lighting, strong shadows.";
    } else if (roll < 90) {
        return "COMPOSITION: ENVIRONMENTAL WIDE SHOT. The subject is small within a massive, impressive setting. Emphasize the scale of the world.";
    } else {
        return "COMPOSITION: STEALTH / TENSION. The subject is taking cover behind a wall, peeking around a corner, or hacking a terminal in the shadows. Suspenseful atmosphere.";
    }
  }

  getWorldContext() {
    const nameLower = this.name.toLowerCase();
    const typeLower = this.type.toLowerCase();
    const textLower = this.text.join(" ").toLowerCase();
    const flavorLower = this.flavor.toLowerCase();
    const combinedText = nameLower + " " + textLower + " " + flavorLower;

    const TECH_1999 = "TECHNOLOGY LEVEL: Late 1990s Contemporary. Standard wheeled cars, helicopters, CRT monitors. NO hovercars. NO spaceships.";
    const TECH_SCIFI = "TECHNOLOGY LEVEL: Post-Apocalyptic Sci-Fi. Hovercrafts with magnetic pads, walkers (APUs), lightning rifles, tesla coils, rusted heavy machinery.";
    const TECH_SURREAL = "TECHNOLOGY LEVEL: Surreal/Digital. Abstract code, glitch effects, impossible geometry.";

    // === CREATURE LOGIC ===
    if (typeLower.includes("creature")) {
        if (this.hasDigitalKeyword()) {
            if (combinedText.includes("kung fu") || combinedText.includes("monk") || combinedText.includes("dojo")) {
                 return { setting: "A Japanese Dojo Simulation. Features: Rice paper walls, wooden floors.", tone: "Warm Wood, Clean Light, Golden Hues", tech: "Traditional / Minimal" };
            }
            if (nameLower.includes("construct") || nameLower.includes("loading") || nameLower.includes("white")) {
                return { setting: "The Construct Loading Program. Features: Infinite white void, racks of guns.", tone: "Stark Infinite White Void", tech: "Clean Digital" };
            }
            if (nameLower.includes("agent") || typeLower.includes("agent") || combinedText.includes("security")) {
                return { setting: "Government/Corporate Building. Sterile Office Lobby or Concrete Interrogation Room.", tone: "Sterile, Green-tinted Fluorescent", tech: TECH_1999 };
            }
            if (combinedText.includes("club") || combinedText.includes("chateau") || combinedText.includes("french")) {
                return { setting: "The Merovingian's Territory. Club Hel (Industrial fetish club) or The Chateau (Grand staircase).", tone: "Rich Reds, Deep Shadows, Decadent Gold", tech: TECH_1999 };
            }
            if (combinedText.includes("subway") || combinedText.includes("train") || combinedText.includes("station")) {
                return { setting: "Matrix Subway Station. Features: White tiled walls, graffiti, concrete platforms.", tone: "Dirty White, Greenish Florescent, Grimy", tech: TECH_1999 };
            }
            return { 
                setting: "The Matrix City (1999 Aesthetic). Skyscraper rooftop, busy city street, or alleyway.", 
                tone: "Slightly Desaturated, High Contrast, Green Tint",
                tech: TECH_1999
            };
        } else {
            if (nameLower.includes("machine city") || nameLower.includes("01")) {
                 return { setting: "The Machine City (01). Features: Endless black towers, red lightning storms, swarms of sentinels.", tone: "Oppressive Black metal and Glowing Orange Sky", tech: TECH_SCIFI };
            }
            if (nameLower.includes("zion") || textLower.includes("citizen") || nameLower.includes("dock") || nameLower.includes("temple")) {
                return { 
                    setting: "Zion (The Last City). Choose: The Dock (Cavernous), The Temple (Cave), or Engineering (Industrial).", 
                    tone: "Warm Earthy Tones, Incandescent lighting, Sweat, Metal, Stone",
                    tech: TECH_SCIFI
                };
            }
            if (combinedText.includes("pod") || combinedText.includes("farm") || combinedText.includes("harvest")) {
                return { setting: "The Power Plant / Fetus Fields. Endless towers of pink glowing pods.", tone: "Bioluminescent Pink, Dark Machinery, Slime", tech: TECH_SCIFI };
            }
            if (combinedText.includes("ship") || combinedText.includes("hovercraft") || combinedText.includes("operator")) {
                return { setting: "Hovercraft Interior (Nebuchadnezzar class). Cramped corridors, hanging cables, screens.", tone: "Cold Blue LEDs, Rusted Metal, Dim Lighting", tech: TECH_SCIFI };
            }
            return { 
                setting: "The Real World Wasteland. Scorched sky, lightning, shattered ruins, or sewer tunnels.", 
                tone: "Cold Blues, Dark Greys, Rusted Metal, Stormy",
                tech: TECH_SCIFI
            };
        }
    }

    if (combinedText.includes("code") || combinedText.includes("virtual") || combinedText.includes("download") || combinedText.includes("blue screen")) {
        return { setting: "Abstract Visualization of Data. Features: Cascading Green Code, glitches.", tone: "Surreal, Neon Green, Black Background", tech: TECH_SURREAL };
    }
    if (typeLower.includes("vehicle") || combinedText.includes("emp") || combinedText.includes("scrap")) {
         return { setting: "The Real World Sewers or Surface. Hovercrafts, sparks flying.", tone: "Cold Blue, Rust, Industrial", tech: TECH_SCIFI };
    }
    if (typeLower.includes("land")) {
         if (nameLower.includes("simulated") || nameLower.includes("skyline")) return { setting: "Matrix Cityscape Skyline", tone: "Simulated Daylight, Green Tint", tech: TECH_1999 };
         if (nameLower.includes("zion") || nameLower.includes("living")) return { setting: "Zion (Dock or Living Quarters)", tone: "Warm Incandescent, Stone", tech: TECH_SCIFI };
         if (nameLower.includes("machine") || nameLower.includes("01")) return { setting: "01 The Machine City", tone: "Black and Orange", tech: TECH_SCIFI };
         return { setting: "The Real World Surface (Ruins)", tone: "Dark, Stormy, Scorched", tech: TECH_SCIFI };
    }

    return { setting: "The Matrix Universe (General)", tone: "Cinematic Sci-Fi Noir", tech: "1999 Aesthetic" };
  }

  getArtStyle() {
    const world = this.getWorldContext();
    const typeLower = this.type.toLowerCase();

    let baseStyle = "Official Magic: The Gathering House Style.";
    if (typeLower.includes("instant") || typeLower.includes("sorcery") || typeLower.includes("enchantment")) {
        baseStyle = "Abstract Surrealism or Dynamic Action Illustration.";
    } else if (world.setting.includes("Real World") || world.setting.includes("Zion") || world.setting.includes("Machine")) {
        baseStyle = "Gritty Impasto Realism. Heavy texture, emphasis on rust, sweat, grime. Classical oil painting vibe.";
    } else if (world.setting.includes("Matrix") || world.setting.includes("Construct") || world.setting.includes("City")) {
        baseStyle = "Sleek, High-Fidelity Realism. Sharp edges, polished surfaces, clear lighting. 90s sci-fi concept art.";
    }

    const roll = Math.floor(Math.random() * 100); 

    if (roll < 50) {
        const artistIndex = Math.floor(Math.random() * MTG_ARTISTS.length);
        const artist = MTG_ARTISTS[artistIndex];
        return `Style of ${artist}.`; 
    }

    return baseStyle;
  }

  generatePrompt() {
    let world = this.getWorldContext();
    const subjectColor = this.getSubjectColor();
    let artStyle = this.getArtStyle();
    let diversity = this.getCharacterDiversity();
    let composition = this.getCompositionType();
    const robotVisuals = this.getRobotVisuals();
    
    // NEW V33 FEATURES
    let lighting = this.getLighting(); 
    const visualKeywords = this.getVisualKeywords();
    const framingInstruction = this.getFramingInstruction(); 
    if (framingInstruction) {
        // Override random composition for specific types (Lands/Spells)
        composition = framingInstruction;
    }
    
    let likenessInstruction = "";
    if (this.type.toLowerCase().includes("legendary")) {
        likenessInstruction = "CHARACTER IDENTITY: This is a LEGENDARY character. The illustration MUST strictly resemble the specific character/actor as they appear in The Matrix films.";
    } else if (this.type.toLowerCase().includes("creature")) {
        likenessInstruction = "CHARACTER IDENTITY: Generic character. Do NOT resemble any specific actor/character from The Matrix films.";
    } else {
        likenessInstruction = "CHARACTER IDENTITY: N/A. Use your judgment based on the subject. Ensure that characters generated are diverse.";
    }

    let sunglassesConstraint = "";
    if (world.setting.includes("Real World") || world.setting.includes("Zion") || world.setting.includes("Machine")) {
        sunglassesConstraint = "6. NO SUNGLASSES. Characters in the Real World/Zion do NOT wear sunglasses.";
    } else {
        sunglassesConstraint = "6. Sunglasses are characteristic of the Matrix simulation.";
    }

    let visualContext = this.flavor.length > 0 ? this.flavor : this.text.join(" ");
    
    const override = artOverrides[this.id];
    let subjectDescription = `Main focus features **${subjectColor}** accents. ${likenessInstruction} ${diversity}`;
    
    if (override) {
        console.log(`   ⚡ Applying overrides for ${this.id}...`);
        if (override.setting) world.setting = override.setting;
        if (override.subject) subjectDescription = override.subject; 
        if (override.composition) composition = "COMPOSITION: " + override.composition;
        if (override.artStyle) artStyle = override.artStyle;
        if (override.lighting) lighting = override.lighting;
        if (override.sunglasses === false) sunglassesConstraint = "6. NO SUNGLASSES.";
        if (override.sunglasses === true) sunglassesConstraint = "6. Sunglasses are MANDATORY.";
    }

    const descriptiveText = visualContext
        .replace(/\{[^}]+\}/g, "") 
        .replace(/Digital|Jack-in|Eject|Override|Scry|Ward/g, "")
        .replace(/\(Color Indicator: .*?\)/g, "")
        .replace(/\\/g, "") 
        .substring(0, 600);

    return `
      Generate an image.
      MANDATORY: NO TEXT. Do not render the card title, mana cost, or text box. This is an illustration ONLY.
      
      Subject: An illustration for a Magic: The Gathering card named "${this.name}". 
      Universe: The Matrix (Sci-Fi / Cyberpunk).
      Type: ${this.type}
      
      STRICT VISUAL CONSTRAINTS:
      1. ${world.tech} (Strictly adhere to this era).
      4. WEAPONRY: Modern firearms, martial arts, or futuristic lightning rifles (only if Real World).
      5. ${robotVisuals}
      ${sunglassesConstraint}
      
      **SCENE RECOGNITION PROTOCOL:**
      - ANALYZE the Card Name: "${this.name}".
      - Does this name refer to a specific, iconic scene or shot from The Matrix movies?
      - IF YES: Prioritize depicting that specific scene.
      - IF NO: Use the Setting, Subject, and Composition details below.
      
      FALLBACK SETTING & TONE (Use if not a specific movie scene):
      - Location: ${world.setting}.
      - ${lighting}
      - Color Palette/Mood: ${world.tone}.
      - ${composition}
      
      SUBJECT DETAILS:
      - ${subjectDescription}
      - ${visualKeywords}
      
      ACTION/MOOD DESCRIPTION: "${descriptiveText}"
      
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

  const sourceTagRegex = /\\/gi;
  const backslashRegex = /\\/g;
  const idTagRegex = /^\[([A-Z]+\d+)\]\s+(.+?)(?:\s+(\{.*\})\s*)?$/;

  lines.forEach(line => {
    let cleanLine = line
        .replace(sourceTagRegex, '')  
        .replace(backslashRegex, '')  
        .trim();
    
    if (!cleanLine) return;

    if (cleanLine === '//') {
        if (currentCard) {
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
      if (currentCard) cards.push(currentCard);
      
      currentCard = new Card();
      currentCard.id = idMatch[1];
      currentCard.name = idMatch[2].trim();
      currentCard.cost = idMatch[3] || "";
      return;
    }

    if (!currentCard) return;

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

async function generateArtForCard(aiClient, card, isDryRun, forceOverwrite) {
  const prompt = card.generatePrompt();
  const outputPath = path.join(OUTPUT_DIR, card.getFileName());

  if (!forceOverwrite && fs.existsSync(outputPath)) {
    console.log(`[SKIP] ${card.getFileName()} already exists.`);
    return;
  }

  if (isDryRun) {
      console.log(`\n--- DRY RUN: ${card.name} (${card.isBackFace ? "BACK" : "FRONT"}) ---`);
      console.log(prompt);
      console.log("---------------------------------------------------------------");
      return;
  }

  const world = card.getWorldContext();
  const isDigital = card.hasDigitalKeyword();
  
  console.log(`\n🎨 Generating: ${card.name} (${card.isBackFace ? "BACK" : "FRONT"})`);
  console.log(`   🔍 Digital: ${isDigital} -> ${isDigital ? "MATRIX" : "REAL WORLD"}`);
  console.log(`   🌍 Setting: ${world.setting}`);
  
  const startTime = Date.now();

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

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (imageBase64) {
      fs.writeFileSync(outputPath, imageBase64, 'base64');
      console.log(`   ✅ Saved to ${outputPath} (${duration}s)`);
    } else {
      console.error(`   ❌ Failed: No image data returned. (${duration}s)`);
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error(`   ❌ API Error: ${error.message} (${duration}s)`);
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

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dryrun') || args.includes('-d');
  const isForce = args.includes('--force') || args.includes('-f');
  const isCleanup = args.includes('--cleanup') || args.includes('-c');
  
  let specificId = null;
  const specificIndex = args.findIndex(arg => arg === '--specific' || arg === '-s');
  if (specificIndex !== -1 && args[specificIndex + 1]) {
    specificId = args[specificIndex + 1].replace(/[\[\]]/g, ''); 
  }

  const allCards = parseDesignBible(INPUT_FILE);

  if (isCleanup) {
      console.log("------------------------------------------");
      console.log("🧹  CLEANUP MODE INITIATED");
      console.log("------------------------------------------");
      const validFilenames = new Set(allCards.map(c => c.getFileName()));
      const filesInDir = fs.readdirSync(OUTPUT_DIR);
      let deletedCount = 0;
      filesInDir.forEach(file => {
          if (file.endsWith(".png")) {
              if (!validFilenames.has(file)) {
                  console.log(`   🗑️  Deleting orphan file: ${file}`);
                  fs.unlinkSync(path.join(OUTPUT_DIR, file));
                  deletedCount++;
              }
          }
      });
      console.log(`   ✅ Cleanup complete. Removed ${deletedCount} orphan files.`);
      return; 
  }

  console.log("------------------------------------------");
  console.log(`   MATRIX SET ART GENERATOR (V33 - Enhanced Detail)`);
  if (isDryRun) console.log("   ⚠️  DRY RUN MODE ENABLED ⚠️");
  if (isForce) console.log("   🔥 FORCE MODE: OVERWRITING ALL FILES 🔥");
  if (specificId) console.log(`   🎯 SPECIFIC MODE: Targeting Card ID '${specificId}'`);
  console.log("------------------------------------------");
  
  let cardsToProcess = [];

  if (specificId) {
      cardsToProcess = allCards.filter(card => card.id === specificId);
      if (cardsToProcess.length === 0) {
          console.error(`❌ Error: Card ID '${specificId}' not found in ${INPUT_FILE}`);
          return;
      }
  } else {
      cardsToProcess = allCards; 
  }

  console.log(`   Found ${allCards.length} total card faces.`);
  console.log(`   📝 Processing ${cardsToProcess.length} selected faces.`);

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  for (let i = 0; i < cardsToProcess.length; i++) {
    const forceThisCard = isForce || (specificId !== null);
    await generateArtForCard(ai, cardsToProcess[i], isDryRun, forceThisCard);
    
    if (!isDryRun) {
        await new Promise(r => setTimeout(r, 100));
    }
  }
}

main();