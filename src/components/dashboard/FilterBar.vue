<template>
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
</template>

<script setup>
import { computed } from 'vue'

const searchTextModel = defineModel('searchText', { type: String })
const rarityModel = defineModel('rarity', { type: String })
const typeTextModel = defineModel('typeText', { type: String })
const activeColors = defineModel('activeColors', { type: Array })
const activeMVs = defineModel('activeMVs', { type: Array })

defineEmits(['toggle-color', 'toggle-mv', 'reset-filters'])

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
</script>

<style scoped>
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

@media (max-width: 600px) {
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
