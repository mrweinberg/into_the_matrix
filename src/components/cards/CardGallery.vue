<template>
  <div class="gallery">
    <template v-if="cards.length === 0">
      <div class="empty-gallery">NO CARDS FOUND IN THE MATRIX</div>
    </template>
    <template v-else>
      <template v-for="card in cards" :key="card.id + (card.isBackFace ? '-back' : '')">
        <CardDFC
          v-if="card.hasBackFace"
          :card="card"
          :back-card="getBackFace(card)"
          @click="handleCardClick"
        />
        <CardItem
          v-else
          :card="card"
          @click="handleCardClick"
        />
      </template>
    </template>
  </div>
</template>

<script setup>
import { useCardStore } from '@/stores/cardStore'
import CardItem from './CardItem.vue'
import CardDFC from './CardDFC.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['card-click'])
const cardStore = useCardStore()

function getBackFace(card) {
  return cardStore.getBackFace(card)
}

function handleCardClick(card) {
  emit('card-click', card)
}
</script>

<style scoped>
.empty-gallery {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #555;
}
</style>
