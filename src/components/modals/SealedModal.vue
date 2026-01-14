<template>
  <BaseModal :show="show" title="SEALED POOL GENERATED" @close="$emit('close')">
    <div class="control-bar">
      <div class="pool-stats">
        <span>{{ pool.length }} Cards Opened</span>
        <div class="rarity-breakdown">
          <span v-for="(count, rarity) in rarityCounts" :key="rarity" :class="['rarity-pill', rarity.toLowerCase()]">
            {{ count }} {{ rarity }}
          </span>
        </div>
      </div>
    </div>
    <div class="pack-grid">
      <template v-for="(card, index) in sortedPool" :key="card.id + '-' + index">
        <CardDFC
          v-if="card.hasBackFace"
          :card="card"
          :back-card="getBackFace(card)"
          @click="viewCard(card)"
        />
        <CardItem
          v-else
          :card="card"
          @click="viewCard(card)"
        />
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { sortCards } from '@/utils/cardUtils'
import BaseModal from './BaseModal.vue'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'view-card'])
const cardStore = useCardStore()

function getBackFace(card) {
  return cardStore.getBackFace(card)
}

function viewCard(card) {
  emit('view-card', card)
}

// Automatically sort the pool by Color -> Rarity -> Name for better readability
const sortedPool = computed(() => {
  return sortCards(props.pool, 'color', 'asc')
})

const rarityCounts = computed(() => {
  const counts = { Mythic: 0, Rare: 0, Uncommon: 0, Common: 0, Land: 0 }
  props.pool.forEach(card => {
    if (counts[card.rarity] !== undefined) {
      counts[card.rarity]++
    }
  })
  return Object.fromEntries(Object.entries(counts).filter(([_, count]) => count > 0))
})
</script>

<style scoped>
.control-bar {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--matrix-green);
  font-family: 'Courier New', monospace;
  background: rgba(0, 255, 65, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 65, 0.2);
}

.pool-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.rarity-breakdown {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.rarity-pill {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid currentColor;
  text-transform: uppercase;
}

.rarity-pill.mythic { color: #fe5501; border-color: #fe5501; }
.rarity-pill.rare { color: #c3ae66; border-color: #c3ae66; }
.rarity-pill.uncommon { color: #708090; border-color: #708090; }
.rarity-pill.common { color: #fff; border-color: #fff; }
.rarity-pill.land { color: #8b4513; border-color: #8b4513; }
</style>
