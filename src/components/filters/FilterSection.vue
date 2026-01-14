<template>
  <div class="filter-section">
    <SearchInput v-model="searchText" />
    <RaritySelect v-model="rarity" />
    <TypeInput v-model="typeText" />
    <ColorToggles :active="activeColors" @toggle="toggleColor" />
  </div>
</template>

<script setup>
import SearchInput from './SearchInput.vue'
import RaritySelect from './RaritySelect.vue'
import TypeInput from './TypeInput.vue'
import ColorToggles from './ColorToggles.vue'

const searchText = defineModel('searchText', { type: String, default: '' })
const rarity = defineModel('rarity', { type: String, default: 'All' })
const typeText = defineModel('typeText', { type: String, default: '' })
const activeColors = defineModel('activeColors', { type: Array, default: () => [] })

const emit = defineEmits(['toggle-color'])

function toggleColor(color) {
  emit('toggle-color', color)
}
</script>
