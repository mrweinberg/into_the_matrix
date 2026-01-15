<template>
  <BaseModal :show="show" title="DRAFT ARCHETYPES" @close="$emit('close')">
    <div class="archetype-container">
      <!-- Archetype Tabs -->
      <div class="archetype-tabs">
        <button
          v-for="arch in archetypes"
          :key="arch.id"
          :class="['arch-tab', { active: selectedId === arch.id }]"
          @click="selectedId = arch.id"
        >
          <span class="arch-colors">
            <i v-for="c in arch.colors" :key="c" :class="'ms ms-' + c.toLowerCase() + ' ms-cost'"></i>
          </span>
          <span class="arch-name">{{ arch.name }}</span>
        </button>
      </div>

      <!-- Selected Archetype Detail -->
      <div class="archetype-detail" v-if="selectedArchetype">
        <div class="arch-header">
          <h3>
            <span class="arch-colors-large">
              <i v-for="c in selectedArchetype.colors" :key="c"
                 :class="'ms ms-' + c.toLowerCase() + ' ms-cost'"></i>
            </span>
            {{ selectedArchetype.name }}
          </h3>
          <span class="card-count">{{ selectedArchetype.onColorCount }} on-color cards</span>
        </div>

        <p class="arch-description">{{ selectedArchetype.description }}</p>

        <!-- Keywords Section -->
        <div class="arch-section" v-if="Object.keys(selectedArchetype.keywords).length > 0">
          <h4>Key Mechanics</h4>
          <div class="keyword-pills">
            <span
              v-for="(count, keyword) in selectedArchetype.keywords"
              :key="keyword"
              class="keyword-pill"
              :class="getKeywordClass(keyword)"
            >
              {{ keyword }}: {{ count }}
            </span>
          </div>
        </div>

        <!-- Creature Types Section -->
        <div class="arch-section" v-if="Object.keys(selectedArchetype.creatureTypes).length > 0">
          <h4>Creature Types</h4>
          <div class="keyword-pills">
            <span
              v-for="(count, type) in selectedArchetype.creatureTypes"
              :key="type"
              class="keyword-pill type-pill"
            >
              {{ type }}: {{ count }}
            </span>
          </div>
        </div>

        <!-- Mana Curve Section -->
        <div class="arch-section">
          <h4>Mana Curve</h4>
          <div class="curve-chart">
            <div
              v-for="(count, cmc) in selectedArchetype.manaCurve"
              :key="cmc"
              class="curve-bar-container"
            >
              <div class="curve-bar" :style="{ height: getBarHeight(count) + 'px' }">
                <span class="curve-count" v-if="count > 0">{{ count }}</span>
              </div>
              <span class="curve-label">{{ cmc }}</span>
            </div>
          </div>
        </div>

        <!-- Card List Section -->
        <div class="arch-section cards-section">
          <h4>Cards in Archetype ({{ selectedArchetype.cards.length }})</h4>
          <div class="card-filters">
            <button
              :class="['filter-btn', { active: cardFilter === 'all' }]"
              @click="cardFilter = 'all'"
            >All</button>
            <button
              :class="['filter-btn', { active: cardFilter === 'creatures' }]"
              @click="cardFilter = 'creatures'"
            >Creatures</button>
            <button
              :class="['filter-btn', { active: cardFilter === 'spells' }]"
              @click="cardFilter = 'spells'"
            >Spells</button>
            <button
              :class="['filter-btn', { active: cardFilter === 'oncolor' }]"
              @click="cardFilter = 'oncolor'"
            >On-Color Only</button>
          </div>
          <div class="card-grid">
            <div
              v-for="card in filteredCards"
              :key="card.id"
              class="card-item"
              @click="$emit('view-card', card)"
            >
              <CardItem :card="card" :clickable="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import CardItem from '@/components/cards/CardItem.vue'
import { useCardStore } from '@/stores/cardStore'
import { useArchetypeAnalysis } from '@/composables/useArchetypeAnalysis'
import { getCardColors } from '@/utils/cardUtils'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'view-card'])

const cardStore = useCardStore()
const allCards = computed(() => cardStore.frontFaceCards)

const { allArchetypes, colorPairs } = useArchetypeAnalysis(allCards)

const selectedId = ref('WU')
const cardFilter = ref('all')

const archetypes = computed(() => allArchetypes.value)

const selectedArchetype = computed(() => {
  return archetypes.value.find(a => a.id === selectedId.value)
})

const filteredCards = computed(() => {
  if (!selectedArchetype.value) return []

  let cards = selectedArchetype.value.cards

  switch (cardFilter.value) {
    case 'creatures':
      cards = cards.filter(c => (c.type || '').toLowerCase().includes('creature'))
      break
    case 'spells':
      cards = cards.filter(c => {
        const type = (c.type || '').toLowerCase()
        return type.includes('instant') || type.includes('sorcery')
      })
      break
    case 'oncolor':
      cards = cards.filter(c => getCardColors(c).length > 0)
      break
  }

  return cards
})

// Get max count for scaling the bar chart
const maxCurveCount = computed(() => {
  if (!selectedArchetype.value) return 1
  return Math.max(...Object.values(selectedArchetype.value.manaCurve), 1)
})

function getBarHeight(count) {
  const maxHeight = 80
  return (count / maxCurveCount.value) * maxHeight
}

function getKeywordClass(keyword) {
  const special = ['Digital', 'Jack-in', 'Eject', 'Override', 'Energy']
  return special.includes(keyword) ? 'special-keyword' : ''
}
</script>

<style scoped>
.archetype-container {
  display: flex;
  gap: 20px;
  min-height: 500px;
  max-height: 80vh;
}

.archetype-tabs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  padding-right: 16px;
  border-right: 1px solid rgba(0, 255, 65, 0.2);
}

.arch-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.arch-tab:hover {
  background: rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.3);
}

.arch-tab.active {
  background: rgba(0, 255, 65, 0.2);
  border-color: var(--matrix-green);
}

.arch-colors {
  display: flex;
  gap: 2px;
}

.arch-colors i {
  font-size: 1rem;
}

.arch-name {
  color: #ccc;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.arch-tab.active .arch-name {
  color: var(--matrix-green);
}

.archetype-detail {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.arch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.arch-header h3 {
  margin: 0;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 8px;
}

.arch-colors-large i {
  font-size: 1.4rem;
}

.card-count {
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.arch-description {
  color: #aaa;
  line-height: 1.5;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.arch-section {
  margin-bottom: 20px;
}

.arch-section h4 {
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.keyword-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-pill {
  padding: 4px 10px;
  background: rgba(100, 100, 100, 0.2);
  border: 1px solid #555;
  border-radius: 12px;
  color: #aaa;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.keyword-pill.special-keyword {
  background: rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.4);
  color: var(--matrix-green);
}

.keyword-pill.type-pill {
  background: rgba(150, 100, 50, 0.2);
  border-color: rgba(200, 150, 100, 0.4);
  color: #d4a574;
}

.curve-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.curve-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.curve-bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(to top, rgba(0, 255, 65, 0.6), rgba(0, 255, 65, 0.3));
  border-radius: 2px 2px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 2px;
  transition: height 0.3s ease;
}

.curve-count {
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  font-weight: bold;
  margin-top: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.curve-label {
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.cards-section {
  flex: 1;
}

.card-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-btn {
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #555;
  border-radius: 4px;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover {
  border-color: #888;
  color: #ccc;
}

.filter-btn.active {
  background: rgba(0, 255, 65, 0.2);
  border-color: var(--matrix-green);
  color: var(--matrix-green);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.card-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.card-item:hover {
  transform: scale(1.02);
}

/* Scrollbar styling */
.archetype-detail::-webkit-scrollbar,
.card-grid::-webkit-scrollbar {
  width: 6px;
}

.archetype-detail::-webkit-scrollbar-track,
.card-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.archetype-detail::-webkit-scrollbar-thumb,
.card-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 3px;
}

.archetype-detail::-webkit-scrollbar-thumb:hover,
.card-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 65, 0.5);
}

/* Responsive */
@media (max-width: 800px) {
  .archetype-container {
    flex-direction: column;
  }

  .archetype-tabs {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: unset;
    padding-right: 0;
    padding-bottom: 12px;
    border-right: none;
    border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  }

  .arch-tab {
    flex: 0 0 auto;
  }

  .arch-name {
    display: none;
  }
}
</style>
