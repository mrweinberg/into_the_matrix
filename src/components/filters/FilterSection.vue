<template>
  <div class="filter-section">
    <SearchInput v-model="searchText" />
    <RaritySelect v-model="rarity" />
    <TypeInput v-model="typeText" />
    <ColorToggles :active="activeColors" @toggle="toggleColor" />
    <MVToggles :active="activeMVs" @toggle="toggleMV" />
    <button v-if="hasActiveFilters" class="clear-filters-btn" @click="$emit('reset')">
      Clear Filters
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SearchInput from './SearchInput.vue'
import RaritySelect from './RaritySelect.vue'
import TypeInput from './TypeInput.vue'
import ColorToggles from './ColorToggles.vue'
import MVToggles from './MVToggles.vue'

const searchText = defineModel('searchText', { type: String, default: '' })
const rarity = defineModel('rarity', { type: String, default: 'All' })
const typeText = defineModel('typeText', { type: String, default: '' })
const activeColors = defineModel('activeColors', { type: Array, default: () => [] })
const activeMVs = defineModel('activeMVs', { type: Array, default: () => [] })

const emit = defineEmits(['toggle-color', 'toggle-mv', 'reset'])

const hasActiveFilters = computed(() =>
  searchText.value !== '' ||
  rarity.value !== 'All' ||
  typeText.value !== '' ||
  activeColors.value.length > 0 ||
  activeMVs.value.length > 0
)

function toggleColor(color) {
  emit('toggle-color', color)
}

function toggleMV(mv) {
  emit('toggle-mv', mv)
}
</script>

<style scoped>
.clear-filters-btn {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid #666;
  border-radius: 4px;
  color: #888;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.clear-filters-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}
</style>
