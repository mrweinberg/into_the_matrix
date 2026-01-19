# MTG: Into The Matrix - AI Art Generator & Website

A complete Magic: The Gathering fan set creator that transforms custom card designs into a visual gallery experience. This application generates AI artwork for each card using Google's Gemini AI and creates a modern Vue.js interactive website to browse the complete set.

## 📖 Overview

**Into The Matrix (ITM)** is a fan-designed Magic: The Gathering set inspired by The Matrix movie trilogy. This project contains two main components:

1. **AI Art Generator** (`generate_matrix.mjs`) - Generates unique artwork for each card using Google's Gemini AI
2. **Interactive Website** (Vue 3 + Vite) - A modern single-page application to browse, draft, and explore the set.

The set contains **251 cards** featuring new mechanics like Digital, Jack-in/Eject, Override, Energy, and Gun Tokens, all themed around the Matrix universe.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Google Gemini API key (for art generation)
- npm or yarn package manager

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from: [https://ai.google.dev/](https://ai.google.dev/)

### Running the Application

#### 1. Development Server
To run the website locally with hot-reloading:
```bash
npm run dev
```
Open `http://localhost:5173` (or the URL shown in terminal) to view the site.

#### 2. Generate Card Data
If you modify `MTG INTO THE MATRIX.txt`, you need to update the JSON data used by the website:
```bash
npm run generate-data
```

#### 3. Generate Card Artwork
To generate AI art for the cards:
```bash
node generate_matrix.mjs
```
**Options:**
- `node generate_matrix.mjs --dryrun` (Preview only)
- `node generate_matrix.mjs --force` (Overwrite existing)
- `node generate_matrix.mjs --specific C001` (Specific card)
- `node resize_art.mjs` (Resize existing art to 4:3)

#### 4. Production Build
To create a strictly static version of the site (e.g. for GitHub Pages):
```bash
npm run build
```
The output will be in the `dist/` folder.

## 📁 File Structure

```
matrix/
├── src/                    # Vue source code
│   ├── data/               # Generated JSON data
│   ├── components/         # Vue components (Card, Dashboard, etc.)
│   ├── composables/        # Shared game logic (Draft, Filters)
│   ├── App.vue             # Main application entry
├── public/                 # Public assets
│   └── cards/              # CONSOLIDATED card images
├── generate_matrix.mjs     # AI art generation script
├── generate_data.mjs       # Card data JSON generator
├── fix_syntax.mjs          # Syntax standardization utility
├── MTG INTO THE MATRIX.txt # SOURCE OF TRUTH (Card designs)
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🎨 Features

### AI Art Generation
- **Context-Aware Prompts**: Generates detailed prompts based on card type, mechanics, and Matrix universe lore.
- **Smart Color Detection**: Automatically determines card colors and applies appropriate visual themes.
- **Transform Card Support**: Handles double-faced cards with separate artwork for each side.

### Website Features (Vue 3)
- **Interactive Gallery**: Browse all 296 cards with high-quality artwork.
- **Instant Filtering**: Filter by name, type, rarity, color, and mechanics.
- **Booster Draft**: Simulate a full 3-pack draft against AI bots.
- **Sealed Deck**: Open 6 packs and build a deck from the pool.
- **Deck Builder**: Visual deck construction with mana curves and stats.
- **Proxy Generator**: Print-ready layout for creating physical proxies.
- **Design Notes**: View developer notes for set design philosophy.

## 🛠 Customization

### Modifying Card Data
Edit `MTG INTO THE MATRIX.txt` to add cards or change mechanics. Then run `npm run generate-data`.

### Adjusting AI Prompts
In `artOverrides.json`, add specific instructions for any card ID.

## 📄 Legal Notice

This is an unofficial fan project. Magic: The Gathering is owned by Wizards of the Coast. The Matrix is owned by Warner Bros. This project is for educational and entertainment purposes only.

## 🔄 Updates

- **v6.0**: Complete refactor to Vue 3 + Vite.
- **v5.0**: Performance optimizations and regex fixes.
- **v4.0**: Added transform card support and booster pack simulator.