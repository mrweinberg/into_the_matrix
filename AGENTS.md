# AGENTS.md - Architecture Guide for AI Agents

This document provides a comprehensive guide to the Into The Matrix (ITM) codebase architecture, designed to help AI agents quickly understand and navigate the project.

## Project Summary

ITM is a Magic: The Gathering fan set with two main components:
1. **Art Generation Pipeline** - Node.js scripts that generate AI artwork via Gemini API
2. **Interactive Gallery App** - Vue 3 SPA for browsing cards, simulating drafts/sealed, and printing proxies

## Tech Stack

| Layer | Technology |
|-------|------------|
| Art Generation | Node.js + Google Gemini AI API |
| Frontend | Vue 3 (Composition API with `<script setup>`) |
| State Management | Pinia |
| Build Tool | Vite |
| Styling | CSS with CSS Variables (Matrix green theme) |
| Icons | Mana Font CDN for MTG mana symbols |

## Directory Structure

```
/
├── MTG INTO THE MATRIX.txt    # Source of truth - all card designs
├── generate_matrix.mjs        # AI art generation script
├── generate_data.mjs          # Card data JSON generator
├── artOverrides.json          # Per-card art prompt customizations
├── public/cards/              # Generated card artwork (PNG files)
│
├── src/                       # Vue 3 application
│   ├── main.js               # App entry point, CSS imports
│   ├── App.vue               # Root component, modal orchestration
│   │
│   ├── data/                 # Static JSON data (generated)
│   │   ├── cards.json        # All card data
│   │   ├── setInfo.json      # Set metadata and stats
│   │   └── notes.json        # Design notes
│   │
│   ├── stores/
│   │   └── cardStore.js      # Pinia store - card data access
│   │
│   ├── composables/          # Reusable logic (Vue Composition API)
│   │   ├── useFilters.js     # Gallery filtering logic
│   │   ├── useBooster.js     # Single pack opening
│   │   ├── useDraft.js       # 3-pack draft simulation
│   │   ├── useDeckBuilder.js # Pool/deck management
│   │   └── useSavedPool.js   # localStorage persistence
│   │
│   ├── utils/
│   │   ├── cardUtils.js      # Color detection, CMC calc, sorting
│   │   ├── manaSymbols.js    # {W} → <i class="ms ms-w"> conversion
│   │   └── boosterLogic.js   # Pack generation algorithm
│   │
│   ├── components/
│   │   ├── cards/            # Card rendering
│   │   ├── modals/           # Modal dialogs
│   │   ├── dashboard/        # Main UI panels
│   │   ├── deck/             # Deck builder components
│   │   ├── print/            # Print proxy components
│   │   ├── filters/          # Filter controls
│   │   └── layout/           # Layout wrappers
│   │
│   └── assets/styles/        # Global CSS
│       ├── variables.css     # CSS custom properties
│       ├── base.css          # Reset and typography
│       ├── cards.css         # Card styling
│       ├── modals.css        # Modal styling
│       ├── draft.css         # Draft mode styling
│       └── print.css         # Print proxy styling
│
└── dist/                     # Build output
```

## Key Architectural Decisions

### 1. Data Generation

**Decision**: Card data is pre-parsed from the source text file into JSON.
- `generate_data.mjs` - Parses `MTG INTO THE MATRIX.txt` into JSON data files
- `src/` - Modern Vue 3 SPA that consumes the JSON

**Reason**: The source file format is human-friendly but complex to parse. Pre-processing into JSON simplifies the frontend and makes the build faster.

### 2. Card Data Flow

```
MTG INTO THE MATRIX.txt (source of truth)
        ↓
generate_data.mjs parses → src/data/*.json
        ↓
cardStore.js loads JSON → Components consume via composables
```

**Decision**: Parse the text file once at build time, not runtime.

**Reason**: The source file format is human-friendly but complex to parse. Pre-processing into JSON simplifies the frontend.

### 3. Composables Over Components for Logic

**Decision**: Business logic lives in `/composables`, not in components.

**Reason**:
- `useDraft.js` handles all draft state/logic
- `useDeckBuilder.js` handles pool↔deck transfers
- `useSavedPool.js` handles localStorage persistence
- Components just render and emit events

### 4. Modal Orchestration in App.vue

**Decision**: All modals are defined in `App.vue` with visibility controlled by refs.

**Reason**: Modals often need to interact (e.g., viewing a card from draft should return to draft after). Centralizing in App.vue simplifies these transitions.

### 5. Mana Symbol Rendering

**Decision**: Use Mana Font CDN with regex replacement.

```javascript
// manaSymbols.js
replaceSymbols("{2}{W}{W}") → '<i class="ms ms-2 ms-cost"></i><i class="ms ms-w ms-cost"></i>...'
```

**Reason**: Mana Font provides all MTG symbols as web fonts. Regex replacement is simple and works for both card text and mana costs.

### 6. Color Detection from Cost

**Decision**: Card color is computed from mana cost, not stored as data.

```javascript
// cardUtils.js
determineColorClass(card) // Analyzes cost string to return W/U/B/R/G/Gold/Artifact/Land
```

**Reason**: Reduces data duplication, handles hybrid mana correctly, matches how MTG rules work.

### 7. Print Proxy Architecture

**Decision**: Use Vue's `<Teleport>` to render print content at body level.

```vue
<Teleport to="body">
  <div class="print-only-container">...</div>
</Teleport>
```

**Reason**: CSS @media print rules are simpler when the print content isn't nested in modals. The teleported container is hidden on screen, visible when printing.

## Component Hierarchy

```
App.vue
├── Dashboard.vue (layout wrapper)
│   ├── TerminalHeader.vue
│   ├── QuickStats.vue
│   ├── ActionButtons.vue (Open Pack, Draft, Sealed, Print Proxies)
│   ├── MechanicsPanel.vue
│   ├── FilterBar.vue
│   └── ResultsBar.vue
│
├── CardGallery.vue
│   ├── CardItem.vue (regular cards)
│   └── CardDFC.vue (double-faced cards)
│
├── BoosterModal.vue (single pack view)
├── DraftModal.vue
│   ├── DraftSidebar.vue (picked cards)
│   ├── HoverPreview.vue
│   └── DeckBuilder.vue (when reviewing pool)
├── SealedModal.vue
│   └── DeckBuilder.vue
├── PrintProxyModal.vue
│   └── PrintProxyGrid.vue
│       └── PrintProxyCard.vue
├── CardDetailModal.vue
├── NotesModal.vue
└── SetStatsModal.vue
```

## Data Structures

### Card Object
```javascript
{
  id: "C01",                    // Rarity prefix + number
  name: "Hovercraft Crewman",
  cost: "{1}{W}",              // Mana cost with symbol syntax
  type: "Creature — Human Soldier",
  displayType: "Creature — Human Soldier", // Without P/T
  text: ["Vigilance", "..."],  // Array of ability lines
  flavor: "Quote here",
  rarity: "Common",            // Common/Uncommon/Rare/Mythic/Land
  pt: "1/4",                   // Power/Toughness (creatures only)
  colorIndicator: "w",         // For cards with color indicators
  fileName: "C01_hovercraft_crewman.png",
  hasBackFace: false,          // True for transform cards
  isBackFace: false            // True for back face of DFCs
}
```

### Booster Pack Composition
```javascript
// boosterLogic.js - generateBoosterPackData()
// 15 cards per pack:
// - 8 Commons
// - 3 Uncommons
// - 1 Rare/Mythic (13% mythic chance)
// - 2 Wildcards (variable rarity)
// - 1 Land (if set has lands)
```

## Key Files for Common Tasks

| Task | Primary Files |
|------|---------------|
| Add new card property | `generate_data.mjs` (parsing), `cardStore.js` |
| Change card rendering | `CardItem.vue`, `cards.css` |
| Modify draft logic | `useDraft.js`, `boosterLogic.js` |
| Change deck builder UI | `DeckBuilder.vue`, `DeckCardRow.vue` |
| Update print layout | `PrintProxyCard.vue`, `print.css` |
| Add new modal | Create in `modals/`, wire up in `App.vue` |
| Modify filters | `FilterBar.vue`, `useFilters.js` |
| Change mana symbols | `manaSymbols.js` |

## State Management Patterns

### Local Component State
Simple UI state (hover, expanded panels) uses `ref()` in components.

### Composable State
Feature-specific state lives in composables:
- `useDraft()` - draft rounds, packs, picks, pool
- `useDeckBuilder()` - pool, mainDeck, basicLands
- `useSavedPool()` - localStorage persistence (shared singleton)

### Pinia Store
Global app data uses Pinia:
- `cardStore` - all card data, loaded once on mount

## CSS Architecture

### Variables (`variables.css`)
```css
--matrix-green: #00ff41;
--card-bg: #1a1a1a;
--text-primary: #00ff41;
```

### Component Scoping
- Most components use `<style scoped>`
- Global styles in `assets/styles/*.css`
- Print styles isolated in `print.css`

### Mana Font Classes
```css
.ms              /* Base mana symbol */
.ms-w            /* White mana */
.ms-cost         /* Mana cost styling */
.ms-ci           /* Color indicator */
```

## Common Gotchas

1. **DFC Back Faces**: Back faces have `isBackFace: true`. Use `cardStore.getBackFace(card)` to retrieve.

2. **Card ID Format**: IDs like `C01`, `U15`, `R03`, `M01`. The letter is rarity, number is sequence.

3. **Mana Cost Parsing**: Cost is a string like `{2}{W}{W}`. Use `calculateCMC()` for numeric value.

4. **Basic Land Detection**: Check `type.toLowerCase().includes('basic land')`.

5. **Print Mode**: Print content is teleported to body. CSS @media print shows only `.print-only-container`.

6. **Saved Pool Structure**: `useSavedPool` stores full pool + deck separately. On restore, deck cards are filtered from pool.

## Testing Changes

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
```

No automated tests exist - manual testing via dev server is the primary method.
