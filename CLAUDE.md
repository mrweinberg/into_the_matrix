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
1. `MTG INTO THE MATRIX.txt` - Source of truth for all card designs, mechanics, and flavor text
2. Both generators parse this file using similar regex-based parsing logic
3. Card IDs follow the pattern `[X##]` where X is rarity prefix (C=Common, U=Uncommon, R=Rare, M=Mythic) and ## is the number

### Key Files
- **generate_matrix.mjs**: AI art generation with Gemini API
  - `Card` class with prompt generation methods (`generatePrompt()`, `getWorldContext()`, `getLighting()`, etc.)
  - Handles transform cards (front/back faces) via `//` separator in source file
  - Uses `artOverrides.json` for per-card prompt customizations
  - Output goes to `public/cards/` directory

- **generate_data.mjs**: Card data JSON generation
  - Parses `MTG INTO THE MATRIX.txt` into JSON format
  - Generates `cards.json`, `notes.json`, and `setInfo.json` in `src/data/`
  - Includes comprehensive set statistics

### Art Generation Logic
The prompt system in `generate_matrix.mjs` has several layers:
- **World Context**: Differentiates Matrix simulation vs Real World based on `Digital` keyword
- **Character Diversity**: Deterministic random appearance for non-legendary humans
- **Vehicle/Robot Visuals**: Type-specific rendering instructions
- **Lighting Engine**: Color-based lighting rules
- **Composition Types**: Random framing styles for creatures

### File Naming Convention
Card art files: `{ID}{suffix}_{sanitized_name}.png`
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
