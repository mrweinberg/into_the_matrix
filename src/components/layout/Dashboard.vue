<template>
  <div class="command-center">
    <!-- Terminal Header -->
    <div class="terminal-header">
      <div class="terminal-controls">
        <span class="control-dot red"></span>
        <span class="control-dot yellow"></span>
        <span class="control-dot green"></span>
      </div>
      <div class="terminal-title">ZION MAINFRAME // CARD DATABASE v4.5.0</div>
      <div class="terminal-status">
        <span class="status-indicator"></span>
        CONNECTED
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Left: Quick Stats & Actions -->
      <div class="panel panel-main">
        <!-- Quick Stats Row -->
        <div class="stats-row">
          <div class="stat-display">
            <span class="stat-value">{{ stats?.totalCards || '---' }}</span>
            <span class="stat-label">CARDS</span>
          </div>
          <div class="stat-display">
            <span class="stat-value">{{ stats?.creatureStats?.total || '---' }}</span>
            <span class="stat-label">CREATURES</span>
          </div>
          <div class="stat-display">
            <span class="stat-value">{{ stats?.dfcCount || '---' }}</span>
            <span class="stat-label">TRANSFORMS</span>
          </div>
          <div class="stat-display">
            <span class="stat-value">{{ stats?.averageCMC || '---' }}</span>
            <span class="stat-label">AVG MV</span>
          </div>
        </div>

        <!-- Action Buttons Grid -->
        <div class="actions-section">
          <h3 class="section-title">
            <span class="title-icon">&gt;</span> SIMULATION PROTOCOLS
          </h3>
          <div class="action-grid">
            <button class="action-btn action-primary" @click="$emit('open-booster')">
              <span class="btn-icon">&#9635;</span>
              <span class="btn-text">Open Pack</span>
              <span class="btn-hint">Single booster</span>
            </button>
            <button class="action-btn action-primary" @click="$emit('start-draft')">
              <span class="btn-icon">&#9638;</span>
              <span class="btn-text">Draft Mode</span>
              <span class="btn-hint">3-pack simulation</span>
            </button>
            <button class="action-btn action-primary" @click="$emit('generate-sealed')">
              <span class="btn-icon">&#9641;</span>
              <span class="btn-text">Sealed Pool</span>
              <span class="btn-hint">6-pack deck builder</span>
            </button>
          </div>
        </div>

        <!-- Info Actions -->
        <div class="info-section">
          <h3 class="section-title">
            <span class="title-icon">&gt;</span> SYSTEM ACCESS
          </h3>
          <div class="info-grid">
            <button class="action-btn action-secondary" @click="$emit('open-stats')">
              <span class="btn-icon">&#9632;</span>
              <span class="btn-text">Set Analytics</span>
            </button>
            <button class="action-btn action-secondary" @click="$emit('open-notes')">
              <span class="btn-icon">&#9633;</span>
              <span class="btn-text">Design Notes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Mechanics Panel -->
      <div class="panel panel-mechanics">
        <div class="mechanics-content">
          <div
            v-for="mechanic in visibleMechanics"
            :key="mechanic.name"
            class="mechanic-item"
            :class="{ active: activeMechanic === mechanic.originalIndex }"
            @click="toggleMechanic(mechanic.originalIndex)"
          >
            <div class="mechanic-header">
              <span class="mechanic-name" v-html="formatMechanic(mechanic.name)"></span>
              <span class="mechanic-toggle">{{ activeMechanic === mechanic.originalIndex ? '×' : '+' }}</span>
            </div>
            <div v-if="activeMechanic === mechanic.originalIndex" class="mechanic-details">
              <p class="mechanic-text" v-html="formatMechanic(mechanic.text.join(' '))"></p>
              <p v-if="mechanic.notes?.length" class="mechanic-note">
                {{ mechanic.notes.join(' ') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item search-item">
          <label class="filter-label">SEARCH</label>
          <input
            type="text"
            class="filter-input"
            placeholder="Name or text..."
            v-model="searchTextModel"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">RARITY</label>
          <select class="filter-select" v-model="rarityModel">
            <option value="All">All</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Mythic">Mythic</option>
            <option value="Land">Land</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">TYPE</label>
          <input
            type="text"
            class="filter-input"
            placeholder="Creature, Artifact..."
            v-model="typeTextModel"
          />
        </div>
      </div>
      <div class="filter-row filter-row-secondary">
        <div class="filter-item colors-item">
          <label class="filter-label">COLOR</label>
          <div class="color-pills">
            <button
              v-for="color in colorOptions"
              :key="color.id"
              :class="['color-pill', 'pill-' + color.id, { active: activeColors.includes(color.id) }]"
              :title="color.name"
              @click="$emit('toggle-color', color.id)"
            >
              <i :class="color.icon"></i>
            </button>
          </div>
        </div>
        <div class="filter-item mv-item">
          <label class="filter-label">MV</label>
          <div class="mv-pills">
            <button
              v-for="mv in ['0', '1', '2', '3', '4', '5+']"
              :key="mv"
              :class="['mv-pill', { active: activeMVs.includes(mv) }]"
              @click="$emit('toggle-mv', mv)"
            >
              {{ mv }}
            </button>
          </div>
        </div>
        <button v-if="hasActiveFilters" class="clear-btn" @click="$emit('reset-filters')">
          CLEAR
        </button>
      </div>
    </div>

    <!-- Results Bar -->
    <div class="results-bar">
      <div class="results-text">
        <span class="prompt">&gt;</span>
        QUERY RESULTS: <strong>{{ visibleCount }}</strong> RECORDS FOUND
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'

const props = defineProps({
  visibleCount: {
    type: Number,
    required: true
  },
  mechanics: {
    type: Array,
    required: true
  },
  stats: {
    type: Object,
    default: null
  }
})

const searchTextModel = defineModel('searchText', { type: String })
const rarityModel = defineModel('rarity', { type: String })
const typeTextModel = defineModel('typeText', { type: String })
const activeColors = defineModel('activeColors', { type: Array })
const activeMVs = defineModel('activeMVs', { type: Array })

defineEmits(['open-booster', 'start-draft', 'generate-sealed', 'open-notes', 'open-stats', 'toggle-color', 'toggle-mv', 'reset-filters'])

const activeMechanic = ref(null)

const visibleMechanics = computed(() => {
  if (activeMechanic.value === null) {
    return props.mechanics.map((m, i) => ({ ...m, originalIndex: i }))
  }
  const mech = props.mechanics[activeMechanic.value]
  return mech ? [{ ...mech, originalIndex: activeMechanic.value }] : []
})

const colorOptions = [
  { id: 'W', name: 'White', icon: 'ms ms-w ms-cost' },
  { id: 'U', name: 'Blue', icon: 'ms ms-u ms-cost' },
  { id: 'B', name: 'Black', icon: 'ms ms-b ms-cost' },
  { id: 'R', name: 'Red', icon: 'ms ms-r ms-cost' },
  { id: 'G', name: 'Green', icon: 'ms ms-g ms-cost' },
  { id: 'Gold', name: 'Multicolor', icon: 'ms ms-multicolored ms-cost' },
  { id: 'Artifact', name: 'Colorless', icon: 'ms ms-artifact ms-cost' },
  { id: 'Land', name: 'Land', icon: 'ms ms-land ms-cost' }
]

const hasActiveFilters = computed(() =>
  searchTextModel.value !== '' ||
  rarityModel.value !== 'All' ||
  typeTextModel.value !== '' ||
  activeColors.value.length > 0 ||
  activeMVs.value.length > 0
)

function toggleMechanic(index) {
  activeMechanic.value = activeMechanic.value === index ? null : index
}

function formatMechanic(text) {
  return replaceSymbols(text)
}
</script>

<style scoped>
.command-center {
  max-width: 1400px;
  margin: 0 auto 30px auto;
  font-family: 'Courier New', monospace;
}

/* Terminal Header */
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 1px solid var(--matrix-green);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 15px;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-dot.red { background: #ff5f56; }
.control-dot.yellow { background: #ffbd2e; }
.control-dot.green { background: #27ca40; }

.terminal-title {
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.terminal-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f0;
  font-size: 0.75rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #0f0;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 5px #0f0; }
  50% { opacity: 0.5; box-shadow: 0 0 2px #0f0; }
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  border: 1px solid var(--matrix-green);
  border-top: none;
  background: rgba(0, 0, 0, 0.8);
}

.panel {
  padding: 20px;
}

.panel-main {
  border-right: 1px solid rgba(0, 255, 65, 0.3);
}

.panel-mechanics {
  background: rgba(0, 255, 65, 0.02);
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.stat-display {
  flex: 1;
  text-align: center;
  padding: 15px 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.stat-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--matrix-green), transparent);
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--matrix-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.65rem;
  color: #666;
  margin-top: 6px;
  letter-spacing: 2px;
}

/* Section Titles */
.section-title {
  margin: 0 0 15px 0;
  font-size: 0.8rem;
  color: #888;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--matrix-green);
}

/* Action Buttons */
.actions-section {
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 12px;
  border: 1px solid var(--matrix-green);
  border-radius: 4px;
  background: rgba(0, 255, 65, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  background: rgba(0, 255, 65, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 65, 0.2);
}

.action-btn.action-primary .btn-icon {
  font-size: 1.8rem;
  color: var(--matrix-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.action-btn.action-secondary {
  padding: 12px;
  flex-direction: row;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-color: #444;
}

.action-btn.action-secondary:hover {
  border-color: var(--matrix-green);
}

.action-btn.action-secondary .btn-icon {
  font-size: 1rem;
  color: #888;
}

.action-btn.action-secondary:hover .btn-icon {
  color: var(--matrix-green);
}

.btn-text {
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
}

.btn-hint {
  font-size: 0.65rem;
  color: #666;
}

.action-btn.action-secondary .btn-text {
  font-size: 0.75rem;
  color: #aaa;
}

.action-btn.action-secondary:hover .btn-text {
  color: #fff;
}

/* Mechanics Panel */
.mechanics-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;
}

.mechanics-content::-webkit-scrollbar {
  width: 4px;
}

.mechanics-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.mechanics-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.mechanic-item {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 65, 0.15);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
}

.mechanic-item:hover {
  border-color: rgba(0, 255, 65, 0.4);
}

.mechanic-item.active {
  border-color: var(--matrix-green);
  background: rgba(0, 255, 65, 0.05);
}

.mechanic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
}

.mechanic-name {
  color: var(--matrix-green);
  font-size: 0.85rem;
  font-weight: bold;
}

.mechanic-toggle {
  color: var(--matrix-green);
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.mechanic-details {
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.mechanic-text {
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
  line-height: 1.6;
}

.mechanic-note {
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
  padding-top: 10px;
  border-top: 1px dashed #444;
  line-height: 1.5;
}

/* Filter Bar */
.filter-bar {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid var(--matrix-green);
  border-top: none;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.filter-row-secondary {
  padding-top: 5px;
  border-top: 1px solid rgba(0, 255, 65, 0.15);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item {
  flex: 1;
  min-width: 180px;
}

.filter-label {
  font-size: 0.65rem;
  color: var(--matrix-green);
  letter-spacing: 2px;
}

.filter-input,
.filter-select {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #444;
  color: #fff;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 0.85rem;
  border-radius: 3px;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--matrix-green);
}

.filter-select {
  cursor: pointer;
}

/* Color Pills */
.colors-item {
  min-width: auto;
}

.color-pills {
  display: flex;
  gap: 6px;
}

.color-pill {
  width: 36px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.1rem;
  color: #666;
}

.color-pill:hover {
  border-color: #888;
}

.color-pill.active {
  border-color: var(--matrix-green);
  box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

.pill-W.active { background: rgba(240, 242, 192, 0.3); }
.pill-U.active { background: rgba(14, 104, 171, 0.3); }
.pill-B.active { background: rgba(80, 60, 60, 0.4); }
.pill-R.active { background: rgba(211, 32, 42, 0.3); }
.pill-G.active { background: rgba(0, 115, 62, 0.3); }
.pill-Gold.active { background: rgba(212, 175, 55, 0.3); }
.pill-Artifact.active { background: rgba(140, 140, 140, 0.3); }
.pill-Land.active { background: rgba(191, 165, 134, 0.3); }

/* MV Pills */
.mv-item {
  min-width: auto;
}

.mv-pills {
  display: flex;
  gap: 6px;
}

.mv-pill {
  width: 36px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #444;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  color: #666;
  transition: all 0.2s;
}

.mv-pill:hover {
  border-color: #888;
  color: #aaa;
}

.mv-pill.active {
  border-color: var(--matrix-green);
  color: var(--matrix-green);
  background: rgba(0, 255, 65, 0.1);
}

/* Clear Button */
.clear-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #666;
  color: #888;
  font-family: inherit;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* Results Bar */
.results-bar {
  background: rgba(0, 255, 65, 0.05);
  border: 1px solid var(--matrix-green);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px 20px;
}

.results-text {
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.results-text strong {
  color: #fff;
  text-shadow: 0 0 10px var(--matrix-green);
}

.prompt {
  color: var(--matrix-green);
  margin-right: 8px;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 600px;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1000px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .panel-main {
    border-right: none;
    border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-row {
    flex-wrap: wrap;
  }

  .stat-display {
    flex: 1 1 45%;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row-secondary {
    border-top: none;
    padding-top: 0;
  }

  .filter-item {
    width: 100%;
  }

  .search-item {
    min-width: auto;
  }

  .color-pills,
  .mv-pills {
    justify-content: flex-start;
  }
}
</style>
