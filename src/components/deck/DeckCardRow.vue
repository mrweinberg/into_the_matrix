<template>
  <div
    class="deck-card-row"
    :class="[colorClass, { 'is-hovered': isHovered }]"
    @mouseenter="$emit('hover', card)"
    @mouseleave="$emit('hover', null)"
    @click="$emit('click', card)"
  >
    <span class="card-count" v-if="count > 1">{{ count }}</span>
    <div class="card-info">
      <div class="row-top">
        <span class="card-name">{{ card.name }}</span>
        <span class="card-cost" v-html="formattedCost"></span>
      </div>
      <div class="row-bottom">
        <span class="card-type">{{ fullType }}</span>
        <span class="card-pt" v-if="card.pt">{{ card.pt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { replaceSymbols } from '@/utils/manaSymbols'
import { determineColorClass } from '@/utils/cardUtils'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  count: {
    type: Number,
    default: 1
  },
  isHovered: {
    type: Boolean,
    default: false
  }
})

defineEmits(['hover', 'click'])

const colorClass = computed(() => `color-${determineColorClass(props.card)}`)
const formattedCost = computed(() => replaceSymbols(props.card.cost || ''))

const fullType = computed(() => {
  return props.card.displayType || props.card.type || ''
})
</script>

<style scoped>
.deck-card-row {
  display: flex;
  align-items: stretch;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #444;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.85rem;
  min-height: 44px;
}

.deck-card-row:hover,
.deck-card-row.is-hovered {
  background: rgba(0, 255, 65, 0.15);
  transform: translateX(2px);
}

.deck-card-row.color-W { border-left-color: #F0F2C0; }
.deck-card-row.color-U { border-left-color: #0E68AB; }
.deck-card-row.color-B { border-left-color: #150B00; background: rgba(30, 20, 20, 0.4); }
.deck-card-row.color-R { border-left-color: #D3202A; }
.deck-card-row.color-G { border-left-color: #00733E; }
.deck-card-row.color-Gold { border-left-color: #D4AF37; }
.deck-card-row.color-Land { border-left-color: #bfa586; }
.deck-card-row.color-Artifact { border-left-color: #7d7d7d; }

.card-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0 6px;
  background: rgba(0, 255, 65, 0.2);
  color: var(--matrix-green);
  font-weight: bold;
  font-size: 0.9rem;
  border-right: 1px solid rgba(0, 255, 65, 0.3);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 8px;
  min-width: 0;
  gap: 2px;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.row-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-name {
  color: #eee;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.card-cost {
  display: flex;
  flex-shrink: 0;
  gap: 1px;
  font-size: 0.95em;
}

.card-type {
  color: #999;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.card-pt {
  color: #ddd;
  font-weight: bold;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 5px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
