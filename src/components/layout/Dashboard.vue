<template>
  <div class="dashboard">
    <div class="info-grid">
      <div class="stat-box">
        <h2>System Stats</h2>
        <p><strong>Visible Cards:</strong> {{ visibleCount }}</p>
        <p><strong>System Version:</strong> v4.3.0 (Deck Builder)</p>
        <button class="btn-generate" @click="$emit('open-booster')">
          Open Simulation Pack
        </button>
        <button class="btn-generate" @click="$emit('start-draft')">
          Start Draft Simulator
        </button>
        <button class="btn-generate" @click="$emit('generate-sealed')">
          Generate Sealed Pool
        </button>
        <button class="btn-generate btn-notes" @click="$emit('open-notes')">
          View Design Notes
        </button>
      </div>
      <div>
        <h2>Set Mechanics</h2>
        <MechanicsGrid :mechanics="mechanics" />
      </div>
    </div>

    <FilterSection
      v-model:search-text="searchText"
      v-model:rarity="rarity"
      v-model:type-text="typeText"
      v-model:active-colors="activeColors"
      v-model:active-m-vs="activeMVs"
      @toggle-color="toggleColor"
      @toggle-mv="toggleMV"
      @reset="$emit('reset-filters')"
    />
  </div>
</template>

<script setup>
import MechanicsGrid from '@/components/mechanics/MechanicsGrid.vue'
import FilterSection from '@/components/filters/FilterSection.vue'

defineProps({
  visibleCount: {
    type: Number,
    required: true
  },
  mechanics: {
    type: Array,
    required: true
  }
})

const searchText = defineModel('searchText', { type: String })
const rarity = defineModel('rarity', { type: String })
const typeText = defineModel('typeText', { type: String })
const activeColors = defineModel('activeColors', { type: Array })
const activeMVs = defineModel('activeMVs', { type: Array })

const emit = defineEmits(['open-booster', 'start-draft', 'generate-sealed', 'open-notes', 'toggle-color', 'toggle-mv', 'reset-filters'])

function toggleColor(color) {
  emit('toggle-color', color)
}

function toggleMV(mv) {
  emit('toggle-mv', mv)
}
</script>
