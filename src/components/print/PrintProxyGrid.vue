<template>
  <div class="print-grid-container">
    <div v-for="(page, pageIndex) in pages" :key="pageIndex" class="print-page">
      <PrintProxyCard
        v-for="(card, cardIndex) in page"
        :key="`${pageIndex}-${cardIndex}-${card.id}`"
        :card="card"
        :display-mode="displayMode"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PrintProxyCard from './PrintProxyCard.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  },
  displayMode: {
    type: String,
    default: 'art'
  }
})

// Group cards into pages of 9 (3x3 grid)
const pages = computed(() => {
  const result = []
  for (let i = 0; i < props.cards.length; i += 9) {
    result.push(props.cards.slice(i, i + 9))
  }
  return result
})
</script>
