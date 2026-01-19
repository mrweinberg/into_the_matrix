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
const OUTPUT_DIR = "public/cards";

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

  // --- 1. KEYWORD PARSING ---
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
    if (fullText.includes("crew")) cues.push("Show scale relative to human pilots/drivers.");

    return cues.join(" ");
  }

  // --- 2. LIGHTING ENGINE ---
  getLighting(world = null) {
    const c = this.getSubjectColor();
    const isRealWorld = world && (world.setting.includes("Real World") || world.setting.includes("Zion") || world.setting.includes("Hovercraft") || world.setting.includes("Machine") || world.setting.includes("Power Plant") || world.setting.includes("Nebuchadnezzar"));

    // Real World gets industrial/gritty lighting, never Construct white
    if (isRealWorld) {
      if (c.includes("Red")) return "Lighting: Emergency red lighting, sparks, industrial glow.";
      if (c.includes("Green")) return "Lighting: Dim green ambient glow, industrial fluorescent.";
      return "Lighting: Low industrial lighting, shadows, rust-colored ambient glow.";
    }

    // Matrix simulation lighting - avoid mentioning objects, focus on light quality
    if (c.includes("White")) return "Lighting: Bright, harsh overhead lights, clinical white exposure.";
    if (c.includes("Blue")) return "Lighting: Cool blue ambient glow, neon signage reflections, rain-slicked surfaces.";
    if (c.includes("Black")) return "Lighting: Low-key Noir, heavy shadows, streetlamp pools of light.";
    if (c.includes("Red")) return "Lighting: Dynamic, high-contrast, sparks flying, muzzle flashes, emergency sirens.";
    if (c.includes("Green")) return "Lighting: Green-tinted ambient light, fluorescent flicker, digital code overlay in shadows.";
    return "Lighting: Cinematic, high contrast.";
  }

  // --- 3. TYPE FRAMING ---
  getFramingInstruction() {
    const t = this.type.toLowerCase();
    if (t.includes("land")) return "Framing: PANORAMIC LANDSCAPE / WIDE SHOT. Focus on the environment.";
    if (t.includes("vehicle")) return "Framing: DYNAMIC VEHICLE ACTION SHOT. Low angle or chasing perspective.";
    if (t.includes("artifact")) return "Framing: MACRO SHOT / OBJECT STUDY. Focus on the texture and machinery.";
    if (t.includes("instant") || t.includes("sorcery")) return "Framing: ABSTRACT or SYMBOLIC or DYNAMIC. If this is a specific reference, use it. Otherwise, show how this effect would be used.";
    if (t.includes("saga") || t.includes("enchantment")) return "Framing: ABSTRACT or SYMBOLIC. Can include floating code or 'glitch' overlays.";
    if (t.includes("planeswalker")) return "Framing: HEROIC PORTRAIT. Low angle, looking up at the powerful subject.";
    return "";
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
    // Match "Digital" as a keyword ability, allowing:
    // - Start of line or after comma: (?:^|,\s*)
    // - The word "Digital" (case insensitive)
    // - Followed by: comma, end of line, or reminder text in parentheses
    const strictDigitalRegex = /(?:^|,\s*)[Dd]igital(?:\s*,|\s*\(|\s*$)/i;
    return this.text.some(line => strictDigitalRegex.test(line));
  }

  getCharacterDiversity() {
    const typeLower = this.type.toLowerCase();
    const nameLower = this.name.toLowerCase();

    if (!typeLower.includes("creature")) return "";
    // Exclude non-humanoid types from diversity generation
    if (typeLower.includes("robot") || typeLower.includes("construct") || typeLower.includes("sentinel")) return "";
    if (!typeLower.includes("human") && !typeLower.includes("scout") && !typeLower.includes("soldier") && !typeLower.includes("pilot") && !typeLower.includes("citizen") && !typeLower.includes("artificer") && !typeLower.includes("advisor")) return "";
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

  // --- 4. VEHICLE LOGIC (New in V34) ---
  getVehicleVisuals() {
    const typeLower = this.type.toLowerCase();
    const nameLower = this.name.toLowerCase();

    if (!typeLower.includes("vehicle")) return "";

    // A. LEGENDARY VEHICLES (Strict Movie Accuracy)
    if (typeLower.includes("legendary")) {
      return "VEHICLE APPEARANCE: This is a LEGENDARY vehicle. It must STRICTLY resemble the specific ship/vehicle from The Matrix films as identified by the card name (e.g., The Nebuchadnezzar, The Logos). Use rusted metal textures, heavy industrial cables, and hovering magnetic pads.";
    }

    // B. GENERIC VEHICLES (Category Detection)
    if (nameLower.includes("hovercraft") || nameLower.includes("ship")) {
      return "VEHICLE APPEARANCE: Real World Hovercraft. Industrial, rusted steel hull, lightning rod antennas, glowing blue magnetic hover-pads. NOT a spaceship.";
    }
    if (nameLower.includes("apu") || nameLower.includes("walker") || nameLower.includes("suit")) {
      return "VEHICLE APPEARANCE: APU (Armored Personnel Unit). A bipedal hydraulic mech suit with open cockpit, heavy machine guns on arms, and exposed ammunition belts. Gritty industrial aesthetic.";
    }
    if (nameLower.includes("truck") || nameLower.includes("semi")) {
      return "VEHICLE APPEARANCE: Heavy Semi-Truck (1999 aesthetic). Chrome grille, boxy design, highway setting.";
    }
    if (nameLower.includes("helicopter") || nameLower.includes("chopper")) {
      return "VEHICLE APPEARANCE: Bell 212 Helicopter or similar 1990s model. Black tactical paint, side-mounted minigun.";
    }
    if (nameLower.includes("car") || nameLower.includes("sedan") || nameLower.includes("police")) {
      return "VEHICLE APPEARANCE: 1990s Black Sedan or Police Cruiser. Boxy, realistic, glossy finish.";
    }
    if (nameLower.includes("bike") || nameLower.includes("motorcycle")) {
      return "VEHICLE APPEARANCE: Ducati 996 or generic sportbike. Sleek, fast, black or dark green.";
    }

    // Default Fallback
    return "VEHICLE APPEARANCE: Industrial Machine or 1990s Vehicle. Consistent with The Matrix universe technology.";
  }

  getRobotVisuals() {
    const typeLower = this.type.toLowerCase();
    const nameLower = this.name.toLowerCase();

    // If it's a vehicle, defer to getVehicleVisuals
    if (typeLower.includes("vehicle")) return this.getVehicleVisuals();

    const isMachine = typeLower.includes("artifact creature") || typeLower.includes("robot") || typeLower.includes("construct") || typeLower.includes("thopter") || typeLower.includes("juggernaut") || typeLower.includes("horror");

    if (!isMachine) return "";

    if (nameLower.includes("sentinel") || nameLower.includes("squid") || nameLower.includes("swarm")) {
      return "ROBOT APPEARANCE: Movie-Accurate Sentinel. A floating machine with a central sensory pod (multiple red eyes) and trailing metallic tentacles. NO humanoid legs/arms.";
    }

    return "ROBOT APPEARANCE: NON-HUMANOID. Industrial, insectoid, or arachnid machinery. Use heavy cables, hydraulics, and sensor eyes. Do NOT depict as a human-shaped android or man in a suit.";
  }

  getCompositionType() {
    if (!this.type.toLowerCase().includes("creature")) return "";

    const typeLower = this.type.toLowerCase();
    const isRobot = typeLower.includes("robot") || typeLower.includes("construct");

    const roll = Math.floor(Math.random() * 100);

    // Robots get machine-appropriate compositions (no coats, no martial arts)
    if (isRobot) {
      if (roll < 25) {
        return "COMPOSITION: MENACING APPROACH. The machine advancing toward the viewer, tentacles/arms extended, red sensor eyes glowing.";
      } else if (roll < 50) {
        return "COMPOSITION: SWARM FORMATION. Multiple units in coordinated pattern, emphasizing their mechanical precision and numbers.";
      } else if (roll < 75) {
        return "COMPOSITION: MECHANICAL DETAIL. Close-up on joints, sensors, or weapons systems. Industrial texture and cold metal.";
      } else {
        return "COMPOSITION: HUNTING/SEARCHING. The machine scanning an environment, sensor pod rotating, searching for targets.";
      }
    }

    // Humanoid creatures get varied compositions
    if (roll < 35) {
      return "COMPOSITION: Use the context of the card to determine the composition.";
    } else if (roll < 45) {
      return "COMPOSITION: DYNAMIC ACTION. High kinetic energy. Mid-air kick, dodging bullets, or diving while shooting. Use motion blur and Dutch angles.";
    } else if (roll < 55) {
      return "COMPOSITION: HEROIC STANCE. The subject is standing tall, centered, looking cool and collected. Coat billowing in the wind. Iconic movie poster vibe.";
    } else if (roll < 65) {
      return "COMPOSITION: INTENSE CLOSE-UP. Focus on the face, eyes, or specific cybernetic details. Shallow depth of field, high emotion or focus.";
    } else if (roll < 80) {
      return "COMPOSITION: IMPOSING LOW ANGLE. The camera looks up at the subject, making them appear powerful and dominant. Noir lighting, strong shadows.";
    } else if (roll < 90) {
      return "COMPOSITION: ENVIRONMENTAL WIDE SHOT. The subject is placed within a massive, impressive setting. Emphasize the scale of the world.";
    } else {
      return "COMPOSITION: STEALTH / TENSION. The subject is taking cover behind a wall, peeking around a corner, or moving through shadows. Suspenseful atmosphere.";
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
    // VEHICLE CONTEXT
    if (typeLower.includes("vehicle") || combinedText.includes("emp") || combinedText.includes("scrap")) {
      if (nameLower.includes("police") || nameLower.includes("sedan") || nameLower.includes("truck") || nameLower.includes("helicopter") || nameLower.includes("ducati")) {
        return { setting: "The Matrix City Streets or Rooftops.", tone: "Slightly Desaturated, High Contrast, Green Tint", tech: TECH_1999 };
      }
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
      baseStyle = "Sleek, High-Fidelity Realism Painting. Sharp edges, polished surfaces, clear lighting. Realistic oil painting.";
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

    // UPDATED: Now fetches Vehicle Visuals if applicable
    const robotVisuals = this.getRobotVisuals();

    // NEW V33 FEATURES
    let lighting = this.getLighting(world);
    const visualKeywords = this.getVisualKeywords();
    const framingInstruction = this.getFramingInstruction();
    if (framingInstruction) {
      composition = framingInstruction;
    }

    let likenessInstruction = "";
    const override = artOverrides[this.id];
    const characterDesc = override?.character?.replace(/\.+$/, '');  // Remove trailing periods
    if (this.type.toLowerCase().includes("legendary")) {
      if (characterDesc) {
        // We have a specific character description from overrides - use it
        likenessInstruction = `LEGENDARY CHARACTER. SPECIFIC APPEARANCE: ${characterDesc}. Depict this specific character accurately.`;
      } else {
        // Legendary but no character data (might be a vehicle or unknown character)
        likenessInstruction = "LEGENDARY character/subject. Must resemble the specific character/vehicle from The Matrix films.";
      }
    } else if (this.type.toLowerCase().includes("creature")) {
      likenessInstruction = "Generic character. Do NOT resemble any specific actor from The Matrix films.";
    } else {
      likenessInstruction = "Use your judgment. Ensure diverse character representation.";
    }

    let sunglassesConstraint = "";
    if (world.setting.includes("Real World") || world.setting.includes("Zion") || world.setting.includes("Machine") || world.setting.includes("Hovercraft") || world.setting.includes("Power Plant")) {
      sunglassesConstraint = "NO SUNGLASSES. Characters in the Real World/Zion never wear sunglasses.";
    } else {
      sunglassesConstraint = "SUNGLASSES encouraged. Characteristic of the Matrix simulation.";
    }

    let visualContext = this.flavor.length > 0 ? this.flavor : this.text.join(" ");

    let subjectDescription = `Color accents: ${subjectColor}. ${likenessInstruction} ${diversity}`.trim();
    let weaponry = "WEAPONS: Modern firearms, martial arts, or lightning rifles (Real World only). No fantasy/medieval weapons.";

    if (override) {
      console.log(`   ⚡ Applying overrides for ${this.id}...`);
      if (override.setting) world.setting = override.setting;
      if (override.subject) subjectDescription = override.subject;
      if (override.composition) composition = "COMPOSITION: " + override.composition;
      if (override.artStyle) artStyle = override.artStyle;
      if (override.lighting) lighting = override.lighting;
      if (override.sunglasses === false) sunglassesConstraint = "NO SUNGLASSES for this character.";
      if (override.sunglasses === true) sunglassesConstraint = "SUNGLASSES MANDATORY for this character.";
      if (override.weaponry === false) weaponry = "";
    }

    const descriptiveText = visualContext
      .replace(/\{[^}]+\}/g, "")
      .replace(/Digital|Jack-in|Eject|Override|Scry|Ward/g, "")
      .replace(/\(Color Indicator: .*?\)/g, "")
      .replace(/\\/g, "")
      .replace(/---.*?---/g, "")  // Remove section headers like "--- MYTHICS ---"
      .replace(/\s+/g, " ")       // Collapse multiple spaces
      .trim()
      .substring(0, 600);

    // Build constraints array, filtering out empty entries
    const constraints = [
      world.tech,
      weaponry,
      robotVisuals,
      sunglassesConstraint
    ].filter(c => c && c.trim());

    // Build the numbered constraints section
    const constraintsText = constraints
      .map((c, i) => `${i + 1}. ${c.replace(/^\d+\.\s*/, '')}`)  // Remove any existing numbers, add fresh ones
      .join("\n      ");

    // Build subject details, filtering empty entries
    const subjectDetails = [subjectDescription, visualKeywords]
      .filter(s => s && s.trim())
      .map(s => `- ${s}`)
      .join("\n      ");

    return `
      Generate an image for a Magic: The Gathering card.

      CRITICAL: NO TEXT IN IMAGE. No card title, mana symbols, or text boxes. Illustration only.
      If the card name and flavor text are indicative of a specific scene from the movies, depict that scene.

      === CARD INFO ===
      Name: "${this.name}"
      Type: ${this.type}
      Universe: The Matrix (1999 film trilogy)

      === VISUAL CONSTRAINTS ===
      ${constraintsText}

      === SETTING ===
      Location: ${world.setting}
      ${lighting}
      Color Palette: ${world.tone}

      === COMPOSITION ===
      ${composition}

      === SUBJECT ===
      ${subjectDetails}

      === MOOD/ACTION ===
      ${descriptiveText || "Dramatic scene fitting the card name and type."}

      === STYLE ===
      ${artStyle}
      Dramatic lighting. Strong composition. Aspect ratio: 4:3.
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

// RETURNS: true if generated, false if skipped
async function generateArtForCard(aiClient, card, isDryRun, forceOverwrite) {
  const prompt = card.generatePrompt();
  const outputPath = path.join(OUTPUT_DIR, card.getFileName());

  if (!forceOverwrite && fs.existsSync(outputPath)) {
    // console.log(`[SKIP] ${card.getFileName()} already exists.`);
    return false; // Skipped
  }

  if (isDryRun) {
    console.log(`\n--- DRY RUN: ${card.name} (${card.isBackFace ? "BACK" : "FRONT"}) ---`);
    console.log(prompt);
    console.log("---------------------------------------------------------------");
    return false; // Dry run counts as "didn't hit API" for delay purposes usually, or you can return true if you want delay.
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
      return true; // Success
    } else {
      console.error(`   ❌ Failed: No image data returned. (${duration}s)`);
      return true; // Still hit API
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error(`   ❌ API Error: ${error.message} (${duration}s)`);
    return true; // Still hit API
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

  let specificIds = null;
  const specificIndex = args.findIndex(arg => arg === '--specific' || arg === '-s');
  if (specificIndex !== -1 && args[specificIndex + 1]) {
    // Support comma-separated list of IDs, e.g., -s M03,M09,R116
    specificIds = args[specificIndex + 1]
      .replace(/[\[\]]/g, '')
      .split(',')
      .map(id => id.trim().toUpperCase());
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
  console.log(`   MATRIX SET ART GENERATOR (V35 - Efficient Delay)`);
  if (isDryRun) console.log("   ⚠️  DRY RUN MODE ENABLED ⚠️");
  if (isForce) console.log("   🔥 FORCE MODE: OVERWRITING ALL FILES 🔥");
  if (specificIds) console.log(`   🎯 SPECIFIC MODE: Targeting Card ID(s) '${specificIds.join(", ")}'`);
  console.log("------------------------------------------");

  let cardsToProcess = [];

  if (specificIds) {
    cardsToProcess = allCards.filter(card => specificIds.includes(card.id.toUpperCase()));
    if (cardsToProcess.length === 0) {
      console.error(`❌ Error: No cards matching IDs '${specificIds.join(", ")}' found in ${INPUT_FILE}`);
      return;
    }
  } else {
    cardsToProcess = allCards;
  }

  console.log(`   Found ${allCards.length} total card faces.`);
  console.log(`   📝 Processing ${cardsToProcess.length} selected faces.`);

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  for (let i = 0; i < cardsToProcess.length; i++) {
    const forceThisCard = isForce || (specificIds !== null);

    // Capture return value
    const didGenerate = await generateArtForCard(ai, cardsToProcess[i], isDryRun, forceThisCard);

    // Only wait if we actually hit the API (and aren't in dry run mode)
    if (didGenerate && !isDryRun) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
}

main();