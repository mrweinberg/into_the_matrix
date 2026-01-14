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
npm run generate-art
```
**Options:**
- `npm run generate-art -- --dryrun` (Preview only)
- `npm run generate-art -- --force` (Overwrite existing)
- `npm run generate-art -- --specific C001` (Specific card)

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
│   ├── assets/             # JSON data and styles
│   ├── components/         # Vue components (Card, Dashboard, etc.)
│   ├── utils/              # Game logic and sorting helpers
│   ├── App.vue             # Main application entry
│   └── main.js             # App initialization
├── public/                 # Public assets
│   └── matrix_art_output/  # Generated card images
├── scripts/                # Utility scripts
├── generate_matrix.mjs     # AI art generation script
├── generate_website.mjs    # Data parsing script
├── MTG INTO THE MATRIX.txt # Card designs and mechanics
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🎨 Features

### AI Art Generation
- **Context-Aware Prompts**: Generates detailed prompts based on card type, mechanics, and Matrix universe lore.
- **Smart Color Detection**: Automatically determines card colors and applies appropriate visual themes.
- **Transform Card Support**: Handles double-faced cards with separate artwork for each side.

### Website Features (Vue 3)
- **Interactive Gallery**: Browse all 251 cards with high-quality artwork.
- **Instant Filtering**: Filter by name, type, rarity, color, and mechanics in real-time.
- **Booster Pack Simulator**: Generate randomized 15-card booster packs with proper rarity distribution.
- **Draft Simulator**: Simulate a full booster draft against AI bots.
- **Responsive Design**: Mobile-friendly interface.
- **Design Notes**: View developer notes for set design philosophy.

## 🛠 Customization

### Modifying Card Data
Edit `MTG INTO THE MATRIX.txt` to add cards or change mechanics. Then run `npm run generate-data`.

### Adjusting AI Prompts
In `generate_matrix.mjs`, modify `generatePrompt()` to change art styles.

## 📄 Legal Notice

This is an unofficial fan project. Magic: The Gathering is owned by Wizards of the Coast. The Matrix is owned by Warner Bros. This project is for educational and entertainment purposes only.

## 🔄 Updates

- **v6.0**: Complete refactor to Vue 3 + Vite.
- **v5.0**: Performance optimizations and regex fixes.
- **v4.0**: Added transform card support and booster pack simulator.