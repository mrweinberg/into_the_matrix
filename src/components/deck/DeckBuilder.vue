<template>
  <div class="deck-builder">
    <!-- Top Section: Pool/Sideboard -->
    <div class="pool-section">
      <div class="section-header">
        <div class="pool-info">
          <h3>Pool ({{ pool.length }} cards)</h3>
          <div class="rarity-breakdown">
            <span v-for="(count, rarity) in rarityCounts" :key="rarity" :class="['p-rarity', rarity.toLowerCase()]">
              {{ count }}{{ rarity[0] }}
            </span>
          </div>
        </div>
        <div class="pool-filters">
          <span>Click to add to deck</span>
        </div>
      </div>
      <div class="pool-grid">
        <template v-for="group in groupedPool" :key="group.name">
          <div class="card-action-wrapper" @click="addToDeck(group.ids[0])">
            <div class="pool-card-container">
              <CardDFC
                v-if="group.hasBackFace"
                :card="group"
                :back-card="getBackFace(group)"
              />
              <CardItem
                v-else
                :card="group"
              />
              <div v-if="group.count > 1" class="count-badge top-left">x{{ group.count }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="builder-divider">
      <BasicLandPicker :counts="basicLands" @add="addBasicLand" @remove="removeBasicLand" />
      <div class="deck-counts">
        <span>Main Deck: {{ totalMainCount }}</span>
      </div>
    </div>

    <!-- Bottom Section: Deck grouped by CMC -->
    <div class="deck-section">
      <div class="section-header">
        <h3>Deck View</h3>
      </div>
      <div class="cmc-groups">
        <div v-for="(group, key) in deckByCMC" :key="key" class="cmc-column">
          <div class="cmc-header">{{ key }}</div>
          <div class="cmc-list">
            <div
              v-for="(stack, idx) in group"
              :key="(stack.id || stack.name) + '-' + idx"
              class="deck-card-wrapper"
              :style="{ zIndex: idx, marginTop: idx === 0 ? '0' : '-180px' }"
              @click="removeFromDeck(stack.isBasic ? null : stack.deckIndexes[0], stack.isBasic, stack.type)"
            >
              <div class="card-stack-item">
                <CardItem :card="stack" class="mini-card" />
                <div v-if="stack.isBasic" class="basic-land-overlay">{{ stack.name }}</div>
                <div v-if="stack.count > 1" class="count-badge deck-badge">x{{ stack.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useDeckBuilder } from '@/composables/useDeckBuilder'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'
import BasicLandPicker from './BasicLandPicker.vue'

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

defineExpose({
  exportDeck
})
</script>

<style scoped>
.deck-builder {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 85vh;
  overflow: hidden;
  padding: 10px;
}

.pool-section {
  flex: 1.2;
  overflow-y: auto;
  min-height: 250px;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--matrix-green);
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  padding-bottom: 8px;
}

.pool-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.rarity-breakdown {
  display: flex;
  gap: 8px;
}

.p-rarity {
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid currentColor;
  text-transform: uppercase;
}

.p-rarity.mythic { color: #fe5501; }
.p-rarity.rare { color: #c3ae66; }
.p-rarity.uncommon { color: #708090; }
.p-rarity.common { color: #fff; }
.p-rarity.land { color: #8b4513; }

.pool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.builder-divider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 255, 65, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 65, 0.1);
}

.deck-counts {
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
}

.deck-section {
  flex: 1;
  min-height: 300px;
  overflow-x: auto;
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
}

.cmc-groups {
  display: flex;
  gap: 8px;
  height: 100%;
  min-width: max-content;
}

.cmc-column {
  width: 140px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.cmc-header {
  text-align: center;
  background: rgba(0, 255, 65, 0.8);
  color: #000;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  padding: 4px;
  font-size: 0.9rem;
}

.cmc-list {
  position: relative;
  flex: 1;
  padding: 5px;
  display: flex;
  flex-direction: column;
}

.deck-card-wrapper {
  cursor: pointer;
  transition: transform 0.1s;
  position: relative;
}

.deck-card-wrapper:hover {
  transform: translateY(-10px);
  z-index: 1000 !important;
}

.mini-card {
  transform: scale(0.65);
  transform-origin: top left;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
}

.card-stack-item {
  position: relative;
  height: 200px; /* Control vertical overlap */
}

.basic-land-overlay {
  position: absolute;
  top: 40px;
  left: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.85);
  padding: 4px;
  border: 1px solid var(--matrix-green);
  color: var(--matrix-green);
  pointer-events: none;
  font-weight: bold;
  text-align: center;
  font-size: 0.8rem;
  z-index: 5;
}

.card-action-wrapper {
  cursor: pointer;
}

.card-action-wrapper:hover {
  transform: scale(1.05);
  z-index: 10;
}

.pool-card-container {
  position: relative;
  transform: scale(0.95);
}

.count-badge {
  position: absolute;
  background: var(--matrix-green);
  color: #000;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.75rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
  font-family: 'Courier New', monospace;
  pointer-events: none;
}

.count-badge.top-left {
  top: -2px;
  left: -2px;
}

.deck-badge {
  top: 5px;
  right: 5px;
  background: #fff;
  border: 1px solid var(--matrix-green);
}
</style>
