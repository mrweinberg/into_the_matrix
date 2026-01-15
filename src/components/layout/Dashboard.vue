<template>
  <div class="command-center">
    <TerminalHeader />

    <div class="main-grid">
      <div class="panel panel-main">
        <QuickStats :stats="stats" />
        <ActionButtons
          @open-booster="$emit('open-booster')"
          @start-draft="$emit('start-draft')"
          @generate-sealed="$emit('generate-sealed')"
          @open-stats="$emit('open-stats')"
          @open-notes="$emit('open-notes')"
          @resume-pool="$emit('resume-pool')"
        />
      </div>

      <div class="panel panel-mechanics">
        <MechanicsPanel :mechanics="mechanics" />
      </div>
    </div>

    <FilterBar
      v-model:search-text="searchTextModel"
      v-model:rarity="rarityModel"
      v-model:type-text="typeTextModel"
      v-model:active-colors="activeColorsModel"
      v-model:active-m-vs="activeMVsModel"
      @toggle-color="$emit('toggle-color', $event)"
      @toggle-mv="$emit('toggle-mv', $event)"
      @reset-filters="$emit('reset-filters')"
    />

    <ResultsBar :count="visibleCount" />
  </div>
</template>

<script setup>
import TerminalHeader from '@/components/dashboard/TerminalHeader.vue'
import QuickStats from '@/components/dashboard/QuickStats.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import MechanicsPanel from '@/components/dashboard/MechanicsPanel.vue'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import ResultsBar from '@/components/dashboard/ResultsBar.vue'

defineProps({
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
const activeColorsModel = defineModel('activeColors', { type: Array })
const activeMVsModel = defineModel('activeMVs', { type: Array })

defineEmits([
  'open-booster',
  'start-draft',
  'generate-sealed',
  'open-notes',
  'open-stats',
  'toggle-color',
  'toggle-mv',
  'reset-filters',
  'resume-pool'
])
</script>

<style scoped>
.command-center {
  max-width: 1400px;
  margin: 0 auto 30px auto;
  font-family: 'Courier New', monospace;
}

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

@media (max-width: 1000px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .panel-main {
    border-right: none;
    border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  }
}
</style>
