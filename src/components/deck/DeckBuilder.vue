<template>
  <div class="deck-builder">
    <!-- Main Content Area -->
    <div class="builder-main">
      <!-- Pool Section -->
      <div class="pool-section">
        <div class="section-header">
          <div class="pool-info">
            <h3>Pool ({{ filteredPoolCount }}/{{ pool.length }})</h3>
            <div class="rarity-breakdown">
              <span v-for="(count, rarity) in rarityCounts" :key="rarity" :class="['p-rarity', rarity.toLowerCase()]">
                {{ count }}{{ rarity[0] }}
              </span>
            </div>
          </div>
          <div class="pool-hint">Click to add to deck</div>
        </div>
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">Color:</span>
            <div class="filter-buttons">
              <button
                v-for="color in colorFilters"
                :key="color.id"
                :class="['filter-btn', 'color-' + color.id, { active: activeColors.has(color.id) }]"
                :title="color.name"
                @click="toggleColor(color.id)"
              >
                <i :class="color.icon"></i>
              </button>
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">Type:</span>
            <div class="filter-buttons">
              <button
                v-for="type in typeFilters"
                :key="type.id"
                :class="['filter-btn', 'type-btn', { active: activeTypes.has(type.id) }]"
                @click="toggleType(type.id)"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">MV:</span>
            <div class="filter-buttons">
              <button
                v-for="mv in mvFilters"
                :key="mv.id"
                :class="['filter-btn', 'mv-btn', { active: activeMVs.has(mv.id) }]"
                @click="toggleMV(mv.id)"
              >
                {{ mv.label }}
              </button>
            </div>
          </div>
          <button v-if="hasActiveFilters" class="clear-filters" @click="clearFilters">Clear</button>
        </div>
        <div class="pool-list">
          <DeckCardRow
            v-for="group in sortedGroupedPool"
            :key="group.name"
            :card="group"
            :count="group.count"
            :is-hovered="hoveredCard?.name === group.name"
            @hover="onHover"
            @click="addToDeck(group.ids[0])"
          />
          <div v-if="sortedGroupedPool.length === 0" class="empty-message">
            {{ hasActiveFilters ? 'No cards match filters' : 'All cards added to deck' }}
          </div>
        </div>
      </div>

      <!-- Divider with Land Picker -->
      <div class="builder-divider">
        <BasicLandPicker :counts="basicLands" @add="addBasicLand" @remove="removeBasicLand" />
        <div class="deck-actions">
          <div class="deck-counts">
            <span class="count-label">Main Deck:</span>
            <span class="count-value" :class="{ 'count-valid': totalMainCount >= 40 }">{{ totalMainCount }}</span>
          </div>
          <button class="export-btn" @click="exportDeck" title="Download deck list">
            Export
          </button>
        </div>
      </div>

      <!-- Deck Section -->
      <div class="deck-section">
        <div class="section-header">
          <h3>Deck</h3>
          <div class="deck-hint">Click to remove from deck</div>
        </div>
        <div class="deck-columns">
          <template v-if="Object.keys(filteredDeckByCMC).length > 0">
            <div v-for="(cards, cmc) in filteredDeckByCMC" :key="cmc" class="cmc-column">
              <div class="cmc-header">
                <span class="cmc-cost">{{ cmc }}</span>
                <span class="cmc-count">({{ getCmcCount(cards) }})</span>
              </div>
              <div class="cmc-list">
                <DeckCardRow
                  v-for="(stack, idx) in cards"
                  :key="(stack.id || stack.name) + '-' + idx"
                  :card="stack"
                  :count="stack.count"
                  :is-hovered="hoveredCard?.name === stack.name"
                  @hover="onHover"
                  @click="removeFromDeck(stack.isBasic ? null : stack.deckIndexes[0], stack.isBasic, stack.type)"
                />
              </div>
            </div>
          </template>
          <div v-else class="empty-deck-message">
            Click cards in the pool above to add them to your deck
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Preview Panel -->
    <div class="preview-panel" :class="{ 'has-card': hoveredCard }">
      <div class="preview-header">Card Preview</div>
      <div class="preview-content">
        <template v-if="hoveredCard">
          <template v-if="hoveredCard.hasBackFace">
            <div class="dfc-preview">
              <div class="dfc-face">
                <div class="dfc-face-label">Front</div>
                <CardItem :card="hoveredCard" :clickable="false" />
              </div>
              <div class="dfc-transform-icon">⇄</div>
              <div class="dfc-face">
                <div class="dfc-face-label">Back</div>
                <CardItem :card="getBackFace(hoveredCard)" :clickable="false" />
              </div>
            </div>
          </template>
          <CardItem
            v-else
            :card="hoveredCard"
            :clickable="false"
          />
        </template>
        <div v-else class="preview-placeholder">
          Hover over a card to see details
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useDeckBuilder } from '@/composables/useDeckBuilder'
import { determineColorClass, calculateCMC } from '@/utils/cardUtils'
import CardItem from '@/components/cards/CardItem.vue'
import BasicLandPicker from './BasicLandPicker.vue'
import DeckCardRow from './DeckCardRow.vue'

const props = defineProps({
  initialPool: {
    type: Array,
    default: () => []
  }
})

const cardStore = useCardStore()
const {
  pool,
  groupedPool,
  basicLands,
  addToDeck: deckAdd,
  removeFromDeck: deckRemove,
  addBasicLand,
  removeBasicLand,
  deckByCMC,
  totalMainCount,
  exportDeck
} = useDeckBuilder(props.initialPool)

const hoveredCard = ref(null)

// Filter state
const activeColors = ref(new Set())
const activeTypes = ref(new Set())
const activeMVs = ref(new Set())

const colorFilters = [
  { id: 'W', name: 'White', icon: 'ms ms-w ms-cost' },
  { id: 'U', name: 'Blue', icon: 'ms ms-u ms-cost' },
  { id: 'B', name: 'Black', icon: 'ms ms-b ms-cost' },
  { id: 'R', name: 'Red', icon: 'ms ms-r ms-cost' },
  { id: 'G', name: 'Green', icon: 'ms ms-g ms-cost' },
  { id: 'Gold', name: 'Multicolor', icon: 'ms ms-gold' },
  { id: 'C', name: 'Colorless', icon: 'ms ms-c ms-cost' }
]

const typeFilters = [
  { id: 'creature', label: 'Creature' },
  { id: 'instant', label: 'Instant' },
  { id: 'sorcery', label: 'Sorcery' },
  { id: 'enchantment', label: 'Enchant' },
  { id: 'artifact', label: 'Artifact' },
  { id: 'land', label: 'Land' }
]

const mvFilters = [
  { id: '0', label: '0' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5+', label: '5+' }
]

function toggleColor(colorId) {
  if (activeColors.value.has(colorId)) {
    activeColors.value.delete(colorId)
  } else {
    activeColors.value.add(colorId)
  }
  activeColors.value = new Set(activeColors.value)
}

function toggleType(typeId) {
  if (activeTypes.value.has(typeId)) {
    activeTypes.value.delete(typeId)
  } else {
    activeTypes.value.add(typeId)
  }
  activeTypes.value = new Set(activeTypes.value)
}

function toggleMV(mvId) {
  if (activeMVs.value.has(mvId)) {
    activeMVs.value.delete(mvId)
  } else {
    activeMVs.value.add(mvId)
  }
  activeMVs.value = new Set(activeMVs.value)
}

function clearFilters() {
  activeColors.value = new Set()
  activeTypes.value = new Set()
  activeMVs.value = new Set()
}

const hasActiveFilters = computed(() =>
  activeColors.value.size > 0 || activeTypes.value.size > 0 || activeMVs.value.size > 0
)

function cardMatchesFilters(card) {
  // Color filter
  if (activeColors.value.size > 0) {
    const cardColor = determineColorClass(card)
    // Map 'Artifact' color class to 'C' (colorless)
    const colorToCheck = cardColor === 'Artifact' ? 'C' : cardColor
    if (!activeColors.value.has(colorToCheck)) {
      return false
    }
  }

  // Type filter
  if (activeTypes.value.size > 0) {
    const type = (card.displayType || card.type || '').toLowerCase()
    let matches = false
    for (const activeType of activeTypes.value) {
      if (type.includes(activeType)) {
        matches = true
        break
      }
    }
    if (!matches) return false
  }

  // Mana value filter
  if (activeMVs.value.size > 0) {
    const cmc = calculateCMC(card.cost)
    const cmcKey = cmc >= 5 ? '5+' : cmc.toString()
    if (!activeMVs.value.has(cmcKey)) {
      return false
    }
  }

  return true
}

const rarityCounts = computed(() => {
  const counts = { Mythic: 0, Rare: 0, Uncommon: 0, Common: 0, Land: 0 }
  pool.value.forEach(card => {
    const rarity = card.rarity === 'Land' ? 'Land' : (card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1))
    if (counts[rarity] !== undefined) {
      counts[rarity]++
    }
  })
  return Object.fromEntries(Object.entries(counts).filter(([_, count]) => count > 0))
})

function getBackFace(card) {
  return cardStore.getBackFace(card)
}

function onHover(card) {
  hoveredCard.value = card
}

function addToDeck(cardId) {
  deckAdd(cardId)
}

function removeFromDeck(index, isBasic, type) {
  if (isBasic) {
    removeBasicLand(type)
  } else {
    deckRemove(index)
  }
}

function getCmcCount(cards) {
  return cards.reduce((sum, c) => sum + c.count, 0)
}

// Filter out empty CMC columns
const filteredDeckByCMC = computed(() => {
  const filtered = {}
  for (const [cmc, cards] of Object.entries(deckByCMC.value)) {
    if (cards.length > 0) {
      filtered[cmc] = cards
    }
  }
  return filtered
})

// Sort pool by color, then CMC, then name for easier browsing
// Also apply filters
const sortedGroupedPool = computed(() => {
  const colorOrder = { 'W': 0, 'U': 1, 'B': 2, 'R': 3, 'G': 4, 'Gold': 5, 'Artifact': 6, 'Land': 7 }
  return [...groupedPool.value]
    .filter(cardMatchesFilters)
    .sort((a, b) => {
      const colorA = colorOrder[determineColorClass(a)] ?? 8
      const colorB = colorOrder[determineColorClass(b)] ?? 8
      if (colorA !== colorB) return colorA - colorB
      const cmcA = calculateCMC(a.cost)
      const cmcB = calculateCMC(b.cost)
      if (cmcA !== cmcB) return cmcA - cmcB
      return a.name.localeCompare(b.name)
    })
})

const filteredPoolCount = computed(() => {
  return sortedGroupedPool.value.reduce((sum, g) => sum + g.count, 0)
})

defineExpose({
  exportDeck
})
</script>

<style scoped>
.deck-builder {
  display: flex;
  gap: 10px;
  height: 94vh;
  padding: 4px;
  overflow: hidden;
}

.builder-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.pool-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  min-height: 0;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--matrix-green);
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  padding-bottom: 4px;
  flex-shrink: 0;
}

.section-header h3 {
  margin: 0;
  font-size: 0.9rem;
}

.pool-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rarity-breakdown {
  display: flex;
  gap: 4px;
}

.p-rarity {
  font-size: 0.65rem;
  padding: 1px 4px;
  border-radius: 2px;
  border: 1px solid currentColor;
  text-transform: uppercase;
}

.p-rarity.mythic { color: #fe5501; }
.p-rarity.rare { color: #c3ae66; }
.p-rarity.uncommon { color: #708090; }
.p-rarity.common { color: #fff; }
.p-rarity.land { color: #8b4513; }

.pool-hint, .deck-hint {
  font-size: 0.7rem;
  color: #666;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.1);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-label {
  color: #666;
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
}

.filter-buttons {
  display: flex;
  gap: 2px;
}

.filter-btn {
  padding: 2px 5px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
  color: #888;
  font-size: 0.85em;
}

.filter-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ccc;
}

.filter-btn.active {
  background: rgba(0, 255, 65, 0.2);
  border-color: var(--matrix-green);
  color: var(--matrix-green);
}

.filter-btn.type-btn {
  font-size: 0.65rem;
  font-family: 'Courier New', monospace;
  padding: 2px 5px;
}

.filter-btn.mv-btn {
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
  padding: 2px 6px;
  min-width: 22px;
}

/* Color-specific button backgrounds when active */
.filter-btn.color-W.active { background: rgba(240, 242, 192, 0.3); border-color: #F0F2C0; color: #F0F2C0; }
.filter-btn.color-U.active { background: rgba(14, 104, 171, 0.3); border-color: #0E68AB; color: #5ba3d9; }
.filter-btn.color-B.active { background: rgba(80, 60, 60, 0.4); border-color: #666; color: #aaa; }
.filter-btn.color-R.active { background: rgba(211, 32, 42, 0.3); border-color: #D3202A; color: #e86b6b; }
.filter-btn.color-G.active { background: rgba(0, 115, 62, 0.3); border-color: #00733E; color: #4db87a; }
.filter-btn.color-Gold.active { background: rgba(212, 175, 55, 0.3); border-color: #D4AF37; color: #D4AF37; }
.filter-btn.color-C.active { background: rgba(140, 140, 140, 0.3); border-color: #888; color: #bbb; }

.clear-filters {
  padding: 3px 8px;
  background: transparent;
  border: 1px solid #666;
  border-radius: 3px;
  color: #888;
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  margin-left: auto;
}

.clear-filters:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.pool-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 4px;
}

.empty-message,
.empty-deck-message {
  color: #555;
  text-align: center;
  padding: 10px;
  font-style: italic;
  font-size: 0.85rem;
}

.empty-deck-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.builder-divider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  background: rgba(0, 255, 65, 0.05);
  border-radius: 3px;
  border: 1px solid rgba(0, 255, 65, 0.1);
  flex-shrink: 0;
}

.deck-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deck-counts {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;
}

.export-btn {
  padding: 3px 10px;
  background: transparent;
  color: var(--matrix-green);
  border: 1px solid var(--matrix-green);
  border-radius: 2px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.export-btn:hover {
  background: var(--matrix-green);
  color: #000;
}

.count-label {
  color: #888;
  font-size: 0.8rem;
}

.count-value {
  color: #ff6b6b;
  font-size: 1rem;
  font-weight: bold;
}

.count-value.count-valid {
  color: var(--matrix-green);
}

.deck-section {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  min-height: 0;
  overflow: hidden;
}

.deck-columns {
  flex: 1;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 5px;
}

.cmc-column {
  min-width: 180px;
  max-width: 250px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.cmc-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: rgba(0, 255, 65, 0.8);
  color: #000;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  padding: 3px;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.cmc-count {
  font-weight: normal;
  opacity: 0.7;
}

.cmc-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Preview Panel */
.preview-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 255, 65, 0.2);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.preview-panel.has-card {
  border-color: rgba(0, 255, 65, 0.5);
}

.preview-header {
  background: rgba(0, 255, 65, 0.1);
  color: var(--matrix-green);
  padding: 4px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  flex-shrink: 0;
}

/* DFC Preview Styles - side by side, scaled down */
.dfc-preview {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
}

.dfc-face {
  flex: 1;
  min-width: 0;
  transform: scale(0.95);
  transform-origin: top center;
}

.dfc-face .card {
  font-size: 0.75em;
}

.dfc-face-label {
  color: var(--matrix-green);
  font-size: 0.6rem;
  font-family: 'Courier New', monospace;
  text-align: center;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dfc-transform-icon {
  color: var(--matrix-green);
  font-size: 0.9rem;
  opacity: 0.6;
  align-self: center;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
}

.preview-content > .card {
  width: 100%;
  max-width: 280px;
}

.preview-placeholder {
  color: #555;
  text-align: center;
  font-style: italic;
  font-size: 0.8rem;
  margin-top: 30px;
}

/* Scrollbar styling */
.pool-list::-webkit-scrollbar,
.cmc-list::-webkit-scrollbar,
.deck-columns::-webkit-scrollbar,
.preview-content::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.pool-list::-webkit-scrollbar-track,
.cmc-list::-webkit-scrollbar-track,
.deck-columns::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.pool-list::-webkit-scrollbar-thumb,
.cmc-list::-webkit-scrollbar-thumb,
.deck-columns::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.pool-list::-webkit-scrollbar-thumb:hover,
.cmc-list::-webkit-scrollbar-thumb:hover,
.deck-columns::-webkit-scrollbar-thumb:hover,
.preview-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 65, 0.5);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .preview-panel {
    width: 260px;
  }
}

@media (max-width: 900px) {
  .deck-builder {
    flex-direction: column;
    height: auto;
    max-height: 96vh;
  }

  .preview-panel {
    width: 100%;
    height: 250px;
    order: -1;
  }

  .builder-main {
    flex: 1;
    overflow: auto;
  }
}
</style>
