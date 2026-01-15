<template>
  <div class="deck-stats">
    <div class="stats-row">
      <!-- Mana Curve -->
      <div class="stat-module curve-module">
        <h4>Mana Curve</h4>
        <div class="curve-chart">
          <div v-for="(count, cmc) in manaCurve" :key="cmc" class="curve-bar-container">
            <div class="curve-bar-wrapper">
              <div 
                class="curve-bar" 
                :style="{ height: getBarHeight(count) + '%' }"
                :title="count + ' cards'"
              ></div>
            </div>
            <div class="curve-label">{{ cmc }}</div>
            <div class="curve-count">{{ count }}</div>
          </div>
        </div>
      </div>

      <!-- Color Breakdown -->
      <div class="stat-module color-module">
        <h4>Color Identity</h4>
        <div class="color-list">
          <div v-for="color in colorBreakdown" :key="color.symbol" class="color-row">
            <i :class="['ms', 'ms-' + color.symbol.toLowerCase(), 'ms-cost']"></i>
            <div class="color-bar-bg">
              <div 
                class="color-bar-fill"
                :class="'bg-' + color.symbol"
                :style="{ width: getColorPercent(color.count) + '%' }"
              ></div>
            </div>
            <span class="color-count">{{ color.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Type Breakdown -->
    <div class="stat-module type-module">
      <h4>Card Types</h4>
      <div class="type-grid">
        <div v-for="(count, type) in typeBreakdown" :key="type" class="type-item">
          <span class="type-name">{{ type }}:</span>
          <span class="type-count">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calculateCMC, getCardColors } from '@/utils/cardUtils'

const props = defineProps({
  deck: {
    type: Array,
    required: true
  },
  basicLands: {
    type: Object,
    default: () => ({})
  }
})

// Mana Curve Calculation
const manaCurve = computed(() => {
  const curve = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6+': 0 }
  
  props.deck.forEach(card => {
    if (card.type.toLowerCase().includes('land')) return // Skip lands for curve
    const cmc = calculateCMC(card.cost)
    if (cmc >= 6) curve['6+']++
    else if (curve[cmc.toString()] !== undefined) curve[cmc.toString()]++
  })
  
  return curve
})

const maxCurveCount = computed(() => {
  return Math.max(...Object.values(manaCurve.value), 1)
})

function getBarHeight(count) {
  return (count / maxCurveCount.value) * 100
}

// Color Breakdown Calculation (Counts Pips? Or Cards? Let's do Cards for now)
const colorBreakdown = computed(() => {
  const counts = { W: 0, U: 0, B: 0, R: 0, G: 0 }
  
  props.deck.forEach(card => {
    const colors = getCardColors(card)
    colors.forEach(c => {
      if (counts[c] !== undefined) counts[c]++
    })
  })

  return [
    { symbol: 'W', count: counts.W },
    { symbol: 'U', count: counts.U },
    { symbol: 'B', count: counts.B },
    { symbol: 'R', count: counts.R },
    { symbol: 'G', count: counts.G }
  ]
})

const totalColorCount = computed(() => {
  return colorBreakdown.value.reduce((sum, c) => sum + c.count, 0) || 1
})

function getColorPercent(count) {
  return (count / totalColorCount.value) * 100
}

// Type Breakdown
const typeBreakdown = computed(() => {
  const types = { 'Creature': 0, 'Instant': 0, 'Sorcery': 0, 'Enchantment': 0, 'Artifact': 0, 'Land': 0, 'Planeswalker': 0 }
  
  // Non-basics
  props.deck.forEach(card => {
    const t = card.type.toLowerCase()
    if (t.includes('creature')) types['Creature']++
    else if (t.includes('instant')) types['Instant']++
    else if (t.includes('sorcery')) types['Sorcery']++
    else if (t.includes('planeswalker')) types['Planeswalker']++
    else if (t.includes('enchantment')) types['Enchantment']++
    else if (t.includes('artifact')) types['Artifact']++
    else if (t.includes('land')) types['Land']++
  })

  // Basics
  Object.values(props.basicLands).forEach(count => {
    types['Land'] += count
  })

  // Filter out zero counts
  return Object.fromEntries(Object.entries(types).filter(([, c]) => c > 0))
})
</script>

<style scoped>
.deck-stats {
  background: rgba(0,0,0,0.8);
  border: 1px solid var(--matrix-green);
  padding: 15px;
  border-radius: 4px;
  color: #fff;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stats-row {
  display: flex;
  gap: 20px;
}

.stat-module {
  flex: 1;
}

h4 {
  margin: 0 0 10px 0;
  color: var(--matrix-green);
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  padding-bottom: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
}

/* Curve Chart */
.curve-chart {
  display: flex;
  gap: 6px;
  height: 120px;
  align-items: flex-end;
  padding-bottom: 20px; /* Space for labels */
}

.curve-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.curve-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.curve-bar {
  width: 80%;
  background: var(--matrix-green);
  min-height: 1px;
  transition: height 0.3s;
  opacity: 0.8;
}

.curve-label {
  position: absolute;
  bottom: -20px;
  font-size: 0.75rem;
  color: #888;
}

.curve-count {
  position: absolute;
  top: -15px; /* Above bar? Might overlap if full. */
  font-size: 0.7rem;
  color: #fff;
  display: none; /* Show on hover maybe? */
}
.curve-bar-container:hover .curve-count {
  display: block;
}

/* Color List */
.color-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-bar-bg {
  flex: 1;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.color-bar-fill {
  height: 100%;
}

.color-count {
  font-size: 0.8rem;
  min-width: 15px;
  text-align: right;
  color: #ccc;
}

.bg-W { background: #F0F2C0; }
.bg-U { background: #0E68AB; }
.bg-B { background: #A8A8A8; }
.bg-R { background: #D3202A; }
.bg-G { background: #00733E; }

/* Type Grid */
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  background: rgba(255,255,255,0.05);
  padding: 4px 8px;
  border-radius: 2px;
}

.type-name {
  font-size: 0.75rem;
  color: #aaa;
}

.type-count {
  font-weight: bold;
  color: var(--matrix-green);
}
</style>
