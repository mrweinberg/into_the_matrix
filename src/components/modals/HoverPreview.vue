<template>
  <div v-if="card" class="hover-preview">
    <CardDFC
      v-if="card.hasBackFace && backCard"
      :card="card"
      :back-card="backCard"
      :clickable="false"
    />
    <CardItem
      v-else
      :card="card"
      :clickable="false"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import CardItem from '@/components/cards/CardItem.vue'
import CardDFC from '@/components/cards/CardDFC.vue'

const props = defineProps({
  card: {
    type: Object,
    default: null
  }
})

const cardStore = useCardStore()

const backCard = computed(() =>
  props.card?.hasBackFace ? cardStore.getBackFace(props.card) : null
)
</script>
