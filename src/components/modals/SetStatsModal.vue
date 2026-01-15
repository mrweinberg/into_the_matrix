<template>
  <BaseModal :show="show" title="SET STATISTICS" @close="$emit('close')">
    <div class="stats-container" v-if="stats">
      <!-- Overview Section -->
      <div class="stats-section">
        <h3>Overview</h3>
        <div class="stat-pills">
          <div class="stat-pill">
            <span class="pill-value">{{ stats.totalCards }}</span>
            <span class="pill-label">Total Cards</span>
          </div>
          <div class="stat-pill">
            <span class="pill-value">{{ stats.averageCMC }}</span>
            <span class="pill-label">Avg CMC</span>
          </div>
          <div class="stat-pill">
            <span class="pill-value">{{ stats.dfcCount }}</span>
            <span class="pill-label">Transform Cards</span>
          </div>
          <div class="stat-pill">
            <span class="pill-value">{{ stats.creatureStats.total }}</span>
            <span class="pill-label">Creatures</span>
          </div>
        </div>
      </div>

      <!-- Rarity Breakdown -->
      <div class="stats-section">
        <h3>Rarity Distribution</h3>
        <div class="bar-chart">
          <div v-for="(count, rarity) in stats.rarityBreakdown" :key="rarity" class="bar-row">
            <span class="bar-label" :class="'rarity-' + rarity.toLowerCase()">{{ rarity }}</span>
            <div class="bar-track">
              <div class="bar-fill" :class="'rarity-' + rarity.toLowerCase()" :style="{ width: getBarWidth(count, maxRarity) + '%' }"></div>
            </div>
            <span class="bar-value">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Type Breakdown -->
      <div class="stats-section">
        <h3>Card Types</h3>
        <div class="bar-chart">
          <div v-for="(count, type) in stats.typeBreakdown" :key="type" class="bar-row">
            <span class="bar-label">{{ type }}</span>
            <div class="bar-track">
              <div class="bar-fill type-fill" :style="{ width: getBarWidth(count, maxType) + '%' }"></div>
            </div>
            <span class="bar-value">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Color Distribution -->
      <div class="stats-section">
        <h3>Color Distribution</h3>
        <div class="color-grid">
          <div v-for="color in ['W', 'U', 'B', 'R', 'G']" :key="color" class="color-stat" :class="'color-' + color">
            <i :class="'ms ms-' + color.toLowerCase() + ' ms-cost'"></i>
            <span class="color-count">{{ stats.colorCombinations[color] || 0 }}</span>
          </div>
          <div class="color-stat color-multi">
            <i class="ms ms-ci ms-ci-5"></i>
            <span class="color-count">{{ multicolorCount }}</span>
          </div>
          <div class="color-stat color-colorless">
            <i class="ms ms-c ms-cost"></i>
            <span class="color-count">{{ stats.colorCombinations['Colorless'] || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Mana Curve by Color -->
      <div class="stats-section">
        <h3>Mana Curve by Color</h3>
        <div class="curve-table">
          <div class="curve-header">
            <span class="curve-label"></span>
            <span v-for="mv in ['0', '1', '2', '3', '4', '5', '6+']" :key="mv" class="curve-mv">{{ mv }}</span>
          </div>
          <div v-for="color in ['W', 'U', 'B', 'R', 'G', 'Multicolor', 'Colorless']" :key="color" class="curve-row" :class="'curve-' + color">
            <span class="curve-label">
              <i v-if="color.length === 1" :class="'ms ms-' + color.toLowerCase() + ' ms-cost'"></i>
              <i v-else-if="color === 'Multicolor'" class="ms ms-ci ms-ci-5"></i>
              <i v-else class="ms ms-c ms-cost"></i>
            </span>
            <span v-for="mv in ['0', '1', '2', '3', '4', '5', '6+']" :key="mv" class="curve-cell" :class="getCellClass(stats.manaCurveByColor[color]?.[mv] || 0)">
              {{ stats.manaCurveByColor[color]?.[mv] || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mana Curve by Rarity -->
      <div class="stats-section">
        <h3>Mana Curve by Rarity</h3>
        <div class="curve-table">
          <div class="curve-header">
            <span class="curve-label"></span>
            <span v-for="mv in ['0', '1', '2', '3', '4', '5', '6+']" :key="mv" class="curve-mv">{{ mv }}</span>
          </div>
          <div v-for="rarity in ['Common', 'Uncommon', 'Rare', 'Mythic']" :key="rarity" class="curve-row">
            <span class="curve-label rarity-label" :class="'rarity-' + rarity.toLowerCase()">{{ rarity.charAt(0) }}</span>
            <span v-for="mv in ['0', '1', '2', '3', '4', '5', '6+']" :key="mv" class="curve-cell" :class="getCellClass(stats.manaCurveByRarity[rarity]?.[mv] || 0)">
              {{ stats.manaCurveByRarity[rarity]?.[mv] || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Creature Stats -->
      <div class="stats-section">
        <h3>Creature Statistics</h3>
        <div class="creature-stats-grid">
          <div class="creature-stat-box">
            <span class="stat-title">Average P/T</span>
            <span class="stat-value">{{ stats.creatureStats.averagePT.power }}/{{ stats.creatureStats.averagePT.toughness }}</span>
          </div>
          <div class="creature-stat-box">
            <span class="stat-title">Power Distribution</span>
            <div class="mini-bar-chart">
              <div v-for="p in ['0', '1', '2', '3', '4', '5+']" :key="'p-' + p" class="mini-bar">
                <span class="mini-label">{{ p }}</span>
                <div class="mini-fill" :style="{ height: getBarWidth(stats.creatureStats.powerDistribution[p] || 0, maxPower) + '%' }"></div>
                <span class="mini-value">{{ stats.creatureStats.powerDistribution[p] || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="creature-stat-box">
            <span class="stat-title">Toughness Distribution</span>
            <div class="mini-bar-chart">
              <div v-for="t in ['0', '1', '2', '3', '4', '5+']" :key="'t-' + t" class="mini-bar">
                <span class="mini-label">{{ t }}</span>
                <div class="mini-fill" :style="{ height: getBarWidth(stats.creatureStats.toughnessDistribution[t] || 0, maxToughness) + '%' }"></div>
                <span class="mini-value">{{ stats.creatureStats.toughnessDistribution[t] || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Keywords -->
      <div class="stats-section">
        <h3>Keyword Frequency</h3>
        <div class="keyword-cloud">
          <span v-for="(count, keyword) in sortedKeywords" :key="keyword" class="keyword-tag" :style="getKeywordStyle(count)">
            {{ keyword }} ({{ count }})
          </span>
        </div>
      </div>

      <!-- Ability Counts -->
      <div class="stats-section">
        <h3>Card Abilities</h3>
        <div class="ability-grid">
          <div class="ability-stat">
            <span class="ability-count">{{ stats.cardsWithAbilities.cardDraw }}</span>
            <span class="ability-label">Card Draw</span>
          </div>
          <div class="ability-stat">
            <span class="ability-count">{{ stats.cardsWithAbilities.removal }}</span>
            <span class="ability-label">Removal</span>
          </div>
          <div class="ability-stat">
            <span class="ability-count">{{ stats.cardsWithAbilities.counterspells }}</span>
            <span class="ability-label">Counters</span>
          </div>
          <div class="ability-stat">
            <span class="ability-count">{{ stats.cardsWithAbilities.tokenCreators }}</span>
            <span class="ability-label">Token Makers</span>
          </div>
          <div class="ability-stat">
            <span class="ability-count">{{ stats.cardsWithAbilities.energyCards }}</span>
            <span class="ability-label">Energy Cards</span>
          </div>
        </div>
      </div>

      <!-- Instant/Sorcery -->
      <div class="stats-section">
        <h3>Spell Distribution</h3>
        <div class="spell-ratio">
          <div class="spell-bar">
            <div class="spell-instant" :style="{ width: instantPercent + '%' }">
              {{ stats.instantSorceryRatio.instants }} Instants
            </div>
            <div class="spell-sorcery" :style="{ width: sorceryPercent + '%' }">
              {{ stats.instantSorceryRatio.sorceries }} Sorceries
            </div>
          </div>
          <span class="spell-ratio-label">Ratio: {{ stats.instantSorceryRatio.ratio }}:1</span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const maxRarity = computed(() => Math.max(...Object.values(props.stats?.rarityBreakdown || {})))
const maxType = computed(() => Math.max(...Object.values(props.stats?.typeBreakdown || {})))
const maxPower = computed(() => Math.max(...Object.values(props.stats?.creatureStats?.powerDistribution || {})))
const maxToughness = computed(() => Math.max(...Object.values(props.stats?.creatureStats?.toughnessDistribution || {})))
const maxKeyword = computed(() => Math.max(...Object.values(props.stats?.keywords || {})))

const multicolorCount = computed(() => {
  if (!props.stats?.colorCombinations) return 0
  return Object.entries(props.stats.colorCombinations)
    .filter(([key]) => key.length > 1 && key !== 'Colorless' && key !== 'Land')
    .reduce((sum, [, count]) => sum + count, 0)
})

const sortedKeywords = computed(() => {
  if (!props.stats?.keywords) return {}
  return Object.fromEntries(
    Object.entries(props.stats.keywords).sort((a, b) => b[1] - a[1])
  )
})

const instantPercent = computed(() => {
  const total = (props.stats?.instantSorceryRatio?.instants || 0) + (props.stats?.instantSorceryRatio?.sorceries || 0)
  return total > 0 ? (props.stats.instantSorceryRatio.instants / total) * 100 : 50
})

const sorceryPercent = computed(() => 100 - instantPercent.value)

function getBarWidth(value, max) {
  return max > 0 ? (value / max) * 100 : 0
}

function getCellClass(value) {
  if (value === 0) return 'cell-empty'
  if (value <= 3) return 'cell-low'
  if (value <= 10) return 'cell-med'
  return 'cell-high'
}

function getKeywordStyle(count) {
  const scale = 0.7 + (count / maxKeyword.value) * 0.6
  const opacity = 0.5 + (count / maxKeyword.value) * 0.5
  return {
    fontSize: `${scale}rem`,
    opacity
  }
}
</script>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 10px;
}

.stats-section {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 65, 0.2);
  border-radius: 6px;
  padding: 15px;
}

.stats-section h3 {
  margin: 0 0 12px 0;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  padding-bottom: 8px;
}

/* Stat Pills */
.stat-pills {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  min-width: 100px;
}

.pill-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
}

.pill-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

/* Bar Charts */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 80px;
  font-size: 0.85rem;
  color: #ccc;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--matrix-green);
  transition: width 0.3s;
}

.bar-fill.type-fill {
  background: linear-gradient(90deg, var(--matrix-green) 0%, #00aa33 100%);
}

.bar-value {
  width: 40px;
  font-size: 0.85rem;
  color: var(--matrix-green);
  font-weight: bold;
  text-align: left;
}

/* Rarity colors */
.rarity-common { color: #fff; }
.rarity-uncommon { color: #708090; }
.rarity-rare { color: #c3ae66; }
.rarity-mythic { color: #fe5501; }
.rarity-land { color: #8b4513; }

.bar-fill.rarity-common { background: #666; }
.bar-fill.rarity-uncommon { background: #708090; }
.bar-fill.rarity-rare { background: #c3ae66; }
.bar-fill.rarity-mythic { background: #fe5501; }
.bar-fill.rarity-land { background: #8b4513; }

/* Color Grid */
.color-grid {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  min-width: 60px;
}

.color-stat i {
  font-size: 1.5rem;
}

.color-count {
  font-weight: bold;
  font-size: 1.2rem;
}

.color-W { border: 1px solid #F0F2C0; }
.color-W .color-count { color: #F0F2C0; }
.color-U { border: 1px solid #0E68AB; }
.color-U .color-count { color: #5ba3d9; }
.color-B { border: 1px solid #666; }
.color-B .color-count { color: #aaa; }
.color-R { border: 1px solid #D3202A; }
.color-R .color-count { color: #e86b6b; }
.color-G { border: 1px solid #00733E; }
.color-G .color-count { color: #4db87a; }
.color-multi { border: 1px solid #D4AF37; }
.color-multi .color-count { color: #D4AF37; }
.color-colorless { border: 1px solid #888; }
.color-colorless .color-count { color: #bbb; }

/* Curve Table */
.curve-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Courier New', monospace;
}

.curve-header, .curve-row {
  display: flex;
  gap: 2px;
}

.curve-label {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.curve-mv, .curve-cell {
  flex: 1;
  text-align: center;
  padding: 6px 4px;
  font-size: 0.85rem;
}

.curve-mv {
  color: #888;
  background: rgba(0, 0, 0, 0.3);
}

.curve-cell {
  background: rgba(0, 0, 0, 0.2);
  color: #666;
}

.cell-empty { color: #333; }
.cell-low { color: #6a6; background: rgba(0, 255, 65, 0.1); }
.cell-med { color: #8c8; background: rgba(0, 255, 65, 0.2); }
.cell-high { color: var(--matrix-green); background: rgba(0, 255, 65, 0.3); font-weight: bold; }

.rarity-label {
  font-weight: bold;
}

/* Creature Stats */
.creature-stats-grid {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 15px;
}

.creature-stat-box {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
}

.stat-title {
  display: block;
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  color: var(--matrix-green);
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.mini-bar-chart {
  display: flex;
  gap: 4px;
  height: 80px;
  align-items: flex-end;
}

.mini-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.mini-label {
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 4px;
}

.mini-fill {
  width: 100%;
  background: var(--matrix-green);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}

.mini-value {
  font-size: 0.7rem;
  color: var(--matrix-green);
  margin-top: 2px;
}

/* Keywords */
.keyword-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.keyword-tag {
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 15px;
  padding: 4px 12px;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
}

/* Ability Grid */
.ability-grid {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.ability-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 20px;
  border-radius: 6px;
  min-width: 80px;
}

.ability-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
}

.ability-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
}

/* Spell Ratio */
.spell-ratio {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spell-bar {
  display: flex;
  height: 35px;
  border-radius: 4px;
  overflow: hidden;
}

.spell-instant, .spell-sorcery {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
  color: #000;
}

.spell-instant {
  background: #0E68AB;
  color: #fff;
}

.spell-sorcery {
  background: #D3202A;
  color: #fff;
}

.spell-ratio-label {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
}

/* Scrollbar */
.stats-container::-webkit-scrollbar {
  width: 6px;
}

.stats-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.stats-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .creature-stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-pills {
    justify-content: center;
  }
}
</style>
