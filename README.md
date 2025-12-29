# MTG: Into The Matrix - AI Art Generator & Website

A complete Magic: The Gathering fan set creator that transforms custom card designs into a visual gallery experience. This application generates AI artwork for each card using Google's Gemini AI and creates an interactive website to browse the complete set.

## 📖 Overview

**Into The Matrix (ITM)** is a fan-designed Magic: The Gathering set inspired by The Matrix movie trilogy. This project contains two main components:

1. **AI Art Generator** (`generate_matrix.mjs`) - Generates unique artwork for each card using Google's Gemini AI
2. **Website Generator** (`generate_website.mjs`) - Creates an interactive HTML gallery to browse and filter cards

The set contains **251 cards** featuring new mechanics like Digital, Jack-in/Eject, Override, Energy, and Gun Tokens, all themed around the Matrix universe.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Google Gemini API key
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

#### 1. Generate Card Artwork
```bash
node generate_matrix.mjs [options]
```

**Available Options:**
- `--dryrun` or `-d`: Preview what would be generated without making API calls
- `--force` or `-f`: Regenerate all artwork, overwriting existing files
- `--specific <card_id>` or `-s <card_id>`: Generate artwork for a specific card only

**Examples:**
```bash
# Normal generation (skips existing artwork)
node generate_matrix.mjs

# Preview mode - see what would be generated
node generate_matrix.mjs --dryrun

# Force regenerate all artwork
node generate_matrix.mjs --force

# Generate artwork for a specific card
node generate_matrix.mjs --specific C01
node generate_matrix.mjs -s M03
```

This script will:
- Parse the card designs from `MTG INTO THE MATRIX.txt`
- Generate AI artwork for each card using Gemini AI
- Save images to the `matrix_art_output/` directory
- Skip cards that already have generated artwork (unless using `--force`)
- Process both front and back faces of transform cards

**Note:** This process can take several hours as it generates 251+ individual artworks. The script includes safety delays between API calls.

#### 2. Generate Website
```bash
node generate_website.mjs
```

This script will:
- Parse the same card data file
- Create an interactive HTML website (`index.html`)
- Include filtering, searching, and card viewing features
- Generate a virtual booster pack simulator

#### 3. View the Website
Open `index.html` in your web browser to explore the complete set.

## 📁 File Structure

```
matrix/
├── generate_matrix.mjs      # AI art generation script
├── generate_website.mjs     # Website generation script
├── MTG INTO THE MATRIX.txt  # Card designs and mechanics
├── package.json            # Node.js dependencies
├── .env                    # API keys (create this)
├── index.html              # Generated website (after running scripts)
├── matrix_art_output/      # Generated card artwork
└── README.md              # This file
```

## 🎨 Features

### AI Art Generation
- **Context-Aware Prompts**: Each card generates detailed prompts based on card type, mechanics, and Matrix universe lore
- **Smart Color Detection**: Automatically determines card colors and applies appropriate visual themes
- **World Context System**: Differentiates between Matrix simulation and Real World settings
- **Transform Card Support**: Handles double-faced cards with separate artwork for each side
- **Resume Capability**: Skips already-generated artwork for interrupted sessions

### Website Features
- **Interactive Gallery**: Browse all 251 cards with high-quality artwork
- **Advanced Filtering**: Filter by name, type, rarity, color, and mechanics
- **Booster Pack Simulator**: Generate randomized 15-card booster packs
- **Transform Card Display**: Special layout for double-faced cards
- **Responsive Design**: Works on desktop and mobile devices
- **Mana Symbol Support**: Proper Magic symbol rendering using Mana Font

### Set Mechanics
- **Digital**: Creatures that can only block/be blocked by other Digital creatures
- **Jack-in/Eject**: Transform abilities for entering/leaving the Matrix
- **Override**: Agent possession mechanic (Champion variant)
- **Energy**: Resource system for bio-electricity and system resources
- **Gun Tokens**: Equipment tokens with first strike and sacrifice effects

## 🛠 Customization

### Modifying Card Data
Edit `MTG INTO THE MATRIX.txt` to:
- Add new cards
- Modify existing card designs
- Update mechanics descriptions
- Change flavor text

### Adjusting AI Prompts
In `generate_matrix.mjs`, modify the `generatePrompt()` method to:
- Change art style preferences
- Adjust world context descriptions
- Modify color accent rules

### Website Styling
In `generate_website.mjs`, customize the CSS within the `generateHTML()` function to:
- Change color schemes
- Modify layout styles
- Add new filter options

## 📊 Performance Notes

- **Art Generation**: Expect 3-5 hours for full set generation (251 cards + transform faces)
- **API Limits**: Script includes 500ms delays between API calls to respect rate limits
- **Storage**: Generated artwork requires ~500MB-1GB of disk space
- **Memory**: Website loads all card data into memory for instant filtering

## 🎯 Card Breakdown

- **Commons**: 114 cards (including transform faces)
- **Uncommons**: 84 cards 
- **Rares**: 74 cards
- **Mythics**: 17 cards
- **Lands**: 11 basic and special lands
- **Transform Cards**: 15 double-faced cards with unique mechanics

## 🚨 API Usage & Costs

**Important**: This project uses Google's Gemini AI API, which may incur costs. Each card generation uses one API call. With 251+ cards, expect significant API usage. Monitor your API quota and billing before running the full generation.

## 🤝 Contributing

This is a fan project inspired by The Matrix and Magic: The Gathering. Feel free to:
- Submit card design improvements
- Enhance the AI prompting system
- Add new website features
- Optimize performance

## 📄 Legal Notice

This is an unofficial fan project. Magic: The Gathering is owned by Wizards of the Coast. The Matrix is owned by Warner Bros. This project is for educational and entertainment purposes only.

## 🐛 Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `.env` file exists with valid `GEMINI_API_KEY`
2. **API Rate Limits**: Increase delay between API calls in `generate_matrix.mjs`
3. **Large File Sizes**: Generated images are high-quality; ensure sufficient disk space
4. **Memory Issues**: For large sets, consider processing cards in batches

### Error Recovery

- Art generation automatically resumes from where it left off
- Check `matrix_art_output/` directory for partial progress
- Review console output for specific error messages

## 🔄 Updates

- **v1.0**: Initial release with basic art generation
- **v2.0**: Added website generator and filtering
- **v3.0**: Enhanced prompting system and Matrix universe theming
- **v4.0**: Added transform card support and booster pack simulator
- **v5.0**: Performance optimizations and regex fixes