<template>
  <BaseModal :show="show" title="BOOSTER PACK UNLOCKED" @close="$emit('close')">
    <div class="pack-grid">
      <template v-for="card in pack" :key="card.id + (card.isBackFace ? '-back' : '')">
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
import { useCardStore } from '@/stores/cardStore'
import BaseModal from './BaseModal.vue'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pack: {
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
</script>
