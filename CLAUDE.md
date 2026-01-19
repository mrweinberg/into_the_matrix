# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Magic: The Gathering fan set creator for "Into The Matrix" (ITM) - a 251-card set themed around The Matrix movie trilogy. The project generates AI artwork using Google's Gemini AI and creates an interactive HTML gallery website.

## Commands

### Generate Card Artwork
```bash
node generate_matrix.mjs [options]
```
Options:
- `--dryrun` / `-d`: Preview prompts without API calls
- `--force` / `-f`: Regenerate all artwork, overwriting existing
- `--specific <card_id>` / `-s <card_id>`: Generate for specific card (e.g., `-s C01`, `-s M03`)
- `--cleanup` / `-c`: Remove orphan files not matching any card

### Resize Artwork to 4:3
```bash
node resize_art.mjs
```
Use this script to batch resize 5:4 images to 4:3 using Gemini image generation (editing mode).

### Generate Card Data
```bash
npm run generate-data
```
Generates `cards.json`, `notes.json`, and `setInfo.json` in `src/data/`.

### Install Dependencies
```bash
npm install
```

## Architecture

### Card Data Flow
1. **Source of Truth**: `MTG INTO THE MATRIX.txt` (Text file with card definitions)
2. **Generators**: `generate_data.mjs` parses this into JSON for the frontend.
3. **Card IDs**: `[X##]` where X is rarity (C/U/R/M) and ## is the number.

### Key Files
- **generate_matrix.mjs**: AI art generation with Gemini API
  - Uses `artOverrides.json` for per-card prompt customizations
  - Output goes to `public/cards/` directory
- **resize_art.mjs**: Ensures all art is 4:3 aspect ratio
- **fix_syntax.mjs**: Standardizes card text syntax (modern wording)

- **generate_data.mjs**: Card data JSON generation
  - Parses `MTG INTO THE MATRIX.txt` into JSON format
  - Generates `cards.json`, `notes.json`, and `setInfo.json` in `src/data/`

### File Naming Convention
Card art files: `public/cards/{ID}{suffix}_{sanitized_name}.png`
- Transform card fronts: `{ID}a_{name}_front.png`
- Transform card backs: `{ID}b_{name}_back.png`

## Environment Variables

Requires `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key
```

## Important Notes

- Art generation uses 100ms delay between API calls
- Transform cards are indicated by `//` separator in the source file
- The `artOverrides.json` file allows overriding default prompt generation for specific cards
- Card rarity is derived from the ID prefix, not parsed from the source file
