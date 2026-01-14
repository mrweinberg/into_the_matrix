<template>
  <div class="dashboard">
    <div class="info-grid">
      <div class="stat-box">
        <h2>System Stats</h2>
        <p><strong>Visible Cards:</strong> {{ visibleCount }}</p>
        <p><strong>System Version:</strong> v4.0.0 (Vue)</p>
        <button class="btn-generate" @click="$emit('open-booster')">
          Open Simulation Pack
        </button>
        <button class="btn-generate" @click="$emit('start-draft')">
          Start Draft Simulator
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
      v-model:active-color="activeColor"
      @toggle-color="toggleColor"
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
const activeColor = defineModel('activeColor', { type: String })

const emit = defineEmits(['open-booster', 'start-draft', 'open-notes', 'toggle-color'])

function toggleColor(color) {
  emit('toggle-color', color)
}
</script>
