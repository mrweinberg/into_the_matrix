import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

// ==========================================
// CONFIGURATION
// ==========================================

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = "gemini-3-pro-image-preview";

// ==========================================
// MAIN
// ==========================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log("Usage: node resize_art.mjs <image_path> [--output <path>]");
        console.log("Example: node resize_art.mjs public/cards/C001a_hovercraft_crewman_front.png");
        process.exit(1);
    }

    const inputPath = args[0];
    const outputIndex = args.indexOf("--output");
    const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : inputPath;

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File not found: ${inputPath}`);
        process.exit(1);
    }

    // Read the original image
    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = imageBuffer.toString("base64");

    console.log(`📂 Input: ${inputPath}`);
    console.log(`📂 Output: ${outputPath}`);

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
Look at this image carefully. Recreate this exact image with:
- The same subject, composition, colors, and art style
- Adjust framing to 4:3 aspect ratio (slightly wider)
- Extend the edges naturally if needed
- Keep the main subject centered and at the same scale
- NO text, watermarks, or borders
- Match the lighting, color palette, and brushwork exactly

Generate an image based on the reference provided.
    `.trim();

    console.log("🎨 Regenerating at 4:3 aspect ratio...");

    const startTime = Date.now();

    try {
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: base64Image
                            }
                        },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                responseModalities: ["IMAGE", "TEXT"],
            },
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
            console.log(`✅ Saved to ${outputPath} (${duration}s)`);
        } else {
            console.error(`❌ Failed: No image data returned. (${duration}s)`);
            console.log("Response:", JSON.stringify(response, null, 2));
            process.exit(1);
        }

    } catch (error) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.error(`❌ Error: ${error.message} (${duration}s)`);
        process.exit(1);
    }
}

main();
